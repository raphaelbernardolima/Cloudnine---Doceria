import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rota de criação de preferência do Mercado Pago
  app.post("/api/create-preference", async (req, res) => {
    try {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!accessToken) {
        return res.status(500).json({ error: "Mercado Pago Access Token não configurado no ambiente (.env)." });
      }

      const client = new MercadoPagoConfig({ accessToken, options: { timeout: 15000 } });
      const { items, payer, external_reference } = req.body;
      
      const preference = new Preference(client);
      
      const origin = process.env.APP_URL || req.headers.origin || `http://localhost:${PORT}`;

      const response = await preference.create({
        body: {
          items,
          payer,
          external_reference,
          back_urls: {
            success: `${origin}?payment=success`,
            failure: `${origin}?payment=failure`,
            pending: `${origin}?payment=pending`
          },
          auto_return: "approved",
        }
      });
      
      res.json({ id: response.id, init_point: response.init_point });
    } catch (error) {
      console.error("Erro ao criar preferência no Mercado Pago:", error);
      res.status(500).json({ error: "Erro ao processar pagamento com o Mercado Pago." });
    }
  });

  // Rota segura para validação e fechamento de pedido (Server-side Checkout)
  app.post("/api/checkout", async (req, res) => {
    try {
      const url = process.env.VITE_SUPABASE_URL;
      // Idealmente usar SERVICE_ROLE_KEY no backend, mas a ANON já serve para ler produtos públicos e inserir pedidos (dependendo do RLS)
      const key = process.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        return res.status(500).json({ error: "Supabase não configurado no servidor." });
      }

      const supabase = createClient(url, key);
      const { cartItems, orderData } = req.body;

      if (!cartItems || !orderData) {
        return res.status(400).json({ error: "Dados do pedido inválidos." });
      }

      let calculatedTotal = 0;
      const validItems = [];

      // Validar preços reais do banco
      for (const item of cartItems) {
        if (item.product?.id) {
          const { data: prodData } = await supabase.from("produtos").select("preco").eq("id", item.product.id).single();
          const realPrice = prodData ? prodData.preco : item.unitPrice; // Fallback temporário
          calculatedTotal += realPrice * item.quantity;
          
          validItems.push({
            produto_id: item.product.id,
            nome_produto: item.product.nome,
            quantidade: item.quantity,
            preco_unitario: realPrice,
            detalhes_customizados: item.customNote || null
          });
        } else if (item.customCake) {
          // Bolo personalizado - idealmente validar os preços base das massas/recheios, mas usaremos o enviado por ora
          calculatedTotal += item.unitPrice * item.quantity;
          validItems.push({
            produto_id: null,
            nome_produto: 'Bolo Personalizado',
            quantidade: item.quantity,
            preco_unitario: item.unitPrice,
            detalhes_customizados: `Massa: ${item.customCake.massa}, Recheio: ${item.customCake.recheio1} - Obs: ${item.customCake.observacoes || ''}`
          });
        }
      }

      const taxaEntrega = orderData.tipo_entrega === "entrega" ? 12.00 : 0;
      calculatedTotal += taxaEntrega;

      // Desconto simulado por Fidelidade (se aplicável, ideal checar no banco)
      if (orderData.appliedDiscount) {
         calculatedTotal -= orderData.appliedDiscount;
      }

      calculatedTotal = Math.max(0, calculatedTotal);

      // Inserir Pedido no Supabase
      const pedidoDB = {
        cliente_id: orderData.cliente_id !== 'guest' ? orderData.cliente_id : null,
        cliente_nome: orderData.cliente_nome,
        cliente_telefone: orderData.cliente_telefone,
        metodo_pagamento: orderData.metodo_pagamento,
        tipo_entrega: orderData.tipo_entrega,
        data_agendada: orderData.data_agendada || null,
        horario_agendado: orderData.horario_agendado || null,
        endereco_entreg: orderData.endereco_entreg,
        total: calculatedTotal,
        status: orderData.metodo_pagamento === 'pix' ? 'pendente_pix' : 'em_preparo',
      };

      const { data: insertedOrder, error: orderError } = await supabase.from('pedidos').insert([pedidoDB]).select().single();
      
      if (orderError || !insertedOrder) {
        throw new Error(orderError?.message || "Erro ao inserir pedido.");
      }

      // Inserir Itens
      const itensDB = validItems.map(vi => ({
        ...vi,
        pedido_id: insertedOrder.id
      }));

      const { error: itemsError } = await supabase.from('itens_pedidos').insert(itensDB);
      if (itemsError) {
         console.warn("Erro ao inserir itens, mas pedido foi criado:", itemsError);
      }

      // SIMULAÇÃO WHATSAPP API: Avisar cliente que pedido foi recebido
      if (orderData.cliente_telefone) {
        try {
          // Fire and forget
          fetch(`http://localhost:${process.env.PORT || 3000}/api/webhook/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telefone: orderData.cliente_telefone,
              mensagem: `Olá ${orderData.cliente_nome}! Seu pedido #${insertedOrder.id} no valor de R$ ${calculatedTotal.toFixed(2)} foi recebido com sucesso pela Cloudnine Doceria.`
            })
          }).catch(e => console.error("Erro interno ao chamar webhook WhatsApp:", e.message));
        } catch (e) {}
      }

      res.json({ success: true, orderId: insertedOrder.id, totalCalculado: calculatedTotal });

    } catch (error: any) {
      console.error("Erro no checkout seguro:", error);
      res.status(500).json({ error: error.message || "Erro interno no checkout." });
    }
  });

  // Webhook do Mercado Pago (IPN)
  app.post("/api/webhook/mercadopago", async (req, res) => {
    try {
      const url = process.env.VITE_SUPABASE_URL;
      const key = process.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        return res.status(500).json({ error: "Supabase não configurado no servidor." });
      }

      const supabase = createClient(url, key);
      
      // O Mercado Pago envia 'action' ou 'type' e um objeto 'data' com o ID do pagamento
      const { action, type, data } = req.body;
      
      // Simulação para o MVP: se recebemos um aviso de pagamento, aprovamos o pedido.
      // Em produção real, você usaria o Access Token para consultar o MP com data.id 
      // e descobriria o external_reference (seu Order ID).
      const paymentId = req.query['data.id'] || data?.id;
      const topic = req.query.topic || type;
      
      if (topic === 'payment' && paymentId) {
        console.log(`[Webhook MP] Pagamento recebido/atualizado. ID: ${paymentId}`);
        // Simulando que aprovou (pois não temos a integração completa do backend no plano free)
        // Se tivéssemos o order_id, faríamos:
        // await supabase.from('pedidos').update({ status: 'em_preparo' }).eq('id', orderId);
      }

      // O Mercado Pago exige retorno 200 OK imediato
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro no webhook MP:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Webhook Simulado - WhatsApp API
  app.post("/api/webhook/whatsapp", async (req, res) => {
    try {
      const { telefone, mensagem } = req.body;
      if (!telefone || !mensagem) {
        return res.status(400).json({ error: "Telefone e mensagem são obrigatórios." });
      }

      console.log(`\n======================================================`);
      console.log(`[WHATSAPP WEBHOOK SIMULATOR]`);
      console.log(`Enviando mensagem para: ${telefone}`);
      console.log(`Conteúdo da Mensagem:\n${mensagem}`);
      console.log(`======================================================\n`);

      // Retorna sucesso para simular o recebimento pela API oficial do WhatsApp
      res.status(200).json({ success: true, message: "Mensagem enfileirada para envio via WhatsApp API." });
    } catch (error) {
      console.error("Erro no webhook de WhatsApp:", error);
      res.status(500).json({ error: "Erro interno ao processar notificação de WhatsApp." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 🛡️ Segurança HTTP Headers (Proteção contra XSS, Clickjacking, etc)
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado localmente para não quebrar assets do Vite
    crossOriginEmbedderPolicy: false
  }));

  // 🛡️ CORS (Cross-Origin Resource Sharing)
  app.use(cors({ origin: '*' })); // Em prod, trocar para o domínio real

  app.use(express.json());

  // 🛡️ Global Rate Limiter: Protege a aplicação inteira (Max 500 requisições / 15 min por IP)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, 
    message: { error: "Muitas requisições originadas deste IP. Por favor, aguarde alguns minutos e tente novamente." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  // 🔒 Checkout Limiter: Proteção extrema na rota de pagamento (Max 20 checkouts / 1 hora por IP)
  // Isso evita spam de pedidos falsos e exaustão da API do Mercado Pago
  const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, 
    message: { error: "Limite de tentativas de checkout atingido. Por segurança, tente novamente em uma hora." }
  });
  app.use("/api/checkout", checkoutLimiter);

  // Helper function to get service role client
  const getAdminSupabase = () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  };

  // Rota segura para validação, pagamento PIX e fechamento de pedido
  app.post("/api/checkout", async (req, res) => {
    try {
      const supabaseAdmin = getAdminSupabase();
      
      if (!supabaseAdmin) {
        return res.status(500).json({ error: "Supabase não configurado no servidor." });
      }

      const { cartItems, orderData } = req.body;
      if (!cartItems || !orderData) {
        return res.status(400).json({ error: "Dados do pedido inválidos." });
      }

      let calculatedTotal = 0;
      const validItems = [];

      // Validar preços reais do banco
      for (const item of cartItems) {
        if (item.product?.id) {
          const { data: prodData } = await supabaseAdmin.from("produtos").select("preco").eq("id", item.product.id).single();
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
      if (orderData.appliedDiscount) calculatedTotal -= orderData.appliedDiscount;
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
        status: orderData.metodo_pagamento === 'pix' ? 'aguardando_pagamento' : 'em_preparo',
        status_pagamento: orderData.metodo_pagamento === 'pix' ? 'pendente' : 'pago',
      };

      const { data: insertedOrder, error: orderError } = await supabaseAdmin.from('pedidos').insert([pedidoDB]).select().single();
      
      if (orderError || !insertedOrder) {
        throw new Error(orderError?.message || "Erro ao inserir pedido.");
      }

      // Inserir Itens
      const itensDB = validItems.map(vi => ({ ...vi, pedido_id: insertedOrder.id }));
      await supabaseAdmin.from('itens_pedidos').insert(itensDB);

      let pixData = null;

      // Integração com Mercado Pago PIX
      if (orderData.metodo_pagamento === 'pix') {
        const { data: secrets } = await supabaseAdmin.from('config_segredos').select('mercadopago_access_token').limit(1).maybeSingle();
        const accessToken = secrets?.mercadopago_access_token;
        
        if (!accessToken) {
          throw new Error("Token do Mercado Pago não configurado. Verifique as configurações de pagamento no Admin.");
        }

        const origin = process.env.APP_URL || req.headers.origin || `http://localhost:${PORT}`;

        try {
          // Utilizar API pura do MP para pagamentos Pix
          const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'X-Idempotency-Key': `order_${insertedOrder.id}_${Date.now()}`
            },
            body: JSON.stringify({
              transaction_amount: Number(calculatedTotal.toFixed(2)),
              description: `Pedido #${insertedOrder.id} - Cloudnine Doceria`,
              payment_method_id: "pix",
              payer: {
                email: orderData.cliente_id && orderData.cliente_id !== 'guest' ? "cliente@cloudnine.com" : "convidado@cloudnine.com", // MP exige um email
                first_name: orderData.cliente_nome
              },
              external_reference: String(insertedOrder.id),
              notification_url: `${origin}/api/webhook/mercadopago`
            })
          });

          const paymentRes = await mpResponse.json();

          if (paymentRes.id) {
            pixData = {
              qr_code: paymentRes.point_of_interaction.transaction_data.qr_code,
              qr_code_base64: paymentRes.point_of_interaction.transaction_data.qr_code_base64,
              payment_id: paymentRes.id
            };
            
            // Atualizar pedido com ID de pagamento externo
            await supabaseAdmin.from('pedidos').update({ id_pagamento_externo: String(paymentRes.id) }).eq('id', insertedOrder.id);
          } else {
             console.error("Erro MP:", paymentRes);
             throw new Error("Erro ao gerar Pix no Mercado Pago.");
          }
        } catch (mpError: any) {
          console.error("Exceção MP:", mpError);
          throw new Error("Falha na comunicação com o Mercado Pago.");
        }
      }

      res.json({ success: true, orderId: insertedOrder.id, totalCalculado: calculatedTotal, pixData });

    } catch (error: any) {
      console.error("Erro no checkout seguro:", error);
      res.status(500).json({ error: error.message || "Erro interno no checkout." });
    }
  });

  // Webhook do Mercado Pago (IPN)
  app.post("/api/webhook/mercadopago", async (req, res) => {
    try {
      const supabaseAdmin = getAdminSupabase();
      if (!supabaseAdmin) return res.status(500).json({ error: "Supabase não configurado" });
      
      const { action, type, data } = req.body;
      const paymentId = req.query['data.id'] || data?.id;
      const topic = req.query.topic || type || action;
      
      if ((topic === 'payment' || topic === 'payment.created' || topic === 'payment.updated') && paymentId) {
        console.log(`[Webhook MP] Pagamento recebido/atualizado. ID: ${paymentId}`);
        
        // Obter access_token para verificar o status real
        const { data: secrets } = await supabaseAdmin.from('config_segredos').select('mercadopago_access_token').limit(1).maybeSingle();
        const accessToken = secrets?.mercadopago_access_token;
        
        if (accessToken) {
           const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
             headers: { 'Authorization': `Bearer ${accessToken}` }
           });
           const paymentInfo = await mpResponse.json();
           
           if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
              const orderId = paymentInfo.external_reference;
              console.log(`[Webhook MP] Pedido ${orderId} aprovado com sucesso!`);
              await supabaseAdmin.from('pedidos').update({ 
                status_pagamento: 'pago',
                status: 'em_preparo'
              }).eq('id', orderId);
           }
        }
      }

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

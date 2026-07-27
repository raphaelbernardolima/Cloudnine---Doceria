import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MercadoPagoConfig, Preference } from "mercadopago";

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

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertSupplierSchema, insertRequestorSchema, insertPurchaseRequestSchema, insertReceptionSchema, insertOutboundSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'article" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  app.get("/api/articles/low-stock", async (req, res) => {
    try {
      const lowStockArticles = await storage.getLowStockArticles();
      res.json(lowStockArticles);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des articles en stock bas" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des fournisseurs" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Requestors routes
  app.get("/api/requestors", async (req, res) => {
    try {
      const requestors = await storage.getRequestors();
      res.json(requestors);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des demandeurs" });
    }
  });

  app.post("/api/requestors", async (req, res) => {
    try {
      const validatedData = insertRequestorSchema.parse(req.body);
      const requestor = await storage.createRequestor(validatedData);
      res.status(201).json(requestor);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/requestors/:id", async (req, res) => {
    try {
      const requestor = await storage.updateRequestor(req.params.id, req.body);
      res.json(requestor);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/requestors/:id", async (req, res) => {
    try {
      await storage.deleteRequestor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Purchase Requests routes
  app.get("/api/purchase-requests", async (req, res) => {
    try {
      const requests = await storage.getPurchaseRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des demandes d'achat" });
    }
  });

  app.post("/api/purchase-requests", async (req, res) => {
    try {
      const validatedData = insertPurchaseRequestSchema.parse(req.body);
      const request = await storage.createPurchaseRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/purchase-requests/:id", async (req, res) => {
    try {
      const request = await storage.updatePurchaseRequest(req.params.id, req.body);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/purchase-requests/:id", async (req, res) => {
    try {
      await storage.deletePurchaseRequest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Receptions routes
  app.get("/api/receptions", async (req, res) => {
    try {
      const receptions = await storage.getReceptions();
      res.json(receptions);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des réceptions" });
    }
  });

  app.post("/api/receptions", async (req, res) => {
    try {
      const validatedData = insertReceptionSchema.parse(req.body);
      const reception = await storage.createReception(validatedData);
      res.status(201).json(reception);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  // Outbounds routes
  app.get("/api/outbounds", async (req, res) => {
    try {
      const outbounds = await storage.getOutbounds();
      res.json(outbounds);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des sorties" });
    }
  });

  app.post("/api/outbounds", async (req, res) => {
    try {
      const validatedData = insertOutboundSchema.parse(req.body);
      const outbound = await storage.createOutbound(validatedData);
      res.status(201).json(outbound);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  // Stock movements
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const articleId = req.query.articleId as string;
      const movements = await storage.getStockMovements(articleId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des mouvements" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { 
  type Article, type InsertArticle,
  type Supplier, type InsertSupplier,
  type Requestor, type InsertRequestor,
  type PurchaseRequest, type InsertPurchaseRequest,
  type Reception, type InsertReception,
  type Outbound, type InsertOutbound,
  type StockMovement,
  articles, suppliers, requestors, purchaseRequests, receptions, outbounds, stockMovements
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, lte, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<Article>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getLowStockArticles(): Promise<Article[]>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;

  // Requestors
  getRequestors(): Promise<Requestor[]>;
  getRequestor(id: string): Promise<Requestor | undefined>;
  createRequestor(requestor: InsertRequestor): Promise<Requestor>;
  updateRequestor(id: string, requestor: Partial<Requestor>): Promise<Requestor>;
  deleteRequestor(id: string): Promise<void>;

  // Purchase Requests
  getPurchaseRequests(): Promise<PurchaseRequest[]>;
  getPurchaseRequest(id: string): Promise<PurchaseRequest | undefined>;
  createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest>;
  updatePurchaseRequest(id: string, request: Partial<PurchaseRequest>): Promise<PurchaseRequest>;
  deletePurchaseRequest(id: string): Promise<void>;

  // Receptions
  getReceptions(): Promise<Reception[]>;
  getReception(id: string): Promise<Reception | undefined>;
  createReception(reception: InsertReception): Promise<Reception>;
  updateReception(id: string, reception: Partial<Reception>): Promise<Reception>;
  deleteReception(id: string): Promise<void>;

  // Outbounds
  getOutbounds(): Promise<Outbound[]>;
  getOutbound(id: string): Promise<Outbound | undefined>;
  createOutbound(outbound: InsertOutbound): Promise<Outbound>;
  updateOutbound(id: string, outbound: Partial<Outbound>): Promise<Outbound>;
  deleteOutbound(id: string): Promise<void>;

  // Stock Movements
  getStockMovements(articleId?: string): Promise<StockMovement[]>;
  createStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalArticles: number;
    lowStock: number;
    pendingRequests: number;
    stockValue: number;
  }>;
}

export class MemStorage implements IStorage {
  private articles: Map<string, Article> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private requestors: Map<string, Requestor> = new Map();
  private purchaseRequests: Map<string, PurchaseRequest> = new Map();
  private receptions: Map<string, Reception> = new Map();
  private outbounds: Map<string, Outbound> = new Map();
  private stockMovements: Map<string, StockMovement> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with empty data - no mock data
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const newArticle: Article = {
      ...article,
      id,
      stockActuel: article.stockInitial,
      createdAt: new Date(),
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
    const existing = this.articles.get(id);
    if (!existing) {
      throw new Error("Article not found");
    }
    const updated = { ...existing, ...article };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    this.articles.delete(id);
  }

  async getLowStockArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(
      article => article.stockActuel <= (article.seuilMinimum || 10)
    );
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const newSupplier: Supplier = {
      ...supplier,
      id,
      createdAt: new Date(),
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const existing = this.suppliers.get(id);
    if (!existing) {
      throw new Error("Supplier not found");
    }
    const updated = { ...existing, ...supplier };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<void> {
    this.suppliers.delete(id);
  }

  // Requestors
  async getRequestors(): Promise<Requestor[]> {
    return Array.from(this.requestors.values());
  }

  async getRequestor(id: string): Promise<Requestor | undefined> {
    return this.requestors.get(id);
  }

  async createRequestor(requestor: InsertRequestor): Promise<Requestor> {
    const id = randomUUID();
    const newRequestor: Requestor = {
      ...requestor,
      id,
      createdAt: new Date(),
    };
    this.requestors.set(id, newRequestor);
    return newRequestor;
  }

  async updateRequestor(id: string, requestor: Partial<Requestor>): Promise<Requestor> {
    const existing = this.requestors.get(id);
    if (!existing) {
      throw new Error("Requestor not found");
    }
    const updated = { ...existing, ...requestor };
    this.requestors.set(id, updated);
    return updated;
  }

  async deleteRequestor(id: string): Promise<void> {
    this.requestors.delete(id);
  }

  // Purchase Requests
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    return Array.from(this.purchaseRequests.values());
  }

  async getPurchaseRequest(id: string): Promise<PurchaseRequest | undefined> {
    return this.purchaseRequests.get(id);
  }

  async createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest> {
    const id = randomUUID();
    const newRequest: PurchaseRequest = {
      ...request,
      id,
      dateInitiation: new Date(),
      createdAt: new Date(),
    };
    this.purchaseRequests.set(id, newRequest);
    return newRequest;
  }

  async updatePurchaseRequest(id: string, request: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const existing = this.purchaseRequests.get(id);
    if (!existing) {
      throw new Error("Purchase request not found");
    }
    const updated = { ...existing, ...request };
    this.purchaseRequests.set(id, updated);
    return updated;
  }

  async deletePurchaseRequest(id: string): Promise<void> {
    this.purchaseRequests.delete(id);
  }

  // Receptions
  async getReceptions(): Promise<Reception[]> {
    return Array.from(this.receptions.values());
  }

  async getReception(id: string): Promise<Reception | undefined> {
    return this.receptions.get(id);
  }

  async createReception(reception: InsertReception): Promise<Reception> {
    const id = randomUUID();
    const newReception: Reception = {
      ...reception,
      id,
      createdAt: new Date(),
    };
    this.receptions.set(id, newReception);

    // Update article stock and create movement
    const article = await this.getArticle(reception.articleId);
    if (article) {
      const newStock = article.stockActuel + reception.quantiteRecue;
      await this.updateArticle(reception.articleId, { stockActuel: newStock });
      
      await this.createStockMovement({
        id: randomUUID(),
        articleId: reception.articleId,
        type: "entree",
        quantite: reception.quantiteRecue,
        quantiteAvant: article.stockActuel,
        quantiteApres: newStock,
        reference: id,
        dateMovement: new Date(),
        description: `Réception - NBL: ${reception.numeroBonLivraison || 'N/A'}`,
      });
    }

    return newReception;
  }

  async updateReception(id: string, reception: Partial<Reception>): Promise<Reception> {
    const existing = this.receptions.get(id);
    if (!existing) {
      throw new Error("Reception not found");
    }
    const updated = { ...existing, ...reception };
    this.receptions.set(id, updated);
    return updated;
  }

  async deleteReception(id: string): Promise<void> {
    this.receptions.delete(id);
  }

  // Outbounds
  async getOutbounds(): Promise<Outbound[]> {
    return Array.from(this.outbounds.values());
  }

  async getOutbound(id: string): Promise<Outbound | undefined> {
    return this.outbounds.get(id);
  }

  async createOutbound(outbound: InsertOutbound): Promise<Outbound> {
    const id = randomUUID();
    const newOutbound: Outbound = {
      ...outbound,
      id,
      createdAt: new Date(),
    };

    // Check stock availability
    const article = await this.getArticle(outbound.articleId);
    if (!article || article.stockActuel < outbound.quantiteSortie) {
      throw new Error("Stock insuffisant");
    }

    this.outbounds.set(id, newOutbound);

    // Update article stock and create movement
    const newStock = article.stockActuel - outbound.quantiteSortie;
    await this.updateArticle(outbound.articleId, { stockActuel: newStock });
    
    await this.createStockMovement({
      id: randomUUID(),
      articleId: outbound.articleId,
      type: "sortie",
      quantite: outbound.quantiteSortie,
      quantiteAvant: article.stockActuel,
      quantiteApres: newStock,
      reference: id,
      dateMovement: new Date(),
      description: `Sortie - ${outbound.motifSortie}`,
    });

    return newOutbound;
  }

  async updateOutbound(id: string, outbound: Partial<Outbound>): Promise<Outbound> {
    const existing = this.outbounds.get(id);
    if (!existing) {
      throw new Error("Outbound not found");
    }
    const updated = { ...existing, ...outbound };
    this.outbounds.set(id, updated);
    return updated;
  }

  async deleteOutbound(id: string): Promise<void> {
    this.outbounds.delete(id);
  }

  // Stock Movements
  async getStockMovements(articleId?: string): Promise<StockMovement[]> {
    const movements = Array.from(this.stockMovements.values());
    if (articleId) {
      return movements.filter(m => m.articleId === articleId);
    }
    return movements;
  }

  async createStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement> {
    const id = randomUUID();
    const newMovement: StockMovement = { ...movement, id };
    this.stockMovements.set(id, newMovement);
    return newMovement;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalArticles: number;
    lowStock: number;
    pendingRequests: number;
    stockValue: number;
  }> {
    const articles = await this.getArticles();
    const lowStockArticles = await this.getLowStockArticles();
    const purchaseRequests = await this.getPurchaseRequests();
    
    const pendingRequests = purchaseRequests.filter(req => req.statut === "en_attente").length;
    
    const stockValue = articles.reduce((total, article) => {
      const price = parseFloat(article.prixUnitaire || "0");
      return total + (price * article.stockActuel);
    }, 0);

    return {
      totalArticles: articles.length,
      lowStock: lowStockArticles.length,
      pendingRequests,
      stockValue,
    };
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // Articles
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const [newArticle] = await db
      .insert(articles)
      .values({
        ...article,
        id,
        stockActuel: article.stockInitial,
      })
      .returning();
    return newArticle;
  }

  async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
    const [updated] = await db
      .update(articles)
      .set(article)
      .where(eq(articles.id, id))
      .returning();
    if (!updated) {
      throw new Error("Article not found");
    }
    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getLowStockArticles(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(lte(articles.stockActuel, articles.seuilMinimum));
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const [newSupplier] = await db
      .insert(suppliers)
      .values({ ...supplier, id })
      .returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const [updated] = await db
      .update(suppliers)
      .set(supplier)
      .where(eq(suppliers.id, id))
      .returning();
    if (!updated) {
      throw new Error("Supplier not found");
    }
    return updated;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  // Requestors
  async getRequestors(): Promise<Requestor[]> {
    return await db.select().from(requestors);
  }

  async getRequestor(id: string): Promise<Requestor | undefined> {
    const [requestor] = await db.select().from(requestors).where(eq(requestors.id, id));
    return requestor || undefined;
  }

  async createRequestor(requestor: InsertRequestor): Promise<Requestor> {
    const id = randomUUID();
    const [newRequestor] = await db
      .insert(requestors)
      .values({ ...requestor, id })
      .returning();
    return newRequestor;
  }

  async updateRequestor(id: string, requestor: Partial<Requestor>): Promise<Requestor> {
    const [updated] = await db
      .update(requestors)
      .set(requestor)
      .where(eq(requestors.id, id))
      .returning();
    if (!updated) {
      throw new Error("Requestor not found");
    }
    return updated;
  }

  async deleteRequestor(id: string): Promise<void> {
    await db.delete(requestors).where(eq(requestors.id, id));
  }

  // Purchase Requests
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    return await db.select().from(purchaseRequests);
  }

  async getPurchaseRequest(id: string): Promise<PurchaseRequest | undefined> {
    const [request] = await db.select().from(purchaseRequests).where(eq(purchaseRequests.id, id));
    return request || undefined;
  }

  async createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest> {
    const id = randomUUID();
    const [newRequest] = await db
      .insert(purchaseRequests)
      .values({ ...request, id })
      .returning();
    return newRequest;
  }

  async updatePurchaseRequest(id: string, request: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const [updated] = await db
      .update(purchaseRequests)
      .set(request)
      .where(eq(purchaseRequests.id, id))
      .returning();
    if (!updated) {
      throw new Error("Purchase request not found");
    }
    return updated;
  }

  async deletePurchaseRequest(id: string): Promise<void> {
    await db.delete(purchaseRequests).where(eq(purchaseRequests.id, id));
  }

  // Receptions
  async getReceptions(): Promise<Reception[]> {
    return await db.select().from(receptions);
  }

  async getReception(id: string): Promise<Reception | undefined> {
    const [reception] = await db.select().from(receptions).where(eq(receptions.id, id));
    return reception || undefined;
  }

  async createReception(reception: InsertReception): Promise<Reception> {
    const id = randomUUID();
    const [newReception] = await db
      .insert(receptions)
      .values({ ...reception, id })
      .returning();

    // Update article stock and create movement
    const article = await this.getArticle(reception.articleId);
    if (article) {
      const newStock = article.stockActuel + reception.quantiteRecue;
      await this.updateArticle(reception.articleId, { stockActuel: newStock });
      
      await this.createStockMovement({
        id: randomUUID(),
        articleId: reception.articleId,
        type: "entree",
        quantite: reception.quantiteRecue,
        quantiteAvant: article.stockActuel,
        quantiteApres: newStock,
        reference: id,
        dateMovement: new Date(),
        description: `Réception - NBL: ${reception.numeroBonLivraison || 'N/A'}`,
      });
    }

    return newReception;
  }

  async updateReception(id: string, reception: Partial<Reception>): Promise<Reception> {
    const [updated] = await db
      .update(receptions)
      .set(reception)
      .where(eq(receptions.id, id))
      .returning();
    if (!updated) {
      throw new Error("Reception not found");
    }
    return updated;
  }

  async deleteReception(id: string): Promise<void> {
    await db.delete(receptions).where(eq(receptions.id, id));
  }

  // Outbounds
  async getOutbounds(): Promise<Outbound[]> {
    return await db.select().from(outbounds);
  }

  async getOutbound(id: string): Promise<Outbound | undefined> {
    const [outbound] = await db.select().from(outbounds).where(eq(outbounds.id, id));
    return outbound || undefined;
  }

  async createOutbound(outbound: InsertOutbound): Promise<Outbound> {
    const id = randomUUID();

    // Check stock availability
    const article = await this.getArticle(outbound.articleId);
    if (!article || article.stockActuel < outbound.quantiteSortie) {
      throw new Error("Stock insuffisant");
    }

    const [newOutbound] = await db
      .insert(outbounds)
      .values({ ...outbound, id })
      .returning();

    // Update article stock and create movement
    const newStock = article.stockActuel - outbound.quantiteSortie;
    await this.updateArticle(outbound.articleId, { stockActuel: newStock });
    
    await this.createStockMovement({
      id: randomUUID(),
      articleId: outbound.articleId,
      type: "sortie",
      quantite: outbound.quantiteSortie,
      quantiteAvant: article.stockActuel,
      quantiteApres: newStock,
      reference: id,
      dateMovement: new Date(),
      description: `Sortie - ${outbound.motifSortie}`,
    });

    return newOutbound;
  }

  async updateOutbound(id: string, outbound: Partial<Outbound>): Promise<Outbound> {
    const [updated] = await db
      .update(outbounds)
      .set(outbound)
      .where(eq(outbounds.id, id))
      .returning();
    if (!updated) {
      throw new Error("Outbound not found");
    }
    return updated;
  }

  async deleteOutbound(id: string): Promise<void> {
    await db.delete(outbounds).where(eq(outbounds.id, id));
  }

  // Stock Movements
  async getStockMovements(articleId?: string): Promise<StockMovement[]> {
    if (articleId) {
      return await db
        .select()
        .from(stockMovements)
        .where(eq(stockMovements.articleId, articleId));
    }
    return await db.select().from(stockMovements);
  }

  async createStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement> {
    const id = randomUUID();
    const [newMovement] = await db
      .insert(stockMovements)
      .values({ ...movement, id })
      .returning();
    return newMovement;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalArticles: number;
    lowStock: number;
    pendingRequests: number;
    stockValue: number;
  }> {
    // Get total articles count
    const [totalArticlesResult] = await db
      .select({ count: count() })
      .from(articles);
    
    // Get low stock articles count
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(articles)
      .where(lte(articles.stockActuel, articles.seuilMinimum));
    
    // Get pending requests count
    const [pendingRequestsResult] = await db
      .select({ count: count() })
      .from(purchaseRequests)
      .where(eq(purchaseRequests.statut, "en_attente"));
    
    // Calculate stock value
    const [stockValueResult] = await db
      .select({ 
        value: sql<number>`SUM(CAST(${articles.prixUnitaire} AS DECIMAL) * ${articles.stockActuel})`.mapWith(Number)
      })
      .from(articles);

    return {
      totalArticles: totalArticlesResult.count,
      lowStock: lowStockResult.count,
      pendingRequests: pendingRequestsResult.count,
      stockValue: stockValueResult.value || 0,
    };
  }
}

export const storage = new DatabaseStorage();

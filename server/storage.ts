import { 
  type Article, type InsertArticle,
  type Supplier, type InsertSupplier,
  type Requestor, type InsertRequestor,
  type PurchaseRequest, type InsertPurchaseRequest,
  type Reception, type InsertReception,
  type Outbound, type InsertOutbound,
  type StockMovement,
  type Category, type InsertCategory,
  type Marque, type InsertMarque,
  type Departement, type InsertDepartement,
  type Poste, type InsertPoste,
  articles, suppliers, requestors, purchaseRequests, receptions, outbounds, stockMovements, categories, marques, departements, postes
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
  getPurchaseRequestsReadyForReception(): Promise<PurchaseRequest[]>;

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

  // Chart data
  getStockEvolutionData(): Promise<Array<{
    month: string;
    stock: number;
    value: number;
  }>>;

  getPurchaseStatusData(): Promise<Array<{
    status: string;
    count: number;
    color: string;
  }>>;

  getCategoryDistributionData(): Promise<Array<{
    category: string;
    count: number;
    percentage: number;
  }>>;

  getRecentMovementsData(): Promise<Array<{
    date: string;
    type: string;
    quantity: number;
    article: string;
  }>>;

  // New entities CRUD operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  getMarques(): Promise<Marque[]>;
  getMarque(id: string): Promise<Marque | undefined>;
  createMarque(marque: InsertMarque): Promise<Marque>;
  updateMarque(id: string, marque: Partial<Marque>): Promise<Marque>;
  deleteMarque(id: string): Promise<void>;

  getDepartements(): Promise<Departement[]>;
  getDepartement(id: string): Promise<Departement | undefined>;
  createDepartement(departement: InsertDepartement): Promise<Departement>;
  updateDepartement(id: string, departement: Partial<Departement>): Promise<Departement>;
  deleteDepartement(id: string): Promise<void>;

  getPostes(): Promise<Poste[]>;
  getPoste(id: string): Promise<Poste | undefined>;
  createPoste(poste: InsertPoste): Promise<Poste>;
  updatePoste(id: string, poste: Partial<Poste>): Promise<Poste>;
  deletePoste(id: string): Promise<void>;
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
      stockInitial: article.stockInitial || 0,
      stockActuel: article.stockInitial || 0,
      createdAt: new Date(),
      prixUnitaire: article.prixUnitaire?.toString() || null,
      marque: article.marque ?? null,
      reference: article.reference ?? null,
      fournisseurId: article.fournisseurId ?? null,
      seuilMinimum: article.seuilMinimum ?? null,
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
      contact: supplier.contact ?? null,
      telephone: supplier.telephone ?? null,
      email: supplier.email ?? null,
      adresse: supplier.adresse ?? null,
      conditionsPaiement: supplier.conditionsPaiement ?? null,
      delaiLivraison: supplier.delaiLivraison ?? null,
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
      poste: requestor.poste ?? null,
      email: requestor.email ?? null,
      telephone: requestor.telephone ?? null,
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
      observations: request.observations ?? null,
      statut: request.statut ?? "en_attente",
      supplierId: request.supplierId ?? null,
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

  async getPurchaseRequestsReadyForReception(): Promise<PurchaseRequest[]> {
    return Array.from(this.purchaseRequests.values()).filter(
      request => request.statut === "approuve"
    );
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
      prixUnitaire: reception.prixUnitaire?.toString() || null,
      observations: reception.observations ?? null,
      numeroBonLivraison: reception.numeroBonLivraison ?? null,
    };
    this.receptions.set(id, newReception);

    // Update article stock and create movement
    const article = await this.getArticle(reception.articleId);
    if (article) {
      const newStock = article.stockActuel + reception.quantiteRecue;
      await this.updateArticle(reception.articleId, { stockActuel: newStock });
      
      await this.createStockMovement({
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
      observations: outbound.observations ?? null,
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

  // Chart data methods for MemStorage
  async getStockEvolutionData(): Promise<Array<{
    month: string;
    stock: number;
    value: number;
  }>> {
    // Return empty data since there's no historical data yet
    return [];
  }

  async getPurchaseStatusData(): Promise<Array<{
    status: string;
    count: number;
    color: string;
  }>> {
    const requests = await this.getPurchaseRequests();
    const statusCounts = requests.reduce((acc, req) => {
      acc[req.statut] = (acc[req.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      'en_attente': '#f59e0b',
      'approuve': '#10b981',
      'refuse': '#ef4444',
      'commande': '#3b82f6'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status === 'en_attente' ? 'En Attente' : 
              status === 'approuve' ? 'Approuvé' :
              status === 'refuse' ? 'Refusé' : 'Commandé',
      count,
      color: statusColors[status as keyof typeof statusColors] || '#6b7280'
    }));
  }

  async getCategoryDistributionData(): Promise<Array<{
    category: string;
    count: number;
    percentage: number;
  }>> {
    const articles = await this.getArticles();
    if (articles.length === 0) return [];

    const categoryCounts = articles.reduce((acc, article) => {
      acc[article.categorie] = (acc[article.categorie] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / articles.length) * 100)
    }));
  }

  async getRecentMovementsData(): Promise<Array<{
    date: string;
    type: string;
    quantity: number;
    article: string;
  }>> {
    const movements = await this.getStockMovements();
    return movements
      .slice(-10) // Get last 10 movements
      .map(movement => ({
        date: movement.dateMovement.toLocaleDateString('fr-FR'),
        type: movement.type === 'entree' ? 'Entrée' : 'Sortie',
        quantity: movement.quantite,
        article: movement.articleId.substring(0, 8) + '...'
      }));
  }

  // New entities - MemStorage implementation (simple maps)
  private categories: Map<string, Category> = new Map();
  private marques: Map<string, Marque> = new Map();
  private departements: Map<string, Departement> = new Map();
  private postes: Map<string, Poste> = new Map();

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id, description: category.description || null, createdAt: new Date() };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error("Category not found");
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  async getMarques(): Promise<Marque[]> {
    return Array.from(this.marques.values());
  }

  async getMarque(id: string): Promise<Marque | undefined> {
    return this.marques.get(id);
  }

  async createMarque(marque: InsertMarque): Promise<Marque> {
    const id = randomUUID();
    const newMarque: Marque = { ...marque, id, description: marque.description || null, createdAt: new Date() };
    this.marques.set(id, newMarque);
    return newMarque;
  }

  async updateMarque(id: string, marque: Partial<Marque>): Promise<Marque> {
    const existing = this.marques.get(id);
    if (!existing) throw new Error("Marque not found");
    const updated = { ...existing, ...marque };
    this.marques.set(id, updated);
    return updated;
  }

  async deleteMarque(id: string): Promise<void> {
    this.marques.delete(id);
  }

  async getDepartements(): Promise<Departement[]> {
    return Array.from(this.departements.values());
  }

  async getDepartement(id: string): Promise<Departement | undefined> {
    return this.departements.get(id);
  }

  async createDepartement(departement: InsertDepartement): Promise<Departement> {
    const id = randomUUID();
    const newDepartement: Departement = { ...departement, id, description: departement.description || null, createdAt: new Date() };
    this.departements.set(id, newDepartement);
    return newDepartement;
  }

  async updateDepartement(id: string, departement: Partial<Departement>): Promise<Departement> {
    const existing = this.departements.get(id);
    if (!existing) throw new Error("Departement not found");
    const updated = { ...existing, ...departement };
    this.departements.set(id, updated);
    return updated;
  }

  async deleteDepartement(id: string): Promise<void> {
    this.departements.delete(id);
  }

  async getPostes(): Promise<Poste[]> {
    return Array.from(this.postes.values());
  }

  async getPoste(id: string): Promise<Poste | undefined> {
    return this.postes.get(id);
  }

  async createPoste(poste: InsertPoste): Promise<Poste> {
    const id = randomUUID();
    const newPoste: Poste = { ...poste, id, description: poste.description || null, departementId: poste.departementId || null, createdAt: new Date() };
    this.postes.set(id, newPoste);
    return newPoste;
  }

  async updatePoste(id: string, poste: Partial<Poste>): Promise<Poste> {
    const existing = this.postes.get(id);
    if (!existing) throw new Error("Poste not found");
    const updated = { ...existing, ...poste };
    this.postes.set(id, updated);
    return updated;
  }

  async deletePoste(id: string): Promise<void> {
    this.postes.delete(id);
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
        stockInitial: article.stockInitial || 0,
        stockActuel: article.stockInitial || 0,
        prixUnitaire: article.prixUnitaire?.toString() || null,
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

  async getPurchaseRequestsReadyForReception(): Promise<PurchaseRequest[]> {
    return await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.statut, "approuve"));
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
      .values({ 
        ...reception, 
        id,
        prixUnitaire: reception.prixUnitaire?.toString() || null
      })
      .returning();

    // Update article stock and create movement
    const article = await this.getArticle(reception.articleId);
    if (article) {
      const newStock = article.stockActuel + reception.quantiteRecue;
      await this.updateArticle(reception.articleId, { stockActuel: newStock });
      
      await this.createStockMovement({
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

  // Chart data methods for DatabaseStorage
  async getStockEvolutionData(): Promise<Array<{
    month: string;
    stock: number;
    value: number;
  }>> {
    // For now, return empty array since we need historical data tracking
    // In a real implementation, you would track stock levels over time
    return [];
  }

  async getPurchaseStatusData(): Promise<Array<{
    status: string;
    count: number;
    color: string;
  }>> {
    const results = await db
      .select({
        status: purchaseRequests.statut,
        count: count()
      })
      .from(purchaseRequests)
      .groupBy(purchaseRequests.statut);

    const statusColors = {
      'en_attente': '#f59e0b',
      'approuve': '#10b981',
      'refuse': '#ef4444',
      'commande': '#3b82f6'
    };

    return results.map(result => ({
      status: result.status === 'en_attente' ? 'En Attente' : 
              result.status === 'approuve' ? 'Approuvé' :
              result.status === 'refuse' ? 'Refusé' : 'Commandé',
      count: result.count,
      color: statusColors[result.status as keyof typeof statusColors] || '#6b7280'
    }));
  }

  async getCategoryDistributionData(): Promise<Array<{
    category: string;
    count: number;
    percentage: number;
  }>> {
    const results = await db
      .select({
        category: articles.categorie,
        count: count()
      })
      .from(articles)
      .groupBy(articles.categorie);

    const total = results.reduce((sum, result) => sum + result.count, 0);
    
    return results.map(result => ({
      category: result.category,
      count: result.count,
      percentage: total > 0 ? Math.round((result.count / total) * 100) : 0
    }));
  }

  async getRecentMovementsData(): Promise<Array<{
    date: string;
    type: string;
    quantity: number;
    article: string;
  }>> {
    const movements = await db
      .select({
        dateMovement: stockMovements.dateMovement,
        type: stockMovements.type,
        quantite: stockMovements.quantite,
        articleId: stockMovements.articleId
      })
      .from(stockMovements)
      .orderBy(stockMovements.dateMovement)
      .limit(10);

    return movements.map(movement => ({
      date: movement.dateMovement.toLocaleDateString('fr-FR'),
      type: movement.type === 'entree' ? 'Entrée' : 'Sortie',
      quantity: movement.quantite,
      article: movement.articleId.substring(0, 8) + '...'
    }));
  }

  // New entities - DatabaseStorage implementation
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const [newCategory] = await db
      .insert(categories)
      .values({ ...category, id })
      .returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    if (!updated) {
      throw new Error("Category not found");
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getMarques(): Promise<Marque[]> {
    return await db.select().from(marques);
  }

  async getMarque(id: string): Promise<Marque | undefined> {
    const [marque] = await db.select().from(marques).where(eq(marques.id, id));
    return marque || undefined;
  }

  async createMarque(marque: InsertMarque): Promise<Marque> {
    const id = randomUUID();
    const [newMarque] = await db
      .insert(marques)
      .values({ ...marque, id })
      .returning();
    return newMarque;
  }

  async updateMarque(id: string, marque: Partial<Marque>): Promise<Marque> {
    const [updated] = await db
      .update(marques)
      .set(marque)
      .where(eq(marques.id, id))
      .returning();
    if (!updated) {
      throw new Error("Marque not found");
    }
    return updated;
  }

  async deleteMarque(id: string): Promise<void> {
    await db.delete(marques).where(eq(marques.id, id));
  }

  async getDepartements(): Promise<Departement[]> {
    return await db.select().from(departements);
  }

  async getDepartement(id: string): Promise<Departement | undefined> {
    const [departement] = await db.select().from(departements).where(eq(departements.id, id));
    return departement || undefined;
  }

  async createDepartement(departement: InsertDepartement): Promise<Departement> {
    const id = randomUUID();
    const [newDepartement] = await db
      .insert(departements)
      .values({ ...departement, id })
      .returning();
    return newDepartement;
  }

  async updateDepartement(id: string, departement: Partial<Departement>): Promise<Departement> {
    const [updated] = await db
      .update(departements)
      .set(departement)
      .where(eq(departements.id, id))
      .returning();
    if (!updated) {
      throw new Error("Departement not found");
    }
    return updated;
  }

  async deleteDepartement(id: string): Promise<void> {
    await db.delete(departements).where(eq(departements.id, id));
  }

  async getPostes(): Promise<Poste[]> {
    return await db.select().from(postes);
  }

  async getPoste(id: string): Promise<Poste | undefined> {
    const [poste] = await db.select().from(postes).where(eq(postes.id, id));
    return poste || undefined;
  }

  async createPoste(poste: InsertPoste): Promise<Poste> {
    const id = randomUUID();
    const [newPoste] = await db
      .insert(postes)
      .values({ ...poste, id })
      .returning();
    return newPoste;
  }

  async updatePoste(id: string, poste: Partial<Poste>): Promise<Poste> {
    const [updated] = await db
      .update(postes)
      .set(poste)
      .where(eq(postes.id, id))
      .returning();
    if (!updated) {
      throw new Error("Poste not found");
    }
    return updated;
  }

  async deletePoste(id: string): Promise<void> {
    await db.delete(postes).where(eq(postes.id, id));
  }
}

export const storage = new DatabaseStorage();

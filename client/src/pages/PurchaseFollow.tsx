import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, Clock, User, Building, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseRequest, Article, Supplier } from "@shared/schema";

export default function PurchaseFollow() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch purchase requests
  const { data: purchaseRequests = [], isLoading } = useQuery<PurchaseRequest[]>({
    queryKey: ["/api/purchase-requests"],
  });

  // Fetch articles for reference
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Fetch suppliers for reference
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
    },
  });

  // Filter requests based on search and status
  const filteredRequests = purchaseRequests.filter((request) => {
    const article = articles.find(a => a.id === request.articleId);
    const supplier = suppliers.find(s => s.id === request.supplierId);
    
    const matchesSearch = !searchTerm || 
      article?.codeArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article?.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group requests by status
  const groupedRequests = {
    en_attente: filteredRequests.filter(r => r.statut === "en_attente"),
    approuve: filteredRequests.filter(r => r.statut === "approuve"),
    commande: filteredRequests.filter(r => r.statut === "commande"),
    refuse: filteredRequests.filter(r => r.statut === "refuse"),
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      en_attente: { color: "bg-yellow-100 text-yellow-800", label: "En Attente", icon: Clock },
      approuve: { color: "bg-green-100 text-green-800", label: "Approuvé", icon: CheckCircle },
      commande: { color: "bg-blue-100 text-blue-800", label: "Commandé", icon: Package },
      refuse: { color: "bg-red-100 text-red-800", label: "Refusé", icon: AlertCircle },
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.en_attente;
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const RequestCard = ({ request }: { request: PurchaseRequest }) => {
    const article = articles.find(a => a.id === request.articleId);
    const supplier = suppliers.find(s => s.id === request.supplierId);

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg">{article?.designation || "Article non trouvé"}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Code: {article?.codeArticle}</span>
                <span>•</span>
                <span>Qté: {request.quantiteDemandee} {article?.unite}</span>
              </CardDescription>
            </div>
            {getStatusBadge(request.statut)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Date demande: {format(new Date(request.dateDemande), "dd/MM/yyyy", { locale: fr })}</span>
            </div>
            {supplier && (
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span>Fournisseur: {supplier.nom}</span>
              </div>
            )}
          </div>
          
          {request.observations && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">{request.observations}</p>
            </div>
          )}
          
          {request.statut === "en_attente" && (
            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => updateStatusMutation.mutate({ id: request.id, statut: "approuve" })}
                disabled={updateStatusMutation.isPending}
              >
                Approuver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatusMutation.mutate({ id: request.id, statut: "refuse" })}
                disabled={updateStatusMutation.isPending}
              >
                Refuser
              </Button>
            </div>
          )}
          
          {request.statut === "approuve" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => updateStatusMutation.mutate({ id: request.id, statut: "commande" })}
              disabled={updateStatusMutation.isPending}
            >
              Marquer comme Commandé
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suivi des Achats</h1>
          <p className="text-gray-600">Gestion et suivi des demandes d'achat</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Rechercher par article ou fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_attente">En Attente</SelectItem>
            <SelectItem value="approuve">Approuvé</SelectItem>
            <SelectItem value="commande">Commandé</SelectItem>
            <SelectItem value="refuse">Refusé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(groupedRequests).map(([status, requests]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {status === "en_attente" && "En Attente"}
                {status === "approuve" && "Approuvé"}
                {status === "commande" && "Commandé"}
                {status === "refuse" && "Refusé"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different statuses */}
      <Tabs defaultValue="en_attente" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="en_attente">En Attente ({groupedRequests.en_attente.length})</TabsTrigger>
          <TabsTrigger value="approuve">Approuvé ({groupedRequests.approuve.length})</TabsTrigger>
          <TabsTrigger value="commande">Commandé ({groupedRequests.commande.length})</TabsTrigger>
          <TabsTrigger value="refuse">Refusé ({groupedRequests.refuse.length})</TabsTrigger>
        </TabsList>

        {Object.entries(groupedRequests).map(([status, requests]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Aucune demande avec le statut "{status.replace('_', ' ')}"
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
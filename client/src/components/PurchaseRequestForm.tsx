import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPurchaseRequestSchema, type PurchaseRequest, type InsertPurchaseRequest, type Article, type Requestor, type Supplier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SearchableSelect from "./SearchableSelect";

interface PurchaseRequestFormProps {
  request?: PurchaseRequest | null;
  onClose: () => void;
}

export default function PurchaseRequestForm({ request, onClose }: PurchaseRequestFormProps) {
  const { toast } = useToast();
  const isEditing = !!request;

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const { data: requestors = [] } = useQuery<Requestor[]>({
    queryKey: ["/api/requestors"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<InsertPurchaseRequest>({
    resolver: zodResolver(insertPurchaseRequestSchema),
    defaultValues: {
      dateDemande: request?.dateDemande || new Date(),
      requestorId: request?.requestorId || "",
      articleId: request?.articleId || "",
      quantiteDemandee: request?.quantiteDemandee || 1,
      observations: request?.observations || "",
      statut: request?.statut || "en_attente",
      supplierId: request?.supplierId || "none",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPurchaseRequest) => apiRequest("POST", "/api/purchase-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Demande créée",
        description: "La demande d'achat a été créée avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PurchaseRequest>) => apiRequest("PUT", `/api/purchase-requests/${request!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Demande modifiée",
        description: "La demande d'achat a été modifiée avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la demande",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPurchaseRequest) => {
    // Convert "none" back to null for supplierId and ensure proper date format
    const processedData = {
      ...data,
      supplierId: data.supplierId === "none" || data.supplierId === "" ? null : data.supplierId
    };
    
    if (isEditing) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="purchase-request-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la Demande" : "Nouvelle Demande d'Achat"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requestorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demandeur *</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      options={requestors.map((requestor: any) => ({
                        value: requestor.id,
                        label: `${requestor.nom} ${requestor.prenom} - ${requestor.departement}`,
                        searchText: `${requestor.nom} ${requestor.prenom} ${requestor.departement}`
                      }))}
                      placeholder="Sélectionner un demandeur"
                      searchPlaceholder="Rechercher un demandeur..."
                      testId="select-requestor"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="articleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article *</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      options={articles.map((article: any) => ({
                        value: article.id,
                        label: `${article.codeArticle} - ${article.designation}`,
                        searchText: `${article.codeArticle} ${article.designation} ${article.categorie}`
                      }))}
                      placeholder="Sélectionner un article"
                      searchPlaceholder="Rechercher un article..."
                      testId="select-article"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantiteDemandee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité demandée *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-quantite"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur suggéré</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-supplier">
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucun fournisseur</SelectItem>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Commentaires, urgence, spécifications..." 
                      {...field} 
                      value={field.value || ""}
                      rows={3}
                      data-testid="input-observations"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="btn-ms-blue"
                disabled={isPending}
                data-testid="button-save"
              >
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

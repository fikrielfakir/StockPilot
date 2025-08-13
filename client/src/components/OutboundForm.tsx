import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertOutboundSchema, type InsertOutbound, type Outbound } from "@shared/schema";

interface OutboundFormProps {
  outbound?: Outbound | null;
  onClose: () => void;
}

export default function OutboundForm({ outbound, onClose }: OutboundFormProps) {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!outbound;

  const { data: articles = [] } = useQuery<any[]>({
    queryKey: ["/api/articles"],
  });

  const { data: requestors = [] } = useQuery<any[]>({
    queryKey: ["/api/requestors"],
  });

  const form = useForm<InsertOutbound>({
    resolver: zodResolver(insertOutboundSchema),
    defaultValues: {
      dateSortie: outbound?.dateSortie || new Date(),
      requestorId: outbound?.requestorId || "",
      articleId: outbound?.articleId || "",
      quantiteSortie: outbound?.quantiteSortie || 1,
      motifSortie: outbound?.motifSortie || "",
      observations: outbound?.observations || "",
    },
  });

  const watchedArticleId = form.watch("articleId");
  const watchedQuantity = form.watch("quantiteSortie");

  useEffect(() => {
    if (watchedArticleId) {
      const article = articles.find((a: any) => a.id === watchedArticleId);
      setSelectedArticle(article);
    }
  }, [watchedArticleId, articles]);

  const createMutation = useMutation({
    mutationFn: (data: InsertOutbound) => apiRequest("POST", "/api/outbounds", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outbounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sortie créée",
        description: "La sortie de stock a été créée avec succès",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la sortie",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Outbound>) => apiRequest("PUT", `/api/outbounds/${outbound!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outbounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sortie modifiée",
        description: "La sortie de stock a été modifiée avec succès",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la sortie",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertOutbound) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const availableStock = selectedArticle?.stockActuel || 0;
  const stockAfterOutbound = Math.max(0, availableStock - (watchedQuantity || 0));
  const isInsufficientStock = (watchedQuantity || 0) > availableStock;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="outbound-form-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Modifier la Sortie" : "Nouvelle Sortie de Stock"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="articleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} data-testid="select-article">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un article" />
                        </SelectTrigger>
                        <SelectContent>
                          {articles.map((article: any) => (
                            <SelectItem key={article.id} value={article.id}>
                              {article.codeArticle} - {article.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateSortie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Sortie *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-date-sortie"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Information Display */}
            {selectedArticle && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock Disponible:</span>
                    <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                      {availableStock}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quantité Sortie:</span>
                    <div className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                      {watchedQuantity || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock Après Sortie:</span>
                    <div className={`font-semibold text-lg ${
                      isInsufficientStock 
                        ? "text-red-600 dark:text-red-400" 
                        : stockAfterOutbound <= (selectedArticle.seuilMinimum || 10)
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {stockAfterOutbound}
                    </div>
                  </div>
                </div>
                {isInsufficientStock && (
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm rounded border border-red-200 dark:border-red-800">
                    ⚠️ Stock insuffisant! Quantité disponible: {availableStock}
                  </div>
                )}
                {!isInsufficientStock && stockAfterOutbound <= (selectedArticle.seuilMinimum || 10) && stockAfterOutbound > 0 && (
                  <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded border border-yellow-200 dark:border-yellow-800">
                    ⚠️ Attention: Le stock après sortie sera en dessous du seuil minimum ({selectedArticle.seuilMinimum || 10})
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantiteSortie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité de Sortie *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max={selectedArticle?.stockActuel || undefined}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-quantite-sortie"
                        className={isInsufficientStock ? "border-red-500 focus:border-red-500" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                    {isInsufficientStock && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Quantité supérieure au stock disponible
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motifSortie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif de Sortie *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} data-testid="select-motif">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un motif" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="reparation">Réparation</SelectItem>
                          <SelectItem value="transfert">Transfert</SelectItem>
                          <SelectItem value="retour_fournisseur">Retour fournisseur</SelectItem>
                          <SelectItem value="perte">Perte/Casse</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requestorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demandeur *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-requestor">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un demandeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestors.map((requestor: any) => (
                          <SelectItem key={requestor.id} value={requestor.id}>
                            {requestor.prenom} {requestor.nom} - {requestor.departement}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notes, commentaires, détails supplémentaires..."
                      rows={3}
                      data-testid="textarea-observations"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t">
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
                disabled={isPending || isInsufficientStock}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-submit"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isEditing ? "Modification..." : "Création..."}
                  </>
                ) : (
                  isEditing ? "Modifier la Sortie" : "Créer la Sortie"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
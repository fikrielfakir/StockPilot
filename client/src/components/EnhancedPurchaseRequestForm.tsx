import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { insertCompletePurchaseRequestSchema, type CompletePurchaseRequest, articles, requestors, suppliers } from "@shared/schema";

type Article = typeof articles.$inferSelect;
type Requestor = typeof requestors.$inferSelect;
type Supplier = typeof suppliers.$inferSelect;
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ArticleAutocomplete from "./ArticleAutocomplete";
import { Plus, Trash2, ShoppingCart, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancedPurchaseRequestFormProps {
  onClose: () => void;
}

interface PurchaseRequestItem {
  articleId: string;
  article?: Article;
  quantiteDemandee: number;
  supplierId?: string;
  prixUnitaireEstime?: number;
  observations?: string;
}

export default function EnhancedPurchaseRequestForm({ onClose }: EnhancedPurchaseRequestFormProps) {
  const { toast } = useToast();
  const [selectedArticles, setSelectedArticles] = useState<{[key: string]: Article}>({});

  const { data: requestors = [] } = useQuery<Requestor[]>({
    queryKey: ["/api/requestors"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm({
    resolver: zodResolver(insertCompletePurchaseRequestSchema),
    defaultValues: {
      dateDemande: new Date().toISOString().split('T')[0],
      requestorId: "",
      observations: "",
      items: [
        {
          articleId: "",
          quantiteDemandee: 1,
          supplierId: "",
          prixUnitaireEstime: undefined,
          observations: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/purchase-requests/complete", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Demande créée",
        description: "La demande d'achat multi-articles a été créée avec succès",
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

  const onSubmit = (data: any) => {
    // Validate that all articles are selected
    const invalidItems = data.items.filter((item: any) => !item.articleId);
    if (invalidItems.length > 0) {
      toast({
        title: "Articles manquants",
        description: "Veuillez sélectionner tous les articles",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(data);
  };

  const handleArticleSelect = (index: number, articleId: string, article: Article) => {
    setSelectedArticles(prev => ({ ...prev, [index]: article }));
    form.setValue(`items.${index}.articleId`, articleId);
    
    // Auto-fill estimated price if available
    if (article.prixUnitaire) {
      form.setValue(`items.${index}.prixUnitaireEstime` as any, parseFloat(article.prixUnitaire));
    }
  };

  const addArticle = () => {
    append({
      articleId: "",
      quantiteDemandee: 1,
      supplierId: "",
      prixUnitaireEstime: undefined,
      observations: "",
    });
  };

  const removeArticle = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Clean up selected articles
      setSelectedArticles(prev => {
        const updated = { ...prev };
        delete updated[index];
        // Reindex remaining articles
        const newSelected: {[key: string]: Article} = {};
        Object.keys(updated).forEach(key => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            newSelected[keyIndex - 1] = updated[key];
          } else if (keyIndex < index) {
            newSelected[key] = updated[key];
          }
        });
        return newSelected;
      });
    }
  };

  const totalItems = fields.reduce((sum, _, index) => {
    const quantity = form.watch(`items.${index}.quantiteDemandee`) || 0;
    return sum + quantity;
  }, 0);

  const estimatedTotal = fields.reduce((sum, _, index) => {
    const quantity = form.watch(`items.${index}.quantiteDemandee`) || 0;
    const price = form.watch(`items.${index}.prixUnitaireEstime`) || 0;
    return sum + (quantity * price);
  }, 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Nouvelle Demande d'Achat Multi-Articles</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateDemande"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de Demande</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requestorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demandeur</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un demandeur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {requestors.map((requestor) => (
                            <SelectItem key={requestor.id} value={requestor.id}>
                              {requestor.prenom} {requestor.nom} - {requestor.departement}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observations</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Notes générales pour cette demande..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Articles Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package2 className="w-5 h-5" />
                  <span>Articles Demandés</span>
                  <Badge variant="secondary">{fields.length}</Badge>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addArticle}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter Article</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Package2 className="w-4 h-4" />
                        <span>Article #{index + 1}</span>
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArticle(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.articleId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Article *</FormLabel>
                              <FormControl>
                                <ArticleAutocomplete
                                  value={field.value}
                                  onSelect={(articleId, article) => handleArticleSelect(index, articleId, article)}
                                  placeholder="Rechercher et sélectionner un article..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantiteDemandee`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantité Demandée *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.prixUnitaireEstime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix Unitaire Estimé</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.supplierId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fournisseur Préféré</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un fournisseur" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Aucune préférence</SelectItem>
                                {suppliers.map((supplier) => (
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

                      <FormField
                        control={form.control}
                        name={`items.${index}.observations`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes sur cet article</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Notes spécifiques à cet article..."
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Article Summary */}
                    {selectedArticles[index] && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">{selectedArticles[index].designation}</span>
                            <span className="text-gray-600 ml-2">
                              Stock disponible: {selectedArticles[index].stockActuel}
                            </span>
                          </div>
                          {form.watch(`items.${index}.prixUnitaireEstime`) && (
                            <div className="text-blue-700 dark:text-blue-300 font-medium">
                              Total estimé: {(
                                (form.watch(`items.${index}.quantiteDemandee`) || 0) *
                                (form.watch(`items.${index}.prixUnitaireEstime`) || 0)
                              ).toFixed(2)}€
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}

                {/* Summary */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Résumé de la demande:</span>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {fields.length} article(s) • {totalItems} unité(s) au total
                      </div>
                    </div>
                    {estimatedTotal > 0 && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {estimatedTotal.toFixed(2)}€
                        </div>
                        <div className="text-xs text-gray-500">Total estimé</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Création..." : "Créer la Demande"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
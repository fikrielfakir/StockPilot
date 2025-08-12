import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertReceptionSchema, type Reception, type InsertReception } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReceptionFormProps {
  reception?: Reception | null;
  onClose: () => void;
}

export default function ReceptionForm({ reception, onClose }: ReceptionFormProps) {
  const { toast } = useToast();
  const isEditing = !!reception;
  const isViewOnly = isEditing; // Receptions are typically view-only once created

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<InsertReception>({
    resolver: zodResolver(insertReceptionSchema),
    defaultValues: {
      dateReception: reception?.dateReception || new Date(),
      supplierId: reception?.supplierId || "",
      articleId: reception?.articleId || "",
      quantiteRecue: reception?.quantiteRecue || 1,
      prixUnitaire: reception?.prixUnitaire || null,
      numeroBonLivraison: reception?.numeroBonLivraison || "",
      observations: reception?.observations || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertReception) => apiRequest("POST", "/api/receptions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Réception enregistrée",
        description: "La réception a été enregistrée et le stock mis à jour",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la réception",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertReception) => {
    if (!isViewOnly) {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="reception-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isViewOnly ? "Détails de la Réception" : "Nouvelle Réception"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isViewOnly}>
                      <FormControl>
                        <SelectTrigger data-testid="select-supplier">
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
              <FormField
                control={form.control}
                name="articleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isViewOnly}>
                      <FormControl>
                        <SelectTrigger data-testid="select-article">
                          <SelectValue placeholder="Sélectionner un article" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {articles.map((article: any) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.codeArticle} - {article.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="quantiteRecue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité reçue *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isViewOnly}
                        data-testid="input-quantite"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prixUnitaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0"
                        {...field} 
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        disabled={isViewOnly}
                        data-testid="input-prix-unitaire"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numeroBonLivraison"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Bon de Livraison</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="BL-2024-001" 
                        {...field} 
                        value={field.value || ""}
                        disabled={isViewOnly}
                        data-testid="input-bon-livraison"
                      />
                    </FormControl>
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
                      placeholder="État des marchandises, conformité..." 
                      {...field} 
                      value={field.value || ""}
                      rows={3}
                      disabled={isViewOnly}
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
                data-testid="button-close"
              >
                {isViewOnly ? "Fermer" : "Annuler"}
              </Button>
              {!isViewOnly && (
                <Button 
                  type="submit" 
                  className="btn-ms-blue"
                  disabled={isPending}
                  data-testid="button-save"
                >
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

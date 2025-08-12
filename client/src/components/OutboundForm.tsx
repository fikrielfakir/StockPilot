import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertOutboundSchema, type Outbound, type InsertOutbound } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OutboundFormProps {
  outbound?: Outbound | null;
  onClose: () => void;
}

const motifOptions = [
  "Maintenance",
  "Réparation",
  "Installation",
  "Remplacement",
  "Retour client",
  "Perte/Casse",
  "Test qualité",
  "Formation",
  "Autre"
];

export default function OutboundForm({ outbound, onClose }: OutboundFormProps) {
  const { toast } = useToast();
  const isEditing = !!outbound;
  const isViewOnly = isEditing; // Outbounds are typically view-only once created

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const { data: requestors = [] } = useQuery({
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

  const createMutation = useMutation({
    mutationFn: (data: InsertOutbound) => apiRequest("POST", "/api/outbounds", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outbounds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sortie enregistrée",
        description: "La sortie a été enregistrée et le stock mis à jour",
      });
      onClose();
    },
    onError: (error: any) => {
      const message = error.message || "Impossible d'enregistrer la sortie";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertOutbound) => {
    if (!isViewOnly) {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending;

  // Get available stock for selected article
  const selectedArticle = articles.find((a: any) => a.id === form.watch("articleId"));
  const availableStock = selectedArticle?.stockActuel || 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="outbound-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isViewOnly ? "Détails de la Sortie" : "Nouvelle Sortie de Stock"}
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isViewOnly}>
                      <FormControl>
                        <SelectTrigger data-testid="select-requestor">
                          <SelectValue placeholder="Sélectionner un demandeur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {requestors.map((requestor: any) => (
                          <SelectItem key={requestor.id} value={requestor.id}>
                            {requestor.nom} {requestor.prenom} - {requestor.departement}
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
                            {article.codeArticle} - {article.designation} (Stock: {article.stockActuel})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="quantiteSortie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité sortie *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max={isViewOnly ? undefined : availableStock}
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                        disabled={isViewOnly}
                        data-testid="input-quantite"
                      />
                    </FormControl>
                    {!isViewOnly && selectedArticle && (
                      <p className="text-xs text-ms-gray">
                        Stock disponible: {availableStock} {selectedArticle.unite}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="motifSortie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif de sortie *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Maintenance" 
                        {...field} 
                        list="motifs"
                        disabled={isViewOnly}
                        data-testid="input-motif"
                      />
                    </FormControl>
                    <datalist id="motifs">
                      {motifOptions.map(motif => (
                        <option key={motif} value={motif} />
                      ))}
                    </datalist>
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
                      placeholder="Détails sur l'utilisation, destination..." 
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

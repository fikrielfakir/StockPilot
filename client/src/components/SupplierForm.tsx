import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertSupplierSchema, type Supplier, type InsertSupplier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
}

export default function SupplierForm({ supplier, onClose }: SupplierFormProps) {
  const { toast } = useToast();
  const isEditing = !!supplier;

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      nom: supplier?.nom || "",
      contact: supplier?.contact || "",
      telephone: supplier?.telephone || "",
      email: supplier?.email || "",
      adresse: supplier?.adresse || "",
      conditionsPaiement: supplier?.conditionsPaiement || "",
      delaiLivraison: supplier?.delaiLivraison || null,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSupplier) => apiRequest("POST", "/api/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fournisseur créé",
        description: "Le fournisseur a été créé avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le fournisseur",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) => apiRequest("PUT", `/api/suppliers/${supplier!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fournisseur modifié",
        description: "Le fournisseur a été modifié avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le fournisseur",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSupplier) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="supplier-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: CéramiTech SAS" 
                      {...field} 
                      data-testid="input-nom"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personne de contact</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom du contact" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-contact"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0123456789" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-telephone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="contact@entreprise.com" 
                      {...field} 
                      value={field.value || ""}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adresse complète" 
                      {...field} 
                      value={field.value || ""}
                      rows={3}
                      data-testid="input-adresse"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="conditionsPaiement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions de paiement</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 30 jours net" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-conditions-paiement"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="delaiLivraison"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Délai de livraison (jours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="Ex: 7" 
                        {...field} 
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        data-testid="input-delai-livraison"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertRequestorSchema, type Requestor, type InsertRequestor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RequestorFormProps {
  requestor?: Requestor | null;
  onClose: () => void;
}

const departements = [
  "Production",
  "Maintenance",
  "Qualité",
  "Logistique",
  "Administration",
  "Service Technique",
  "Commercial",
  "Achats",
  "Direction",
  "Autre"
];

export default function RequestorForm({ requestor, onClose }: RequestorFormProps) {
  const { toast } = useToast();
  const isEditing = !!requestor;

  const form = useForm<InsertRequestor>({
    resolver: zodResolver(insertRequestorSchema),
    defaultValues: {
      nom: requestor?.nom || "",
      prenom: requestor?.prenom || "",
      departement: requestor?.departement || "",
      poste: requestor?.poste || "",
      email: requestor?.email || "",
      telephone: requestor?.telephone || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertRequestor) => apiRequest("POST", "/api/requestors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requestors"] });
      toast({
        title: "Demandeur créé",
        description: "Le demandeur a été créé avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le demandeur",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Requestor>) => apiRequest("PUT", `/api/requestors/${requestor!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requestors"] });
      toast({
        title: "Demandeur modifié",
        description: "Le demandeur a été modifié avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le demandeur",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertRequestor) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="requestor-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le Demandeur" : "Nouveau Demandeur"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nom de famille" 
                        {...field} 
                        data-testid="input-nom"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Prénom" 
                        {...field} 
                        data-testid="input-prenom"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="departement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Département *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Département ou service" 
                        {...field} 
                        data-testid="input-departement"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="poste"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Fonction ou poste" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-poste"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="email@entreprise.com" 
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

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Package2, ArrowRight } from "lucide-react";
import { convertToReceptionSchema, type ConvertToReception, type PurchaseRequest } from "@shared/schema";

interface ConvertToReceptionDialogProps {
  purchaseRequest: PurchaseRequest;
  children?: React.ReactNode;
}

export function ConvertToReceptionDialog({ purchaseRequest, children }: ConvertToReceptionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ConvertToReception>({
    resolver: zodResolver(convertToReceptionSchema),
    defaultValues: {
      quantiteRecue: purchaseRequest.quantiteDemandee,
      prixUnitaire: null,
      numeroBonLivraison: "",
      observations: `Réception pour demande d'achat ${purchaseRequest.id.slice(0, 8)}`,
      dateReception: new Date().toISOString().split('T')[0],
    },
  });

  const convertMutation = useMutation({
    mutationFn: (data: ConvertToReception) =>
      apiRequest("POST", `/api/purchase-requests/${purchaseRequest.id}/convert-to-reception`, data),
    onSuccess: () => {
      toast({
        title: "Conversion réussie",
        description: "La demande d'achat a été convertie en réception",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/receptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de convertir la demande d'achat",
      });
    },
  });

  const onSubmit = (data: ConvertToReception) => {
    convertMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid={`button-convert-${purchaseRequest.id}`}
          >
            <Package2 className="h-4 w-4 mr-2" />
            Convertir en Réception
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="dialog-convert-reception">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package2 className="h-6 w-6 text-green-600" />
            Convertir en Réception
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-blue-800 dark:text-blue-200">
              Demande d'achat #{purchaseRequest.id.slice(0, 8)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Quantité demandée:</span>
              <span className="ml-2 font-medium">{purchaseRequest.quantiteDemandee}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Statut:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                {purchaseRequest.statut}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center my-4">
          <ArrowRight className="h-6 w-6 text-gray-400" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantiteRecue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité Reçue *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-quantite-recue"
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
                    <FormLabel>Prix Unitaire (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        data-testid="input-prix-unitaire"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numeroBonLivraison"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Bon de Livraison</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="BL-2025-001"
                        data-testid="input-bon-livraison"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateReception"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Réception</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        data-testid="input-date-reception"
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
                      {...field}
                      placeholder="Notes sur la réception, contrôle qualité, etc."
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
                onClick={() => setOpen(false)}
                data-testid="button-cancel-convert"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={convertMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-confirm-convert"
              >
                {convertMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Conversion...
                  </>
                ) : (
                  <>
                    <Package2 className="h-4 w-4 mr-2" />
                    Confirmer la Réception
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
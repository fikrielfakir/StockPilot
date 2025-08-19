import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Package2, ArrowRight, Trash2 } from "lucide-react";
import { insertReceptionSchema, type InsertReception, type PurchaseRequest, type Article, type Supplier } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReceptionItem {
  id: string;
  articleId: string;
  articleDesignation: string;
  quantiteDemandee: number;
  quantiteRecue: number;
  prixUnitaire: number | null;
  supplierId: string | null;
  supplierName: string | null;
}

interface ConvertToReceptionDialogProps {
  purchaseRequest: PurchaseRequest;
  children?: React.ReactNode;
}

export function ConvertToReceptionDialog({ purchaseRequest, children }: ConvertToReceptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch purchase request items
  const { data: purchaseRequestItems = [] } = useQuery({
    queryKey: ["/api/purchase-request-items", purchaseRequest.id],
    queryFn: () => apiRequest("GET", `/api/purchase-request-items/${purchaseRequest.id}`).then(res => res.json()),
    enabled: open,
  });

  // Fetch articles for item details
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    enabled: open,
  });

  // Fetch suppliers for supplier names
  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
    enabled: open,
  });

  // Initialize reception items when data is loaded
  useEffect(() => {
    if (purchaseRequestItems.length > 0 && articles.length > 0) {
      const items: ReceptionItem[] = purchaseRequestItems.map((item: any) => {
        const article = articles.find((a: Article) => a.id === item.articleId);
        const supplier = suppliers.find((s: Supplier) => s.id === item.supplierId);
        
        return {
          id: item.id,
          articleId: item.articleId,
          articleDesignation: article?.designation || "Article inconnu",
          quantiteDemandee: item.quantiteDemandee,
          quantiteRecue: item.quantiteDemandee, // Default to requested quantity
          prixUnitaire: item.prixUnitaireEstime ? parseFloat(item.prixUnitaireEstime) : null,
          supplierId: item.supplierId,
          supplierName: supplier?.nom || "Fournisseur non spécifié",
        };
      });
      setReceptionItems(items);
    }
  }, [purchaseRequestItems, articles, suppliers]);

  const form = useForm({
    defaultValues: {
      dateReception: new Date().toISOString().split('T')[0],
      numeroBonLivraison: "",
      observations: `Réception pour demande d'achat ${purchaseRequest.id.slice(0, 8)}`,
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create individual receptions for each item
      const receptionPromises = receptionItems.map(item => 
        apiRequest("POST", "/api/receptions", {
          dateReception: data.dateReception,
          supplierId: item.supplierId,
          articleId: item.articleId,
          quantiteRecue: item.quantiteRecue,
          prixUnitaire: item.prixUnitaire,
          numeroBonLivraison: data.numeroBonLivraison,
          observations: `${data.observations} - Article: ${item.articleDesignation}`,
        })
      );
      
      await Promise.all(receptionPromises);
      
      // Update purchase request status to received
      await apiRequest("PUT", `/api/purchase-requests/${purchaseRequest.id}`, {
        statut: "recu"
      });
    },
    onSuccess: () => {
      toast({
        title: "Conversion réussie",
        description: "La demande d'achat a été convertie en réceptions multiples",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/receptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de convertir la demande d'achat",
      });
      console.error("Conversion error:", error);
    },
  });

  const onSubmit = (data: any) => {
    convertMutation.mutate(data);
  };

  const updateReceptionItem = (index: number, field: keyof ReceptionItem, value: any) => {
    setReceptionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeReceptionItem = (index: number) => {
    setReceptionItems(prev => prev.filter((_, i) => i !== index));
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="dialog-convert-reception">
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
              <span className="text-gray-600 dark:text-gray-400">Total articles:</span>
              <span className="ml-2 font-medium">{purchaseRequest.totalArticles}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Statut:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                {purchaseRequest.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Articles à réceptionner
          </h3>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead className="w-32">Qté commandée</TableHead>
                  <TableHead className="w-32">Qté reçue</TableHead>
                  <TableHead className="w-32">PU (MAD)</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receptionItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.articleDesignation}</TableCell>
                    <TableCell>{item.quantiteDemandee}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantiteDemandee}
                        value={item.quantiteRecue}
                        onChange={(e) => updateReceptionItem(index, 'quantiteRecue', Number(e.target.value))}
                        className="w-20"
                        data-testid={`input-quantite-recue-${index}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.prixUnitaire || ""}
                        onChange={(e) => updateReceptionItem(index, 'prixUnitaire', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Prix unitaire"
                        className="w-24"
                        data-testid={`input-prix-${index}`}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{item.supplierName}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReceptionItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                name="dateReception"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de Réception *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-date-reception"
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
                        {...field}
                        value={field.value || ""}
                        placeholder="BL-2025-001"
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
                      {...field}
                      value={field.value || ""}
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
                disabled={convertMutation.isPending || receptionItems.length === 0}
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
                    Confirmer la Réception ({receptionItems.length} articles)
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
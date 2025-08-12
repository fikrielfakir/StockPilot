import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertArticleSchema, type Article, type InsertArticle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ArticleFormProps {
  article?: Article | null;
  onClose: () => void;
}

const categories = [
  "Joints",
  "Électrique",
  "Régulation",
  "Mécanique",
  "Thermique",
  "Filtration",
  "Autre"
];

const unites = ["pcs", "kg", "m", "L", "m²", "m³"];

export default function ArticleForm({ article, onClose }: ArticleFormProps) {
  const { toast } = useToast();
  const isEditing = !!article;

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const form = useForm<InsertArticle>({
    resolver: zodResolver(insertArticleSchema),
    defaultValues: {
      codeArticle: article?.codeArticle || "",
      designation: article?.designation || "",
      categorie: article?.categorie || "",
      marque: article?.marque || "",
      reference: article?.reference || "",
      stockInitial: article?.stockInitial || 0,
      unite: article?.unite || "pcs",
      prixUnitaire: article?.prixUnitaire || null,
      seuilMinimum: article?.seuilMinimum || 10,
      fournisseurId: article?.fournisseurId || "none",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertArticle) => apiRequest("POST", "/api/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Article créé",
        description: "L'article a été créé avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'article",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Article>) => apiRequest("PUT", `/api/articles/${article!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Article modifié",
        description: "L'article a été modifié avec succès",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'article",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertArticle) => {
    // Convert "none" back to null for fournisseurId
    const processedData = {
      ...data,
      fournisseurId: data.fournisseurId === "none" ? null : data.fournisseurId
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="article-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'Article" : "Nouvel Article"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="codeArticle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Article *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: JE-205" 
                        {...field} 
                        data-testid="input-code-article"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Référence fournisseur" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-reference"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Désignation *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Joint étanchéité diamètre 20.5mm" 
                      {...field} 
                      data-testid="input-designation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marque</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Marque du produit" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-marque"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="stockInitial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Initial *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-stock-initial"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-unite">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unites.map(unite => (
                          <SelectItem key={unite} value={unite}>{unite}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seuilMinimum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil Minimum</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                        data-testid="input-seuil-minimum"
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
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        data-testid="input-prix-unitaire"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fournisseurId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur Principal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fournisseur">
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

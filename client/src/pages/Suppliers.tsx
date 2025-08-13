import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SupplierForm from "@/components/SupplierForm";
import BulkImportExport from "@/components/BulkImportExport";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExportButton } from "@/components/ExportButton";
import { Upload, Download, Plus, Edit, Trash2 } from "lucide-react";
import type { Supplier } from "@shared/schema";

export default function Suppliers() {
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [search, setSearch] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);
  const { toast } = useToast();

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fournisseur supprimé",
        description: "Le fournisseur a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur",
        variant: "destructive",
      });
    },
  });

  const filteredSuppliers = suppliers.filter(supplier => 
    !search || 
    supplier.nom.toLowerCase().includes(search.toLowerCase()) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="suppliers-page">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-ms-gray-dark">Gestion des Fournisseurs</h3>
            <div className="flex space-x-3">
              <ExportButton
                data={filteredSuppliers}
                filename="fournisseurs"
                title="Fournisseurs"
                columns={[
                  { key: 'nom', label: 'Nom' },
                  { key: 'contact', label: 'Contact' },
                  { key: 'telephone', label: 'Téléphone' },
                  { key: 'email', label: 'Email' },
                  { key: 'adresse', label: 'Adresse' },
                  { key: 'delaiLivraison', label: 'Délai Livraison (jours)', format: (val) => val?.toString() || 'N/A' },
                  { key: 'conditionsPaiement', label: 'Conditions Paiement' },
                ]}
                className="mr-2"
              />
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue flex items-center space-x-2"
                data-testid="button-add-supplier"
              >
                <i className="fas fa-plus"></i>
                <span>Nouveau Fournisseur</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-ms-gray-dark mb-2">Rechercher</label>
            <Input 
              type="text" 
              placeholder="Nom, contact..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Suppliers Table */}
        <CardContent className="p-0">
          {filteredSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ms-gray-light">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Nom</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Téléphone</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Délai Livraison</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-ms-gray-dark">{supplier.nom}</td>
                      <td className="p-4 text-sm text-ms-gray">{supplier.contact || "-"}</td>
                      <td className="p-4 text-sm text-ms-gray">{supplier.telephone || "-"}</td>
                      <td className="p-4 text-sm text-ms-gray">{supplier.email || "-"}</td>
                      <td className="p-4 text-sm text-ms-gray">
                        {supplier.delaiLivraison ? `${supplier.delaiLivraison} jours` : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(supplier)}
                            data-testid={`button-edit-${supplier.id}`}
                          >
                            <i className="fas fa-edit text-ms-blue"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(supplier.id)}
                            data-testid={`button-delete-${supplier.id}`}
                          >
                            <i className="fas fa-trash text-ms-red"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-ms-gray" data-testid="empty-state">
              <i className="fas fa-building text-4xl mb-4"></i>
              <p className="text-lg font-medium">Aucun fournisseur trouvé</p>
              <p className="text-sm">Commencez par ajouter votre premier fournisseur</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue mt-4"
                data-testid="button-add-first-supplier"
              >
                Ajouter un fournisseur
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <SupplierForm 
          supplier={editingSupplier}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

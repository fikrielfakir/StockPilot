import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RequestorForm from "@/components/RequestorForm";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Requestor } from "@shared/schema";

export default function Requestors() {
  const [showForm, setShowForm] = useState(false);
  const [editingRequestor, setEditingRequestor] = useState<Requestor | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: requestors = [], isLoading } = useQuery<Requestor[]>({
    queryKey: ["/api/requestors"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/requestors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requestors"] });
      toast({
        title: "Demandeur supprimé",
        description: "Le demandeur a été supprimé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le demandeur",
        variant: "destructive",
      });
    },
  });

  const filteredRequestors = requestors.filter(requestor => 
    !search || 
    requestor.nom.toLowerCase().includes(search.toLowerCase()) ||
    requestor.prenom.toLowerCase().includes(search.toLowerCase()) ||
    requestor.departement.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (requestor: Requestor) => {
    setEditingRequestor(requestor);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce demandeur ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRequestor(null);
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
    <div className="space-y-6" data-testid="requestors-page">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-ms-gray-dark">Gestion des Demandeurs</h3>
            <Button 
              onClick={() => setShowForm(true)}
              className="btn-ms-blue flex items-center space-x-2"
              data-testid="button-add-requestor"
            >
              <i className="fas fa-plus"></i>
              <span>Nouveau Demandeur</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-ms-gray-dark mb-2">Rechercher</label>
            <Input 
              type="text" 
              placeholder="Nom, prénom, département..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Requestors Table */}
        <CardContent className="p-0">
          {filteredRequestors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ms-gray-light">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Nom</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Prénom</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Département</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Poste</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Téléphone</th>
                    <th className="text-left p-4 text-sm font-medium text-ms-gray-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestors.map((requestor) => (
                    <tr key={requestor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-ms-gray-dark">{requestor.nom}</td>
                      <td className="p-4 text-sm text-ms-gray">{requestor.prenom}</td>
                      <td className="p-4 text-sm text-ms-gray">{requestor.departement}</td>
                      <td className="p-4 text-sm text-ms-gray">{requestor.poste || "-"}</td>
                      <td className="p-4 text-sm text-ms-gray">{requestor.email || "-"}</td>
                      <td className="p-4 text-sm text-ms-gray">{requestor.telephone || "-"}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(requestor)}
                            data-testid={`button-edit-${requestor.id}`}
                          >
                            <i className="fas fa-edit text-ms-blue"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(requestor.id)}
                            data-testid={`button-delete-${requestor.id}`}
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
              <i className="fas fa-users text-4xl mb-4"></i>
              <p className="text-lg font-medium">Aucun demandeur trouvé</p>
              <p className="text-sm">Commencez par ajouter votre premier demandeur</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="btn-ms-blue mt-4"
                data-testid="button-add-first-requestor"
              >
                Ajouter un demandeur
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <RequestorForm 
          requestor={editingRequestor}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

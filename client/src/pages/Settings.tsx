import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Download, Upload, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form schemas
const categorySchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

const marqueSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

const departementSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

const posteSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  departementId: z.string().optional(),
  description: z.string().optional(),
});

interface EntityFormProps {
  entity: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  schema: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'input' | 'textarea' | 'select';
    options?: Array<{value: string, label: string}>;
  }>;
}

function EntityForm({ entity, onSubmit, onCancel, schema, fields }: EntityFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: entity || {}
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === 'input' && (
            <Input
              id={field.name}
              {...register(field.name)}
              className={errors[field.name] ? "border-red-500" : ""}
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              id={field.name}
              {...register(field.name)}
              className={errors[field.name] ? "border-red-500" : ""}
            />
          )}
          {field.type === 'select' && field.options && (
            <Select onValueChange={(value) => setValue(field.name, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors[field.name] && (
            <p className="text-sm text-red-500">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </form>
  );
}

interface EntityManagerProps {
  title: string;
  entityName: string;
  apiEndpoint: string;
  schema: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'input' | 'textarea' | 'select';
    options?: Array<{value: string, label: string}>;
  }>;
  extraOptions?: any;
}

function EntityManager({ title, entityName, apiEndpoint, schema, fields, extraOptions }: EntityManagerProps) {
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entities = [], isLoading } = useQuery({
    queryKey: [apiEndpoint],
    queryFn: async () => {
      const response = await fetch(`/api/${apiEndpoint}`);
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur de création');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      setIsDialogOpen(false);
      setEditingEntity(null);
      toast({ title: `${entityName} créé avec succès` });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erreur de mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      setIsDialogOpen(false);
      setEditingEntity(null);
      toast({ title: `${entityName} mis à jour avec succès` });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/${apiEndpoint}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur de suppression');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      toast({ title: `${entityName} supprimé avec succès` });
    }
  });

  const handleSubmit = (data: any) => {
    if (editingEntity) {
      updateMutation.mutate({ id: editingEntity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entity: any) => {
    setEditingEntity(entity);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/${apiEndpoint}/export?format=json`);
      if (!response.ok) throw new Error('Erreur d\'export');
      
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${apiEndpoint}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: 'Export réalisé avec succès' });
    } catch (error) {
      toast({ title: 'Erreur lors de l\'export', variant: 'destructive' });
    }
  };

  // Get fields with dynamic options
  const getFieldsWithOptions = () => {
    return fields.map(field => {
      if (field.name === 'departementId' && extraOptions?.departements) {
        return {
          ...field,
          options: extraOptions.departements.map((dept: any) => ({
            value: dept.id,
            label: dept.nom
          }))
        };
      }
      return field;
    });
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingEntity(null); setIsDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEntity ? `Modifier ${entityName}` : `Nouveau ${entityName}`}
                  </DialogTitle>
                </DialogHeader>
                <EntityForm
                  entity={editingEntity}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                  schema={schema}
                  fields={getFieldsWithOptions()}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entities.map((entity: any) => (
            <div key={entity.id} className="flex justify-between items-center p-4 border rounded">
              <div>
                <h3 className="font-medium">{entity.nom}</h3>
                {entity.description && (
                  <p className="text-sm text-muted-foreground">{entity.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(entity)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(entity.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {entities.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              Aucun {entityName.toLowerCase()} configuré
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { data: departements } = useQuery({
    queryKey: ['departements'],
    queryFn: async () => {
      const response = await fetch('/api/departements');
      if (!response.ok) throw new Error('Erreur de chargement');
      return response.json();
    }
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
      
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="marques">Marques</TabsTrigger>
          <TabsTrigger value="departements">Départements</TabsTrigger>
          <TabsTrigger value="postes">Postes</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <EntityManager
            title="Gestion des Catégories d'Articles"
            entityName="catégorie"
            apiEndpoint="categories"
            schema={categorySchema}
            fields={[
              { name: 'nom', label: 'Nom de la catégorie', type: 'input' },
              { name: 'description', label: 'Description', type: 'textarea' }
            ]}
          />
        </TabsContent>

        <TabsContent value="marques">
          <EntityManager
            title="Gestion des Marques"
            entityName="marque"
            apiEndpoint="marques"
            schema={marqueSchema}
            fields={[
              { name: 'nom', label: 'Nom de la marque', type: 'input' },
              { name: 'description', label: 'Description', type: 'textarea' }
            ]}
          />
        </TabsContent>

        <TabsContent value="departements">
          <EntityManager
            title="Gestion des Départements"
            entityName="département"
            apiEndpoint="departements"
            schema={departementSchema}
            fields={[
              { name: 'nom', label: 'Nom du département', type: 'input' },
              { name: 'description', label: 'Description', type: 'textarea' }
            ]}
          />
        </TabsContent>

        <TabsContent value="postes">
          <EntityManager
            title="Gestion des Postes"
            entityName="poste"
            apiEndpoint="postes"
            schema={posteSchema}
            fields={[
              { name: 'nom', label: 'Nom du poste', type: 'input' },
              { name: 'departementId', label: 'Département', type: 'select' },
              { name: 'description', label: 'Description', type: 'textarea' }
            ]}
            extraOptions={{ departements }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
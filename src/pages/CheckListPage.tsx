import type React from "react";

import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const houses = [
  { id: "maison-1", name: "Mv1" },
  { id: "maison-2", name: "Mv2" },
  { id: "maison-3", name: "Mv3" },
  { id: "maison-4", name: "Mv4" },
  { id: "maison-5", name: "Mv5" },
  { id: "maison-6", name: "Mv6" },
  { id: "maison-7", name: "Mv7" },
  { id: "maison-8", name: "Mv8" },
  { id: "maison-9", name: "Mv9" },
  { id: "maison-10", name: "Mv10" },
  { id: "maison-bg", name: "Bg" },
  { id: "maison-high", name: "High" },
];

// Mock data
const mockData = {
  categories: [
    {
      id: 1,
      name: "Entrée",
      steps: [
        {
          id: 1,
          description:
            "Nettoyage de la porte extérieure de la maison (poussière + araignées)",
          "produits a utilise": "",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 2,
      name: "Salle de Bain",
      steps: [
        {
          id: 2,
          description: "Nettoyage de (lavabo + toilette + douche)",
          "produits a utilise": "détartrant, OMO, Javel",
          type: "nettoyage",
        },
        {
          id: 3,
          description: "Nettoyage du miroir",
          "produits a utilise": "Ajax",
          type: "nettoyage",
        },
        {
          id: 4,
          description: "Nettoyage interne de toilette",
          "produits a utilise": "Choc",
          type: "nettoyage",
        },
        {
          id: 5,
          description: "Nettoyage de tout le faïence des murs",
          "produits a utilise": "OMO, Javel, détartrant",
          type: "nettoyage",
        },
        {
          id: 6,
          description:
            "Vérification de la validité de : chasse, douche, toilette, lampe, eau chaude",
          "produits a utilise": "",
          type: "vérification",
        },
        {
          id: 7,
          description:
            "Vérification de la présence de : seau, bassine, frottoir, balai, serpillière",
          "produits a utilise": "",
          type: "vérification",
        },
      ],
    },
    {
      id: 3,
      name: "Couloir",
      steps: [
        {
          id: 8,
          description: "Vérification de la validité de la lampe",
          "produits a utilise": "",
          type: "vérification",
        },
        {
          id: 9,
          description:
            "Nettoyage des toiles d'araignées (plafond et coins des murs)",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 10,
          description: "Nettoyage de la faïence des murs",
          "produits a utilise": "OMO, Javel",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 4,
      name: "Cuisine",
      steps: [
        {
          id: 11,
          description:
            "Nettoyage du réfrigérateur (enlever tous les supports internes)",
          "produits a utilise": "OMO, Javel, dégraissant, détartrant, zestes",
          type: "nettoyage",
        },
        {
          id: 12,
          description: "Nettoyage du gaz + nettoyage du four",
          "produits a utilise": "OMO, dégraissant, Javel",
          type: "nettoyage",
        },
        {
          id: 13,
          description: "Nettoyage du plan de travail en marbre",
          "produits a utilise": "OMO, dégraissant, Javel, détartrant",
          type: "nettoyage",
        },
        {
          id: 14,
          description: "Nettoyage de la fenêtre (vitre + bois) + porte cuisine",
          "produits a utilise": "OMO, Javel, Ajax",
          type: "nettoyage",
        },
        {
          id: 15,
          description:
            "Nettoyage du placard + étagères de la cuisine (de l'intérieur + extérieur)",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 16,
          description:
            "Nettoyage de la faïence (autour du gaz, des taches d'huiles)",
          "produits a utilise": "dégraissant, OMO, Javel",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 5,
      name: "Chambres",
      steps: [
        {
          id: 17,
          description: "Enlèvement des toiles d'araignées",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 18,
          description:
            "Changement des draps + oreillers ou secouer s'ils sont propres",
          "produits a utilise": "",
          type: "entretien",
        },
        {
          id: 19,
          description: "Enlever la poussière des étagères du placard",
          "produits a utilise": "",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 6,
      name: "Extérieur",
      steps: [
        {
          id: 20,
          description: "Nettoyage des balcons + véranda",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 21,
          description: "Nettoyage de la table + chaises plastiques",
          "produits a utilise": "OMO, Javel",
          type: "nettoyage",
        },
        {
          id: 22,
          description: "Nettoyage du parterre de toute la maison",
          "produits a utilise": "eau, Javel",
          type: "nettoyage",
        },
      ],
    },
  ],
};

interface ChecklistEntry {
  id: string;
  maison: string;
  etape: number;
  categorie: string;
  description: string;
  produitAUtiliser: string;
  type: string;
}

export default function CheckListePage() {
  const [selectedHouse, setSelectedHouse] = useState<string>("maison-1");
  const [checklistEntries, setChecklistEntries] = useState<ChecklistEntry[]>(
    []
  );
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    etape: "",
    categorie: "",
    description: "",
    produitAUtiliser: "",
    type: "",
  });

  // Initialize with mock data
  useEffect(() => {
    const initialEntries: ChecklistEntry[] = [];
    let stepCounter = 1;

    mockData.categories.forEach((category) => {
      category.steps.forEach((step) => {
        initialEntries.push({
          id: step.id.toString(),
          maison: "maison-1", // Default to first house
          etape: stepCounter++,
          categorie: category.name,
          description: step.description,
          produitAUtiliser: step["produits a utilise"],
          type: step.type,
        });
      });
    });

    setChecklistEntries(initialEntries);
  }, []);

  const filteredEntries = checklistEntries.filter(
    (entry) => entry.maison === selectedHouse
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.etape ||
      !formData.categorie ||
      !formData.description ||
      !formData.type
    ) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    const entryData: ChecklistEntry = {
      id: editingEntry || Date.now().toString(),
      maison: selectedHouse,
      etape: Number.parseInt(formData.etape),
      categorie: formData.categorie,
      description: formData.description,
      produitAUtiliser: formData.produitAUtiliser,
      type: formData.type,
    };

    if (editingEntry) {
      setChecklistEntries((prev) =>
        prev.map((entry) => (entry.id === editingEntry ? entryData : entry))
      );
      setEditingEntry(null);
      toast.success("Étape mise à jour", {
        description: "L'étape a été mise à jour avec succès",
      });
    } else {
      setChecklistEntries((prev) => [...prev, entryData]);
      toast.success("Étape ajoutée avec succès", {
        description: "La nouvelle étape a été ajoutée à la checklist",
      });
    }

    // Reset form
    setFormData({
      etape: "",
      categorie: "",
      description: "",
      produitAUtiliser: "",
      type: "",
    });
  };

  const handleEdit = (entry: ChecklistEntry) => {
    setFormData({
      etape: entry.etape.toString(),
      categorie: entry.categorie,
      description: entry.description,
      produitAUtiliser: entry.produitAUtiliser,
      type: entry.type,
    });
    setEditingEntry(entry.id);
  };

  const handleDelete = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete) {
      setChecklistEntries((prev) =>
        prev.filter((entry) => entry.id !== entryToDelete)
      );
      toast.success("Étape supprimée", {
        description: "L'étape a été supprimée avec succès",
      });
    }
    setDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      etape: "",
      categorie: "",
      description: "",
      produitAUtiliser: "",
      type: "",
    });
    setEditingEntry(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Checkliste
          </h1>
        </div>

        {/* House Filter */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Sélectionner une maison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedHouse} onValueChange={setSelectedHouse}>
              <SelectTrigger className="w-full md:w-[300px] border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Choisir une maison" />
              </SelectTrigger>
              <SelectContent>
                {houses.map((house) => (
                  <SelectItem key={house.id} value={house.id}>
                    {house.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Checklist Form */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {editingEntry ? "Modifier l'étape" : "Ajouter une étape"}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {editingEntry
                ? "Modifiez les détails de l'étape"
                : "Créez une nouvelle étape pour la checklist"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="etape"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Étape *
                  </Label>
                  <Input
                    id="etape"
                    type="number"
                    value={formData.etape}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        etape: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                    placeholder="Numéro de l'étape"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="categorie"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Catégorie *
                  </Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categorie: value }))
                    }
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-800">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrée">Entrée</SelectItem>
                      <SelectItem value="Salle de Bain">
                        Salle de Bain
                      </SelectItem>
                      <SelectItem value="Couloir">Couloir</SelectItem>
                      <SelectItem value="Cuisine">Cuisine</SelectItem>
                      <SelectItem value="Chambres">Chambres</SelectItem>
                      <SelectItem value="Extérieur">Extérieur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="border-slate-200 dark:border-slate-800">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nettoyage">Nettoyage</SelectItem>
                      <SelectItem value="vérification">Vérification</SelectItem>
                      <SelectItem value="entretien">Entretien</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Description *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border-slate-200 dark:border-slate-800"
                  placeholder="Description détaillée de l'étape"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="produitAUtiliser"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Produit à utiliser
                </Label>
                <Input
                  id="produitAUtiliser"
                  value={formData.produitAUtiliser}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      produitAUtiliser: e.target.value,
                    }))
                  }
                  className="border-slate-200 dark:border-slate-800"
                  placeholder="Produits nécessaires (ex: Javel, OMO, etc.)"
                />
              </div>

              <div className="flex justify-center space-x-2 pt-4">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {editingEntry ? "Modifier" : "Valider"}
                </Button>
                {editingEntry && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-slate-200 dark:border-slate-800 bg-transparent"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Checklist Table */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Checklist - {houses.find((h) => h.id === selectedHouse)?.name}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {filteredEntries.length} étape(s) dans la checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-800">
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Actions
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Maison
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Étape
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Catégorie
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Description
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Produit à utiliser
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries
                    .sort((a, b) => a.etape - b.etape)
                    .map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="border-slate-200 dark:border-slate-800"
                      >
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(entry)}
                              className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(entry.id)}
                              className="border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                          {houses.find((h) => h.id === entry.maison)?.name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {entry.etape}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {entry.categorie}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {entry.description}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {entry.produitAUtiliser || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              entry.type === "nettoyage"
                                ? "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                : entry.type === "vérification"
                                ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                : "bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-slate-50"
                            }`}
                          >
                            {entry.type}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900 dark:text-slate-50">
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                Êtes-vous sûr de vouloir supprimer cette étape ? Cette action ne
                peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-200 dark:border-slate-800">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </div>
    </div>
  );
}

// src/pages/MaintenancePage.tsx

import type React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Edit,
  Trash2,
  Upload,
  Check,
  X,
  Notebook,
  CircleX,
  Camera,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Loading, LoadingInline, LoadingOverlay } from "@/components/ui/loading";
import { maintenanceService, financeService } from "@/services";
import type { MaintenanceIssue as ApiMaintenanceIssue, CreateMaintenanceIssue } from "@/types/api";

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

const issueTypes = [
  { id: "electricite", name: "Électricité" },
  { id: "plomberie", name: "Plomberie" },
  { id: "electromenager", name: "Électroménager" },
  { id: "peinture", name: "Peinture" },
  { id: "autre", name: "Autre" },
];

// Use the API type, but extend it for local file handling
interface MaintenanceIssue extends Omit<ApiMaintenanceIssue, 'photoPanne' | 'photoFacture'> {
  photoPanne?: File | string;
  photoFacture?: File | string;
}

export default function MaintenancePage() {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIssue, setEditingIssue] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);
  const [accordionValue, setAccordionValue] = useState<string>("");

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    maison: "",
    typePanne: "",
    dateDeclaration: new Date(),
    assigne: "",
    commentaire: "",
    statut: "non-resolue" as "resolue" | "non-resolue",
    photoPanne: null as File | null,
    photoFacture: null as File | null,
    prixMainOeuvre: "",
  });

  // Filter state
  const [filters, setFilters] = useState({
    statut: "non-resolue" as "resolue" | "non-resolue",
    maison: "maison-1",
    dateDeclaration: undefined as Date | undefined,
  });

  // Load maintenance issues from API
  useEffect(() => {
    loadIssues();
  }, [filters.maison, filters.statut]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters for API call
      const apiFilters: Parameters<typeof maintenanceService.getMaintenanceIssues>[0] = {};
      
      if (filters.maison !== 'all') {
        apiFilters.houseId = filters.maison;
      }
      
      apiFilters.status = filters.statut;
      
      const data = await maintenanceService.getMaintenanceIssues(apiFilters);
      setIssues(data);
      console.log('Loaded maintenance issues:', data);
    } catch (err) {
      setError('Erreur lors du chargement des pannes');
      console.error('Error loading maintenance issues:', err);
      toast.error('Erreur', {
        description: 'Impossible de charger les pannes de maintenance'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = issue.statut === filters.statut;
    const matchesHouse = issue.maison === filters.maison;
    const matchesDate =
      !filters.dateDeclaration ||
      issue.dateDeclaration === format(filters.dateDeclaration, "yyyy-MM-dd");

    return matchesStatus && matchesHouse && matchesDate;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting || processing) {
      return;
    }

    if (!formData.maison || !formData.typePanne || !formData.assigne) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs obligatoires",
        duration: 2000,
      });
      return;
    }

    const issueData: CreateMaintenanceIssue = {
      maison: formData.maison,
      typePanne: formData.typePanne,
      dateDeclaration: format(formData.dateDeclaration, "yyyy-MM-dd"),
      assigne: formData.assigne,
      commentaire: formData.commentaire,
      statut: formData.statut,
      photoPanne: typeof formData.photoPanne === 'string' ? formData.photoPanne : formData.photoPanne?.name,
      photoFacture: typeof formData.photoFacture === 'string' ? formData.photoFacture : formData.photoFacture?.name,
      prixMainOeuvre: formData.prixMainOeuvre
        ? Number.parseFloat(formData.prixMainOeuvre)
        : undefined,
    };

    try {
      setSubmitting(true);
      setProcessing(true);

      if (editingIssue) {
        const updated = await maintenanceService.updateMaintenanceIssue(editingIssue, issueData);
        console.log('Updated maintenance issue:', updated);
        
        // Create financial transaction if maintenance is resolved with costs
        if (updated.statut === 'resolue' && updated.prixMainOeuvre && updated.prixMainOeuvre > 0) {
          try {
            await financeService.createMaintenanceTransaction({
              id: updated.id,
              assigne: updated.assigne,
              dateDeclaration: updated.dateDeclaration,
              prixMainOeuvre: updated.prixMainOeuvre,
              maison: updated.maison,
              typePanne: updated.typePanne,
              photoFacture: updated.photoFacture
            });
            console.log('Created financial transaction for maintenance:', updated.id);
          } catch (err) {
            console.error('Error creating financial transaction:', err);
            // Don't fail the maintenance update if transaction fails
          }
        }
        
        // Optimistically update the local state
        setIssues(prev => 
          prev.map(issue => issue.id === editingIssue ? updated : issue)
        );
        setEditingIssue(null);
        toast.success("Panne mise à jour", {
          description: "La panne a été mise à jour avec succès",
          duration: 1000,
        });
      } else {
        const created = await maintenanceService.createMaintenanceIssue(issueData);
        console.log('Created maintenance issue:', created);
        
        // Optimistically add to local state
        setIssues(prev => [...prev, created]);
        toast.success("Panne déclarée", {
          description: "La nouvelle panne a été déclarée avec succès",
          duration: 1000,
        });
      }

      resetForm();
    } catch (err) {
      console.error('Error saving maintenance issue:', err);
      toast.error("Erreur", {
        description: "Impossible de sauvegarder la panne",
      });
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      maison: "",
      typePanne: "",
      dateDeclaration: new Date(),
      assigne: "",
      commentaire: "",
      statut: "non-resolue",
      photoPanne: null,
      photoFacture: null,
      prixMainOeuvre: "",
    });
  };

  const handleDelete = (id: string) => {
    setIssueToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (issueToDelete) {
      try {
        setDeleting(issueToDelete);
        setProcessing(true);

        await maintenanceService.deleteMaintenanceIssue(issueToDelete);
        
        // Optimistically remove from local state
        setIssues(prev => prev.filter(issue => issue.id !== issueToDelete));
        
        toast.success("Panne supprimée", {
          description: "La panne a été supprimée avec succès",
          duration: 1000,
        });
      } catch (err) {
        console.error('Error deleting maintenance issue:', err);
        toast.error("Erreur", {
          description: "Impossible de supprimer la panne",
        });
      } finally {
        setDeleting(null);
        setProcessing(false);
      }
    }
    setDeleteDialogOpen(false);
    setIssueToDelete(null);
  };

  const handleEdit = (issue: MaintenanceIssue) => {
    setFormData({
      maison: issue.maison,
      typePanne: issue.typePanne,
      dateDeclaration: new Date(issue.dateDeclaration),
      assigne: issue.assigne,
      commentaire: issue.commentaire,
      statut: issue.statut,
      photoPanne: null,
      photoFacture: null,
      prixMainOeuvre: issue.prixMainOeuvre?.toString() || "",
    });
    setEditingIssue(issue.id);
    setAccordionValue("form");
  };


  const handleFileUpload = (
    file: File | null,
    field: "photoPanne" | "photoFacture"
  ) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleImageClick = (imageSrc: string, title: string) => {
    setSelectedImage({ src: imageSrc, title });
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      {/* Processing Overlay */}
      {processing && <LoadingOverlay message="Traitement en cours..." />}
      
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Notebook className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Maintenance
          </h1>
        </div>

        {/* Form Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <AccordionItem
            value="form"
            className="border-slate-200 dark:border-slate-800"
          >
            <AccordionTrigger className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 px-6 py-4 rounded-t-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Notebook className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-slate-900 dark:text-slate-50 font-medium">
                  {editingIssue
                    ? "Modifier la panne"
                    : "Déclarer une nouvelle panne"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white dark:bg-slate-950 border-x border-b border-slate-200 dark:border-slate-800 rounded-b-lg">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Sélectionner une maison *
                      </Label>
                      <Select
                        value={formData.maison}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, maison: value }))
                        }
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-800">
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
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Type de panne *
                      </Label>
                      <Select
                        value={formData.typePanne}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, typePanne: value }))
                        }
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-800">
                          <SelectValue placeholder="Choisir le type" />
                        </SelectTrigger>
                        <SelectContent>
                          {issueTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Date de déclaration
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800 bg-transparent"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.dateDeclaration, "PPP", {
                              locale: fr,
                            })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dateDeclaration}
                            onSelect={(date) =>
                              date &&
                              setFormData((prev) => ({
                                ...prev,
                                dateDeclaration: date,
                              }))
                            }
                            locale={fr}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Assigné *
                      </Label>
                      <Input
                        value={formData.assigne}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            assigne: e.target.value,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800"
                        placeholder="Nom de la personne responsable"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Commentaire
                    </Label>
                    <Textarea
                      value={formData.commentaire}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          commentaire: e.target.value,
                        }))
                      }
                      className="border-slate-200 dark:border-slate-800"
                      placeholder="Description détaillée de la panne"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Statut
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm text-slate-600 dark:text-slate-400">
                        Non résolue
                      </Label>
                      <Switch
                        checked={formData.statut === "resolue"}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            statut: checked ? "resolue" : "non-resolue",
                          }))
                        }
                      />
                      <Label className="text-sm text-slate-600 dark:text-slate-400">
                        Résolue
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Photo de la panne
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0] || null,
                            "photoPanne"
                          )
                        }
                        className="border-slate-200 dark:border-slate-800"
                      />
                      <Upload className="h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  {(editingIssue || formData.statut === "resolue") && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Photo de la facture de matériel
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files?.[0] || null,
                                "photoFacture"
                              )
                            }
                            className="border-slate-200 dark:border-slate-800"
                          />
                          <Upload className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Prix de main d'œuvre (€)
                        </Label>
                        <Input
                          type="number"
                          value={formData.prixMainOeuvre}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              prixMainOeuvre: e.target.value,
                            }))
                          }
                          className="border-slate-200 dark:border-slate-800"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-center space-x-2 pt-4">
                    {editingIssue && formData.statut === "non-resolue" ? (
                      <Button
                        type="button"
                        onClick={() => {
                          const updatedData = {
                            ...formData,
                            statut: "resolue" as const,
                          };
                          setFormData(updatedData);

                          // Update the issue in the list
                          const issueData: MaintenanceIssue = {
                            id: editingIssue,
                            maison: updatedData.maison,
                            typePanne: updatedData.typePanne,
                            dateDeclaration: format(
                              updatedData.dateDeclaration,
                              "yyyy-MM-dd"
                            ),
                            assigne: updatedData.assigne,
                            commentaire: updatedData.commentaire,
                            statut: updatedData.statut,
                            photoPanne:
                              updatedData.photoPanne?.name || undefined,
                            photoFacture:
                              updatedData.photoFacture?.name || undefined,
                            prixMainOeuvre: updatedData.prixMainOeuvre
                              ? Number.parseFloat(updatedData.prixMainOeuvre)
                              : undefined,
                          };

                          setIssues((prev) =>
                            prev.map((issue) =>
                              issue.id === editingIssue ? issueData : issue
                            )
                          );

                          toast.success("Panne résolue", {
                            description:
                              "La panne est maintenant marquée comme résolue",
                            duration: 1000,
                          });
                        }}
                        className="bg-cyan-900 hover:bg-cyan-600 text-white"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Résoudre la panne
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        {submitting ? (
                          <LoadingInline size={16} color="#ffffff" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {submitting ? "En cours..." : "Valider"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingIssue(null);
                        resetForm();
                      }}
                      className="border-slate-200 dark:border-slate-800"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Issues Table with Integrated Filters */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Liste des pannes -{" "}
              {houses.find((h) => h.id === filters.maison)?.name}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {filteredIssues.length} panne(s){" "}
              {filters.statut === "resolue" ? "résolue(s)" : "non résolue(s)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters in one horizontal row */}

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs whitespace-nowrap overflow-x-auto">
              {/* Statut (switch + texte inline) */}
              <div className="flex items-center gap-1">
                <span className="text-slate-600 dark:text-slate-300">
                  Non résolue
                </span>
                <Switch
                  className="scale-75"
                  checked={filters.statut === "resolue"}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({
                      ...prev,
                      statut: checked ? "resolue" : "non-resolue",
                    }))
                  }
                />
                <span className="text-slate-600 dark:text-slate-300">
                  Résolue
                </span>
              </div>

              {/* Maison */}
              <Select
                value={filters.maison}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, maison: value }))
                }
              >
                <SelectTrigger className="h-8 px-2 text-xs border-slate-200 dark:border-slate-800 w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {houses.map((house) => (
                    <SelectItem key={house.id} value={house.id}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-8 px-2 text-xs border-slate-200 dark:border-slate-800 w-[110px] justify-start",
                      !filters.dateDeclaration &&
                        "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {filters.dateDeclaration
                      ? format(filters.dateDeclaration, "dd/MM/yy", {
                          locale: fr,
                        })
                      : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateDeclaration}
                    onSelect={(date) =>
                      setFilters((prev) => ({ ...prev, dateDeclaration: date }))
                    }
                    locale={fr}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Table */}
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
                      Type de panne
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Date de déclaration
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Assigné
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Commentaire
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Statut
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Photo panne
                    </TableHead>
                    {filters.statut === "resolue" && (
                      <>
                        <TableHead className="text-slate-700 dark:text-slate-300">
                          Photo facture
                        </TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-300">
                          Prix main d'œuvre
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={filters.statut === "resolue" ? 10 : 8} className="text-center py-8">
                        <Loading message="Chargement des pannes..." />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={filters.statut === "resolue" ? 10 : 8} className="text-center py-8">
                        <span className="text-red-600 dark:text-red-400">
                          {error}
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : filteredIssues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={filters.statut === "resolue" ? 10 : 8} className="text-center py-8">
                        <span className="text-slate-600 dark:text-slate-400">
                          Aucune panne trouvée pour cette maison
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIssues.map((issue) => (
                    <TableRow
                      key={issue.id}
                      className="border-slate-200 dark:border-slate-800"
                    >
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(issue)}
                            className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(issue.id)}
                            disabled={deleting === issue.id}
                            className="border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 disabled:opacity-50"
                          >
                            {deleting === issue.id ? (
                              <LoadingInline size={16} color="#64748b" className="mr-0" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                        {houses.find((h) => h.id === issue.maison)?.name}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {issueTypes.find((t) => t.id === issue.typePanne)?.name}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {format(new Date(issue.dateDeclaration), "PPP", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {issue.assigne}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {issue.commentaire}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            issue.statut === "resolue"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {issue.statut === "resolue"
                            ? "Résolue"
                            : "Non résolue"}
                        </span>
                      </TableCell>

                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {issue.photoPanne ? (
                          <button
                            onClick={() => {
                              const imageUrl =
                                issue.photoPanne instanceof File
                                  ? URL.createObjectURL(issue.photoPanne)
                                  : issue.photoPanne;

                              if (typeof imageUrl === "string") {
                                handleImageClick(imageUrl, "Photo de la panne");
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer text-lg"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      {filters.statut === "resolue" && (
                        <>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {issue.photoFacture ? (
                              <button
                                onClick={() => {
                                  const imageUrl =
                                    issue.photoFacture instanceof File
                                      ? URL.createObjectURL(issue.photoFacture)
                                      : issue.photoFacture;

                                  if (typeof imageUrl === "string") {
                                    handleImageClick(
                                      imageUrl,
                                      "Photo de la facture"
                                    );
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer text-lg"
                              >
                                <Camera className="h-4 w-4" />
                              </button>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {issue.prixMainOeuvre
                              ? `${issue.prixMainOeuvre}€`
                              : "-"}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Image Modal */}
        {imageModalOpen && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white dark:bg-slate-950 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Close button */}
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <CircleX className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>

              {/* Image container */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                  {selectedImage.title}
                </h3>
                <div className="flex justify-center">
                  <img
                    src={selectedImage.src || "/placeholder.svg"}
                    alt={selectedImage.title}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900 dark:text-slate-50">
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                Êtes-vous sûr de vouloir supprimer cette panne ? Cette action ne
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

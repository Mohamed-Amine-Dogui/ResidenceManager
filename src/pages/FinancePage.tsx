"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  CircleX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartTooltip } from "@/components/ui/chart";

const houses = [
  { id: "all", name: "Toutes" },
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

const originTypes = [
  { id: "all", name: "Toutes" },
  { id: "reservation", name: "Réservation" },
  { id: "maintenance", name: "Maintenance" },
  { id: "checkin", name: "Check-in/out" },
  { id: "manuel", name: "Manuel" },
];

interface FinancialOperation {
  id: string;
  date: string;
  maison: string;
  type: "entree" | "sortie";
  motif: string;
  montant: number;
  origine: "reservation" | "maintenance" | "checkin" | "manuel";
  pieceJointe?: File | string;
  editable: boolean;
}

export default function FinancePage() {
  const [operations, setOperations] = useState<FinancialOperation[]>([]);
  const [editingOperation, setEditingOperation] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<string | null>(
    null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    maison: "all",
    date: new Date(), // Change from mois to date
    annee: new Date().getFullYear().toString(),
    origine: "all",
  });

  // Form state
  const [formData, setFormData] = useState({
    type: "entree" as "entree" | "sortie",
    maison: "",
    date: new Date(),
    motif: "",
    montant: "",
    pieceJointe: null as File | null,
  });

  // Mock data initialization
  useEffect(() => {
    const mockOperations: FinancialOperation[] = [
      {
        id: "1",
        date: "2025-08-15",
        maison: "maison-1",
        type: "entree",
        motif: "Avance réservation - Jean Dupont",
        montant: 200,
        origine: "reservation",
        editable: false,
      },
      {
        id: "2",
        date: "2025-08-20",
        maison: "maison-1",
        type: "entree",
        motif: "Solde réservation - Jean Dupont",
        montant: 300,
        origine: "checkin",
        editable: false,
      },
      {
        id: "3",
        date: "2025-08-18",
        maison: "maison-2",
        type: "sortie",
        motif: "Réparation électricité - Matériaux",
        montant: 85,
        origine: "maintenance",
        editable: false,
      },
      {
        id: "4",
        date: "2025-08-18",
        maison: "maison-2",
        type: "sortie",
        motif: "Réparation électricité - Main d'œuvre",
        montant: 150,
        origine: "maintenance",
        editable: false,
      },
      {
        id: "5",
        date: "2025-08-10",
        maison: "maison-3",
        type: "sortie",
        motif: "Salaire employé - Janvier",
        montant: 1200,
        origine: "manuel",
        editable: true,
      },
    ];
    setOperations(mockOperations);
  }, []);

  const filteredOperations = operations.filter((op) => {
    const opDate = new Date(op.date);
    const matchesHouse =
      filters.maison === "all" || op.maison === filters.maison;
    const matchesMonthAndYear =
      opDate.getMonth() === filters.date.getMonth() &&
      opDate.getFullYear() === filters.date.getFullYear();
    const matchesYearFilter = opDate.getFullYear().toString() === filters.annee;
    const matchesOrigin =
      filters.origine === "all" || op.origine === filters.origine;

    return (
      matchesHouse && matchesMonthAndYear && matchesYearFilter && matchesOrigin
    );
  });

  const entrees = filteredOperations.filter((op) => op.type === "entree");
  const sorties = filteredOperations.filter((op) => op.type === "sortie");

  const totalEntrees = entrees.reduce((sum, op) => sum + op.montant, 0);
  const totalSorties = sorties.reduce((sum, op) => sum + op.montant, 0);
  const soldeNet = totalEntrees - totalSorties;

  // Chart data
  const chartData = Array.from({ length: 12 }, (_, index) => {
    const monthOps = operations.filter((op) => {
      const opDate = new Date(op.date);
      return (
        opDate.getMonth() === index &&
        opDate.getFullYear().toString() === filters.annee && // Use the year from the filter
        (filters.maison === "all" || op.maison === filters.maison)
      );
    });

    const entreesMonth = monthOps
      .filter((op) => op.type === "entree")
      .reduce((sum, op) => sum + op.montant, 0);
    const sortiesMonth = monthOps
      .filter((op) => op.type === "sortie")
      .reduce((sum, op) => sum + op.montant, 0);

    return {
      mois: format(new Date(2025, index, 1), "MMM", { locale: fr }),
      entrees: entreesMonth,
      sorties: sortiesMonth,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.maison || !formData.motif || !formData.montant) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    const operationData: FinancialOperation = {
      id: editingOperation || Date.now().toString(),
      date: format(formData.date, "yyyy-MM-dd"),
      maison: formData.maison,
      type: formData.type,
      motif: formData.motif,
      montant: Number.parseFloat(formData.montant),
      origine: "manuel",
      pieceJointe: formData.pieceJointe?.name || undefined,
      editable: true,
    };

    if (editingOperation) {
      setOperations((prev) =>
        prev.map((op) => (op.id === editingOperation ? operationData : op))
      );
      setEditingOperation(null);
      toast.success("Opération mise à jour", {
        description: "L'opération a été mise à jour avec succès",
      });
    } else {
      setOperations((prev) => [...prev, operationData]);
      toast.success("Opération ajoutée", {
        description: "La nouvelle opération a été ajoutée avec succès",
      });
    }

    resetForm();
    setAddDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      type: "entree",
      maison: "",
      date: new Date(),
      motif: "",
      montant: "",
      pieceJointe: null,
    });
  };

  const handleEdit = (operation: FinancialOperation) => {
    if (!operation.editable) {
      toast.error("Erreur", {
        description:
          "Cette opération ne peut pas être modifiée car elle est générée automatiquement",
      });
      return;
    }

    setFormData({
      type: operation.type,
      maison: operation.maison,
      date: new Date(operation.date),
      motif: operation.motif,
      montant: operation.montant.toString(),
      pieceJointe: null,
    });
    setEditingOperation(operation.id);
    setAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const operation = operations.find((op) => op.id === id);
    if (!operation?.editable) {
      toast.error("Erreur", {
        description:
          "Cette opération ne peut pas être supprimée car elle est générée automatiquement",
      });
      return;
    }

    setOperationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (operationToDelete) {
      setOperations((prev) => prev.filter((op) => op.id !== operationToDelete));
      toast.success("Opération supprimée", {
        description: "L'opération a été supprimée avec succès",
      });
    }
    setDeleteDialogOpen(false);
    setOperationToDelete(null);
  };

  const handleImageClick = (imageSrc: string, title: string) => {
    setSelectedImage({ src: imageSrc, title });
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const getOriginBadge = (origine: string) => {
    const variants = {
      reservation:
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      maintenance:
        "bg-teal-200 text-teal-900 dark:bg-teal-800 dark:text-teal-100",
      checkin: "bg-teal-300 text-teal-900 dark:bg-teal-700 dark:text-teal-100",
      manuel: "bg-teal-400 text-teal-900 dark:bg-teal-600 dark:text-teal-100",
    };

    const labels = {
      reservation: "Réservation",
      maintenance: "Maintenance",
      checkin: "Check-in/out",
      manuel: "Manuel",
    };

    return (
      <Badge className={variants[origine as keyof typeof variants]}>
        {labels[origine as keyof typeof labels]}
      </Badge>
    );
  };

  const OperationTable = ({
    data,
    title,
  }: {
    data: FinancialOperation[];
    title: string;
  }) => (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          {data.length} opération(s) trouvée(s)
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
                  Date
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Maison
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Type
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Motif
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Montant
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Origine
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Pièce jointe
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((operation) => (
                <TableRow
                  key={operation.id}
                  className="border-slate-200 dark:border-slate-800"
                >
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(operation)}
                        disabled={!operation.editable}
                        className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(operation.id)}
                        disabled={!operation.editable}
                        className="border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {format(new Date(operation.date), "PPP", { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                    {houses.find((h) => h.id === operation.maison)?.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {operation.type === "entree" ? (
                        <TrendingUp className="h-4 w-4 text-lime-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-cyan-300" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          operation.type === "entree"
                            ? "text-lime-400"
                            : "text-cyan-300"
                        }`}
                      >
                        {operation.type === "entree" ? "Entrée" : "Sortie"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {operation.motif}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                    {operation.montant.toLocaleString("fr-FR")}€
                  </TableCell>
                  <TableCell>{getOriginBadge(operation.origine)}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {operation.pieceJointe ? (
                      <button
                        onClick={() =>
                          handleImageClick(
                            typeof operation.pieceJointe === "string"
                              ? operation.pieceJointe
                              : URL.createObjectURL(operation.pieceJointe),
                            "Pièce jointe"
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une opération
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-slate-50">
                  {editingOperation
                    ? "Modifier l'opération"
                    : "Ajouter une opération financière"}
                </DialogTitle>
                <DialogDescription className="text-slate-600 dark:text-slate-400">
                  {editingOperation
                    ? "Modifiez les détails de l'opération"
                    : "Ajoutez une nouvelle opération financière manuelle"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "entree" | "sortie") =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="border-slate-200 dark:border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entree">Entrée</SelectItem>
                        <SelectItem value="sortie">Sortie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Maison *
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
                        {houses.slice(1).map((house) => (
                          <SelectItem key={house.id} value={house.id}>
                            {house.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Date *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800 bg-transparent"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(formData.date, "PPP", { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) =>
                            date && setFormData((prev) => ({ ...prev, date }))
                          }
                          locale={fr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Montant (€) *
                    </Label>
                    <Input
                      type="number"
                      value={formData.montant}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          montant: e.target.value,
                        }))
                      }
                      className="border-slate-200 dark:border-slate-800"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Motif *
                  </Label>
                  <Textarea
                    value={formData.motif}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        motif: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                    placeholder="Description de l'opération"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Pièce jointe
                  </Label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pieceJointe: e.target.files?.[0] || null,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddDialogOpen(false);
                      setEditingOperation(null);
                      resetForm();
                    }}
                    className="border-slate-200 dark:border-slate-800"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {editingOperation ? "Modifier" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-slate-800 bg-transparent"
          >
            <Download className="text-xs mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-slate-800 bg-transparent"
          >
            <Download className="text-xs mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Suivi Financier
            </h1>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Maison
                </Label>
                <Select
                  value={filters.maison}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, maison: value }))
                  }
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-800">
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
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Mois
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800 bg-transparent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(filters.date, "MMMM yyyy", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.date}
                      onSelect={(date) =>
                        date &&
                        setFilters((prev) => ({
                          ...prev,
                          date,
                          annee: date.getFullYear().toString(), // Automatically update year
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
                  Année
                </Label>
                <Select
                  value={filters.annee}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, annee: value }))
                  }
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300">
                  Origine
                </Label>
                <Select
                  value={filters.origine}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, origine: value }))
                  }
                >
                  <SelectTrigger className="border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {originTypes.map((origin) => (
                      <SelectItem key={origin.id} value={origin.id}>
                        {origin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total des entrées
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-lime-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lime-400">
                {totalEntrees.toLocaleString("fr-FR")}€
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {entrees.length} opération(s)
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total des sorties
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-cyan-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-300">
                {totalSorties.toLocaleString("fr-FR")}€
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {sorties.length} opération(s)
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Solde net
              </CardTitle>
              <DollarSign
                className={`h-4 w-4 ${
                  soldeNet >= 0 ? "text-lime-400" : "text-cyan-300"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  soldeNet >= 0 ? "text-lime-400" : "text-cyan-300"
                }`}
              >
                {soldeNet.toLocaleString("fr-FR")}€
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {soldeNet >= 0 ? "Bénéfice" : "Déficit"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
            >
              Toutes les opérations
            </TabsTrigger>
            <TabsTrigger
              value="entrees"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
            >
              Entrées
            </TabsTrigger>
            <TabsTrigger
              value="sorties"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950"
            >
              Sorties
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <OperationTable
              data={filteredOperations}
              title="Toutes les opérations financières"
            />
          </TabsContent>
          <TabsContent value="entrees" className="mt-6">
            <OperationTable data={entrees} title="Entrées d'argent" />
          </TabsContent>
          <TabsContent value="sorties" className="mt-6">
            <OperationTable data={sorties} title="Sorties d'argent" />
          </TabsContent>
        </Tabs>

        {/* Chart */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Évolution mensuelle - {filters.annee}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Comparaison des entrées et sorties par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="mois"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg">
                            <p className="text-slate-900 dark:text-slate-50 font-medium">
                              {label}
                            </p>
                            <p className="text-lime-400">
                              Entrées: {payload[0].value}€
                            </p>
                            <p className="text-cyan-300">
                              Sorties: {payload[1].value}€
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="entrees"
                    fill="#a3e635"
                    name="Entrées"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="sorties"
                    fill="#67e8f9"
                    name="Sorties"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Image Modal */}
        {imageModalOpen && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white dark:bg-slate-950 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <CircleX className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
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
                Êtes-vous sûr de vouloir supprimer cette opération ? Cette
                action ne peut pas être annulée.
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

// src/pages/FinancePage.tsx

import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  Euro,
  Camera,
  Download,
  CircleX,
  Landmark,
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
import { ChartTooltip } from "@/components/ui/chart";
import AddFinanceTransaction from "@/components/AddFinanceTransaction";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loading, LoadingInline, LoadingOverlay } from "@/components/ui/loading";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { financeService } from "@/services";
import type { FinancialOperation as ApiFinancialOperation, CreateFinancialOperation } from "@/types/api";

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

// Use the API type, but extend it for local file handling
interface FinancialOperation extends ApiFinancialOperation {
  pieceJointe?: File | string;
}

export default function FinancePage() {
  const [operations, setOperations] = useState<FinancialOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingOperation, setEditingOperation] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<string | null>(
    null
  );
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    maison: "all",
    date: new Date(),
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

  // Load financial operations from API
  useEffect(() => {
    loadOperations();
  }, [filters.maison, filters.annee]);

  const loadOperations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters for API call
      const apiFilters: Parameters<typeof financeService.getFinancialOperations>[0] = {};
      
      if (filters.maison !== 'all') {
        apiFilters.houseId = filters.maison;
      }
      
      if (filters.origine !== 'all') {
        apiFilters.origine = filters.origine;
      }
      
      apiFilters.year = parseInt(filters.annee);
      
      const data = await financeService.getFinancialOperations(apiFilters);
      setOperations(data);
      console.log('Loaded financial operations:', data);
    } catch (err) {
      setError('Erreur lors du chargement des opérations');
      console.error('Error loading financial operations:', err);
      toast.error('Erreur', {
        description: 'Impossible de charger les opérations financières'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const [addFormVisible, setAddFormVisible] = useState(false);

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
        opDate.getFullYear().toString() === filters.annee &&
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // CRITICAL FIX FOR VITE + JSON SERVER PAGE REFRESH ISSUE:
    // Apply the same comprehensive fix as ReservationPage
    
    // Step 1: IMMEDIATE prevention - before ANY other code
    e.preventDefault();
    e.stopPropagation();
    
    // Step 2: Additional safeguards for Vite dev environment
    if (e.nativeEvent) {
      e.nativeEvent.preventDefault();
      e.nativeEvent.stopPropagation();
    }
    
    // Step 3: Return early if event is not properly formed (Vite HMR issue)
    if (!e || !e.currentTarget) {
      console.warn('🟡 Invalid form event detected - this is a Vite/HMR issue');
      return;
    }

    if (submitting || processing) {
      return;
    }

    if (!formData.maison || !formData.motif || !formData.montant) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    const operationData: CreateFinancialOperation = {
      date: format(formData.date, "yyyy-MM-dd"),
      maison: formData.maison,
      type: formData.type,
      motif: formData.motif,
      montant: Number.parseFloat(formData.montant),
      origine: "manuel",
      pieceJointe: formData.pieceJointe?.name || undefined,
      editable: true,
    };

    try {
      setSubmitting(true);
      setProcessing(true);

      if (editingOperation) {
        const updated = await financeService.updateFinancialOperation(editingOperation, operationData);
        console.log('Updated financial operation:', updated);
        
        // Optimistically update the local state
        setOperations(prev => 
          prev.map(op => op.id === editingOperation ? updated : op)
        );
        setEditingOperation(null);
        toast.success("Opération mise à jour", {
          description: "L'opération a été mise à jour avec succès",
        });
      } else {
        const created = await financeService.createFinancialOperation(operationData);
        console.log('Created financial operation:', created);
        
        // Optimistically add to local state
        setOperations(prev => [...prev, created]);
        toast.success("Opération ajoutée", {
          description: "La nouvelle opération a été ajoutée avec succès",
        });
      }

      resetForm();
    } catch (err) {
      console.error('Error saving financial operation:', err);
      toast.error("Erreur", {
        description: "Impossible de sauvegarder l'opération",
      });
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
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

  const confirmDelete = async () => {
    if (operationToDelete) {
      try {
        setDeleting(operationToDelete);
        setProcessing(true);

        await financeService.deleteFinancialOperation(operationToDelete);
        
        // Optimistically remove from local state
        setOperations(prev => prev.filter(op => op.id !== operationToDelete));
        
        toast.success("Opération supprimée", {
          description: "L'opération a été supprimée avec succès",
        });
      } catch (err) {
        console.error('Error deleting financial operation:', err);
        toast.error("Erreur", {
          description: "Impossible de supprimer l'opération",
        });
      } finally {
        setDeleting(null);
        setProcessing(false);
      }
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
        " bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 ",
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

  const memoizedSetFormData = useCallback(
    (updater: React.SetStateAction<typeof formData>) => {
      setFormData(updater);
    },
    []
  );

  const memoizedFormData = useMemo(() => formData, [formData]);

  const memoizedCloseDialog = useCallback(() => {
    setAddFormVisible(false);
    setEditingOperation(null);
    resetForm();
  }, []);

  const getTimestamp = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
  };

  const exportToCSV = () => {
    const headers = ["Date", "Maison", "Type", "Motif", "Montant", "Origine"];

    const rows = filteredOperations.map((op) => [
      format(new Date(op.date), "yyyy-MM-dd"),
      houses.find((h) => h.id === op.maison)?.name || "",
      op.type === "entree" ? "Entrée" : "Sortie",
      op.motif,
      `${op.montant}€`,
      originTypes.find((o) => o.id === op.origine)?.name || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `operations_${getTimestamp()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Date",
      "Maison",
      "Type",
      "Motif",
      "Montant",
      "Origine",
    ];

    const tableRows = filteredOperations.map((op) => [
      format(new Date(op.date), "yyyy-MM-dd"),
      houses.find((h) => h.id === op.maison)?.name || "",
      op.type === "entree" ? "Entrée" : "Sortie",
      op.motif,
      `${op.montant}€`,
      originTypes.find((o) => o.id === op.origine)?.name || "",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      theme: "grid",
    });

    doc.save(`operations_${getTimestamp()}.pdf`);
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loading message="Chargement des opérations..." />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <span className="text-red-600 dark:text-red-400">
                      {error}
                    </span>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <span className="text-slate-600 dark:text-slate-400">
                      Aucune opération trouvée pour cette période
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((operation) => (
                  <TableRow
                    key={operation.id}
                    className={`border-slate-200 dark:border-slate-800 ${
                      deleting === operation.id ? 'opacity-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(operation)}
                          disabled={!operation.editable || deleting === operation.id}
                          className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(operation.id)}
                          disabled={!operation.editable || deleting === operation.id}
                          className="border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 disabled:opacity-50"
                        >
                          {deleting === operation.id ? (
                            <LoadingInline size={16} color="#64748b" className="mr-0" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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
                        onClick={() => {
                          const imageUrl =
                            operation.pieceJointe instanceof File
                              ? URL.createObjectURL(operation.pieceJointe)
                              : operation.pieceJointe;

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
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            onClick={() => {
              setEditingOperation(null);
              resetForm();
              setAddFormVisible(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une opération
          </Button>

          <Button
            variant="outline"
            className="border-slate-200 dark:border-slate-800 bg-transparent"
            onClick={exportToPDF}
          >
            <Download className="text-xs mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-slate-800 bg-transparent"
            onClick={exportToCSV}
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
      {/* Processing Overlay */}
      {processing && <LoadingOverlay message="Traitement en cours..." />}
      
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Landmark className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Suivi Financier
            </h1>
          </div>
        </div>

        <CardContent>
          <div className="w-full flex justify-center">
            <div className="flex items-end gap-3 px-4 py-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs whitespace-nowrap">
              {/* Maison */}
              <div className="flex flex-col space-y-1">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">
                  Maison
                </Label>
                <Select
                  value={filters.maison}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, maison: value }))
                  }
                >
                  <SelectTrigger className="h-8 px-2 text-xs border-slate-200 dark:border-slate-800 w-[90px]">
                    <SelectValue placeholder="Maison" />
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

              {/* Mois */}
              <div className="flex flex-col space-y-1">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">
                  Mois
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 px-2 text-xs border-slate-200 dark:border-slate-800 w-[110px] justify-start"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {filters.date
                        ? format(filters.date, "MMM yyyy", { locale: fr })
                        : "Mois"}
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
                          annee: date.getFullYear().toString(),
                        }))
                      }
                      locale={fr}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Année */}
              <div className="flex flex-col space-y-1">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">
                  Année
                </Label>
                <Select
                  value={filters.annee}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, annee: value }))
                  }
                >
                  <SelectTrigger className="h-8 px-2 text-xs border-slate-200 dark:border-slate-800 w-[80px]">
                    <SelectValue placeholder="Année" />
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

              {/* Origine */}
              <div className="flex flex-col space-y-1">
                <Label className="text-slate-700 dark:text-slate-300 text-xs">
                  Origine
                </Label>
                <Select
                  value={filters.origine}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, origine: value }))
                  }
                >
                  <SelectTrigger className="h-8 px-2 text-xs border-slate-200 dark:border-slate-800 w-[100px]">
                    <SelectValue placeholder="Origine" />
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
          </div>
        </CardContent>

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

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-3">
            
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
                  Solde total net
                </CardTitle>
                <Euro
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

      <Sheet open={addFormVisible} onOpenChange={setAddFormVisible}>
        <SheetContent side="right" className="w-[400px]">
          <SheetHeader>
            <SheetTitle>
              {editingOperation ? "Modifier l'opération" : "Nouvelle opération"}
            </SheetTitle>
          </SheetHeader>

          <AddFinanceTransaction
            formData={memoizedFormData}
            setFormData={memoizedSetFormData}
            handleSubmit={(e) => {
              handleSubmit(e);
              if (!submitting) {
                setAddFormVisible(false);
              }
            }}
            editingOperation={editingOperation}
            closeDialog={memoizedCloseDialog}
            houses={houses}
            submitting={submitting}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

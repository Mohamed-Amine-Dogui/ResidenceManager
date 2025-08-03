// src/pages/ReservationPage.tsx

import type React from "react";
import { useState } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Edit, Trash2, Check, X } from "lucide-react";

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
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  checkin: string;
  checkout: string;
  montantAvance: number;
  maison: string;
}

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
const initialReservations: Reservation[] = [
  {
    id: "1",
    nom: "Jean Dupont",
    telephone: "0123456789",
    email: "jean.dupont@email.com",
    checkin: "2025-07-15",
    checkout: "2025-07-20",
    montantAvance: 200,
    maison: "maison-1",
  },
  {
    id: "2",
    nom: "Marie Martin",
    telephone: "0987654321",
    email: "marie.martin@email.com",
    checkin: "2025-06-25",
    checkout: "2025-07-02",
    montantAvance: 150,
    maison: "maison-1",
  },
];

export default function ReservationPage() {
  const [selectedHouse, setSelectedHouse] = useState<string>("maison-1");
  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);
  const [selectedReservations, setSelectedReservations] = useState<string[]>(
    []
  );
  const [editingReservation, setEditingReservation] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(
    null
  );

  // Calendar state
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // Form state
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    checkin: undefined as Date | undefined,
    checkout: undefined as Date | undefined,
    montantAvance: "",
  });

  const filteredReservations = reservations.filter(
    (r) => r.maison === selectedHouse
  );

  const getBookedDates = () => {
    const bookedDates: Date[] = [];
    filteredReservations.forEach((reservation) => {
      const start = parseISO(reservation.checkin);
      const end = parseISO(reservation.checkout);
      const current = new Date(start);

      while (current <= end) {
        bookedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    return bookedDates;
  };

  const isDateBooked = (date: Date) => {
    return filteredReservations.some((reservation) => {
      const start = parseISO(reservation.checkin);
      const end = parseISO(reservation.checkout);
      return isWithinInterval(date, { start, end });
    });
  };

  const isDateRangeAvailable = (checkin: Date, checkout: Date) => {
    if (editingReservation) {
      // Exclude current reservation when editing
      const otherReservations = filteredReservations.filter(
        (r) => r.id !== editingReservation
      );
      return !otherReservations.some((reservation) => {
        const start = parseISO(reservation.checkin);
        const end = parseISO(reservation.checkout);
        return (
          isWithinInterval(checkin, { start, end }) ||
          isWithinInterval(checkout, { start, end }) ||
          (checkin <= start && checkout >= end)
        );
      });
    }

    return !filteredReservations.some((reservation) => {
      const start = parseISO(reservation.checkin);
      const end = parseISO(reservation.checkout);
      return (
        isWithinInterval(checkin, { start, end }) ||
        isWithinInterval(checkout, { start, end }) ||
        (checkin <= start && checkout >= end)
      );
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nom ||
      !formData.checkin ||
      !formData.checkout
    ) {
      toast.error("Failed", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    if (!isDateRangeAvailable(formData.checkin, formData.checkout)) {
      toast.error("Failed", {
        description: "La maison est déjà réservée dans cette période",
      });
      return;
    }

    const reservationData = {
      id: editingReservation || Date.now().toString(),
      nom: formData.nom,
      telephone: formData.telephone,
      email: formData.email,
      checkin: format(formData.checkin, "yyyy-MM-dd"),
      checkout: format(formData.checkout, "yyyy-MM-dd"),
      montantAvance: Number.parseFloat(formData.montantAvance) || 0,
      maison: selectedHouse,
    };

    if (editingReservation) {
      setReservations((prev) =>
        prev.map((r) => (r.id === editingReservation ? reservationData : r))
      );
      setEditingReservation(null);
      toast.success("Réservation réussie", {
        description: "La réservation a été mise à jour avec succès",
      });
    } else {
      setReservations((prev) => [...prev, reservationData]);
      toast.success("Réservation réussie", {
        description: "La réservation a été créée avec succès",
      });
    }

    // Reset form
    setFormData({
      nom: "",
      telephone: "",
      email: "",
      checkin: undefined,
      checkout: undefined,
      montantAvance: "",
    });
  };

  const handleEdit = (reservation: Reservation) => {
    setFormData({
      nom: reservation.nom,
      telephone: reservation.telephone,
      email: reservation.email,
      checkin: parseISO(reservation.checkin),
      checkout: parseISO(reservation.checkout),
      montantAvance: reservation.montantAvance.toString(),
    });
    setEditingReservation(reservation.id);
  };

  const handleDelete = (id: string) => {
    setReservationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (reservationToDelete) {
      setReservations((prev) =>
        prev.filter((r) => r.id !== reservationToDelete)
      );
      setSelectedReservations((prev) =>
        prev.filter((id) => id !== reservationToDelete)
      );
      toast.success("Réservation supprimée", {
        description: "La réservation a été supprimée avec succès",
      });
    }
    setDeleteDialogOpen(false);
    setReservationToDelete(null);
  };

  const handleSelectReservation = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReservations((prev) => [...prev, id]);
    } else {
      setSelectedReservations((prev) => prev.filter((resId) => resId !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Réservations
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

        {/* Calendar - Full Width */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Calendrier des réservations
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Les dates en bleu sont déjà réservées
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Year Selector */}
            <div className="mb-6 flex items-center space-x-4">
              <Label className="text-slate-700 dark:text-slate-300">
                Année:
              </Label>
              <Select
                value={calendarDate.getFullYear().toString()}
                onValueChange={(year) => {
                  const newDate = new Date(calendarDate);
                  newDate.setFullYear(Number.parseInt(year));
                  setCalendarDate(newDate);
                }}
              >
                <SelectTrigger className="w-[120px] border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={(date) => date && setCalendarDate(date)}
              locale={fr}
              month={calendarDate}
              onMonthChange={setCalendarDate}
              className="rounded-md border border-slate-200 dark:border-slate-800"
              modifiers={{
                booked: getBookedDates(),
              }}
              modifiersStyles={{
                booked: {
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontWeight: "bold",
                },
              }}
            />
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  Réservé
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded border border-slate-300 dark:border-slate-600"></div>
                <span className="text-slate-600 dark:text-slate-400">
                  Disponible
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservation Form - Full Width */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {editingReservation
                ? "Modifier la réservation"
                : "Nouvelle réservation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="nom"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nom: e.target.value }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="telephone"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        telephone: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Date d'arrivée
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800",
                          !formData.checkin &&
                            "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.checkin
                          ? format(formData.checkin, "PPP", { locale: fr })
                          : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkin}
                        onSelect={(date) =>
                          setFormData((prev) => ({ ...prev, checkin: date }))
                        }
                        locale={fr}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Date de départ
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800",
                          !formData.checkout &&
                            "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.checkout
                          ? format(formData.checkout, "PPP", { locale: fr })
                          : "Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.checkout}
                        onSelect={(date) =>
                          setFormData((prev) => ({ ...prev, checkout: date }))
                        }
                        locale={fr}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="montantAvance"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Montant payé en avance
                  </Label>
                  <Input
                    id="montantAvance"
                    type="number"
                    value={formData.montantAvance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        montantAvance: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-center space-x-2 pt-4">
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {editingReservation ? "Modifier" : "Valider"}
                </Button>
                {editingReservation && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingReservation(null);
                      setFormData({
                        nom: "",
                        telephone: "",
                        email: "",
                        checkin: undefined,
                        checkout: undefined,
                        montantAvance: "",
                      });
                    }}
                    className="border-slate-200 dark:border-slate-800"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Reservations Table */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Réservations - {houses.find((h) => h.id === selectedHouse)?.name}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {filteredReservations.length} réservation(s)
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
                      Nom
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Téléphone
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Email
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Check-in
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Check-out
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300">
                      Avance
                    </TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow
                      key={reservation.id}
                      className="border-slate-200 dark:border-slate-800"
                    >
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(reservation)}
                            className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(reservation.id)}
                            className="border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                        {reservation.nom}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {reservation.telephone}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {reservation.email}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {format(parseISO(reservation.checkin), "PPP", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {format(parseISO(reservation.checkout), "PPP", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {reservation.montantAvance}€
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
                Êtes-vous sûr de vouloir supprimer cette réservation ? Cette
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

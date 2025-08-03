// src/pages/CheckInOutPage.tsx

import type React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, LogIn, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loading, LoadingInline, LoadingOverlay } from "@/components/ui/loading";
import { checkinService, reservationService, financeService } from "@/services";
import type { CheckInData as ApiCheckInData, CreateCheckIn, InventaireType } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// Define the type for inventory
type InventaireType = {
  litsSimples: number;
  litsDoubles: number;
  matelasSupplementaires: number;
  oreillers: number;
  tables: number;
  chaises: number;
  drapsPropres: number;
  drapsHousse: number;
  couvertures: number;
  television: boolean;
  telecommandeTv: boolean;
  climatiseur: boolean;
  telecommandeClimatiseur: boolean;
  recepteurTv: boolean;
  telecommandeRecepteur: boolean;
  assiettes: number;
  verres: number;
  couverts: number;
  casseroles: number;
  poeles: number;
  refrigerateur: boolean;
  rideaux: boolean;
  lampes: boolean;
  balaiSerpilliere: boolean;
};

type CheckOutInventaireType = {
  [K in keyof InventaireType]: boolean;
};

// Use the API type directly
type CheckInData = ApiCheckInData;

export default function CheckInOutPage() {
  const [isCheckIn, setIsCheckIn] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkInData, setCheckInData] = useState({
    nom: "",
    telephone: "",
    email: "",
    dateArrivee: undefined as Date | undefined,
    dateDepart: undefined as Date | undefined,
    avancePaye: "",
    paiementCheckin: "",
    montantTotal: "",
    responsable: "",
    remarques: "",
  });

  const [inventaire, setInventaire] = useState<InventaireType>({
    litsSimples: 2,
    litsDoubles: 1,
    matelasSupplementaires: 0,
    oreillers: 4,
    tables: 1,
    chaises: 4,
    drapsPropres: 4,
    drapsHousse: 4,
    couvertures: 4,
    television: true,
    telecommandeTv: true,
    climatiseur: true,
    telecommandeClimatiseur: true,
    recepteurTv: false,
    telecommandeRecepteur: false,
    assiettes: 6,
    verres: 6,
    couverts: 6,
    casseroles: 2,
    poeles: 1,
    refrigerateur: true,
    rideaux: true,
    lampes: true,
    balaiSerpilliere: true,
  });

  const [checkOutView, setCheckOutView] = useState<"table" | "verification">(
    "table"
  );
  const [checkOutSearch, setCheckOutSearch] = useState({
    nom: "",
    dateArrivee: undefined as Date | undefined,
  });
  const [foundCheckIn, setFoundCheckIn] = useState<CheckInData | null>(null);
  const [checkOutInventaire, setCheckOutInventaire] =
    useState<CheckOutInventaireType>({} as CheckOutInventaireType);
  const [commentaireFinal, setCommentaireFinal] = useState("");

  const [checkInRecords, setCheckInRecords] = useState<CheckInData[]>([]);

  // Load check-in records from API when component mounts or house changes
  useEffect(() => {
    if (selectedHouse) {
      loadCheckInRecords();
    }
  }, [selectedHouse]);

  const loadCheckInRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await checkinService.getCheckins(selectedHouse);
      setCheckInRecords(records);
    } catch (err) {
      setError('Erreur lors du chargement des check-ins');
      console.error('Error loading check-ins:', err);
      toast.error('Erreur', {
        description: 'Impossible de charger les check-ins'
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill check-in data when name and date change
  const handleAutoFill = async () => {
    if (!checkInData.nom || !checkInData.dateArrivee || !selectedHouse) return;
    
    try {
      const checkinDateStr = format(checkInData.dateArrivee, "yyyy-MM-dd");
      const reservation = await reservationService.findReservationForCheckin(
        checkInData.nom,
        checkinDateStr,
        selectedHouse
      );
      
      if (reservation) {
        setCheckInData(prev => ({
          ...prev,
          telephone: reservation.telephone,
          email: reservation.email,
          dateDepart: new Date(reservation.checkout),
          avancePaye: reservation.montantAvance.toString(),
        }));
        
        toast.success('Réservation trouvée', {
          description: 'Les informations ont été pré-remplies',
          duration: 2000,
        });
      }
    } catch (err) {
      console.error('Error searching reservation:', err);
    }
  };

  // Trigger auto-fill when name or arrival date changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleAutoFill();
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timeoutId);
  }, [checkInData.nom, checkInData.dateArrivee, selectedHouse]);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedHouse ||
      !checkInData.nom ||
      !checkInData.dateArrivee ||
      !checkInData.dateDepart
    ) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);

      const newCheckInData: CreateCheckIn = {
        maison: selectedHouse,
        nom: checkInData.nom,
        telephone: checkInData.telephone,
        email: checkInData.email,
        dateArrivee: format(checkInData.dateArrivee, "yyyy-MM-dd"),
        dateDepart: format(checkInData.dateDepart, "yyyy-MM-dd"),
        avancePaye: Number.parseFloat(checkInData.avancePaye) || 0,
        paiementCheckin: Number.parseFloat(checkInData.paiementCheckin) || 0,
        montantTotal: (Number.parseFloat(checkInData.avancePaye) || 0) + (Number.parseFloat(checkInData.paiementCheckin) || 0),
        inventaire,
        responsable: checkInData.responsable,
        remarques: checkInData.remarques,
      };

      const createdCheckIn = await checkinService.createCheckin(newCheckInData);

      // Create financial transaction for accommodation payment
      if (createdCheckIn.montantTotal > 0) {
        try {
          await financeService.createCheckinTransaction({
            id: createdCheckIn.id,
            nom: createdCheckIn.nom,
            dateArrivee: createdCheckIn.dateArrivee,
            montantTotal: createdCheckIn.montantTotal,
            maison: createdCheckIn.maison
          });
          console.log('Created financial transaction for check-in:', createdCheckIn.id);
        } catch (err) {
          console.error('Error creating financial transaction:', err);
          // Don't fail the check-in creation if transaction fails
        }
      }

      // Optimistically update local state
      setCheckInRecords((prev) => [...prev, createdCheckIn]);

      toast.success("Check-in enregistré avec succès", {
        description: `État des lieux validé pour ${checkInData.nom}`,
        duration: 2000,
      });

      // Reset form
      setCheckInData({
        nom: "",
        telephone: "",
        email: "",
        dateArrivee: undefined,
        dateDepart: undefined,
        avancePaye: "",
        paiementCheckin: "",
        montantTotal: "",
        responsable: "",
        remarques: "",
      });
    } catch (err) {
      console.error('Error creating check-in:', err);
      toast.error("Erreur", {
        description: "Impossible d'enregistrer le check-in",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOutSearch = async () => {
    if (!checkOutSearch.nom || !checkOutSearch.dateArrivee || !selectedHouse) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs de recherche",
      });
      return;
    }

    if (processing) return;

    try {
      setProcessing(true);

      // Search in the loaded check-in records (which come from API)
      const found = checkInRecords.find(
        (record) =>
          record.nom.toLowerCase().includes(checkOutSearch.nom.toLowerCase()) &&
          record.dateArrivee ===
            format(checkOutSearch.dateArrivee!, "yyyy-MM-dd") &&
          record.maison === selectedHouse
      );

      if (found) {
        setFoundCheckIn(found);

        const initialCheckOut: CheckOutInventaireType = {
          litsSimples: false,
          litsDoubles: false,
          matelasSupplementaires: false,
          oreillers: false,
          tables: false,
          chaises: false,
          drapsPropres: false,
          drapsHousse: false,
          couvertures: false,
          television: false,
          telecommandeTv: false,
          climatiseur: false,
          telecommandeClimatiseur: false,
        recepteurTv: false,
        telecommandeRecepteur: false,
        assiettes: false,
        verres: false,
        couverts: false,
        casseroles: false,
        poeles: false,
        refrigerateur: false,
        rideaux: false,
        lampes: false,
        balaiSerpilliere: false,
      };

        setCheckOutInventaire(initialCheckOut);
        setCheckOutView("verification");

        toast.success("Enregistrement trouvé", {
          description: `Check-in trouvé pour ${found.nom}`,
        });
      } else {
        toast.error("Aucun enregistrement trouvé", {
          description: "Vérifiez les informations saisies",
        });
      }
    } catch (err) {
      console.error('Error searching check-in:', err);
      toast.error("Erreur", {
        description: "Impossible de rechercher le check-in",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!foundCheckIn) return;

    const allItemsChecked = Object.values(checkOutInventaire).every(
      (checked) => checked === true
    );

    if (!allItemsChecked) {
      toast.error("Vérification incomplète", {
        description:
          "Veuillez vérifier tous les éléments avant de valider le départ",
      });
      return;
    }

    if (processing) return;

    try {
      setProcessing(true);

      // Delete the check-in record from the backend
      await checkinService.deleteCheckin(foundCheckIn.id);

      // Optimistically update local state
      setCheckInRecords((prev) =>
        prev.filter((record) => record.id !== foundCheckIn.id)
      );

      toast.success("Check-out enregistré", {
        description: "La maison est maintenant disponible",
        duration: 2000,
      });

      // Reset checkout form
      setCheckOutView("table");
      setCheckOutSearch({
        nom: "",
        dateArrivee: undefined,
      });
      setFoundCheckIn(null);
      setCheckOutInventaire({} as CheckOutInventaireType);
      setCommentaireFinal("");
    } catch (err) {
      console.error('Error processing check-out:', err);
      toast.error("Erreur", {
        description: "Impossible de traiter le check-out",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOutInventaireChange = (
    key: keyof CheckOutInventaireType,
    checked: boolean
  ) => {
    setCheckOutInventaire((prev: CheckOutInventaireType) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-8">
          <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Arrivée / Départ
          </h1>
        </div>

        {/* House Selector - Shared */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
              Sélection de la maison
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

        {/* Toggle Switch */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950  mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={isCheckIn ? "default" : "outline"}
                onClick={() => setIsCheckIn(true)}
                className={cn(
                  "flex items-center space-x-2",
                  isCheckIn
                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                <LogIn className="h-4 w-4" />
                <span>Check-in</span>
              </Button>
              <Button
                variant={!isCheckIn ? "default" : "outline"}
                onClick={() => setIsCheckIn(false)}
                className={cn(
                  "flex items-center space-x-2",
                  !isCheckIn
                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                <LogOut className="h-4 w-4" />
                <span>Check-out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content based on toggle */}
        {isCheckIn ? (
          // Check-in Content
          <div className="space-y-6">
            {/* Client Info */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Nom *
                    </Label>
                    <Input
                      value={checkInData.nom}
                      onChange={(e) =>
                        setCheckInData((prev) => ({
                          ...prev,
                          nom: e.target.value,
                        }))
                      }
                      className="border-slate-200 dark:border-slate-800"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Téléphone
                    </Label>
                    <Input
                      value={checkInData.telephone}
                      onChange={(e) =>
                        setCheckInData((prev) => ({
                          ...prev,
                          telephone: e.target.value,
                        }))
                      }
                      className="border-slate-200 dark:border-slate-800"
                      placeholder="Numéro de téléphone"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={checkInData.email}
                    onChange={(e) =>
                      setCheckInData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                    placeholder="Adresse email"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Date d'arrivée *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800",
                            !checkInData.dateArrivee &&
                              "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInData.dateArrivee
                            ? format(checkInData.dateArrivee, "PPP", {
                                locale: fr,
                              })
                            : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInData.dateArrivee}
                          onSelect={(date) =>
                            setCheckInData((prev) => ({
                              ...prev,
                              dateArrivee: date,
                            }))
                          }
                          locale={fr}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Date de départ *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-slate-200 dark:border-slate-800",
                            !checkInData.dateDepart &&
                              "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInData.dateDepart
                            ? format(checkInData.dateDepart, "PPP", {
                                locale: fr,
                              })
                            : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkInData.dateDepart}
                          onSelect={(date) =>
                            setCheckInData((prev) => ({
                              ...prev,
                              dateDepart: date,
                            }))
                          }
                          locale={fr}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Avance payé
                    </Label>
                    <Input
                      type="number"
                      value={checkInData.avancePaye}
                      onChange={(e) =>
                        setCheckInData((prev) => ({
                          ...prev,
                          avancePaye: e.target.value,
                        }))
                      }
                      className="border-slate-200 dark:border-slate-800"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Paiement au checkin
                    </Label>
                    <Input
                      type="number"
                      value={checkInData.paiementCheckin}
                      onChange={(e) =>
                        setCheckInData((prev) => ({
                          ...prev,
                          paiementCheckin: e.target.value,
                        }))
                      }
                      className="border-slate-200 dark:border-slate-800"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">
                      Montant total
                    </Label>
                    <Input
                      type="number"
                      value={((Number.parseFloat(checkInData.avancePaye) || 0) + (Number.parseFloat(checkInData.paiementCheckin) || 0)).toString()}
                      readOnly
                      disabled
                      className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                  État de l'équipement
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Inventaire à l'entrée
                </CardDescription>
              </CardHeader>

              {/* Literie & Mobilier Card */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                    Literie & Mobilier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Lits simples
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.litsSimples}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            litsSimples: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Lits doubles
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.litsDoubles}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            litsDoubles: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Matelas supplémentaires
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.matelasSupplementaires}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            matelasSupplementaires:
                              Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Oreillers
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.oreillers}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            oreillers: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Tables
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.tables}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            tables: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Chaises
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.chaises}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            chaises: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Draps propres
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.drapsPropres}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            drapsPropres: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Draps housse
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.drapsHousse}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            drapsHousse: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Couvertures
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.couvertures}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            couvertures: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Électronique & Équipements Card */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                    Électronique & Équipements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="television"
                        checked={inventaire.television}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            television: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="television"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Télévision
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="telecommandeTv"
                        checked={inventaire.telecommandeTv}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            telecommandeTv: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="telecommandeTv"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Télécommande TV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="climatiseur"
                        checked={inventaire.climatiseur}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            climatiseur: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="climatiseur"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Climatiseur
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="telecommandeClimatiseur"
                        checked={inventaire.telecommandeClimatiseur}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            telecommandeClimatiseur: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="telecommandeClimatiseur"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Télécommande Climatiseur
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recepteurTv"
                        checked={inventaire.recepteurTv}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            recepteurTv: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="recepteurTv"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Récepteur TV
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="telecommandeRecepteur"
                        checked={inventaire.telecommandeRecepteur}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            telecommandeRecepteur: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="telecommandeRecepteur"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Télécommande Récepteur
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cuisine Card */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                    Cuisine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Assiettes
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.assiettes}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            assiettes: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Verres
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.verres}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            verres: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Couverts
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.couverts}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            couverts: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Casseroles
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.casseroles}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            casseroles: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        Poêles
                      </Label>
                      <Input
                        type="number"
                        value={inventaire.poeles}
                        onChange={(e) =>
                          setInventaire((prev) => ({
                            ...prev,
                            poeles: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border-slate-200 dark:border-slate-800 w-20"
                        min="0"
                        max="99"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="refrigerateur"
                        checked={inventaire.refrigerateur}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            refrigerateur: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="refrigerateur"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Réfrigérateur
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Autres Card */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                    Autres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rideaux"
                        checked={inventaire.rideaux}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            rideaux: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="rideaux"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Rideaux présents
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lampes"
                        checked={inventaire.lampes}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            lampes: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="lampes"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Lampes fonctionnelles
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="balaiSerpilliere"
                        checked={inventaire.balaiSerpilliere}
                        onCheckedChange={(checked) =>
                          setInventaire((prev) => ({
                            ...prev,
                            balaiSerpilliere: !!checked,
                          }))
                        }
                      />
                      <Label
                        htmlFor="balaiSerpilliere"
                        className="text-slate-700 dark:text-slate-300"
                      >
                        Balai / Serpillière / Seau
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Card>

            {/* Final Action */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Nom ou signature du responsable
                  </Label>
                  <Input
                    value={checkInData.responsable}
                    onChange={(e) =>
                      setCheckInData((prev) => ({
                        ...prev,
                        responsable: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                    placeholder="Nom du responsable"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Remarques
                  </Label>
                  <Textarea
                    value={checkInData.remarques}
                    onChange={(e) =>
                      setCheckInData((prev) => ({
                        ...prev,
                        remarques: e.target.value,
                      }))
                    }
                    className="border-slate-200 dark:border-slate-800"
                    placeholder="Remarques ou observations"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCheckInSubmit}
                  disabled={submitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
                >
                  {submitting ? (
                    <LoadingInline size={16} color="#ffffff" />
                  ) : (
                    "Valider l'état des lieux"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Check-out Content
          <div className="space-y-6">
            {checkOutView === "table" ? (
              // Table View
              <>
                {/* Search Card */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                      Rechercher le client
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Entrez les informations pour retrouver l'enregistrement ou
                      sélectionnez dans le tableau
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Nom du client
                        </Label>
                        <Input
                          value={checkOutSearch.nom}
                          onChange={(e) =>
                            setCheckOutSearch((prev) => ({
                              ...prev,
                              nom: e.target.value,
                            }))
                          }
                          className="border-slate-200 dark:border-slate-800"
                          placeholder="Nom du client"
                        />
                      </div>
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
                                !checkOutSearch.dateArrivee &&
                                  "text-slate-500 dark:text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOutSearch.dateArrivee
                                ? format(checkOutSearch.dateArrivee, "PPP", {
                                    locale: fr,
                                  })
                                : "Sélectionner"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={checkOutSearch.dateArrivee}
                              onSelect={(date) =>
                                setCheckOutSearch((prev) => ({
                                  ...prev,
                                  dateArrivee: date,
                                }))
                              }
                              locale={fr}
                              autoFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckOutSearch}
                      disabled={processing}
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
                    >
                      {processing ? (
                        <LoadingInline size={16} color="#ffffff" />
                      ) : (
                        "Rechercher"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Clients Table */}
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                      Clients présents -{" "}
                      {houses.find((h) => h.id === selectedHouse)?.name ||
                        "Sélectionner une maison"}
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      {
                        checkInRecords.filter(
                          (record) => record.maison === selectedHouse
                        ).length
                      }{" "}
                      client(s) actuellement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-200 dark:border-slate-800">
                            <TableHead className="text-slate-700 dark:text-slate-300">
                              Nom
                            </TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">
                              Date d'entrée
                            </TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">
                              Date de départ
                            </TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-300">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                <Loading message="Chargement des check-ins..." />
                              </TableCell>
                            </TableRow>
                          ) : error ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                <span className="text-red-600 dark:text-red-400">
                                  {error}
                                </span>
                              </TableCell>
                            </TableRow>
                          ) : checkInRecords
                            .filter((record) => record.maison === selectedHouse)
                            .length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8">
                                <span className="text-slate-600 dark:text-slate-400">
                                  Aucun check-in pour cette maison
                                </span>
                              </TableCell>
                            </TableRow>
                          ) : (
                            checkInRecords
                            .filter((record) => record.maison === selectedHouse)
                            .map((record) => {
                              return (
                                <TableRow
                                  key={record.id}
                                  className="border-slate-200 dark:border-slate-800"
                                >
                                  <TableCell className="font-medium text-slate-900 dark:text-slate-50">
                                    {record.nom}
                                  </TableCell>
                                  <TableCell className="text-slate-600 dark:text-slate-400">
                                    {format(
                                      new Date(record.dateArrivee),
                                      "PPP",
                                      { locale: fr }
                                    )}
                                  </TableCell>
                                  <TableCell className="text-slate-600 dark:text-slate-400">
                                    {format(
                                      new Date(record.dateDepart),
                                      "PPP",
                                      { locale: fr }
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setFoundCheckIn(record);
                                        // Initialize checkout inventory with all items as unchecked
                                        const initialCheckOut = {
                                          litsSimples: false,
                                          litsDoubles: false,
                                          matelasSupplementaires: false,
                                          oreillers: false,
                                          tables: false,
                                          chaises: false,
                                          drapsPropres: false,
                                          drapsHousse: false,
                                          couvertures: false,
                                          television: false,
                                          telecommandeTv: false,
                                          climatiseur: false,
                                          telecommandeClimatiseur: false,
                                          recepteurTv: false,
                                          telecommandeRecepteur: false,
                                          assiettes: false,
                                          verres: false,
                                          couverts: false,
                                          casseroles: false,
                                          poeles: false,
                                          refrigerateur: false,
                                          rideaux: false,
                                          lampes: false,
                                          balaiSerpilliere: false,
                                        };
                                        setCheckOutInventaire(initialCheckOut);
                                        setCheckOutView("verification");
                                      }}
                                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                                    >
                                      Check-out
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Verification View
              foundCheckIn && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setCheckOutView("table")}
                      className="border-slate-200 dark:border-slate-800"
                    >
                      ← Retour au tableau
                    </Button>
                  </div>

                  <Card className="border-slate-200 dark:border-slate-800 mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                        Vérification de l'inventaire
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        Client: {foundCheckIn.nom} - Maison:{" "}
                        {houses.find((h) => h.id === foundCheckIn.maison)?.name}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Literie & Mobilier Card */}
                  <Card
                    className={cn(
                      "border-2 transition-colors",
                      Object.entries(checkOutInventaire)
                        .filter(([key]) =>
                          [
                            "litsSimples",
                            "litsDoubles",
                            "matelasSupplementaires",
                            "oreillers",
                            "tables",
                            "chaises",
                            "drapsPropres",
                            "drapsHousse",
                            "couvertures",
                          ].includes(key)
                        )
                        .every(([, value]) => value === true)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          Literie & Mobilier
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => {
                            const literieKeys = [
                              "litsSimples",
                              "litsDoubles",
                              "matelasSupplementaires",
                              "oreillers",
                              "tables",
                              "chaises",
                              "drapsPropres",
                              "drapsHousse",
                              "couvertures",
                            ];
                            const updates = literieKeys.reduce(
                              (acc, key) => ({ ...acc, [key]: true }),
                              {}
                            );
                            setCheckOutInventaire((prev) => ({
                              ...prev,
                              ...updates,
                            }));
                            toast.success(
                              "Literie & Mobilier marqué comme prêt"
                            );
                          }}
                          className="bg-cyan-900 hover:bg-cyan-600 text-white"
                        >
                          Marquer comme prêt
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          {
                            key: "litsSimples",
                            label: "Lits simples",
                            value: foundCheckIn.inventaire.litsSimples,
                          },
                          {
                            key: "litsDoubles",
                            label: "Lits doubles",
                            value: foundCheckIn.inventaire.litsDoubles,
                          },
                          {
                            key: "matelasSupplementaires",
                            label: "Matelas supplémentaires",
                            value:
                              foundCheckIn.inventaire.matelasSupplementaires,
                          },
                          {
                            key: "oreillers",
                            label: "Oreillers",
                            value: foundCheckIn.inventaire.oreillers,
                          },
                          {
                            key: "tables",
                            label: "Tables",
                            value: foundCheckIn.inventaire.tables,
                          },
                          {
                            key: "chaises",
                            label: "Chaises",
                            value: foundCheckIn.inventaire.chaises,
                          },
                          {
                            key: "drapsPropres",
                            label: "Draps propres",
                            value: foundCheckIn.inventaire.drapsPropres,
                          },
                          {
                            key: "drapsHousse",
                            label: "Draps housse",
                            value: foundCheckIn.inventaire.drapsHousse,
                          },
                          {
                            key: "couvertures",
                            label: "Couvertures",
                            value: foundCheckIn.inventaire.couvertures,
                          },
                        ].map(({ key, label, value }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`checkout-${key}`}
                                checked={
                                  checkOutInventaire[
                                    key as keyof CheckOutInventaireType
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  handleCheckOutInventaireChange(
                                    key as keyof CheckOutInventaireType,
                                    !!checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`checkout-${key}`}
                                className="text-slate-700 dark:text-slate-300"
                              >
                                {label}
                              </Label>
                            </div>

                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              ({value})
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Électronique & Équipements Card */}
                  <Card
                    className={cn(
                      "border-2 transition-colors",
                      Object.entries(checkOutInventaire)
                        .filter(([key]) =>
                          [
                            "television",
                            "telecommandeTv",
                            "climatiseur",
                            "telecommandeClimatiseur",
                            "recepteurTv",
                            "telecommandeRecepteur",
                          ].includes(key)
                        )
                        .every(([, value]) => value === true)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          Électronique & Équipements
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => {
                            const electroKeys = [
                              "television",
                              "telecommandeTv",
                              "climatiseur",
                              "telecommandeClimatiseur",
                              "recepteurTv",
                              "telecommandeRecepteur",
                            ];
                            const updates = electroKeys.reduce(
                              (acc, key) => ({ ...acc, [key]: true }),
                              {}
                            );
                            setCheckOutInventaire((prev) => ({
                              ...prev,
                              ...updates,
                            }));
                            toast.success(
                              "Électronique & Équipements marqué comme prêt"
                            );
                          }}
                          className="bg-cyan-900 hover:bg-cyan-600 text-white"
                        >
                          Marquer comme prêt
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          {
                            key: "television",
                            label: "Télévision",
                            value: foundCheckIn.inventaire.television,
                          },
                          {
                            key: "telecommandeTv",
                            label: "Télécommande TV",
                            value: foundCheckIn.inventaire.telecommandeTv,
                          },
                          {
                            key: "climatiseur",
                            label: "Climatiseur",
                            value: foundCheckIn.inventaire.climatiseur,
                          },
                          {
                            key: "telecommandeClimatiseur",
                            label: "Télécommande Climatiseur",
                            value:
                              foundCheckIn.inventaire.telecommandeClimatiseur,
                          },
                          {
                            key: "recepteurTv",
                            label: "Récepteur TV",
                            value: foundCheckIn.inventaire.recepteurTv,
                          },
                          {
                            key: "telecommandeRecepteur",
                            label: "Télécommande Récepteur",
                            value:
                              foundCheckIn.inventaire.telecommandeRecepteur,
                          },
                        ].map(({ key, label, value }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`checkout-${key}`}
                                checked={
                                  checkOutInventaire[
                                    key as keyof CheckOutInventaireType
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  handleCheckOutInventaireChange(
                                    key as keyof CheckOutInventaireType,
                                    !!checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`checkout-${key}`}
                                className="text-slate-700 dark:text-slate-300"
                              >
                                {label}
                              </Label>
                            </div>

                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {typeof value === "boolean"
                                ? value
                                  ? "✓"
                                  : "x"
                                : `(${value})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cuisine Card */}
                  <Card
                    className={cn(
                      "border-2 transition-colors",
                      Object.entries(checkOutInventaire)
                        .filter(([key]) =>
                          [
                            "assiettes",
                            "verres",
                            "couverts",
                            "casseroles",
                            "poeles",
                            "refrigerateur",
                          ].includes(key)
                        )
                        .every(([, value]) => value === true)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          Cuisine
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => {
                            const cuisineKeys = [
                              "assiettes",
                              "verres",
                              "couverts",
                              "casseroles",
                              "poeles",
                              "refrigerateur",
                            ];
                            const updates = cuisineKeys.reduce(
                              (acc, key) => ({ ...acc, [key]: true }),
                              {}
                            );
                            setCheckOutInventaire((prev) => ({
                              ...prev,
                              ...updates,
                            }));
                            toast.success("Cuisine marquée comme prête");
                          }}
                          className="bg-cyan-900 hover:bg-cyan-600 text-white"
                        >
                          Marquer comme prêt
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          {
                            key: "assiettes",
                            label: "Assiettes",
                            value: foundCheckIn.inventaire.assiettes,
                          },
                          {
                            key: "verres",
                            label: "Verres",
                            value: foundCheckIn.inventaire.verres,
                          },
                          {
                            key: "couverts",
                            label: "Couverts",
                            value: foundCheckIn.inventaire.couverts,
                          },
                          {
                            key: "casseroles",
                            label: "Casseroles",
                            value: foundCheckIn.inventaire.casseroles,
                          },
                          {
                            key: "poeles",
                            label: "Poêles",
                            value: foundCheckIn.inventaire.poeles,
                          },
                          {
                            key: "refrigerateur",
                            label: "Réfrigérateur",
                            value: foundCheckIn.inventaire.refrigerateur,
                          },
                        ].map(({ key, label, value }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`checkout-${key}`}
                                checked={
                                  checkOutInventaire[
                                    key as keyof CheckOutInventaireType
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  handleCheckOutInventaireChange(
                                    key as keyof CheckOutInventaireType,
                                    !!checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`checkout-${key}`}
                                className="text-slate-700 dark:text-slate-300"
                              >
                                {label}
                              </Label>
                            </div>

                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {typeof value === "boolean"
                                ? value
                                  ? "✓"
                                  : "x"
                                : `(${value})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Autres Card */}
                  <Card
                    className={cn(
                      "border-2 transition-colors",
                      Object.entries(checkOutInventaire)
                        .filter(([key]) =>
                          ["rideaux", "lampes", "balaiSerpilliere"].includes(
                            key
                          )
                        )
                        .every(([, value]) => value === true)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
                          Autres
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => {
                            const autresKeys = [
                              "rideaux",
                              "lampes",
                              "balaiSerpilliere",
                            ];
                            const updates = autresKeys.reduce(
                              (acc, key) => ({ ...acc, [key]: true }),
                              {}
                            );
                            setCheckOutInventaire((prev) => ({
                              ...prev,
                              ...updates,
                            }));
                            toast.success(
                              "Autres éléments marqués comme prêts"
                            );
                          }}
                          className="bg-cyan-900 hover:bg-cyan-600 text-white"
                        >
                          Marquer comme prêt
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          {
                            key: "rideaux",
                            label: "Rideaux présents",
                            value: foundCheckIn.inventaire.rideaux,
                          },
                          {
                            key: "lampes",
                            label: "Lampes fonctionnelles",
                            value: foundCheckIn.inventaire.lampes,
                          },
                          {
                            key: "balaiSerpilliere",
                            label: "Balai / Serpillière / Seau",
                            value: foundCheckIn.inventaire.balaiSerpilliere,
                          },
                        ].map(({ key, label, value }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`checkout-${key}`}
                                checked={
                                  checkOutInventaire[
                                    key as keyof CheckOutInventaireType
                                  ] || false
                                }
                                onCheckedChange={(checked) =>
                                  handleCheckOutInventaireChange(
                                    key as keyof CheckOutInventaireType,
                                    !!checked
                                  )
                                }
                              />
                              <Label
                                htmlFor={`checkout-${key}`}
                                className="text-slate-700 dark:text-slate-300"
                              >
                                {label}
                              </Label>
                            </div>

                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {typeof value === "boolean"
                                ? value
                                  ? "✓"
                                  : "x"
                                : `(${value})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          Commentaire final
                        </Label>
                        <Textarea
                          value={commentaireFinal}
                          onChange={(e) => setCommentaireFinal(e.target.value)}
                          className="border-slate-200 dark:border-slate-800"
                          placeholder="Observations lors du départ"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleCheckOutSubmit}
                        disabled={processing}
                        className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-50"
                      >
                        {processing ? (
                          <LoadingInline size={16} color="#ffffff" />
                        ) : (
                          "Valider le départ"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )
            )}
          </div>
        )}

        {/* Processing Overlay */}
        {processing && <LoadingOverlay message="Traitement en cours..." />}

        <Toaster />
      </div>
    </div>
  );
}

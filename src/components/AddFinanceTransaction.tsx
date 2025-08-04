// src/components/AddFinanceTransaction.tsx

import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  formData: {
    type: "entree" | "sortie";
    maison: string;
    date: Date;
    motif: string;
    montant: string;
    pieceJointe: File | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<Props["formData"]>>;
  handleSubmit: (e: React.FormEvent) => void;
  editingOperation: string | null;
  closeDialog: () => void;
  houses: { id: string; name: string }[];
}

const AddFinanceTransaction: React.FC<Props> = ({
  formData,
  setFormData,
  handleSubmit,
  editingOperation,
  closeDialog,
  houses,
}) => {
  
  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {editingOperation
            ? "Modifier l'opération"
            : "Ajouter une opération financière"}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {editingOperation
            ? "Modifiez les détails de l'opération"
            : "Ajoutez une nouvelle opération financière manuelle"}
        </p>
      </div>

      {/* Form */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        noValidate
        autoComplete="off"
        // Additional form attributes to prevent issues in Vite environment
        method="POST"
        action="#"
        onReset={(e) => {
          e.preventDefault();
          console.log('🟡 Form reset prevented');
        }}
      >
        {/* Row: Type + Maison */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Type *</Label>
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
                {houses
                  .filter((h) => h.id !== "all")
                  .map((house) => (
                    <SelectItem key={house.id} value={house.id}>
                      {house.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row: Date + Montant */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
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

        {/* Motif */}
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Motif *</Label>
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

        {/* Pièce jointe */}
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

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
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
        </div>
      </form>
    </div>
  );
};

export default React.memo(AddFinanceTransaction);

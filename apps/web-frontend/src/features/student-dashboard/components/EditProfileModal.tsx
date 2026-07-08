import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button, cn } from "@chambitas/ui";
import { DAYS, TIME_SLOTS } from "../types";

export interface EditProfileFormData {
  bio: string;
  gpa: string;
  academicCycle: string;
  phoneNumber?: string;
  availability: any;
}

interface EditProfileModalProps {
  initialData: EditProfileFormData;
  isOpen: boolean;
  updating: boolean;
  onClose: () => void;
  onSubmit: (data: EditProfileFormData) => void;
}

export function EditProfileModal({
  initialData,
  isOpen,
  updating,
  onClose,
  onSubmit,
}: EditProfileModalProps) {
  const [form, setForm] = useState<EditProfileFormData>(initialData);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const toggleAvailability = (dayId: string, index: number) => {
    setForm((prev) => {
      const currentBits = (prev.availability as any)[dayId].split("");
      currentBits[index] = currentBits[index] === "1" ? "0" : "1";
      return {
        ...prev,
        availability: { ...prev.availability, [dayId]: currentBits.join("") },
      };
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-none md:rounded-lg shadow-xl overflow-hidden h-full md:h-auto max-h-screen md:max-h-[90vh] flex flex-col border border-slate-200">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            Ajustes de Perfil
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 md:p-8 overflow-y-auto space-y-8 custom-scrollbar flex-1">
          <form onSubmit={handleUpdate} className="space-y-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Ciclo Académico</label>
                <input
                  type="number"
                  value={form.academicCycle}
                  onChange={(e) => setForm({ ...form, academicCycle: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border bg-white font-medium text-slate-800 text-sm outline-none transition-colors",
                    form.academicCycle && (!Number.isInteger(Number(form.academicCycle)) || Number(form.academicCycle) < 1 || Number(form.academicCycle) > 10)
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  )}
                />
                {form.academicCycle && (!Number.isInteger(Number(form.academicCycle)) || Number(form.academicCycle) < 1 || Number(form.academicCycle) > 10) && (
                  <p className="text-[10px] text-red-500 font-medium">Debe ser un número entero entre 1 y 10.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Promedio Ponderado</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.gpa}
                  onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border bg-white font-medium text-slate-800 text-sm outline-none transition-colors",
                    form.gpa && (!/^\d+(\.\d{1,2})?$/.test(String(form.gpa)) || Number(form.gpa) < 0 || Number(form.gpa) > 20)
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  )}
                />
                {form.gpa && (!/^\d+(\.\d{1,2})?$/.test(String(form.gpa)) || Number(form.gpa) < 0 || Number(form.gpa) > 20) && (
                  <p className="text-[10px] text-red-500 font-medium">Debe ser un número entre 0 y 20, con máximo 2 decimales.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Celular</label>
                <input
                  type="tel"
                  placeholder="Ej. 987654321"
                  value={form.phoneNumber || ""}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border bg-white font-medium text-slate-800 text-sm outline-none transition-colors",
                    form.phoneNumber && (form.phoneNumber.length !== 9 || !form.phoneNumber.startsWith('9'))
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  )}
                />
                {form.phoneNumber && (form.phoneNumber.length !== 9 || !form.phoneNumber.startsWith('9')) && (
                  <p className="text-[10px] text-red-500 font-medium">Debe tener 9 dígitos y empezar con 9.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Sobre Mí (Bio)</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white font-medium text-slate-800 h-24 resize-none text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600">Editar Disponibilidad</label>
              <div className="bg-white p-4 rounded-lg overflow-x-auto border border-slate-200">
                <div className="grid grid-cols-8 gap-2 min-w-125">
                  <div />
                  {DAYS.map((day) => (
                    <div key={day.id} className="text-[10px] font-bold text-center text-slate-900">
                      {day.label}
                    </div>
                  ))}
                  <div className="col-span-8 h-62.5 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                    {TIME_SLOTS.map((time, idx) => (
                      <div key={time} className="grid grid-cols-8 gap-2 items-center">
                        <div className="text-[9px] font-semibold text-slate-400 text-right">
                          {time}
                        </div>
                        {DAYS.map((day) => {
                          const isSelected = (form.availability as any)[day.id][idx] === "1";
                          return (
                            <div
                              key={`${day.id}-${idx}`}
                              onClick={() => toggleAvailability(day.id, idx)}
                              className={cn(
                                "h-6 rounded border cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-emerald-600 border-emerald-600 shadow-sm"
                                  : "bg-slate-50 border-slate-200 hover:border-emerald-300"
                              )}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                updating ||
                (!!form.phoneNumber && (form.phoneNumber.length !== 9 || !form.phoneNumber.startsWith('9'))) ||
                (!!form.academicCycle && (!Number.isInteger(Number(form.academicCycle)) || Number(form.academicCycle) < 1 || Number(form.academicCycle) > 10)) ||
                (!!form.gpa && (!/^\d+(\.\d{1,2})?$/.test(String(form.gpa)) || Number(form.gpa) < 0 || Number(form.gpa) > 20))
              }
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-md text-sm transition-colors mt-4"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Guardar Cambios"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

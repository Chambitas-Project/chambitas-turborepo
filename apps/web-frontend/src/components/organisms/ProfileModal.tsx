import { useState, useEffect, useRef } from "react";
import { Button, Input } from "@chambitas/ui";
import { X, Save, Upload, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/api-client";
import { toast } from "react-hot-toast";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, refreshUser, deleteAccount } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    description: "",
    avatarUrl: "",
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiClient.get('/profile/me').then(res => {
        const u = res.data;
        setFormData({
          fullName: u.fullName || u.name || u.full_name || "",
          companyName: u.companyName || u.company_name || "",
          description: u.description || u.bio || "",
          avatarUrl: u.avatarUrl || u.avatar_url || "",
        });
      }).catch(err => {
        console.error("Error fetching profile for modal", err);
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: any = {};
      if (user?.role === "student") {
        payload.full_name = formData.fullName;
        payload.bio = formData.description;
      } else {
        payload.name = formData.fullName;
        payload.company_name = formData.companyName;
        payload.description = formData.description;
      }
      if (formData.avatarUrl) {
        payload.avatar_url = formData.avatarUrl;
      }

      if (user?.role === "employer" && !user.isOnboarded) {
        await apiClient.post('/profile/onboarding/employer', payload);
      } else {
        await apiClient.patch('/profile/me', payload);
      }

      await refreshUser();
      onClose();
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      toast.error("Ocurrió un error al intentar eliminar la cuenta.");
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-md w-full max-w-lg shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Modificar Perfil</h2>
          <button onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center rounded-md hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

            <div className="flex justify-center mb-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative shrink-0 h-24 w-24 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer group hover:border-emerald-400 transition-all"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                ) : formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-emerald-600">
                    {formData.fullName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                )}

                {!isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      toast.error("Por favor selecciona una imagen válida.");
                      return;
                    }
                    try {
                      setIsUploadingAvatar(true);
                      const data = new FormData();
                      data.append("file", file);
                      data.append("folder", "profiles");
                      const response = await apiClient.post("/media/upload", data, {
                        headers: { "Content-Type": "multipart/form-data" }
                      });
                      const url = response.data.url || response.data;
                      if (url) {
                        setFormData(prev => ({ ...prev, avatarUrl: url }));
                      }
                    } catch (err) {
                      console.error("Error uploading avatar", err);
                      toast.error("Hubo un error al subir la imagen. Inténtalo de nuevo.");
                    } finally {
                      setIsUploadingAvatar(false);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Nombre Personal</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-slate-50 border border-slate-100 rounded-md h-12 w-full text-slate-900 font-bold focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-none"
                placeholder="Tu nombre completo"
              />
            </div>

            {user?.role === "employer" && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Nombre de la Empresa</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="bg-slate-50 border border-slate-100 rounded-md h-12 w-full text-slate-900 font-bold focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-none"
                  placeholder="Ej. TechCorp SAC"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">{user?.role === "employer" ? "Descripción de la Empresa" : "Sobre ti"}</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-50 border border-slate-100 rounded-md p-4 w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-bold focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none shadow-none"
                placeholder="Cuéntanos un poco más..."
              />
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 px-6">
            <h4 className="text-sm font-bold text-red-600 mb-2">Zona de Peligro</h4>
            <p className="text-xs text-slate-500 mb-4">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.
            </p>
            {!showConfirmDelete ? (
              <Button
                onClick={() => setShowConfirmDelete(true)}
                disabled={isLoading}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold py-2.5 rounded-md text-sm transition-colors shadow-none"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" /> Eliminar mi cuenta permanentemente
                </span>
              </Button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex flex-col items-center">
                <p className="text-sm font-bold text-red-700 mb-3 text-center">¿Estás completamente seguro? Esta acción es irreversible.</p>
                <div className="flex w-full gap-2">
                  <Button
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={isDeleting}
                    variant="outline"
                    className="flex-1 text-slate-600 border-slate-300 hover:bg-slate-100 font-bold text-sm shadow-none"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-none"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sí, eliminar cuenta"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 flex justify-end gap-3 bg-white">
          <Button variant="outline" type="button" onClick={onClose} className="h-11 px-6 rounded-md font-bold text-slate-600 bg-white border-slate-200 hover:bg-slate-50 cursor-pointer shadow-none">
            Cancelar
          </Button>
          <Button type="submit" form="profile-form" disabled={isLoading} className="h-11 px-6 rounded-md font-black bg-[#065f46] hover:bg-[#064e3b] text-white cursor-pointer shadow-none">
            {isLoading ? "Guardando..." : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

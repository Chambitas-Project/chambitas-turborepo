import { useState, useEffect } from "react";
import { Button, Input } from "@chambitas/ui";
import { X, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/api-client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      apiClient.get('/profile/me').then(res => {
        const u = res.data;
        setFormData({
          fullName: u.fullName || u.name || u.full_name || "",
          companyName: u.companyName || u.company_name || "",
          description: u.description || u.bio || "",
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
      
      await apiClient.patch('/profile/me', payload);
      await refreshUser();
      onClose();
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">Modificar Perfil</h2>
          <button onClick={onClose} className="h-8 w-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Nombre Personal</label>
              <Input 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="bg-slate-50 border-none rounded-xl h-12 w-full text-slate-900 font-bold"
                placeholder="Tu nombre completo"
              />
            </div>
            
            {user?.role === "employer" && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Nombre de la Empresa</label>
                <Input 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="bg-slate-50 border-none rounded-xl h-12 w-full text-slate-900 font-bold"
                  placeholder="Ej. TechCorp SAC"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">{user?.role === "employer" ? "Descripción de la Empresa" : "Sobre ti"}</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-slate-50 border-none rounded-xl p-4 w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                placeholder="Cuéntanos un poco más..."
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <Button variant="outline" type="button" onClick={onClose} className="h-12 px-6 rounded-xl font-bold text-slate-600 bg-white border-slate-200 cursor-pointer">
            Cancelar
          </Button>
          <Button type="submit" form="profile-form" disabled={isLoading} className="h-12 px-6 rounded-xl font-black bg-[#065f46] hover:bg-[#064e3b] text-white cursor-pointer shadow-lg shadow-emerald-900/20">
            {isLoading ? "Guardando..." : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

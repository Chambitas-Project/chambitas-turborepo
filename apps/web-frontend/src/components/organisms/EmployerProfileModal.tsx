import { X } from "lucide-react";
import { ReviewsList } from "./ReviewsList";

interface EmployerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employerId: string;
  companyName: string;
  employerName: string;
  employerProfile: any;
}

export function EmployerProfileModal({
  isOpen,
  onClose,
  employerId,
  companyName,
  employerName,
  employerProfile,
}: EmployerProfileModalProps) {
  if (!isOpen || !employerId) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Perfil del Empleador</h2>
          <button onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center rounded-md hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${companyName}&backgroundColor=0f172a`} alt="Avatar" className="rounded-lg" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">{employerProfile?.full_name || employerName}</h3>
              <p className="text-sm font-bold text-slate-500">{employerProfile?.company_name || companyName}</p>
            </div>
          </div>

          {(employerProfile?.bio || employerProfile?.description) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acerca de la Empresa</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {employerProfile.bio || employerProfile.description}
              </p>
            </div>
          )}

          <div>
            <ReviewsList userId={employerId} role="employer" />
          </div>
        </div>
      </div>
    </div>
  );
}

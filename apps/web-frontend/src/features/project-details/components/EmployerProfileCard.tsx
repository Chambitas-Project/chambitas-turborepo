import { CheckCircle2, Star } from "lucide-react";

interface EmployerProfileCardProps {
  companyName: string;
  employerName: string;
  employerProfile: any;
  employerProjectsCount: number;
  employerReviews: any[];
  onViewProfile?: () => void;
}

export function EmployerProfileCard({
  companyName,
  employerName,
  employerProfile,
  employerProjectsCount,
  employerReviews,
  onViewProfile,
}: EmployerProfileCardProps) {
  return (
    <div className="space-y-8">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Acerca del Empleador</h3>
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-sm">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${companyName}&backgroundColor=0f172a`} alt="Avatar" className="rounded-lg" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900">{employerProfile?.full_name || employerName}</h4>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{employerProfile?.company_name || companyName}</span>
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
            </div>
          </div>
        </div>

        {(employerProfile?.bio || employerProfile?.description) && (
          <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
            {employerProfile.bio || employerProfile.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="text-center p-2 rounded-md bg-slate-50 flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Proyectos</p>
            <p className="text-lg font-black text-slate-900">{employerProjectsCount}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-slate-50 flex flex-col justify-center items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reseñas</p>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400 mb-0.5" />
              <p className="text-lg font-black text-slate-900 leading-none">
                {employerReviews.length > 0
                  ? (employerReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / employerReviews.length).toFixed(1)
                  : 'N/A'}
              </p>
              <span className="text-[10px] text-slate-500 font-medium ml-0.5 leading-none">({employerReviews.length})</span>
            </div>
          </div>
        </div>

        {onViewProfile && (
          <button 
            onClick={onViewProfile}
            className="w-full mt-2 py-2 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            Ver Perfil Completo
          </button>
        )}
      </div>
    </div>
  );
}

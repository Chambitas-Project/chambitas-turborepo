import { Card, CardContent, Badge } from "@chambitas/ui";
import { GraduationCap, Calendar, Star } from "lucide-react";

interface StudentProfileHeaderProps {
  profile: any;
}

export function StudentProfileHeader({ profile }: StudentProfileHeaderProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
      <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="relative group">
          <div className="h-32 w-32 rounded-3xl bg-slate-900 overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName}`} 
              alt="Avatar" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight">{profile?.fullName}</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] py-1 px-3">
              ESTUDIANTE ACTIVO
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-slate-500 font-bold">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              {profile?.universityName || "Universidad Peruana de Ciencias Aplicadas"}
            </p>
            <p className="text-slate-400 font-medium">Estudiante de <span className="text-slate-700 font-bold">{profile?.career}</span></p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-600">{profile?.academicCycle}° Ciclo</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <Star className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <span className="text-sm font-bold text-slate-600">{profile?.gpa || "4.0"} GPA</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle, cn } from "@chambitas/ui";
import { Bell } from "lucide-react";
import type { ActivityItemData } from "../../api/employer.api";

export function RecentActivityCard({ activities }: { activities: ActivityItemData[] }) {
  return (
    <Card className="bg-white border-none shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-black">Actividad Reciente</CardTitle>
        <Bell className="h-5 w-5 text-slate-300" />
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-6">
        {activities.map(activity => (
          <ActivityItem 
            key={activity.id}
            id={activity.id}
            user={activity.user} 
            action={activity.action} 
            target={activity.target} 
            time={activity.time} 
            color={activity.color} 
          />
        ))}
        <button className="w-full pt-4 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
          Ver Toda la Actividad
        </button>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ user, action, target, time, color }: ActivityItemData) {
  return (
    <div className="flex gap-4 group">
      <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", 
        color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-slate-300'
      )} />
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-600 leading-tight">
          <span className="font-black text-slate-900">{user} </span>
          {action} {target && <span className="font-black text-slate-900">{target}</span>}
        </p>
        <p className="text-[10px] font-bold text-slate-300">{time}</p>
      </div>
    </div>
  );
}

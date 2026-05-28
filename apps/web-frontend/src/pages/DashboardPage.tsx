import { useAuth } from "../context/AuthContext";
import { StudentDashboard } from "./StudentDashboard";
import { EmployerDashboard } from "./EmployerDashboard";

export function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "employer") {
    return <EmployerDashboard />;
  }

  return <StudentDashboard />;
}

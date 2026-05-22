import { createBrowserRouter, Navigate } from "react-router-dom";
import { EmployerProjectsPage } from "./pages/EmployerProjectsPage";
import { EmployerProjectDetailsPage } from "./pages/EmployerProjectDetailsPage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { StudentApplicationsPage } from "./pages/StudentApplicationsPage";
// Forced refresh to fix HMR sync issues
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobSearchPage } from "./pages/JobSearchPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Componente para proteger rutas privadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
      <p className="text-slate-400 font-bold animate-pulse tracking-tight">Cargando...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
  // Si no ha hecho onboarding, forzarlo a ir allá (a menos que ya esté en onboarding)
  if (!user.isOnboarded && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Componente para evitar que usuarios logueados vean login/register
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.isOnboarded ? "/dashboard" : "/onboarding"} replace />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoute><LandingPage /></PublicRoute>,
  },
  {
    path: "/login",
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: "/register",
    element: <PublicRoute><RegisterPage /></PublicRoute>,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs",
    element: (
      <ProtectedRoute>
        <JobSearchPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/applications",
    element: (
      <ProtectedRoute>
        <StudentApplicationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects/:id",
    element: (
      <ProtectedRoute>
        <ProjectDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects",
    element: (
      <ProtectedRoute>
        <EmployerProjectsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects/new",
    element: (
      <ProtectedRoute>
        <CreateProjectPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects/:id",
    element: (
      <ProtectedRoute>
        <EmployerProjectDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

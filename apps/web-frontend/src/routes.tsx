import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";
import { GlobalErrorBoundary } from "./components/organisms/GlobalErrorBoundary";

// Lazy loaded pages
const EmployerProjectsPage = React.lazy(() => import("./pages/EmployerProjectsPage").then(m => ({ default: m.EmployerProjectsPage })));
const EmployerProjectDetailsPage = React.lazy(() => import("./pages/EmployerProjectDetailsPage").then(m => ({ default: m.EmployerProjectDetailsPage })));
const CreateProjectPage = React.lazy(() => import("./pages/CreateProjectPage").then(m => ({ default: m.CreateProjectPage })));
const EditProjectPage = React.lazy(() => import("./pages/EditProjectPage").then(m => ({ default: m.EditProjectPage })));
const StudentApplicationsPage = React.lazy(() => import("./pages/StudentApplicationsPage").then(m => ({ default: m.StudentApplicationsPage })));
const LandingPage = React.lazy(() => import("./pages/LandingPage").then(m => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import("./pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const TermsPage = React.lazy(() => import("./pages/TermsPage").then(m => ({ default: m.TermsPage })));
const OnboardingPage = React.lazy(() => import("./pages/OnboardingPage").then(m => ({ default: m.OnboardingPage })));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const JobSearchPage = React.lazy(() => import("./pages/JobSearchPage").then(m => ({ default: m.JobSearchPage })));
const ProjectDetailsPage = React.lazy(() => import("./pages/ProjectDetailsPage").then(m => ({ default: m.ProjectDetailsPage })));

import { useLocation } from "react-router-dom";

// Componente para proteger rutas privadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
      <p className="text-slate-400 font-bold animate-pulse tracking-tight">Cargando...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
  // Si no ha hecho onboarding, forzarlo a ir allá (a menos que ya esté en onboarding)
  if (!user.isOnboarded && location.pathname !== "/onboarding") {
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

// Fallback UI for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
    <p className="text-slate-400 font-bold animate-pulse tracking-tight">Cargando página...</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <GlobalErrorBoundary />,
    element: <Suspense fallback={<PageLoader />}><PublicRoute><LandingPage /></PublicRoute></Suspense>,
  },
  {
    path: "/terms",
    errorElement: <GlobalErrorBoundary />,
    element: <Suspense fallback={<PageLoader />}><TermsPage /></Suspense>,
  },
  {
    path: "/login",
    errorElement: <GlobalErrorBoundary />,
    element: <Suspense fallback={<PageLoader />}><PublicRoute><LoginPage /></PublicRoute></Suspense>,
  },
  {
    path: "/register",
    errorElement: <GlobalErrorBoundary />,
    element: <Suspense fallback={<PageLoader />}><PublicRoute><RegisterPage /></PublicRoute></Suspense>,
  },
  {
    path: "/forgot-password",
    errorElement: <GlobalErrorBoundary />,
    element: <Suspense fallback={<PageLoader />}><PublicRoute><ForgotPasswordPage /></PublicRoute></Suspense>,
  },
  {
    path: "/onboarding",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <OnboardingPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <DashboardPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <JobSearchPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/student/applications",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <StudentApplicationsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/projects/:id",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <ProjectDetailsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EmployerProjectsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects/new",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <CreateProjectPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects/:id/edit",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EditProjectPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/employer/projects/:id",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <EmployerProjectDetailsPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    errorElement: <GlobalErrorBoundary />,
    element: <Navigate to="/" replace />,
  },
]);

import { Link, Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { DashboardPage } from "@/pages/DashboardPage";
import { NewProjectPage } from "@/pages/NewProjectPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { cn } from "@/lib/utils";

function AppLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-2 px-0 font-heading text-sm font-semibold tracking-[0.12em] text-foreground uppercase",
            )}
          >
            Horizon
          </Link>
          <nav className="flex items-center gap-0.5" aria-label="Primary">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size: "sm" }))
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/projects/new"
              end
              className={({ isActive }) =>
                cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size: "sm" }))
              }
            >
              New Project
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="pb-16">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

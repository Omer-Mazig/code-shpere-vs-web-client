import { Outlet } from "react-router-dom";
import { AppHeader } from "./app-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export const AppLayout = () => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col bg-muted/40">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
};

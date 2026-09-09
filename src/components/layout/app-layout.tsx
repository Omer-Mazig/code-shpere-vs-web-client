import { Outlet } from "react-router-dom";
import { AppHeader } from "./app-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatSocketProvider } from "@/features/chat/chat-socket.context";
import { ChatDockProvider } from "@/features/chat/chat-dock.context";
import { ChatDock } from "@/features/chat/components/chat-dock";

export const AppLayout = () => {
  return (
    <TooltipProvider>
      <ChatDockProvider>
        <ChatSocketProvider>
          <div className="flex min-h-screen flex-col bg-muted/40">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-2 focus:ring-ring"
              onClick={(event) => {
                event.preventDefault();
                const main = document.getElementById("main");
                if (!main) return;
                main.focus();
                main.scrollIntoView();
              }}
            >
              Skip to content
            </a>
            <AppHeader />
            <main
              id="main"
              tabIndex={-1}
              className="flex-1 outline-none"
            >
              <Outlet />
            </main>
            <ChatDock />
          </div>
        </ChatSocketProvider>
      </ChatDockProvider>
    </TooltipProvider>
  );
};

import TopBar from "@/components/TopBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import WorkspaceSidebar from "@/components/WorkspaceSidebar";
import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/workspaces/$workspaceId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SidebarProvider className="flex flex-col">
        <TopBar />
        <div className="flex flex-1">
          <WorkspaceSidebar />
          <main className="w-full p-4">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}

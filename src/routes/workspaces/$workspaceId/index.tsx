import { useWorkspaceStore } from "@/store";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/workspaces/$workspaceId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { workspaceId } = Route.useParams();
  const { selectedWorkspace, workspaces, setSelectedWorkspace } =
    useWorkspaceStore((state) => state);

  if (selectedWorkspace === null) {
    navigate({ to: "/workspaces" });
    return null;
  }

  useEffect(() => {
    setSelectedWorkspace(
      workspaces.find((workspace) => workspace.id === workspaceId) ?? null
    );
    navigate({
      to: "/workspaces/$workspaceId/chats",
      params: { workspaceId },
    });
  }, [workspaceId, workspaces, setSelectedWorkspace]);

  return <></>;
}

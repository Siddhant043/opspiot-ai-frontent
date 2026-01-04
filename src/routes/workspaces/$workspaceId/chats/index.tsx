import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspaces/$workspaceId/chats/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/workspaces/$workspaceId/chats/"!</div>;
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspaces/$workspaceId/actions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workspaces/$workspaceId/actions"!</div>
}

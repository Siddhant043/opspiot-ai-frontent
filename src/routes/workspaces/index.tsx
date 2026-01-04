import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { Workspace } from "@/types/workspace";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EyeIcon, PlusIcon } from "lucide-react";
import { useEffect } from "react";

const workspaces = [
  {
    id: "1",
    name: "Tech",
    description:
      "This workspace is related to the tech and product development.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Marketing",
    description: "This workspace is related to the marketing.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Sales",
    description: "This workspace is related to the sales.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Design",
    description: "This workspace is related to the design.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "HR",
    description: "This workspace is related to the HR.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Finance",
    description: "This workspace is related to the finance.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    name: "Legal",
    description: "This workspace is related to the legal.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    name: "Customer Support",
    description: "This workspace is related to the customer support.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as Workspace[];

export const Route = createFileRoute("/workspaces/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { setWorkspaces, setSelectedWorkspace } = useWorkspaceStore();

  useEffect(() => {
    setWorkspaces(workspaces);
  }, [setWorkspaces]);

  const onWorkspaceClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    navigate({
      to: "/workspaces/$workspaceId",
      params: { workspaceId: workspace.id.toString() },
    });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <Button size="lg">
          <PlusIcon className="w-4 h-4" />
          Create Workspace
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription>{workspace.description}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-end">
              <Button size="sm" onClick={() => onWorkspaceClick(workspace)}>
                <EyeIcon className="w-4 h-4" />
                View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

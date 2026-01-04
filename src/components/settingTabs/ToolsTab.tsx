import { Button } from "@/components/ui/button";
import {
  EllipsisIcon,
  PlusIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AddEditToolDialog } from "./AddEditToolDialog";
import { ToolOverviewDialog } from "./ToolOverviewDialog";

interface ToolData {
  name: string;
  type: string;
  description: string;
  endpointUrl?: string;
  httpMethod?: string;
  authType?: string;
  inputSchema?: string;
  requiresApproval: boolean;
  enabled: boolean;
}

// Helper function to convert tool from table format to ToolData format
function convertToToolData(tool: {
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}): ToolData {
  return {
    name: tool.name.trim(),
    type: tool.type.trim(),
    description: tool.description,
    requiresApproval: false,
    enabled: tool.status === "Active",
    // Add mock data for HTTP API tools
    ...(tool.type.trim() === "HTTP API" && {
      endpointUrl: "https://api.example.com/endpoint",
      httpMethod: "POST",
      authType: "API Key",
      inputSchema: '{"key": "value"}',
    }),
  };
}

const tools = [
  {
    name: "Knowledge",
    description: "Description 1",
    type: "System",
    status: "Active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    name: "Send Email ",
    description: "Send email to a recipient",
    type: " HTTP API ",
    status: "Active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    name: "Send SMS",
    description: "Send SMS to a recipient",
    type: " HTTP API ",
    status: "Inactive",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    name: "DB Query",
    description: "Query a database",
    type: "Database",
    status: "Active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    name: "Create Jira Issue",
    description: "Create a new Jira issue",
    type: " Jira API ",
    status: "Active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
];

const ToolsTab = () => {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOverviewDialogOpen, setIsOverviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolData | null>(null);
  const [viewingTool, setViewingTool] = useState<ToolData | null>(null);
  const [deletingTool, setDeletingTool] = useState<ToolData | null>(null);

  const handleAddTool = () => {
    setEditingTool(null);
    setIsDialogOpen(true);
  };

  const handleSaveTool = (toolData: ToolData) => {
    console.log("Saving tool:", toolData);
    // TODO: Implement actual save logic
    setIsDialogOpen(false);
    setEditingTool(null);
  };

  const handleToolNameClick = (tool: (typeof tools)[0]) => {
    const toolData = convertToToolData(tool);
    setViewingTool(toolData);
    setIsOverviewDialogOpen(true);
  };

  const handleEditTool = (tool: (typeof tools)[0]) => {
    const toolData = convertToToolData(tool);
    setEditingTool(toolData);
    setIsDialogOpen(true);
  };

  const handleDeleteTool = (tool: (typeof tools)[0]) => {
    const toolData = convertToToolData(tool);
    setDeletingTool(toolData);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTool) {
      console.log("Deleting tool:", deletingTool);
      // TODO: Implement actual delete logic
      setIsDeleteDialogOpen(false);
      setDeletingTool(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <InputGroup className="w-xl">
            <InputGroupInput
              placeholder="Search tools"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Button onClick={handleAddTool}>
            <PlusIcon className="w-4 h-4" />
            Add Tool
          </Button>
        </div>
        <ScrollArea className="h-[550px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.name}>
                  <TableCell>
                    <button
                      onClick={() => handleToolNameClick(tool)}
                      className="text-left hover:underline cursor-pointer"
                    >
                      {tool.name}
                    </button>
                  </TableCell>
                  <TableCell>{tool.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tool.status === "Active" ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}{" "}
                      {tool.status}
                    </div>
                  </TableCell>
                  <TableCell>{tool.type}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <EllipsisIcon className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTool(tool)}>
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteTool(tool)}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <AddEditToolDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveTool}
        tool={editingTool}
      />
      <ToolOverviewDialog
        open={isOverviewDialogOpen}
        onOpenChange={setIsOverviewDialogOpen}
        tool={viewingTool}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTool?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ToolsTab;

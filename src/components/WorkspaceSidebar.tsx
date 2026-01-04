import { useWorkspaceStore } from "@/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  ChartColumnIcon,
  ChevronDown,
  ChevronRight,
  FileText,
  MessageSquareIcon,
  SettingsIcon,
  SquareTerminalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

const sidebarItems = [
  {
    icon: MessageSquareIcon,
    label: "Chat",
    href: "/chat",
    collapsible: true,
  },
  {
    icon: FileText,
    label: "Knowledge Base",
    href: "/knowledge",
  },
  {
    icon: SquareTerminalIcon,
    label: "Actions",
    href: "/actions",
  },
];

const footerItems = [
  {
    icon: ChartColumnIcon,
    label: "Usage",
    href: "/usage",
  },
  {
    icon: SettingsIcon,
    label: "Settings",
    href: "/settings",
  },
];

const WorkspaceSidebar = () => {
  const { selectedWorkspace, workspaces } = useWorkspaceStore((state) => state);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (selectedWorkspace === null || workspaces.length === 0) {
      navigate({ to: "/workspaces" });
    }
  }, [workspaces, selectedWorkspace]);

  if (selectedWorkspace === null || workspaces.length === 0) {
    toast.error("No workspace selected");
    return null;
  }

  const onWorkspaceChange = (value: string) => {
    navigate({
      to: "/workspaces/$workspaceId",
      params: { workspaceId: value },
    });
  };

  const onSidebarItemClick = (href: string) => {
    if (href.startsWith("/")) {
      navigate({
        to: `/workspaces/$workspaceId${href}`,
        params: { workspaceId: selectedWorkspace.id },
      });
    }
  };

  return (
    <Sidebar className="top-16 h-auto">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex flex-row align-center items-center gap-2">
                  <p className="text-sm text-muted-foreground">Workspace: </p>
                  <p className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {selectedWorkspace.name}
                  </p>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => onWorkspaceChange(workspace.id)}
                  >
                    <span>{workspace.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="mt-2 mb-4 mx-auto" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) =>
                item.collapsible ? (
                  <Collapsible
                    key={item.label}
                    defaultOpen={isOpen}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => setIsOpen((prev) => !prev)}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                          {isOpen ? (
                            <ChevronDown className="ml-auto" />
                          ) : (
                            <ChevronRight className="ml-auto" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuButton
                              onClick={() =>
                                navigate({
                                  to: "/workspaces/$workspaceId/chats",
                                  params: { workspaceId: selectedWorkspace.id },
                                })
                              }
                            >
                              New Chat
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => onSidebarItemClick(item.href)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => onSidebarItemClick(item.href)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default WorkspaceSidebar;

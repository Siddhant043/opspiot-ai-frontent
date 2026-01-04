import AiTab from "@/components/settingTabs/AiTab";
import LimitsTab from "@/components/settingTabs/LimitsTab";
import LogsTab from "@/components/settingTabs/LogsTab";
import MembersTab from "@/components/settingTabs/MembersTab";
import RolesTab from "@/components/settingTabs/RolesTab";
import ToolsTab from "@/components/settingTabs/ToolsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/workspaces/$workspaceId/settings")({
  component: RouteComponent,
});

const settingsTabs = [
  {
    label: "Members",
    value: "members",
    content: <MembersTab />,
  },
  {
    label: "Roles",
    value: "roles",
    content: <RolesTab />,
  },
  {
    label: "Tools",
    value: "tools",
    content: <ToolsTab />,
  },
  {
    label: "Limits",
    value: "limits",
    content: <LimitsTab />,
  },
  {
    label: "AI",
    value: "ai",
    content: <AiTab />,
  },
  {
    label: "Logs",
    value: "logs",
    content: <LogsTab />,
  },
];

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-md text-muted-foreground">
          Manage your workspace settings
        </p>
      </div>
      <div>
        <Tabs defaultValue={settingsTabs[0].value}>
          <TabsList className="flex justify-start w-full">
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {settingsTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const RolesTab = () => {
  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Roles & Permissions</h2>
        <p className="text-sm text-muted-foreground">
          Manage the roles and permissions for your workspace
        </p>
      </div>
      <div className="flex flex-col gap-10 mt-10">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">Admin</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Checkbox id="manage-members" />
              <Label htmlFor="manage-members">Manage members</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="configure-tools" />
              <Label htmlFor="configure-tools">Configure tools</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="view-usage" />
              <Label htmlFor="view-usage">View usage</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="approve-agent-actions" />
              <Label htmlFor="approve-agent-actions">
                Approve agent actions
              </Label>
            </div>
          </div>
          <Button className="w-fit">Save Changes</Button>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">Members</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Checkbox id="chat-with-ai" />
              <Label htmlFor="chat-with-ai">Chat with AI</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="run-agents" />
              <Label htmlFor="run-agents">Run Agents</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="view-usage" />
              <Label htmlFor="view-usage">View usage</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="configure-tools" />
              <Label htmlFor="configure-tools">Configure tools</Label>
            </div>
          </div>
          <Button className="w-fit">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default RolesTab;

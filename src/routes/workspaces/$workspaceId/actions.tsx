import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  PlayIcon,
  RotateCcwIcon,
  StopCircleIcon,
  ChevronRightIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

export const Route = createFileRoute("/workspaces/$workspaceId/actions")({
  component: RouteComponent,
});

// Types
type AgentStatus =
  | "planning"
  | "running"
  | "waiting_approval"
  | "completed"
  | "failed";

type StepStatus =
  | "pending"
  | "running"
  | "success"
  | "approval_required"
  | "failed";

interface AgentStep {
  id: string;
  name: string;
  tool: string;
  status: StepStatus;
  output?: string;
  input?: Record<string, unknown>;
  error?: string;
}

interface AgentRun {
  id: string;
  status: AgentStatus;
  task: string;
  startedAt: string;
  steps: AgentStep[];
}

interface AgentHistoryItem {
  id: string;
  task: string;
  status: "success" | "failed" | "completed";
  time: string;
}

// Mock data
const mockAgentRun: AgentRun | null = {
  id: "agent_101",
  status: "running",
  task: "Create weekly sales report and email it",
  startedAt: "2026-01-03T06:30:00Z",
  steps: [
    {
      id: "step_1",
      name: "Plan task",
      tool: "Planner Agent",
      status: "success",
    },
    {
      id: "step_2",
      name: "Fetch sales data",
      tool: "DB Query",
      status: "success",
      output: "2341 records fetched",
    },
    {
      id: "step_3",
      name: "Generate report",
      tool: "LLM",
      status: "running",
    },
    {
      id: "step_4",
      name: "Send email",
      tool: "Email",
      status: "approval_required",
      input: {
        to: "sales@company.com",
        subject: "Weekly Sales Report",
      },
    },
  ],
};

const mockHistory: AgentHistoryItem[] = [
  {
    id: "agent_100",
    task: "Sync Stripe invoices",
    status: "failed",
    time: "1 day ago",
  },
  {
    id: "agent_099",
    task: "Cleanup old records",
    status: "success",
    time: "3 days ago",
  },
];

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeVariant(
  status: AgentStatus | StepStatus
): "default" | "secondary" | "destructive" {
  if (status === "success" || status === "completed") return "default";
  if (status === "failed") return "destructive";
  if (
    status === "pending" ||
    status === "planning" ||
    status === "running" ||
    status === "approval_required" ||
    status === "waiting_approval"
  )
    return "secondary";
  return "secondary";
}

function getStatusLabel(status: AgentStatus | StepStatus): string {
  const labels: Record<string, string> = {
    planning: "Planning",
    running: "Running",
    waiting_approval: "Waiting Approval",
    completed: "Completed",
    failed: "Failed",
    pending: "Pending",
    success: "Success",
    approval_required: "Approval Required",
  };
  return labels[status] || status;
}

function getStatusIcon(status: StepStatus) {
  switch (status) {
    case "success":
      return <CheckCircle2Icon className="w-4 h-4 text-green-500" />;
    case "failed":
      return <XCircleIcon className="w-4 h-4 text-destructive" />;
    case "running":
      return <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />;
    case "approval_required":
      return <AlertCircleIcon className="w-4 h-4 text-yellow-500" />;
    default:
      return <ClockIcon className="w-4 h-4 text-muted-foreground" />;
  }
}

function RouteComponent() {
  const [taskInput, setTaskInput] = useState("");
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(mockAgentRun);
  const [pendingApprovalStepId, setPendingApprovalStepId] = useState<
    string | null
  >(null);
  const [failedStepId, setFailedStepId] = useState<string | null>(null);

  // Find step that needs approval
  const approvalStep = currentRun?.steps.find(
    (step) => step.status === "approval_required"
  );
  const failedStep = currentRun?.steps.find((step) => step.status === "failed");

  const handleRunAgent = () => {
    if (!taskInput.trim()) {
      toast.error("Please enter a task");
      return;
    }
    toast.success("Agent task started");
    // In real implementation, this would start an agent run
    // For now, we'll just show the mock run
  };

  const handleApprove = (stepId: string) => {
    if (!currentRun) return;
    const updatedSteps = currentRun.steps.map((step) =>
      step.id === stepId ? { ...step, status: "success" as StepStatus } : step
    );
    setCurrentRun({ ...currentRun, steps: updatedSteps });
    setPendingApprovalStepId(null);
    toast.success("Step approved");
  };

  const handleReject = (stepId: string) => {
    if (!currentRun) return;
    const updatedSteps = currentRun.steps.map((step) =>
      step.id === stepId ? { ...step, status: "failed" as StepStatus } : step
    );
    setCurrentRun({ ...currentRun, steps: updatedSteps });
    setPendingApprovalStepId(null);
    toast.error("Step rejected");
  };

  const handleRetryStep = (stepId: string) => {
    if (!currentRun) return;
    const updatedSteps = currentRun.steps.map((step) =>
      step.id === stepId
        ? { ...step, status: "running" as StepStatus, error: undefined }
        : step
    );
    setCurrentRun({ ...currentRun, steps: updatedSteps });
    setFailedStepId(null);
    toast.success("Retrying step...");
  };

  const handleAbortAgent = () => {
    if (!currentRun) return;
    setCurrentRun({ ...currentRun, status: "failed" as AgentStatus });
    toast.error("Agent aborted");
  };

  const isAgentRunning =
    currentRun?.status === "running" || currentRun?.status === "planning";

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-6 p-6">
        {/* Section 1: Action Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Run Agent Task</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="task-input">Task Description</FieldLabel>
                <Textarea
                  id="task-input"
                  placeholder="Example: Create weekly sales report and email it"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="min-h-24"
                  disabled={isAgentRunning}
                />
              </Field>
              <Button
                onClick={handleRunAgent}
                disabled={isAgentRunning || !taskInput.trim()}
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Run Agent
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 2: Execution Monitor */}
        {currentRun && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Execution Monitor</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadgeVariant(currentRun.status)}>
                    {getStatusLabel(currentRun.status)}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    ID: {currentRun.id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Started: {formatDate(currentRun.startedAt)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Section 3: Step Timeline */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Step Timeline</h3>
                  <div className="relative">
                    {currentRun.steps.map((step, index) => (
                      <div key={step.id} className="relative flex gap-4 pb-6">
                        {/* Timeline line */}
                        {index < currentRun.steps.length - 1 && (
                          <div className="absolute left-[7px] top-4 w-px h-full bg-border" />
                        )}

                        {/* Step icon */}
                        <div className="relative z-10 shrink-0">
                          <div className="flex items-center justify-center w-4 h-4 rounded-none bg-background">
                            {getStatusIcon(step.status)}
                          </div>
                        </div>

                        {/* Step content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              Step {index + 1}
                            </span>
                            <span className="text-sm font-medium">
                              {step.name}
                            </span>
                            <Badge variant={getStatusBadgeVariant(step.status)}>
                              {getStatusLabel(step.status)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Tool: {step.tool}
                          </div>
                          {step.output && (
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded-none mb-2">
                              Output: {step.output}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Human Approval UI */}
                {approvalStep && (
                  <>
                    <Separator />
                    <Card className="border-yellow-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircleIcon className="w-5 h-5 text-yellow-500" />
                          Human Approval Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Step: {approvalStep.name}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Tool: {approvalStep.tool}
                            </p>
                            {approvalStep.input && (
                              <div className="bg-muted p-3 rounded-none mb-4">
                                <p className="text-xs font-medium mb-2">
                                  Input:
                                </p>
                                <pre className="text-xs font-mono">
                                  {JSON.stringify(approvalStep.input, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(approvalStep.id)}
                              className="flex-1"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(approvalStep.id)}
                              className="flex-1"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Section 5: Failure Recovery */}
                {failedStep && (
                  <>
                    <Separator />
                    <Card className="border-destructive">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                          <XCircleIcon className="w-5 h-5" />
                          Step Failed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Step: {failedStep.name}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              Tool: {failedStep.tool}
                            </p>
                            {failedStep.error && (
                              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-none mb-4">
                                <p className="text-xs font-medium text-destructive mb-1">
                                  Error:
                                </p>
                                <p className="text-xs text-destructive">
                                  {failedStep.error}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleRetryStep(failedStep.id)}
                              variant="outline"
                              className="flex-1"
                            >
                              <RotateCcwIcon className="w-4 h-4 mr-2" />
                              Retry Step
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleAbortAgent}
                              className="flex-1"
                            >
                              <StopCircleIcon className="w-4 h-4 mr-2" />
                              Abort Agent
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 6: Action History */}
        <Card>
          <CardHeader>
            <CardTitle>Action History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      // In real implementation, this would load the agent run details
                      toast.loading(`Viewing details for ${item.id}`);
                    }}
                  >
                    <TableCell className="font-medium">{item.task}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.time}
                    </TableCell>
                    <TableCell>
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

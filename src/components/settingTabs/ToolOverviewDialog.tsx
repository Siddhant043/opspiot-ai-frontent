import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

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

interface ToolOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: ToolData | null;
}

export function ToolOverviewDialog({
  open,
  onOpenChange,
  tool,
}: ToolOverviewDialogProps) {
  if (!tool) return null;

  const isHttpApiType = tool.type === "HTTP API";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tool Overview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{tool.name}</CardTitle>
              <CardDescription>{tool.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </Field>

                <Separator />

                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <div className="flex items-center gap-2">
                    {tool.enabled ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    <span className="text-sm">
                      {tool.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </Field>

                <Field>
                  <FieldLabel>Requires Approval</FieldLabel>
                  <p className="text-sm text-muted-foreground">
                    {tool.requiresApproval ? "Yes" : "No"}
                  </p>
                </Field>

                {isHttpApiType && (
                  <>
                    <Separator />
                    <div className="text-sm font-medium mb-2">
                      HTTP API Configurations
                    </div>

                    {tool.endpointUrl && (
                      <Field>
                        <FieldLabel>Endpoint URL</FieldLabel>
                        <p className="text-sm text-muted-foreground font-mono break-all">
                          {tool.endpointUrl}
                        </p>
                      </Field>
                    )}

                    {tool.httpMethod && (
                      <Field>
                        <FieldLabel>HTTP Method</FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          {tool.httpMethod}
                        </p>
                      </Field>
                    )}

                    {tool.authType && (
                      <Field>
                        <FieldLabel>Auth Type</FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          {tool.authType}
                        </p>
                      </Field>
                    )}

                    {tool.inputSchema && (
                      <Field>
                        <FieldLabel>Input Schema (JSON)</FieldLabel>
                        <pre className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-none overflow-auto">
                          {(() => {
                            try {
                              return JSON.stringify(
                                JSON.parse(tool.inputSchema || "{}"),
                                null,
                                2
                              );
                            } catch {
                              return tool.inputSchema;
                            }
                          })()}
                        </pre>
                      </Field>
                    )}
                  </>
                )}
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

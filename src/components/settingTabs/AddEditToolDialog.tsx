import { useEffect } from "react";
import * as zod from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";

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

interface AddEditToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (toolData: ToolData) => void;
  tool?: ToolData | null;
}

const TOOL_TYPES = ["HTTP API", "Database", "System", "Jira API"] as const;
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
const AUTH_TYPES = ["API Key", "Bearer Token", "Basic Auth", "OAuth2"] as const;

const MIN_WORDS = 100;

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

const toolFormSchema = zod
  .object({
    name: zod.string().min(1, "Tool name is required"),
    type: zod.string().min(1, "Tool type is required"),
    description: zod
      .string()
      .min(1, "Description is required")
      .refine(
        (val) => countWords(val) >= MIN_WORDS,
        `Description must be at least ${MIN_WORDS} words`
      ),
    endpointUrl: zod.string().optional(),
    httpMethod: zod.string().optional(),
    authType: zod.string().optional(),
    inputSchema: zod.string().optional(),
    requiresApproval: zod.boolean(),
    enabled: zod.boolean(),
  })
  .refine(
    (data) => {
      if (data.type === "HTTP API") {
        return !!data.endpointUrl && data.endpointUrl.length > 0;
      }
      return true;
    },
    {
      message: "Endpoint URL is required for HTTP API tools",
      path: ["endpointUrl"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "HTTP API") {
        return !!data.httpMethod && data.httpMethod.length > 0;
      }
      return true;
    },
    {
      message: "HTTP Method is required for HTTP API tools",
      path: ["httpMethod"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "HTTP API" && data.inputSchema) {
        try {
          JSON.parse(data.inputSchema);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Input Schema must be valid JSON",
      path: ["inputSchema"],
    }
  );

type ToolFormData = zod.infer<typeof toolFormSchema>;

export function AddEditToolDialog({
  open,
  onOpenChange,
  onSave,
  tool,
}: AddEditToolDialogProps) {
  const isEditMode = !!tool;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      endpointUrl: "",
      httpMethod: "",
      authType: "API Key",
      inputSchema: "",
      requiresApproval: false,
      enabled: true,
    },
  });

  const toolType = watch("type");
  const description = watch("description");
  const isHttpApiType = toolType === "HTTP API";

  // Reset form when dialog opens or tool changes
  useEffect(() => {
    if (!open) return;

    if (tool) {
      reset({
        name: tool.name,
        type: tool.type,
        description: tool.description,
        endpointUrl: tool.endpointUrl || "",
        httpMethod: tool.httpMethod || "",
        authType: tool.authType || "API Key",
        inputSchema: tool.inputSchema || "",
        requiresApproval: tool.requiresApproval,
        enabled: tool.enabled,
      });
    } else {
      reset({
        name: "",
        type: "",
        description: "",
        endpointUrl: "",
        httpMethod: "",
        authType: "API Key",
        inputSchema: "",
        requiresApproval: false,
        enabled: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tool?.name]);

  const onSubmit = (data: ToolFormData) => {
    const toolData: ToolData = {
      name: data.name,
      type: data.type,
      description: data.description,
      requiresApproval: data.requiresApproval,
      enabled: data.enabled,
      ...(isHttpApiType && {
        endpointUrl: data.endpointUrl,
        httpMethod: data.httpMethod,
        authType: data.authType,
        inputSchema: data.inputSchema,
      }),
    };

    onSave(toolData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Tool" : "Add Tool"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="tool-name">Tool Name</FieldLabel>
              <Input
                id="tool-name"
                placeholder="Enter tool name"
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="tool-type">Tool Type</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tool-type">
                      <SelectValue placeholder="Select tool type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOOL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <FieldError>{errors.type.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="tool-description">
                Tool Description
              </FieldLabel>
              <Textarea
                id="tool-description"
                placeholder="Enter tool description (minimum 100 words)"
                className="min-h-32"
                {...register("description")}
              />
              {errors.description && (
                <FieldError>{errors.description.message}</FieldError>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {countWords(description || "")} words (minimum {MIN_WORDS}{" "}
                words)
              </p>
            </Field>

            <Separator />

            {isHttpApiType && (
              <>
                <div className="text-sm font-medium mb-2">Configurations</div>

                <Field>
                  <FieldLabel htmlFor="endpoint-url">Endpoint URL</FieldLabel>
                  <Input
                    id="endpoint-url"
                    placeholder="https://api.example.com/endpoint"
                    {...register("endpointUrl")}
                  />
                  {errors.endpointUrl && (
                    <FieldError>{errors.endpointUrl.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="http-method">HTTP Method</FieldLabel>
                  <Controller
                    name="httpMethod"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="http-method">
                          <SelectValue placeholder="Select HTTP method" />
                        </SelectTrigger>
                        <SelectContent>
                          {HTTP_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.httpMethod && (
                    <FieldError>{errors.httpMethod.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="auth-type">Auth Type</FieldLabel>
                  <Controller
                    name="authType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="auth-type">
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUTH_TYPES.map((auth) => (
                            <SelectItem key={auth} value={auth}>
                              {auth}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.authType && (
                    <FieldError>{errors.authType.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="input-schema">
                    Input Schema (JSON)
                  </FieldLabel>
                  <Textarea
                    id="input-schema"
                    placeholder='{"key": "value"}'
                    className="min-h-24 font-mono text-xs"
                    {...register("inputSchema")}
                  />
                  {errors.inputSchema && (
                    <FieldError>{errors.inputSchema.message}</FieldError>
                  )}
                </Field>

                <Separator />
              </>
            )}

            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Controller
                  name="requiresApproval"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="requires-approval"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel
                  htmlFor="requires-approval"
                  className="cursor-pointer"
                >
                  Requires Approval
                </FieldLabel>
              </div>
            </Field>

            <Field orientation="horizontal">
              <div className="flex items-center gap-2">
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="enabled" className="cursor-pointer">
                  Enable
                </FieldLabel>
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Tool</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

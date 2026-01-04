import * as zod from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { HelpCircleIcon } from "lucide-react";

// Mock data
const mockAIConfig = {
  defaultModel: "gpt-4",
  fallbackModel: "gpt-3.5",
  fallbackTrigger: "on_error",
  temperature: 0.3,
  maxTokens: 2048,
  responseStyle: "precise",
  safety: {
    requireCitations: true,
    blockUnknownTools: true,
    requireApproval: true,
    rejectLowConfidence: true,
  },
};

// Response style to temperature mapping
const RESPONSE_STYLE_TEMPERATURE: Record<string, number> = {
  precise: 0.1,
  balanced: 0.5,
  creative: 0.9,
};

// Zod schema
const aiBehaviorSchema = zod
  .object({
    defaultModel: zod.enum(["gpt-4", "gpt-3.5", "claude"]),
    fallbackModel: zod.enum(["gpt-4", "gpt-3.5", "claude"]),
    fallbackTrigger: zod.enum(["on_error", "on_token_limit", "on_cost_limit"]),
    temperature: zod.number().min(0).max(1),
    maxTokens: zod
      .number()
      .min(1, "Max tokens must be at least 1")
      .int("Max tokens must be an integer"),
    responseStyle: zod.enum(["precise", "balanced", "creative"]),
    requireCitations: zod.boolean(),
    blockUnknownTools: zod.boolean(),
    requireApproval: zod.boolean(),
    rejectLowConfidence: zod.boolean(),
  })
  .refine((data) => data.defaultModel !== data.fallbackModel, {
    message: "Default and fallback models must be different",
    path: ["fallbackModel"],
  });

type AIBehaviorFormData = zod.infer<typeof aiBehaviorSchema>;

// Mock logic to compute preview values
function computeCostImpact(
  data: AIBehaviorFormData
): "Low" | "Medium" | "High" {
  const expensiveModels = ["gpt-4", "claude"];
  const isExpensive = expensiveModels.includes(data.defaultModel);
  const highTemp = data.temperature > 0.7;
  const highTokens = data.maxTokens > 3000;

  if (isExpensive && (highTemp || highTokens)) return "High";
  if (isExpensive || highTemp || highTokens) return "Medium";
  return "Low";
}

function computeHallucinationRisk(
  data: AIBehaviorFormData
): "Low" | "Medium" | "High" {
  const highTemp = data.temperature > 0.7;
  const lowConfidence = !data.rejectLowConfidence;
  const noCitations = !data.requireCitations;

  if (highTemp && (lowConfidence || noCitations)) return "High";
  if (highTemp || lowConfidence || noCitations) return "Medium";
  return "Low";
}

function computeAgentAutonomy(
  data: AIBehaviorFormData
): "Restricted" | "Moderate" | "Full" {
  const hasApproval = data.requireApproval;
  const blocksTools = data.blockUnknownTools;
  const rejectsLowConf = data.rejectLowConfidence;

  if (hasApproval && blocksTools && rejectsLowConf) return "Restricted";
  if (hasApproval || blocksTools || rejectsLowConf) return "Moderate";
  return "Full";
}

const AiTab = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AIBehaviorFormData>({
    resolver: zodResolver(aiBehaviorSchema),
    defaultValues: {
      defaultModel: mockAIConfig.defaultModel as "gpt-4" | "gpt-3.5" | "claude",
      fallbackModel: mockAIConfig.fallbackModel as
        | "gpt-4"
        | "gpt-3.5"
        | "claude",
      fallbackTrigger: mockAIConfig.fallbackTrigger as
        | "on_error"
        | "on_token_limit"
        | "on_cost_limit",
      temperature: mockAIConfig.temperature,
      maxTokens: mockAIConfig.maxTokens,
      responseStyle: mockAIConfig.responseStyle as
        | "precise"
        | "balanced"
        | "creative",
      requireCitations: mockAIConfig.safety.requireCitations,
      blockUnknownTools: mockAIConfig.safety.blockUnknownTools,
      requireApproval: mockAIConfig.safety.requireApproval,
      rejectLowConfidence: mockAIConfig.safety.rejectLowConfidence,
    },
  });

  const defaultModel = watch("defaultModel");
  const fallbackModel = watch("fallbackModel");
  const temperature = watch("temperature");
  const formData = watch();

  // Update temperature when response style changes
  const handleResponseStyleChange = (
    style: "precise" | "balanced" | "creative"
  ) => {
    setValue("responseStyle", style);
    setValue("temperature", RESPONSE_STYLE_TEMPERATURE[style]);
  };

  // Update response style when temperature changes manually
  const handleTemperatureChange = (value: number[]) => {
    const temp = value[0];
    setValue("temperature", temp);
    // Auto-update response style based on temperature
    if (temp <= 0.3) {
      setValue("responseStyle", "precise");
    } else if (temp <= 0.7) {
      setValue("responseStyle", "balanced");
    } else {
      setValue("responseStyle", "creative");
    }
  };

  const costImpact = computeCostImpact(formData);
  const hallucinationRisk = computeHallucinationRisk(formData);
  const agentAutonomy = computeAgentAutonomy(formData);

  const onSubmit = (data: AIBehaviorFormData) => {
    console.log("Saving AI settings:", data);
    toast.success("AI settings saved successfully");
  };

  const onFormSubmit = handleSubmit(onSubmit);

  return (
    <ScrollArea className="flex flex-col gap-6 py-4 h-[calc(100vh-13rem)]">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">AI Behavior Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure how AI models behave, respond, and interact with your
          workspace
        </p>
      </div>

      <form onSubmit={onFormSubmit} className="flex flex-col gap-6 mt-4">
        {/* Section 1: Model Routing */}
        <Card>
          <CardHeader>
            <CardTitle>Model Routing</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="default-model">Default Model</FieldLabel>
                <Controller
                  name="defaultModel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="default-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.defaultModel && (
                  <FieldError>{errors.defaultModel.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="fallback-model">Fallback Model</FieldLabel>
                <Controller
                  name="fallbackModel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="fallback-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fallbackModel && (
                  <FieldError>{errors.fallbackModel.message}</FieldError>
                )}
                {defaultModel === fallbackModel && (
                  <p className="text-xs text-destructive mt-1">
                    Default and fallback models must be different
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="fallback-trigger">
                  Fallback Trigger
                </FieldLabel>
                <Controller
                  name="fallbackTrigger"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="fallback-trigger">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_error">On error</SelectItem>
                        <SelectItem value="on_token_limit">
                          On token limit
                        </SelectItem>
                        <SelectItem value="on_cost_limit">
                          On cost limit
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fallbackTrigger && (
                  <FieldError>{errors.fallbackTrigger.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 2: Response Behavior */}
        <Card>
          <CardHeader>
            <CardTitle>Response Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="temperature">Temperature</FieldLabel>
                  <span className="text-sm text-muted-foreground">
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <Controller
                  name="temperature"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => {
                          field.onChange(value[0]);
                          handleTemperatureChange(value);
                        }}
                        className="w-full"
                      />
                      <Input
                        id="temperature"
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={field.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const clamped = Math.min(1, Math.max(0, val));
                          field.onChange(clamped);
                          handleTemperatureChange([clamped]);
                        }}
                        className="w-24"
                      />
                    </div>
                  )}
                />
                {errors.temperature && (
                  <FieldError>{errors.temperature.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="max-tokens">Max Tokens</FieldLabel>
                <Input
                  id="max-tokens"
                  type="number"
                  {...register("maxTokens", { valueAsNumber: true })}
                />
                {errors.maxTokens && (
                  <FieldError>{errors.maxTokens.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Response Style</FieldLabel>
                <Controller
                  name="responseStyle"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleResponseStyleChange(
                          value as "precise" | "balanced" | "creative"
                        );
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="precise" id="precise" />
                          <FieldLabel
                            htmlFor="precise"
                            className="cursor-pointer"
                          >
                            Precise
                          </FieldLabel>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="balanced" id="balanced" />
                          <FieldLabel
                            htmlFor="balanced"
                            className="cursor-pointer"
                          >
                            Balanced
                          </FieldLabel>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="creative" id="creative" />
                          <FieldLabel
                            htmlFor="creative"
                            className="cursor-pointer"
                          >
                            Creative
                          </FieldLabel>
                        </div>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.responseStyle && (
                  <FieldError>{errors.responseStyle.message}</FieldError>
                )}
                <FieldDescription>
                  Changing response style automatically updates temperature
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 3: Safety & Guardrails */}
        <Card>
          <CardHeader>
            <CardTitle>Safety & Guardrails</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="requireCitations"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="require-citations"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <FieldLabel
                      htmlFor="require-citations"
                      className="cursor-pointer"
                    >
                      Require citations for knowledge answers
                    </FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Forces AI to cite sources when answering from
                          knowledge base, improving traceability and reducing
                          hallucinations.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="blockUnknownTools"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="block-unknown-tools"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <FieldLabel
                      htmlFor="block-unknown-tools"
                      className="cursor-pointer"
                    >
                      Block unknown / unapproved tools
                    </FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Prevents agents from using tools that haven't been
                          explicitly approved, reducing security risks.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="requireApproval"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="require-approval"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <FieldLabel
                      htmlFor="require-approval"
                      className="cursor-pointer"
                    >
                      Human approval for sensitive actions
                    </FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Requires manual approval before executing actions that
                          modify data, send external communications, or access
                          sensitive resources.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="rejectLowConfidence"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="reject-low-confidence"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <FieldLabel
                      htmlFor="reject-low-confidence"
                      className="cursor-pointer"
                    >
                      Reject low-confidence answers
                    </FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          AI will refuse to answer if confidence is below
                          threshold, preventing unreliable responses.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 4: Preview & Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Preview & Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Estimated Cost Impact</FieldLabel>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      costImpact === "High"
                        ? "destructive"
                        : costImpact === "Medium"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {costImpact}
                  </Badge>
                </div>
              </Field>

              <Field>
                <FieldLabel>Hallucination Risk</FieldLabel>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      hallucinationRisk === "High"
                        ? "destructive"
                        : hallucinationRisk === "Medium"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {hallucinationRisk}
                  </Badge>
                </div>
              </Field>

              <Field>
                <FieldLabel>Agent Autonomy</FieldLabel>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      agentAutonomy === "Full"
                        ? "destructive"
                        : agentAutonomy === "Moderate"
                          ? "secondary"
                          : "default"
                    }
                  >
                    {agentAutonomy}
                  </Badge>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="submit"
            disabled={
              !!errors.defaultModel ||
              !!errors.fallbackModel ||
              !!errors.temperature ||
              !!errors.maxTokens ||
              defaultModel === fallbackModel
            }
          >
            Save AI Settings
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default AiTab;

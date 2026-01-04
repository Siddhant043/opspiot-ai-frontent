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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { AlertTriangleIcon, HelpCircleIcon } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

// Mock data
const mockLimits = {
  dailyTokens: 100000,
  monthlyTokens: 2000000,
  enforcementMode: "HARD_STOP" as const,
  alerts: [50, 70, 90],
  notificationChannel: "email" as const,
  models: [
    { name: "gpt-4", dailyLimit: 40000, enabled: true },
    { name: "gpt-3.5", dailyLimit: 60000, enabled: true },
    { name: "claude", dailyLimit: 20000, enabled: false },
  ],
  perUserDailyLimit: 10000,
  exemptAdmins: true,
  agentLimits: {
    maxSteps: 8,
    maxRuntimeSec: 120,
    maxToolCalls: 15,
  },
};

const mockUsage = {
  tokensUsed: 232000,
  monthlyLimit: 2000000,
  estimatedSpend: 18.72,
};

// Zod schema
const limitsFormSchema = zod
  .object({
    dailyTokens: zod
      .number()
      .min(1, "Daily token limit must be at least 1")
      .int("Daily token limit must be an integer"),
    monthlyTokens: zod
      .number()
      .min(1, "Monthly token limit must be at least 1")
      .int("Monthly token limit must be an integer"),
    enforcementMode: zod.enum(["HARD_STOP", "SOFT_ALERT"]),
    alert50: zod.boolean(),
    alert70: zod.boolean(),
    alert90: zod.boolean(),
    notificationChannel: zod.enum(["email", "slack"]),
    models: zod.array(
      zod.object({
        name: zod.string(),
        dailyLimit: zod.number().min(0).int(),
        enabled: zod.boolean(),
      })
    ),
    perUserDailyLimit: zod
      .number()
      .min(1, "Per-user limit must be at least 1")
      .int("Per-user limit must be an integer"),
    exemptAdmins: zod.boolean(),
    maxSteps: zod
      .number()
      .min(1, "Max steps must be at least 1")
      .int("Max steps must be an integer"),
    maxRuntimeSec: zod
      .number()
      .min(1, "Max runtime must be at least 1")
      .int("Max runtime must be an integer"),
    maxToolCalls: zod
      .number()
      .min(1, "Max tool calls must be at least 1")
      .int("Max tool calls must be an integer"),
  })
  .refine((data) => data.dailyTokens <= data.monthlyTokens, {
    message: "Daily limit must be less than or equal to monthly limit",
    path: ["dailyTokens"],
  })
  .refine(
    (data) => {
      const enabledModelsTotal = data.models
        .filter((m) => m.enabled)
        .reduce((sum, m) => sum + m.dailyLimit, 0);
      return enabledModelsTotal <= data.dailyTokens;
    },
    {
      message: "Total of enabled model limits exceeds workspace daily limit",
      path: ["models"],
    }
  );

type LimitsFormData = zod.infer<typeof limitsFormSchema>;

const LimitsTab = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LimitsFormData>({
    resolver: zodResolver(limitsFormSchema),
    defaultValues: {
      dailyTokens: mockLimits.dailyTokens,
      monthlyTokens: mockLimits.monthlyTokens,
      enforcementMode: mockLimits.enforcementMode,
      alert50: mockLimits.alerts.includes(50),
      alert70: mockLimits.alerts.includes(70),
      alert90: mockLimits.alerts.includes(90),
      notificationChannel: mockLimits.notificationChannel,
      models: mockLimits.models,
      perUserDailyLimit: mockLimits.perUserDailyLimit,
      exemptAdmins: mockLimits.exemptAdmins,
      maxSteps: mockLimits.agentLimits.maxSteps,
      maxRuntimeSec: mockLimits.agentLimits.maxRuntimeSec,
      maxToolCalls: mockLimits.agentLimits.maxToolCalls,
    },
  });

  const dailyTokens = watch("dailyTokens");
  const monthlyTokens = watch("monthlyTokens");
  const models = watch("models");
  const alert70 = watch("alert70");
  const alert90 = watch("alert90");

  // Calculate total enabled model limits
  const enabledModelsTotal = models
    .filter((m) => m.enabled)
    .reduce((sum, m) => sum + m.dailyLimit, 0);

  const modelLimitExceeded = enabledModelsTotal > dailyTokens;
  const dailyExceedsMonthly = dailyTokens > monthlyTokens;

  const onSubmit = (data: LimitsFormData) => {
    console.log("Saving limits:", data);
    toast.success("Limits saved successfully");
  };

  const handleReset = () => {
    reset({
      dailyTokens: mockLimits.dailyTokens,
      monthlyTokens: mockLimits.monthlyTokens,
      enforcementMode: mockLimits.enforcementMode,
      alert50: mockLimits.alerts.includes(50),
      alert70: mockLimits.alerts.includes(70),
      alert90: mockLimits.alerts.includes(90),
      notificationChannel: mockLimits.notificationChannel,
      models: mockLimits.models,
      perUserDailyLimit: mockLimits.perUserDailyLimit,
      exemptAdmins: mockLimits.exemptAdmins,
      maxSteps: mockLimits.agentLimits.maxSteps,
      maxRuntimeSec: mockLimits.agentLimits.maxRuntimeSec,
      maxToolCalls: mockLimits.agentLimits.maxToolCalls,
    });
    toast.success("Limits reset to defaults");
  };

  return (
    <ScrollArea className="flex flex-col gap-6 py-4 h-[calc(100vh-13rem)]">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Limits & Cost Control</h1>
        <p className="text-sm text-muted-foreground">
          Control how much AI can spend and when to stop execution
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 mt-4"
      >
        {/* Section 1: Workspace Token Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Workspace Token Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="daily-tokens">
                  Daily Token Limit
                </FieldLabel>
                <Input
                  id="daily-tokens"
                  type="number"
                  {...register("dailyTokens", { valueAsNumber: true })}
                />
                {errors.dailyTokens && (
                  <FieldError>{errors.dailyTokens.message}</FieldError>
                )}
                {dailyExceedsMonthly && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertTriangleIcon className="w-3 h-3" />
                    Daily limit exceeds monthly limit
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="monthly-tokens">
                  Monthly Token Limit
                </FieldLabel>
                <Input
                  id="monthly-tokens"
                  type="number"
                  {...register("monthlyTokens", { valueAsNumber: true })}
                />
                {errors.monthlyTokens && (
                  <FieldError>{errors.monthlyTokens.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="enforcement-mode">
                  Enforcement Mode
                </FieldLabel>
                <Controller
                  name="enforcementMode"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="enforcement-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HARD_STOP">Hard Stop</SelectItem>
                        <SelectItem value="SOFT_ALERT">Soft Alert</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.enforcementMode && (
                  <FieldError>{errors.enforcementMode.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 2: Cost Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="alert50"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="alert-50"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel htmlFor="alert-50" className="cursor-pointer">
                    Alert at 50%
                  </FieldLabel>
                </div>
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="alert70"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="alert-70"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel htmlFor="alert-70" className="cursor-pointer">
                    Alert at 70%
                  </FieldLabel>
                  {alert70 && (
                    <Badge variant="destructive" className="ml-2">
                      Warning
                    </Badge>
                  )}
                </div>
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="alert90"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="alert-90"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel htmlFor="alert-90" className="cursor-pointer">
                    Alert at 90%
                  </FieldLabel>
                  {alert90 && (
                    <Badge variant="destructive" className="ml-2">
                      Warning
                    </Badge>
                  )}
                </div>
              </Field>

              <Separator />

              <Field>
                <FieldLabel htmlFor="notification-channel">
                  Notification Channel
                </FieldLabel>
                <Controller
                  name="notificationChannel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="notification-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="slack" disabled>
                          Slack (coming soon)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <FieldDescription>
                Alerts are non-blocking and will notify you when usage reaches
                the specified thresholds.
              </FieldDescription>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 3: Model-Level Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Model-Level Limits</CardTitle>
            {modelLimitExceeded && (
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangleIcon className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive">
                  Total enabled model limits (
                  {enabledModelsTotal.toLocaleString()}) exceed workspace daily
                  limit ({dailyTokens.toLocaleString()})
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Daily Token Limit</TableHead>
                  <TableHead>Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model, index) => (
                  <TableRow key={model.name}>
                    <TableCell className="font-medium">
                      {model.name.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-32"
                        {...register(`models.${index}.dailyLimit`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`models.${index}.enabled`}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {errors.models && (
              <FieldError className="mt-2">{errors.models.message}</FieldError>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Per-User Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Per-User Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <div className="flex items-center gap-2">
                  <FieldLabel htmlFor="per-user-limit">
                    Max Tokens per User per Day
                  </FieldLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircleIcon className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Per-user caps prevent individual users from consuming
                        excessive tokens and help distribute costs fairly across
                        the team.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="per-user-limit"
                  type="number"
                  {...register("perUserDailyLimit", { valueAsNumber: true })}
                />
                {errors.perUserDailyLimit && (
                  <FieldError>{errors.perUserDailyLimit.message}</FieldError>
                )}
              </Field>

              <Field orientation="horizontal">
                <div className="flex items-center gap-2">
                  <Controller
                    name="exemptAdmins"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="exempt-admins"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel
                    htmlFor="exempt-admins"
                    className="cursor-pointer"
                  >
                    Admins are exempt from this limit
                  </FieldLabel>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 5: Agent Safety Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Safety Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="max-steps">
                  Max Steps per Agent Run
                </FieldLabel>
                <Input
                  id="max-steps"
                  type="number"
                  {...register("maxSteps", { valueAsNumber: true })}
                />
                {errors.maxSteps && (
                  <FieldError>{errors.maxSteps.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="max-runtime">
                  Max Runtime (seconds)
                </FieldLabel>
                <Input
                  id="max-runtime"
                  type="number"
                  {...register("maxRuntimeSec", { valueAsNumber: true })}
                />
                {errors.maxRuntimeSec && (
                  <FieldError>{errors.maxRuntimeSec.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="max-tool-calls">Max Tool Calls</FieldLabel>
                <Input
                  id="max-tool-calls"
                  type="number"
                  {...register("maxToolCalls", { valueAsNumber: true })}
                />
                {errors.maxToolCalls && (
                  <FieldError>{errors.maxToolCalls.message}</FieldError>
                )}
              </Field>

              <FieldDescription>
                These limits prevent infinite agent loops and ensure agents
                complete execution within reasonable timeframes.
              </FieldDescription>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Section 6: Live Usage Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Usage (Mock)</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Tokens used this month</FieldLabel>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {mockUsage.tokensUsed.toLocaleString()} /{" "}
                    {mockUsage.monthlyLimit.toLocaleString()}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-none overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${
                          (mockUsage.tokensUsed / mockUsage.monthlyLimit) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </Field>

              <Field>
                <FieldLabel>Estimated spend</FieldLabel>
                <p className="text-sm font-medium">
                  ${mockUsage.estimatedSpend}
                </p>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              !!errors.dailyTokens ||
              !!errors.monthlyTokens ||
              !!errors.models ||
              dailyExceedsMonthly ||
              modelLimitExceeded
            }
          >
            Save Changes
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default LimitsTab;

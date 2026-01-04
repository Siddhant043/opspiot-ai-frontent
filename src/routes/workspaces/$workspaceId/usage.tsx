import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import mockUsageData from "@/data/mockUsageData.json";

export const Route = createFileRoute("/workspaces/$workspaceId/usage")({
  component: RouteComponent,
});

// Types
type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

interface UsageOverTimeData {
  date: string;
  tokens: number;
}

interface UsageByModelData {
  model: string;
  tokens: number;
  percentage: number;
}

interface PeriodData {
  tokens: number;
  cost: number;
  usageOverTime: UsageOverTimeData[];
  byModel: UsageByModelData[];
}

interface UsageData {
  daily: PeriodData;
  weekly: PeriodData;
  monthly: PeriodData;
  yearly: PeriodData;
}

// Chart configuration
const chartConfig: ChartConfig = {
  tokens: {
    label: "Tokens",
    theme: {
      light: "oklch(0.85 0.13 165)",
      dark: "oklch(0.85 0.13 165)",
    },
  },
};

// Helper functions
function formatDate(dateString: string, period: TimePeriod): string {
  const date = new Date(dateString);

  switch (period) {
    case "daily":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "weekly":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "monthly":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    case "yearly":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
      });
    default:
      return date.toLocaleDateString("en-US");
  }
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function getPeriodLabel(period: TimePeriod): string {
  const labels = {
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
    yearly: "This Year",
  };
  return labels[period];
}

function RouteComponent() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [isLoading] = useState(false); // Simulate loading state

  const usageData = mockUsageData as UsageData;
  const currentPeriodData = usageData[timePeriod];
  const usageOverTimeData = currentPeriodData.usageOverTime;

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-6 p-6">
        {/* Section 1: Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Usage & Cost</h1>
          <p className="text-sm text-muted-foreground">
            Monitor AI usage, cost & trends
          </p>
        </div>

        {/* Section 2: Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Period Tokens */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {formatNumber(currentPeriodData.tokens)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tokens {getPeriodLabel(timePeriod)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Tokens This Month */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {formatNumber(usageData.monthly.tokens)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tokens This Month
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {formatCurrency(currentPeriodData.cost)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost {getPeriodLabel(timePeriod)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Usage Over Time */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usage Over Time</CardTitle>
              <Select
                value={timePeriod}
                onValueChange={(value) => setTimePeriod(value as TimePeriod)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart
                  data={usageOverTimeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatDate(value, timePeriod)}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) =>
                      formatDate(value as string, timePeriod)
                    }
                  />
                  <Bar dataKey="tokens" fill="var(--chart-2)" radius={0} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Usage by Model */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Model</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentPeriodData.byModel.map((model, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{model.model}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{model.percentage}%</span>
                        <span>{formatNumber(model.tokens)} tokens</span>
                      </div>
                    </div>
                    <div className="w-full h-4 bg-muted rounded-none overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-none"
                        style={{ width: `${model.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

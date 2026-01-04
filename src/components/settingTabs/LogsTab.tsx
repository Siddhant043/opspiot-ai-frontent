import { useState, useMemo, useEffect } from "react";
import * as zod from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  XIcon,
} from "lucide-react";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

// Types
type LogStatus = "success" | "approved" | "denied" | "failed" | "pending";
type DateRangePreset = "last_24h" | "last_7d" | "last_30d";

interface LogDetails {
  requestId: string;
  triggerSource?: "Chat" | "Agent" | "Settings";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
}

interface AuditLog {
  id: string;
  time: string;
  user: string;
  action: string;
  tool: string;
  status: LogStatus;
  details: LogDetails;
}

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: "log_1",
    time: "2026-01-03T10:30:00Z",
    user: "Alice",
    action: "Run Agent",
    tool: "Agent",
    status: "success",
    details: {
      requestId: "req_123",
      triggerSource: "Chat",
      input: { task: "Generate weekly report" },
      output: { result: "Completed" },
      durationMs: 2400,
    },
  },
  {
    id: "log_2",
    time: "2026-01-03T10:45:00Z",
    user: "Bob",
    action: "Send Email",
    tool: "Email",
    status: "approved",
    details: {
      requestId: "req_124",
      triggerSource: "Agent",
      input: { to: "sales@company.com" },
      output: { status: "sent" },
      durationMs: 1200,
    },
  },
  {
    id: "log_3",
    time: "2026-01-03T11:00:00Z",
    user: "Bob",
    action: "Delete Tool",
    tool: "Tool",
    status: "denied",
    details: {
      requestId: "req_125",
      triggerSource: "Settings",
      input: { toolName: "DB Query" },
      output: { error: "Permission denied" },
      durationMs: 300,
    },
  },
  {
    id: "log_4",
    time: "2026-01-03T11:15:00Z",
    user: "Alice",
    action: "Update Settings",
    tool: "System",
    status: "success",
    details: {
      requestId: "req_126",
      triggerSource: "Settings",
      input: { setting: "maxTokens", value: 4096 },
      output: { success: true },
      durationMs: 150,
    },
  },
  {
    id: "log_5",
    time: "2026-01-03T11:30:00Z",
    user: "Bob",
    action: "Run Agent",
    tool: "Agent",
    status: "failed",
    details: {
      requestId: "req_127",
      triggerSource: "Chat",
      input: { task: "Analyze data" },
      output: { error: "Timeout exceeded" },
      durationMs: 5000,
    },
  },
  {
    id: "log_6",
    time: "2026-01-03T11:45:00Z",
    user: "Alice",
    action: "Send Email",
    tool: "Email",
    status: "pending",
    details: {
      requestId: "req_128",
      triggerSource: "Agent",
      input: { to: "team@company.com" },
      output: {},
      durationMs: 0,
    },
  },
  {
    id: "log_7",
    time: "2026-01-03T12:00:00Z",
    user: "Bob",
    action: "Run Agent",
    tool: "Agent",
    status: "success",
    details: {
      requestId: "req_129",
      triggerSource: "Chat",
      input: { task: "Process order" },
      output: { result: "Order processed" },
      durationMs: 3200,
    },
  },
  {
    id: "log_8",
    time: "2026-01-03T12:15:00Z",
    user: "Alice",
    action: "Update Settings",
    tool: "System",
    status: "approved",
    details: {
      requestId: "req_130",
      triggerSource: "Settings",
      input: { setting: "temperature", value: 0.7 },
      output: { success: true },
      durationMs: 200,
    },
  },
  {
    id: "log_9",
    time: "2026-01-03T12:30:00Z",
    user: "Bob",
    action: "Delete Tool",
    tool: "Tool",
    status: "success",
    details: {
      requestId: "req_131",
      triggerSource: "Settings",
      input: { toolName: "Old Tool" },
      output: { deleted: true },
      durationMs: 450,
    },
  },
  {
    id: "log_10",
    time: "2026-01-03T12:45:00Z",
    user: "Alice",
    action: "Send Email",
    tool: "Email",
    status: "denied",
    details: {
      requestId: "req_132",
      triggerSource: "Agent",
      input: { to: "external@example.com" },
      output: { error: "External email blocked" },
      durationMs: 250,
    },
  },
  {
    id: "log_11",
    time: "2026-01-03T13:00:00Z",
    user: "Bob",
    action: "Run Agent",
    tool: "Agent",
    status: "success",
    details: {
      requestId: "req_133",
      triggerSource: "Chat",
      input: { task: "Generate report" },
      output: { result: "Report generated" },
      durationMs: 2800,
    },
  },
  {
    id: "log_12",
    time: "2026-01-03T13:15:00Z",
    user: "Alice",
    action: "Update Settings",
    tool: "System",
    status: "success",
    details: {
      requestId: "req_134",
      triggerSource: "Settings",
      input: { setting: "maxTokens", value: 2048 },
      output: { success: true },
      durationMs: 180,
    },
  },
];

// Filter schema
const filterSchema = zod.object({
  user: zod.string().optional(),
  action: zod.string().optional(),
  tool: zod.string().optional(),
  dateRange: zod.enum(["last_24h", "last_7d", "last_30d"]).optional(),
});

type FilterFormData = zod.infer<typeof filterSchema>;

// Get unique values for filters
const uniqueUsers = Array.from(new Set(mockAuditLogs.map((log) => log.user)));
const uniqueActions = Array.from(
  new Set(mockAuditLogs.map((log) => log.action))
);
const uniqueTools = Array.from(new Set(mockAuditLogs.map((log) => log.tool)));

// Status badge configuration
const statusConfig: Record<
  LogStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive";
    icon: React.ReactNode;
  }
> = {
  success: {
    label: "Success",
    variant: "default",
    icon: <CheckCircle2Icon className="w-3 h-3" />,
  },
  approved: {
    label: "Approved",
    variant: "default",
    icon: <CheckCircle2Icon className="w-3 h-3" />,
  },
  denied: {
    label: "Denied",
    variant: "destructive",
    icon: <XCircleIcon className="w-3 h-3" />,
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    icon: <AlertCircleIcon className="w-3 h-3" />,
  },
  pending: {
    label: "Pending",
    variant: "secondary",
    icon: <ClockIcon className="w-3 h-3" />,
  },
};

// Format date for display
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

// Filter logs based on date range
function isInDateRange(dateString: string, range?: DateRangePreset): boolean {
  if (!range) return true;

  const logDate = new Date(dateString).getTime();
  const now = Date.now();
  const ranges: Record<DateRangePreset, number> = {
    last_24h: 24 * 60 * 60 * 1000,
    last_7d: 7 * 24 * 60 * 60 * 1000,
    last_30d: 30 * 24 * 60 * 60 * 1000,
  };

  return now - logDate <= ranges[range];
}

const LogsTab = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);
  const pageSize = 10;

  const {
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      user: "all",
      action: "all",
      tool: "all",
      dateRange: "last_24h",
    },
  });

  const filters = watch();

  // Filter logs based on form values
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      if (filters.user && filters.user !== "all" && log.user !== filters.user) {
        return false;
      }
      if (
        filters.action &&
        filters.action !== "all" &&
        log.action !== filters.action
      ) {
        return false;
      }
      if (filters.tool && filters.tool !== "all" && log.tool !== filters.tool) {
        return false;
      }
      if (!isInDateRange(log.time, filters.dateRange)) {
        return false;
      }
      return true;
    });
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const toggleRowExpansion = (logId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    reset({
      user: "all",
      action: "all",
      tool: "all",
      dateRange: "last_24h",
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.user !== "all" ||
    filters.action !== "all" ||
    filters.tool !== "all" ||
    filters.dateRange !== "last_24h";

  if (isLoading) {
    return (
      <ScrollArea className="flex flex-col gap-6 py-4 h-[calc(100vh-13rem)]">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex flex-col gap-6 py-4 h-[calc(100vh-13rem)]">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Review all AI and user actions in this workspace
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field>
                <FieldLabel htmlFor="filter-user">User</FieldLabel>
                <Controller
                  name="user"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="filter-user">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {uniqueUsers.map((user) => (
                          <SelectItem key={user} value={user}>
                            {user}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.user && (
                  <span className="text-xs text-destructive">
                    {errors.user.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="filter-action">Action</FieldLabel>
                <Controller
                  name="action"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="filter-action">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {uniqueActions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.action && (
                  <span className="text-xs text-destructive">
                    {errors.action.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="filter-tool">Tool</FieldLabel>
                <Controller
                  name="tool"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="filter-tool">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {uniqueTools.map((tool) => (
                          <SelectItem key={tool} value={tool}>
                            {tool}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tool && (
                  <span className="text-xs text-destructive">
                    {errors.tool.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="filter-date-range">Date Range</FieldLabel>
                <Controller
                  name="dateRange"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="filter-date-range">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_24h">Last 24h</SelectItem>
                        <SelectItem value="last_7d">Last 7 days</SelectItem>
                        <SelectItem value="last_30d">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.dateRange && (
                  <span className="text-xs text-destructive">
                    {errors.dateRange.message}
                  </span>
                )}
              </Field>
            </div>

            <div className="flex items-center justify-end mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <XIcon className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-sm text-muted-foreground">
                No logs found matching your filters
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => {
                  const isExpanded = expandedRows.has(log.id);
                  const statusInfo = statusConfig[log.status];

                  return (
                    <Collapsible
                      key={log.id}
                      open={isExpanded}
                      onOpenChange={() => toggleRowExpansion(log.id)}
                    >
                      <TableRow>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="h-6 w-6"
                            >
                              {isExpanded ? (
                                <ChevronDownIcon className="w-4 h-4" />
                              ) : (
                                <ChevronRightIcon className="w-4 h-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatDateTime(log.time)}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.tool}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="gap-1">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium mb-2">
                                    Request ID
                                  </p>
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {log.details.requestId}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium mb-2">
                                    Trigger Source
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {log.details.triggerSource || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium mb-2">
                                    Execution Duration
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {log.details.durationMs}ms
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-medium mb-2">
                                  Tool Input
                                </p>
                                <Card className="bg-background">
                                  <CardContent className="p-3">
                                    <pre className="text-xs font-mono overflow-x-auto">
                                      {JSON.stringify(
                                        log.details.input,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </CardContent>
                                </Card>
                              </div>

                              <div>
                                <p className="text-xs font-medium mb-2">
                                  Tool Output
                                </p>
                                <Card className="bg-background">
                                  <CardContent className="p-3">
                                    <pre className="text-xs font-mono overflow-x-auto">
                                      {JSON.stringify(
                                        log.details.output,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredLogs.length)} of{" "}
            {filteredLogs.length} logs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </ScrollArea>
  );
};

export default LogsTab;

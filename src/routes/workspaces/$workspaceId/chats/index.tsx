import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SendIcon,
  PlusIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  FileTextIcon,
  WrenchIcon,
  MessageSquareIcon,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import mockChatData from "@/data/mockChatData.json";

export const Route = createFileRoute("/workspaces/$workspaceId/chats/")({
  component: RouteComponent,
});

// Types
type MessageRole = "user" | "assistant";
type ToolStatus = "running" | "success" | "failed";

interface Source {
  name: string;
}

interface Tool {
  name: string;
  status: ToolStatus;
}

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
  sources?: Source[];
  tools?: Tool[];
}

interface Conversation {
  id: string;
  title: string;
}

// Mock data
const mockConversations: Conversation[] =
  mockChatData.conversations as Conversation[];
const mockMessages: Record<string, Message[]> = mockChatData.messages as Record<
  string,
  Message[]
>;

function RouteComponent() {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    mockConversations[0]?.id || ""
  );
  const [messages, setMessages] = useState<Message[]>(
    mockMessages[selectedConversationId] || []
  );
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Update messages when conversation changes
  useEffect(() => {
    const convMessages = mockMessages[selectedConversationId] || [];
    setMessages(convMessages);
    setIsStreaming(false);
  }, [selectedConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate streaming
  const simulateStreaming = (fullContent: string, messageId: string) => {
    setIsStreaming(true);
    const words = fullContent.split(" ");
    let currentContent = "";
    let wordIndex = 0;

    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        currentContent += (wordIndex > 0 ? " " : "") + words[wordIndex];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: currentContent, streaming: true }
              : msg
          )
        );
        wordIndex++;
      } else {
        clearInterval(streamInterval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, streaming: false } : msg
          )
        );
        setIsStreaming(false);
      }
    }, 50);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
    };

    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: "assistant",
      content: "This is a simulated streaming response. ",
      streaming: true,
      sources: [{ name: "example_source.pdf" }],
      tools: [{ name: "DB Query", status: "running" }],
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");

    // Simulate streaming
    setTimeout(() => {
      simulateStreaming(
        "This is a simulated streaming response. The assistant is processing your request and will provide a detailed answer.",
        assistantMessage.id
      );
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getToolIcon = (status: ToolStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle2Icon className="w-3.5 h-3.5" />;
      case "failed":
        return <XCircleIcon className="w-3.5 h-3.5" />;
      case "running":
        return <ClockIcon className="w-3.5 h-3.5 animate-spin" />;
    }
  };

  const getToolBadgeVariant = (
    status: ToolStatus
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
    }
  };

  const getStatusColor = (status: ToolStatus): string => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "failed":
        return "text-destructive";
      case "running":
        return "text-blue-500";
    }
  };

  const selectedMessages = messages;

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Section 2: Conversations Panel (Left) */}
      <div className="w-64 border-r border-border flex flex-col bg-muted/20">
        <div className="p-4 border-b border-border">
          <Button
            className="w-full"
            onClick={() => {
              // Create new conversation logic
              const newId = `conv_${Date.now()}`;
              setSelectedConversationId(newId);
              setMessages([]);
            }}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 h-[calc(100vh-20rem)]">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={
                  selectedConversationId === conv.id ? "secondary" : "ghost"
                }
                className="w-full justify-start"
                onClick={() => setSelectedConversationId(conv.id)}
              >
                {conv.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Section 1: Chat Header */}
        <div className="border-b border-border p-4 bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">AI Copilot</h1>
              <div className="flex items-center gap-4 mt-1">
                <Badge variant="secondary">GPT-4</Badge>
                <span className="text-xs text-muted-foreground">
                  Cost today: $0.23
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Chat Messages Area */}
        <ScrollArea
          className="flex-1 h-[calc(100vh-20rem)]"
          ref={scrollAreaRef}
        >
          {selectedMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquareIcon />
                  </EmptyMedia>
                  <EmptyTitle>Start a new conversation</EmptyTitle>
                  <EmptyDescription>
                    Ask a question or start a conversation with your AI copilot.
                    It can help you with tasks, answer questions, and more.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-6 space-y-8">
              {selectedMessages.map((message) => (
                <div key={message.id} className="space-y-3">
                  {/* Message Bubble */}
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      } rounded-none px-4 py-3`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                        {message.streaming && (
                          <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Sources Panel (Conditional) */}
                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[75%] bg-muted/30 border border-border/50 rounded-none p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-5 h-5 rounded-none bg-blue-500/10">
                              <FileTextIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              Sources
                            </span>
                          </div>
                          <div className="space-y-2">
                            {message.sources.map((source, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <div className="w-1 h-1 rounded-full bg-current" />
                                <span className="font-mono">{source.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Section 5: Tool Execution Panel (Conditional) */}
                  {message.role === "assistant" &&
                    message.tools &&
                    message.tools.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[75%] bg-muted/30 border border-border/50 rounded-none p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-5 h-5 rounded-none bg-yellow-500/10">
                              <WrenchIcon className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              Tool Execution
                            </span>
                          </div>
                          <div className="space-y-2.5">
                            {message.tools.map((tool, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-1.5 px-2 bg-background/50 rounded-none"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-foreground">
                                    {tool.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={getStatusColor(tool.status)}>
                                    {getToolIcon(tool.status)}
                                  </div>
                                  <Badge
                                    variant={getToolBadgeVariant(tool.status)}
                                    className="text-xs"
                                  >
                                    {tool.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Section 6: Message Composer */}
        <div className="p-4 border-t border-border bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[100px] max-h-[200px] resize-none text-sm"
                disabled={isStreaming}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isStreaming}
                size="default"
                className="self-end"
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize, formatFileType } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";
import { UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/workspaces/$workspaceId/knowledge")({
  component: RouteComponent,
});

interface Document {
  name: string;
  type: string;
  size: number;
  status: string;
  uploadedAt: Date;
}

const getFileStatusChip = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "success":
      return <Badge variant="default">Success</Badge>;
  }
};

function RouteComponent() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const dragAndDropRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) {
      return;
    }
    const newDocuments = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      status: "pending",
      uploadedAt: new Date(),
    }));
    setDocuments((prevDocuments) => [...prevDocuments, ...newDocuments]);
    toast.success(
      `${newDocuments.length} file${newDocuments.length > 1 ? "s" : ""} uploaded successfully`
    );
  };

  const handleUpload = () => {
    // Open document picker for PDF, TXT, and DOCX files
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      "application/pdf, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return;
      }
      const newDocuments = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        status: "pending",
        uploadedAt: new Date(),
      }));
      setDocuments((prevDocuments) => [...prevDocuments, ...newDocuments]);
      toast.success(
        `${newDocuments.length} file${newDocuments.length > 1 ? "s" : ""} uploaded successfully`
      );
    };

    // Must be attached to DOM to trigger input dialog on some browsers
    document.body.appendChild(input);
    input.click();

    // Remove the input after a short timeout to allow the file dialog to work
    setTimeout(() => {
      document.body.removeChild(input);
    }, 0);
  };

  return (
    <div className="flex flex-col h-screen gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-md text-muted-foreground">
          Upload documents for AI to learn
        </p>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-20 border-2 border-dashed border-gray-300 rounded-md p-4 h-1/3"
        ref={dragAndDropRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-xl font-bold">Upload Documents</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop documents here or click to upload
          </p>
        </div>

        <Button disabled={isDragging} onClick={handleUpload}>
          <UploadIcon className="w-4 h-4" />
          Upload Document
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Documents</h2>

        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TableCell className="text-ellipsis overflow-hidden max-w-xs">
                        {document.name}
                      </TableCell>
                    </TooltipTrigger>
                    <TooltipContent>{document.name}</TooltipContent>
                  </Tooltip>

                  <TableCell>{formatFileType(document.type)}</TableCell>
                  <TableCell>{formatFileSize(document.size)}</TableCell>
                  <TableCell>
                    {document.uploadedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getFileStatusChip(document.status)}</TableCell>
                  <TableCell>
                    <Button>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

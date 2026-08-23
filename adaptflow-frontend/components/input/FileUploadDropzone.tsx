"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string[];
}

export function FileUploadDropzone({ onFiles, accept = [".txt", ".md", ".csv", ".pdf"] }: FileUploadDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    onFiles([...files, ...acceptedFiles]);
  }, [files, onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, ext) => ({ ...acc, [ext]: [] }), {}),
    multiple: true,
  });

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFiles(next);
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-copper bg-copper/5" : "border-border hover:border-copper/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto text-silver mb-2" />
        <p className="text-sm text-ink">Drop files here or click to browse</p>
        <p className="text-xs text-silver mt-1">Accepts: {accept.join(", ")}</p>
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li key={i} className="flex items-center justify-between bg-board-panel-raised px-3 py-2 rounded-card">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-silver" />
                <span className="text-sm text-ink truncate max-w-[200px]">{file.name}</span>
              </div>
              <button type="button" onClick={() => removeFile(i)} className="text-silver hover:text-signal-critical">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

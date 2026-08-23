"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadDropzone } from "@/components/input/FileUploadDropzone";
import { DemoExamplePicker } from "@/components/input/DemoExamplePicker";
import { useCreateSession } from "@/lib/hooks/useSession";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  inputType: z.enum(["text", "file", "example"]),
  content: z.string().min(20, "Please describe your workflow in at least 20 characters."),
  exampleId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkflowInputForm() {
  const router = useRouter();
  const createSession = useCreateSession();
  const [activeTab, setActiveTab] = useState<string>("text");
  const [selectedExample, setSelectedExample] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { inputType: "text", content: "", exampleId: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      inputType: values.inputType,
      content: values.content,
      exampleId: values.exampleId || undefined,
    };
    try {
      const result = await createSession.mutateAsync(payload);
      router.push(`/workspace/session/${result.sessionId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create workflow. Please try again.";
      toast.error(message);
      console.error("Create session error:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-board-panel border border-border/50">
          <TabsTrigger value="text">Describe Workflow</TabsTrigger>
          <TabsTrigger value="file">Upload SOP / CSV</TabsTrigger>
          <TabsTrigger value="example">Demo Example</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Textarea
            {...form.register("content")}
            placeholder="Describe your workflow, e.g., 'When a support ticket comes in, it is manually triaged by a support agent, then escalated to a team lead if complex...'"
            className="min-h-[160px] bg-board-panel border-border text-ink placeholder:text-silver resize-none"
          />
          {form.formState.errors.content && (
            <p className="text-signal-critical text-xs mt-1">{form.formState.errors.content.message}</p>
          )}
        </TabsContent>

        <TabsContent value="file" className="mt-4">
          <FileUploadDropzone
            onFiles={(files) => {
              form.setValue("content", files.map((f) => f.name).join(", "));
              form.setValue("inputType", "file");
            }}
          />
        </TabsContent>

        <TabsContent value="example" className="mt-4">
          <DemoExamplePicker
            selectedId={selectedExample}
            onSelect={(id) => {
              setSelectedExample(id);
              form.setValue("exampleId", id);
              form.setValue("inputType", "example");
            }}
          />
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        disabled={createSession.isPending}
        className="w-full bg-copper hover:bg-copper-bright text-board-bg font-medium py-3"
      >
        {createSession.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Workflow...
          </>
        ) : (
          "Analyze Workflow"
        )}
      </Button>
    </form>
  );
}

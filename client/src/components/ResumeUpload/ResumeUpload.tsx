import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadResume, deleteResume, analyzeResume } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function ResumeUpload() {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: resume, isLoading } = useQuery({
    queryKey: ["/api/resume"],
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      toast({
        title: "Success",
        description:
          "Resume uploaded successfully! Skills extracted and ready for analysis.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      toast({
        title: "Resume Deleted",
        description: "Resume has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeResume,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      toast({
        title: "Analysis Complete",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type - DOCX only
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only DOCX files.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${Math.round(size / (1024 * 1024))} MB`;
  };

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-8">
      <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
        <span className="mr-3 text-2xl">📄</span>
        Resume Management
      </h2>

      {!resume ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-brand-purple bg-purple-50 dark:bg-purple-900/20"
              : "border-muted-foreground/40 hover:border-brand-purple hover:bg-muted/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-4">
            <span className="text-6xl block opacity-60">📁</span>
            <div>
              <p className="text-xl font-semibold text-foreground mb-2">
                Upload Your Resume
              </p>
              <p className="text-muted-foreground mb-6">
                Drop your DOCX file here, or click to browse
              </p>
            </div>
            <Button
              className="bg-brand-purple text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors text-base"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Choose File"}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">📄</div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100 text-lg">
                  {resume.originalName}
                </p>
                <div className="flex items-center space-x-4 text-sm text-green-700 dark:text-green-300">
                  <span>
                    Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(resume.fileSize)}</span>
                  {resume.hasSkills && (
                    <>
                      <span>•</span>
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="mr-1">✅</span>
                        Skills extracted
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={analyzeMutation.isPending}
                className="bg-brand-purple text-white hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors font-medium"
                data-testid="button-analyze-resume"
              >
                <span className="mr-2">🤖</span>
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg transition-colors font-medium border border-blue-200 dark:border-blue-800/30"
                variant="outline"
                disabled={uploadMutation.isPending}
              >
                Replace
              </Button>
              <Button
                onClick={() => deleteMutation.mutate()}
                className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 px-4 py-2 rounded-lg transition-colors font-medium border border-red-200 dark:border-red-800/30"
                variant="outline"
                disabled={deleteMutation.isPending}
                data-testid="button-delete-resume"
              >
                Delete
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {uploadMutation.isPending && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-purple border-t-transparent mr-3"></div>
            <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              Uploading and analyzing resume...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGeminiApiKey } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function APIConfig() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateKeyMutation = useMutation({
    mutationFn: updateGeminiApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      setApiKey("");
      toast({
        title: "Success",
        description: "Gemini API key updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    updateKeyMutation.mutate(apiKey);
  };

  const startEditing = () => {
    setIsEditing(true);
    setApiKey("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setApiKey("");
  };

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-8 max-w-lg mx-auto">
      <h3 className="text-xl font-bold flex items-center mb-6 text-foreground">
        <span className="text-brand-purple text-2xl mr-2">🔑</span>
        AI Configuration
      </h3>
      <div className="space-y-6">
        {!isEditing ? (
          <>
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">Gemini API Key</label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={user?.hasGeminiKey ? "sk-ant-api03-..." : "Not configured"}
                  readOnly
                  className="w-full px-4 py-2 border border-border rounded-lg bg-muted pr-12 text-lg text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-4 top-2.5 text-lg text-muted-foreground hover:text-brand-purple transition-colors"
                  aria-label="Toggle API Key"
                >
                  {showKey ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Encrypted and stored securely</p>
            </div>
            {user?.hasGeminiKey ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <div className="flex items-center">
                  <span className="mr-2 text-green-600 dark:text-green-400 text-lg">✔️</span>
                  <span className="text-sm text-green-900 dark:text-green-100 font-medium">API Connected</span>
                </div>
                <span className="text-xs text-green-700 dark:text-green-300 font-semibold">Valid</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                <div className="flex items-center">
                  <span className="mr-2 text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                  <span className="text-sm text-amber-800 dark:text-amber-100 font-medium">API Key Required</span>
                </div>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Not Set</span>
              </div>
            )}
            <Button
              onClick={startEditing}
              className="w-full bg-brand-purple text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors text-base tracking-tight"
            >
              {user?.hasGeminiKey ? "Update API Key" : "Configure API Key"}
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-semibold text-foreground mb-2">Gemini API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-2 border border-border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Get your API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple font-semibold underline hover:text-purple-700"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={updateKeyMutation.isPending}
                className="flex-1 bg-brand-purple text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors text-base"
              >
                {updateKeyMutation.isPending ? "Saving..." : "Save API Key"}
              </Button>
              <Button
                type="button"
                onClick={cancelEditing}
                variant="outline"
                className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg font-semibold hover:bg-muted/80 transition-colors text-base border-border"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        {!user?.hasGeminiKey && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg">
            <div className="flex items-start">
              <span className="mr-3 text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Why do I need an API key?</p>
                <p>
                  SkillGap AI uses Google's Gemini AI to analyze resumes and job postings.{" "}
                  Your personal API key ensures secure, private analysis of your data.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

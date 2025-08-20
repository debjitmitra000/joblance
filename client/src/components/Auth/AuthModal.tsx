import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, register, setAuthToken } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      login(email, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      toast({
        title: "Success",
        description: "Welcome back! Ready to analyze jobs with JOBLANCE.",
      });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => 
      register(name, email, password),
    onSuccess: (data) => {
      setAuthToken(data.token);
      toast({
        title: "Account Created",
        description: "Welcome to JOBLANCE! Upload your resume to get started.",
      });
      onClose();
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "login") {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password
      });
    } else {
      registerMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative border border-border">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {mode === "login" ? "Welcome Back" : "Join JOBLANCE"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "login" 
              ? "Sign in to continue your job analysis journey" 
              : "Start analyzing job opportunities with AI"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
              placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-brand-purple text-white py-3 px-4 rounded-xl font-semibold mt-6 hover:bg-purple-600 transition-colors"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {(loginMutation.isPending || registerMutation.isPending) ? "Processing..." : 
             (mode === "login" ? "Sign In" : "Create Account")}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              className="text-brand-purple font-semibold hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Hide initial loader when React app is ready
  useEffect(() => {
    const hideInitialLoader = () => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        document.body.classList.add('app-loaded');
        setTimeout(() => {
          loader.classList.add('hidden');
        }, 500);
      }
    };

    // Hide loader once auth state is determined
    if (!isLoading) {
      // Small delay to ensure smooth transition
      setTimeout(hideInitialLoader, 800);
    }
  }, [isLoading]);

  // Don't render anything while loading - let HTML loader handle it
  if (isLoading) {
    return null;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Dashboard} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="joblance-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
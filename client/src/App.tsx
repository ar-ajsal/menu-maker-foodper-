import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/Auth";
import PublicMenu from "@/pages/PublicMenu";
import Landing from "@/pages/Landing";

function Router() {
  return (
    <Switch>
      {/* Public Landing */}
      <Route path="/" component={Landing} />
      
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />

      {/* App Routes */}
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Public Menu Route */}
      <Route path="/menu/:slug" component={PublicMenu} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

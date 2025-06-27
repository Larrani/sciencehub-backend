import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ContentForm from "@/pages/admin/content-form";
import NotFound from "@/pages/not-found";

function useAdminAuth() {
  const { data: adminStatus, isLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  return {
    isLoggedIn: adminStatus?.isLoggedIn || false,
    admin: adminStatus?.admin,
    isLoading,
  };
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isLoggedIn ? <Component /> : <AdminLogin />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} />} />
      <Route path="/admin/content/new" component={() => <ProtectedRoute component={ContentForm} />} />
      <Route path="/admin/content/:id/edit" component={() => <ProtectedRoute component={ContentForm} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-black text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

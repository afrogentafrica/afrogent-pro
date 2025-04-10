import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import BookingsPage from "@/pages/BookingsPage";
import StylistsPage from "@/pages/StylistsPage";
import ServicesPage from "@/pages/ServicesPage";
import ClientsPage from "@/pages/ClientsPage";
import MobileAppPage from "@/pages/MobileAppPage";
import { isAuthenticated } from "./lib/auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const [location, setLocation] = useLocation();

  // Redirect from root to dashboard if authenticated, otherwise to login
  useEffect(() => {
    if (location === "/") {
      if (isAuthenticated()) {
        setLocation("/dashboard");
      } else {
        setLocation("/login");
      }
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/bookings" component={BookingsPage} />
      <Route path="/stylists" component={StylistsPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/clients" component={ClientsPage} />
      <Route path="/mobile-app" component={MobileAppPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

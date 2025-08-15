import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import PWASupport from "@/components/PWASupport";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import Dashboard from "@/pages/Dashboard";
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import Articles from "@/pages/Articles";
import Suppliers from "@/pages/Suppliers";
import Requestors from "@/pages/Requestors";
import PurchaseRequests from "@/pages/PurchaseRequests";
import PurchaseFollow from "@/pages/PurchaseFollow";
import StockStatus from "@/pages/StockStatus";
import Reception from "@/pages/Reception";
import Outbound from "@/pages/Outbound";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={EnhancedDashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/enhanced-dashboard" component={EnhancedDashboard} />
        <Route path="/articles" component={Articles} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/requestors" component={Requestors} />
        <Route path="/purchase-requests" component={PurchaseRequests} />
        <Route path="/purchase-follow" component={PurchaseFollow} />
        <Route path="/stock-status" component={StockStatus} />
        <Route path="/reception" component={Reception} />
        <Route path="/outbound" component={Outbound} />
        <Route path="/reports" component={Reports} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/settings" component={Settings} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <KeyboardShortcuts />
        <Toaster />
        <Router />
        <PWASupport />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

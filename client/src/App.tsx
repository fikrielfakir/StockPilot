import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Articles from "@/pages/Articles";
import Suppliers from "@/pages/Suppliers";
import Requestors from "@/pages/Requestors";
import PurchaseRequests from "@/pages/PurchaseRequests";
import Reception from "@/pages/Reception";
import Outbound from "@/pages/Outbound";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/articles" component={Articles} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/requestors" component={Requestors} />
        <Route path="/purchase-requests" component={PurchaseRequests} />
        <Route path="/reception" component={Reception} />
        <Route path="/outbound" component={Outbound} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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

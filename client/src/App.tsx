import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Employees from "@/pages/employees";
import Dealers from "@/pages/dealers";
import Products from "@/pages/products";
import PurchaseOrders from "@/pages/purchase-orders";
import Inventory from "@/pages/inventory";
import SavingSchemes from "@/pages/saving-schemes";
import Reports from "@/pages/reports";
import PriceMaster from "@/pages/price-master";
import ProductCategories from "@/pages/product-categories";
import AddProduct from "@/pages/add-product";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // If there's an authentication error or user is not authenticated, show auth page
  if (error || !isAuthenticated) {
    return (
      <Switch>
        <Route path="*" component={AuthPage} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/customers" component={Customers} />
      <Route path="/employees" component={Employees} />
      <Route path="/dealers" component={Dealers} />
      <Route path="/products" component={Products} />
      <Route path="/products/add" component={AddProduct} />
      <Route path="/product-categories" component={ProductCategories} />
      <Route path="/purchase-orders" component={PurchaseOrders} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/saving-schemes" component={SavingSchemes} />
      <Route path="/reports" component={Reports} />
      <Route path="/price-master" component={PriceMaster} />
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

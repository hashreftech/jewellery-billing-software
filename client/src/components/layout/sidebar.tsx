import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Gem, 
  LayoutDashboard, 
  Users, 
  Bus, 
  Handshake, 
  Package, 
  Tag,
  ShoppingCart, 
  Archive, 
  PiggyBank, 
  BarChart3, 
  DollarSign 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Employees", href: "/employees", icon: Bus },
  { name: "Dealers", href: "/dealers", icon: Handshake },
  { name: "Products", href: "/products", icon: Package },
  { name: "Product Categories", href: "/product-categories", icon: Tag },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Archive },
  { name: "Saving Schemes", href: "/saving-schemes", icon: PiggyBank },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Price Master", href: "/price-master", icon: DollarSign },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <div className="flex items-center">
            <Gem className="text-gold-400 text-2xl mr-3" />
            <h1 className="text-xl font-bold text-white">JewelryMS</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                    )} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User Menu */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-medium text-white">JD</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

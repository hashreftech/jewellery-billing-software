import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  DollarSign,
  ChevronDown,
  Plus,
  List,
  BarChart3 as BarChart3Icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navigationMenu = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    type: "single"
  },
  { 
    name: "People", 
    icon: Users,
    type: "dropdown",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Employees", href: "/employees", icon: Bus },
      { name: "Dealers", href: "/dealers", icon: Handshake },
    ]
  },
  { 
    name: "Products", 
    icon: Package,
    type: "dropdown",
    items: [
      { name: "List Products", href: "/products", icon: List },
      { name: "Add Product", href: "/products/add", icon: Plus },
      { name: "Product Categories", href: "/product-categories", icon: Tag },
      { name: "Product Stock", href: "/inventory", icon: Archive },
    ]
  },
  { 
    name: "Orders", 
    href: "/purchase-orders", 
    icon: ShoppingCart,
    type: "single"
  },
  { 
    name: "Financial", 
    icon: DollarSign,
    type: "dropdown",
    items: [
      { name: "Price Master", href: "/price-master", icon: DollarSign },
      { name: "Saving Schemes", href: "/saving-schemes", icon: PiggyBank },
    ]
  },
  { 
    name: "Reports", 
    href: "/reports", 
    icon: BarChart3,
    type: "single"
  },
];

export default function HorizontalNavbar() {
  const [location] = useLocation();

  const isActiveMenu = (item: any) => {
    if (item.type === "single") {
      return location === item.href;
    }
    // For dropdown menus, check if any submenu item is active
    return item.items?.some((subItem: any) => location === subItem.href);
  };

  const isActiveMenuItem = (href: string) => {
    return location === href;
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Gem className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">JewelryMS</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigationMenu.map((item) => {
              const isActive = isActiveMenu(item);
              
              if (item.type === "single") {
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              }

              // Dropdown menu
              return (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {item.items?.map((subItem: any) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                            isActiveMenuItem(subItem.href)
                              ? "bg-primary/10 text-primary"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <subItem.icon className="mr-2 h-4 w-4" />
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm">
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - can be expanded later */}
      <div className="md:hidden">
        {/* Mobile menu content would go here */}
      </div>
    </nav>
  );
}

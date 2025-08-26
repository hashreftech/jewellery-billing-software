import { ReactNode } from "react";
import HorizontalNavbar from "./horizontal-navbar";
import Topbar from "./topbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Horizontal Navigation */}
      <HorizontalNavbar />
      
      {/* Top Bar with search and user menu */}
      <Topbar />
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

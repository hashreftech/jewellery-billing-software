import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Users, ShoppingCart, BarChart3, Shield, Clock } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: "Customer Management",
      description: "Comprehensive customer database with automatic ID generation and search capabilities"
    },
    {
      icon: Gem,
      title: "Product Catalog",
      description: "Complete jewelry inventory with barcode scanning and dynamic pricing"
    },
    {
      icon: ShoppingCart,
      title: "Purchase Orders",
      description: "Streamlined order processing with real-time price calculations"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Detailed reports on sales, inventory, and customer analytics"
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Role-based authentication with employee management"
    },
    {
      icon: Clock,
      title: "Saving Schemes",
      description: "Flexible saving schemes with automatic payment tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Gem className="w-6 h-6 text-gold-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">JewelryMS</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Jewelry Shop 
              <span className="text-primary-500"> Management System</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Streamline your jewelry business operations with our complete management solution. 
              From inventory tracking to customer management, everything you need in one place.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-3"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Jewelry Business
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools necessary to efficiently run your jewelry shop operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary-500">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-12">
            Trusted by Jewelry Businesses Worldwide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-white">
              <div className="text-4xl font-bold text-gold-400 mb-2">10,000+</div>
              <div className="text-lg">Products Managed</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold text-gold-400 mb-2">5,000+</div>
              <div className="text-lg">Happy Customers</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold text-gold-400 mb-2">99.9%</div>
              <div className="text-lg">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Jewelry Business?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of jewelry shop owners who have streamlined their operations with JewelryMS.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-3"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Gem className="w-5 h-5 text-gold-400" />
            </div>
            <span className="text-xl font-bold">JewelryMS</span>
          </div>
          <p className="text-gray-400">
            © 2025 JewelryMS. All rights reserved. Built for jewelry professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}

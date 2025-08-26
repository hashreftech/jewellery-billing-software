import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AddProduct() {
  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Create a new product in your inventory</p>
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Product Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU/Barcode *</Label>
              <Input
                id="sku"
                placeholder="Enter SKU or barcode"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Select category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purity">Purity</Label>
              <Input
                id="purity"
                placeholder="e.g., 22K, 18K, 916"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="netWeight">Net Weight (g)</Label>
              <Input
                id="netWeight"
                type="number"
                step="0.001"
                placeholder="0.000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grossWeight">Gross Weight (g)</Label>
              <Input
                id="grossWeight"
                type="number"
                step="0.001"
                placeholder="0.000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stoneWeight">Stone Weight (g)</Label>
              <Input
                id="stoneWeight"
                type="number"
                step="0.001"
                placeholder="0.000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wastageType">Wastage Charge Type</Label>
              <select
                id="wastageType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Percentage">Percentage</option>
                <option value="Per Gram">Per Gram</option>
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Per Piece">Per Piece</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wastageValue">Wastage Charge Value</Label>
              <Input
                id="wastageValue"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="makingType">Making Charge Type</Label>
              <select
                id="makingType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Percentage">Percentage</option>
                <option value="Per Gram">Per Gram</option>
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Per Piece">Per Piece</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="makingValue">Making Charge Value</Label>
              <Input
                id="makingValue"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

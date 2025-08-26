#!/bin/bash

# Array of files to update
files=(
  "client/src/pages/employees.tsx"
  "client/src/pages/dealers.tsx"
  "client/src/pages/inventory.tsx"
  "client/src/pages/price-master.tsx"
  "client/src/pages/product-categories.tsx"
  "client/src/pages/purchase-orders.tsx"
  "client/src/pages/reports.tsx"
  "client/src/pages/saving-schemes.tsx"
)

for file in "${files[@]}"; do
  echo "Updating $file..."
  
  # Replace Sidebar import with Layout import
  sed -i '' 's/import Sidebar from "@\/components\/layout\/sidebar";/import Layout from "@\/components\/layout\/layout";/g' "$file"
  sed -i '' 's/import Topbar from "@\/components\/layout\/topbar";//g' "$file"
  
  # Replace layout structure
  sed -i '' 's/<div className="flex h-screen bg-gray-50">/<Layout>/g' "$file"
  sed -i '' 's/<Sidebar \/>//g' "$file"
  sed -i '' 's/<div className="flex flex-col flex-1 overflow-hidden">//g' "$file"
  sed -i '' 's/<Topbar \/>//g' "$file"
  sed -i '' 's/<main className="flex-1 overflow-y-auto p-6">//g' "$file"
  
  # Fix closing tags
  sed -i '' 's/<\/main>/<\/Layout>/g' "$file"
  sed -i '' '/^[[:space:]]*<\/div>$/d' "$file"
  
done

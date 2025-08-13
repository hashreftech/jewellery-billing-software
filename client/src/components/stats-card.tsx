import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  change?: string;
  changeType?: "positive" | "negative";
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  change,
  changeType = "positive",
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            </div>
          </div>
          {change && (
            <div className="bg-gray-50 px-5 py-3 mt-5 -mx-5 -mb-5">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", iconColor)}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span
              className={cn(
                "font-medium",
                changeType === "positive" ? "text-green-600" : "text-red-600"
              )}
            >
              {change}
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      )}
    </Card>
  );
}

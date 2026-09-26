
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
    iconColor: string;
    iconBackground: string;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    iconColor,
    iconBackground,
}: StatsCardProps) {
    return (
        <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-900">
                        {value}
                    </h3>

                    <p className="text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className={`rounded-xl p-3 ${iconBackground}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </CardContent>
        </Card>
    );
}

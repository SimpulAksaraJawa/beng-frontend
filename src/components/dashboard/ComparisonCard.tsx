import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  windowLabel: string;
  icon: any;
  color: string;
  data: {
    current: number;
    percentage: number;
  };
}

export default function ComparisonCard({ title, windowLabel, icon: Icon, color, data }: Props) {
  const isUp = data.percentage >= 0;

  return (
    <Card className="col-span-2 row-span-1">
      <CardHeader className="pt-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{windowLabel}</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${color}`}>
          <Icon size={26} />
        </div>

        <div>
          <p className="text-2xl font-bold">{data.current}</p>
          <p
            className={`text-sm font-semibold ${
              isUp ? "text-green-700" : "text-red-700"
            }`}
          >
            {isUp ? "+" : ""}
            {data.percentage}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

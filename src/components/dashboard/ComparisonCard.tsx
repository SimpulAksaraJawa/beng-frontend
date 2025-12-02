import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface Props {
  title: string;
  windowLabel: string;
  icon: any;
  color: string;
  unit?: string;
  data: {
    current: number;
    previous: number | null;
    percentage: number | null;
  };
}
export default function ComparisonCard({
  title,
  windowLabel,
  icon: Icon,
  color,
  unit,
  data,
}: Props) {
  const isNew = data.percentage === null;
  const isUp = data.percentage !== null && data.percentage >= 0;

  return (
    <Card className="col-span-2 row-span-1 gap-2 flex flex-col">
      <CardHeader className="pt-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      {/* Push content + footer to bottom */}
      <div className="flex flex-col mt-auto">
        <CardContent className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`size-12 flex items-center justify-center rounded-xl ${color}`}
          >
            <Icon size={26} />
          </div>

          {/* Numbers */}
          <div className="flex flex-col">
            <div className="flex flex-row items-baseline gap-1">
              <p className="text-2xl font-bold">{data.current}</p>

              {unit && (
                <span className="text-base text-muted-foreground">{unit}</span>
              )}
            </div>

            {/* Percentage change */}
            {isNew ? (
              <p className="text-sm font-semibold text-green-700">New!</p>
            ) : (
              <p
                className={`text-sm font-semibold ${
                  isUp ? "text-green-700" : "text-red-700"
                }`}
              >
                {isUp ? "+" : ""}
                {data.percentage}%
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>{windowLabel}</CardFooter>
      </div>
    </Card>
  );
}


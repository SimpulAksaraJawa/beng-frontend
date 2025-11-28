import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface Props {
  title: string;
  windowLabel: string;
  icon: any;
  color: string;
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
  data,
}: Props) {
  const isNew = data.percentage === null;
  const isUp = data.percentage !== null && data.percentage >= 0;

  return (
    <Card className="col-span-2 row-span-1">
      <CardHeader className="pt-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{windowLabel}</CardDescription>
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`size-12 flex items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={26} />
        </div>

        {/* Numbers */}
        <div className="flex flex-col">
          <div className="flex flex-row gap-1 items-end">
            <p className="text-2xl/tight font-bold ">{data.current}</p>

            {/* Previous value */}
            <p className="text-sm font-medium text-gray-500">
              {data.previous === null ? "-" : data.previous}
            </p>
          </div>
          {/* Current value */}

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
    </Card>
  );
}

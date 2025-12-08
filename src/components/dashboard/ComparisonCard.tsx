import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowUpRightFromSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // <-- make sure this exists

interface Props {
  title: string;
  windowLabel: string;
  icon: any;
  color: string;
  unit?: string;
  redirectTo?: string;
  className?: string; // <-- added
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
  redirectTo,
  className,
  data,
}: Props) {
  const isNew = data.percentage === null;
  const isUp = data.percentage !== null && data.percentage >= 0;

  const navigate = useNavigate();
  const handleRedirect = () => {
    if (redirectTo) navigate(redirectTo);
  };

  return (
    <Card
      className={cn(
        "col-span-2 row-span-1 gap-2 flex flex-col",
        className // <-- apply parent class
      )}
    >
      <CardHeader className="pt-6 flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>

        {redirectTo && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedirect}
            className="ml-auto"
          >
            <ArrowUpRightFromSquareIcon size={5} />
          </Button>
        )}
      </CardHeader>

      <div className="flex flex-col mt-auto">
        <CardContent className="flex items-center gap-4">
          <div
            className={`size-12 flex items-center justify-center rounded-xl ${color}`}
          >
            <Icon size={26} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{data.current}</p>

              {unit && (
                <span className="text-base text-muted-foreground">{unit}</span>
              )}
            </div>

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

        <CardFooter className="text-gray-500">{windowLabel}</CardFooter>
      </div>
    </Card>
  );
}

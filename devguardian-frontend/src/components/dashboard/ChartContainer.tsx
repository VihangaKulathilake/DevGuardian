import * as React from "react";
import Card from "../ui/Card";
import { cn } from "@/lib/utils";

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  className,
}) => {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={cn("w-full h-full flex flex-col", className)}
    >
      <div className="flex-1 w-full min-h-[300px] flex items-center justify-center relative mt-2">
        {children}
      </div>
    </Card>
  );
};

export default ChartContainer;

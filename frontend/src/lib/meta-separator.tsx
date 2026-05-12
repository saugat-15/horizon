import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

export function MetaSeparator({ className }: { className?: string }) {
  return (
    <Circle
      aria-hidden
      className={cn(
        "inline-block size-[5px] shrink-0 align-middle fill-muted-foreground text-muted-foreground",
        className,
      )}
      strokeWidth={0}
    />
  );
}

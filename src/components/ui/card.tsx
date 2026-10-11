import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A bordered surface. Add `interactive` when the whole card is a link: it
 * lifts on hover and shows a ring when the link inside it has focus.
 */
function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground",
        interactive &&
          "transition-[box-shadow,transform,border-color] duration-200 ease-soft hover:-translate-y-0.5 hover:border-input hover:shadow-lift has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("grid gap-1.5 p-5 pb-0", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="card-title" className={cn("type-title-md", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex items-center gap-3 border-t bg-muted/40 px-5 py-4", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

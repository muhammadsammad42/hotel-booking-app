import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-150 ease-soft hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" aria-hidden />
      {children}
    </Link>
  );
}

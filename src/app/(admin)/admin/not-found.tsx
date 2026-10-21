import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminNotFound() {
  return (
    <div className="rounded-xl border bg-card">
      <EmptyState
        headingLevel="h1"
        title="Not found"
        description="That hotel, room type or page does not exist, or it has been removed."
        action={
          <Button asChild>
            <Link href="/admin">Back to the overview</Link>
          </Button>
        }
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteAmenityAction, saveAmenityAction } from "@/app/(admin)/admin/_actions/catalog";
import { AmenityIcon } from "@/components/hotel/amenity-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AMENITY_CATEGORIES, amenitySchema, type AmenityInput } from "@/lib/validation/admin";

export type AmenityRow = { id: string; name: string; iconKey: string; category: string; hotels: number; rooms: number };

const label = (category: string) => category.charAt(0) + category.slice(1).toLowerCase();

function AmenityDialog({
  open,
  onOpenChange,
  amenity,
  iconKeys,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amenity: AmenityRow | null;
  iconKeys: string[];
}) {
  const router = useRouter();
  const [values, setValues] = React.useState<AmenityInput>({ name: "", iconKey: "wifi", category: "GENERAL" });
  const [errors, setErrors] = React.useState<Partial<Record<keyof AmenityInput, string>>>({});
  const [formError, setFormError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();

  // Load the amenity being edited each time the dialog opens.
  const [openedFor, setOpenedFor] = React.useState<string | null>(null);
  const key = open ? (amenity?.id ?? "new") : null;
  if (key !== openedFor) {
    setOpenedFor(key);
    if (open) {
      setValues(amenity ? { name: amenity.name, iconKey: amenity.iconKey, category: amenity.category as AmenityInput["category"] } : { name: "", iconKey: "wifi", category: "GENERAL" });
      setErrors({});
      setFormError(undefined);
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = amenitySchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    startTransition(async () => {
      const result = await saveAmenityAction(values, amenity?.id);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.formError);
        return;
      }
      onOpenChange(false);
      toast.success(result.message, { description: values.name });
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{amenity ? `Edit ${amenity.name}` : "New amenity"}</DialogTitle>
            <DialogDescription>Hotels and room types pick from this list.</DialogDescription>
          </DialogHeader>
          {formError && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {formError}
            </p>
          )}
          <Field label="Name" error={errors.name} required>
            <Input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} maxLength={60} />
          </Field>
          <Field label="Category" error={errors.category} required>
            <Select value={values.category} onValueChange={(category) => setValues((current) => ({ ...current, category: category as AmenityInput["category"] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AMENITY_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {label(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Icon</legend>
            <div className="grid max-h-48 grid-cols-7 gap-1.5 overflow-y-auto rounded-lg border p-2 sm:grid-cols-9">
              {iconKeys.map((iconKey) => (
                <label
                  key={iconKey}
                  title={iconKey}
                  className={cn(
                    "flex aspect-square cursor-pointer items-center justify-center rounded-md border border-transparent transition-colors duration-150 ease-soft hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    values.iconKey === iconKey && "border-primary bg-primary/10 text-primary",
                  )}
                >
                  <input
                    type="radio"
                    name="iconKey"
                    value={iconKey}
                    checked={values.iconKey === iconKey}
                    onChange={() => setValues((current) => ({ ...current, iconKey }))}
                    className="sr-only"
                  />
                  <AmenityIcon iconKey={iconKey} className="size-5" />
                  <span className="sr-only">{iconKey.replace(/-/g, " ")}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {amenity ? "Save amenity" : "Add amenity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AmenityManager({ amenities, iconKeys }: { amenities: AmenityRow[]; iconKeys: string[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState("");
  const [editing, setEditing] = React.useState<AmenityRow | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<AmenityRow | null>(null);
  const [rows, removeOptimistic] = React.useOptimistic(amenities, (current: AmenityRow[], id: string) => current.filter((row) => row.id !== id));
  const [pending, startTransition] = React.useTransition();
  const shown = rows.filter((row) => `${row.name} ${row.category}`.toLowerCase().includes(filter.trim().toLowerCase()));

  function confirmDelete() {
    const target = deleting;
    if (!target) return;
    setDeleting(null);
    startTransition(async () => {
      removeOptimistic(target.id);
      const result = await deleteAmenityAction(target.id);
      if (!result.ok) {
        toast.error("Nothing was deleted", { description: result.formError });
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Filter amenities</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by name or category" className="pl-10" />
        </label>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <PlusIcon aria-hidden />
          New amenity
        </Button>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState headingLevel="h2" title={filter ? "No amenity matches" : "No amenities yet"} description={filter ? "Try another word." : "Add the first amenity hotels can offer."} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="relative overflow-x-auto">
            <table className={cn("w-full min-w-[36rem] text-sm transition-opacity duration-150", pending && "opacity-70")}>
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">Amenity</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Category</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Used by</th>
                  <th scope="col" className="py-2.5 pr-5 pl-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((row) => (
                  <tr key={row.id} className="transition-colors duration-150 ease-soft hover:bg-accent/50">
                    <td className="py-2.5 pr-3 pl-5">
                      <span className="flex items-center gap-3 font-medium">
                        <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                          <AmenityIcon iconKey={row.iconKey} className="size-4" />
                        </span>
                        {row.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{label(row.category)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                      {row.hotels} {row.hotels === 1 ? "hotel" : "hotels"}, {row.rooms} room {row.rooms === 1 ? "type" : "types"}
                    </td>
                    <td className="py-2.5 pr-5 pl-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditing(row);
                            setDialogOpen(true);
                          }}
                        >
                          <PencilIcon aria-hidden />
                          <span className="sr-only">Edit {row.name}</span>
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(row)}>
                          <Trash2Icon className="text-destructive" aria-hidden />
                          <span className="sr-only">Delete {row.name}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AmenityDialog open={dialogOpen} onOpenChange={setDialogOpen} amenity={editing} iconKeys={iconKeys} />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.name}?</DialogTitle>
            <DialogDescription>
              {deleting && deleting.hotels + deleting.rooms > 0
                ? `It is removed from ${deleting.hotels} ${deleting.hotels === 1 ? "hotel" : "hotels"} and ${deleting.rooms} room ${deleting.rooms === 1 ? "type" : "types"}. This cannot be undone.`
                : "No hotel uses it. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep it</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete amenity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

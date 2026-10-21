"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveRoomTypeAction } from "@/app/(admin)/admin/_actions/catalog";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safe } from "@/lib/safe-action";
import { roomTypeSchema, slugify } from "@/lib/validation/admin";

import type { RoomTypeFormValues } from "@/lib/admin/form-values";

import { AmenityPicker, type AmenityOption } from "./amenity-picker";
import { collectErrors, focusFirstError, FormCard, SectionedForm, type FormSection } from "./form-layout";
import { ImageManager } from "./image-manager";

const SECTIONS: FormSection[] = [
  { id: "basics", title: "Basics", description: "The name and story guests see on the room card." },
  { id: "capacity", title: "Capacity", description: "Who fits, and how much space they get." },
  { id: "pricing", title: "Price and inventory", description: "The default nightly price. Change specific dates on the Rates page." },
  { id: "photos", title: "Photos", description: "The first photo leads the room card." },
  { id: "amenities", title: "In the room", description: "Amenities specific to this room type." },
  { id: "visibility", title: "Visibility", description: "Whether guests can book this room type." },
];

const FIELDS: Record<string, string[]> = {
  basics: ["name", "slug", "description"],
  capacity: ["maxGuests", "beds", "sizeSqm"],
  pricing: ["basePrice", "totalInventory"],
  photos: ["images"],
};

export function RoomTypeForm({
  hotelId,
  roomTypeId,
  initial,
  amenities,
  uploadsEnabled,
}: {
  hotelId: string;
  roomTypeId?: string;
  initial: RoomTypeFormValues;
  amenities: AmenityOption[];
  uploadsEnabled: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = React.useState(initial);
  const [saved, setSaved] = React.useState(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = React.useState<Record<number, string>>({});
  const [formError, setFormError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const backHref = `/admin/hotels/${hotelId}#room-types`;

  const set = <K extends keyof RoomTypeFormValues>(key: K, value: RoomTypeFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };
  const text = (key: "name" | "slug" | "description" | "beds" | "maxGuests" | "sizeSqm" | "basePrice" | "totalInventory") => ({
    name: key,
    value: values[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, event.target.value),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const parsed = roomTypeSchema.safeParse(values);
    if (!parsed.success) {
      const { fields, images } = collectErrors(parsed.error);
      setErrors(fields);
      setImageErrors(images);
      // After React has rendered the error states.
      window.setTimeout(() => focusFirstError(SECTIONS, FIELDS, fields, images), 0);
      return;
    }
    startTransition(async () => {
      const result = await safe(saveRoomTypeAction(hotelId, values, roomTypeId));
      if (!result.ok) {
        setErrors((result.fieldErrors as Record<string, string>) ?? {});
        setFormError(result.formError);
        return;
      }
      setSaved(values);
      toast.success(result.message);
      if (!roomTypeId) router.push(backHref);
      else router.refresh();
    });
  }

  return (
    <SectionedForm
      sections={SECTIONS}
      onSubmit={submit}
      pending={pending}
      dirty={dirty}
      submitLabel={roomTypeId ? "Save room type" : "Create room type"}
      cancelHref={backHref}
      formError={formError}
    >
      <FormCard section={SECTIONS[0]}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Room name" hint="For example Caldera View Suite" error={errors.name} required>
            <Input {...text("name")} onBlur={() => !values.slug && set("slug", slugify(values.name))} />
          </Field>
          <Field label="Short name for links" hint="Made from the name if left empty" error={errors.slug}>
            <Input {...text("slug")} placeholder={slugify(values.name) || "made from the name"} />
          </Field>
        </div>
        <Field label="Description" error={errors.description} required>
          <Textarea {...text("description")} rows={4} maxLength={2000} />
        </Field>
      </FormCard>

      <FormCard section={SECTIONS[1]}>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Sleeps" hint="Guests per room" error={errors.maxGuests} required>
            <Input {...text("maxGuests")} type="number" min={1} max={10} inputMode="numeric" />
          </Field>
          <Field label="Beds" hint="For example 1 king bed" error={errors.beds} required>
            <Input {...text("beds")} />
          </Field>
          <Field label="Size (m²)" error={errors.sizeSqm} required>
            <Input {...text("sizeSqm")} type="number" min={5} inputMode="numeric" />
          </Field>
        </div>
      </FormCard>

      <FormCard section={SECTIONS[2]}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Base price per night (USD)" hint="Before taxes and fees" error={errors.basePrice} required>
            <Input {...text("basePrice")} type="number" min={1} step="0.01" inputMode="decimal" />
          </Field>
          <Field label="Rooms of this type" hint="How many can be sold each night" error={errors.totalInventory} required>
            <Input {...text("totalInventory")} type="number" min={1} inputMode="numeric" />
          </Field>
        </div>
      </FormCard>

      <FormCard section={SECTIONS[3]}>
        <ImageManager
          images={values.images}
          onChange={(images) => {
            set("images", images);
            setImageErrors({});
          }}
          max={10}
          uploadsEnabled={uploadsEnabled}
          error={errors.images}
          itemErrors={imageErrors}
        />
      </FormCard>

      <FormCard section={SECTIONS[4]}>
        <AmenityPicker options={amenities} value={values.amenityIds} onChange={(ids) => set("amenityIds", ids)} />
      </FormCard>

      <FormCard section={SECTIONS[5]}>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <Checkbox checked={values.isActive} onCheckedChange={(on) => set("isActive", on === true)} className="mt-0.5" />
          <span>
            <span className="font-medium">Bookable</span>
            <span className="block text-muted-foreground">Guests can book this room type. Turn off to hide it; bookings are kept.</span>
          </span>
        </label>
      </FormCard>
    </SectionedForm>
  );
}

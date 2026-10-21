"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveHotelAction } from "@/app/(admin)/admin/_actions/catalog";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { safe } from "@/lib/safe-action";
import { hotelSchema, slugify } from "@/lib/validation/admin";

import type { HotelFormValues } from "@/lib/admin/form-values";

import { AmenityPicker, type AmenityOption } from "./amenity-picker";
import { collectErrors, focusFirstError, FormCard, SectionedForm, type FormSection } from "./form-layout";
import { ImageManager } from "./image-manager";

const SECTIONS: FormSection[] = [
  { id: "basics", title: "Basics", description: "How the hotel appears in search and on its page." },
  { id: "location", title: "Location", description: "Shown on the map and in the booking confirmation." },
  { id: "policies", title: "Stay policies", description: "Times are local to the hotel." },
  { id: "photos", title: "Photos", description: "Wide, bright photos work best. The first one is the cover." },
  { id: "amenities", title: "Amenities", description: "What guests can enjoy at the hotel." },
  { id: "visibility", title: "Visibility", description: "Whether guests can find and book this hotel." },
];

const FIELDS: Record<string, string[]> = {
  basics: ["name", "slug", "description", "starRating"],
  location: ["address", "city", "country", "latitude", "longitude"],
  policies: ["checkInTime", "checkOutTime"],
  photos: ["images"],
  amenities: ["amenityIds"],
};

export function HotelForm({
  hotelId,
  initial,
  amenities,
  uploadsEnabled,
}: {
  hotelId?: string;
  initial: HotelFormValues;
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

  const set = <K extends keyof HotelFormValues>(key: K, value: HotelFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };
  const text = (key: "name" | "slug" | "description" | "city" | "country" | "address" | "latitude" | "longitude" | "checkInTime" | "checkOutTime") => ({
    name: key,
    value: values[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, event.target.value),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const parsed = hotelSchema.safeParse(values);
    if (!parsed.success) {
      const { fields, images } = collectErrors(parsed.error);
      setErrors(fields);
      setImageErrors(images);
      // After React has rendered the error states.
      window.setTimeout(() => focusFirstError(SECTIONS, FIELDS, fields, images), 0);
      return;
    }
    startTransition(async () => {
      const result = await safe(saveHotelAction(values, hotelId));
      if (!result.ok) {
        setErrors((result.fieldErrors as Record<string, string>) ?? {});
        setFormError(result.formError);
        return;
      }
      setSaved(values);
      toast.success(result.message);
      if (!hotelId) router.push(`/admin/hotels/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <SectionedForm
      sections={SECTIONS}
      onSubmit={submit}
      pending={pending}
      dirty={dirty}
      submitLabel={hotelId ? "Save hotel" : "Create hotel"}
      cancelHref="/admin/hotels"
      formError={formError}
    >
      <FormCard section={SECTIONS[0]}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Hotel name" error={errors.name} required>
            <Input {...text("name")} onBlur={() => !values.slug && set("slug", slugify(values.name))} />
          </Field>
          <Field label="Web address" hint={`/hotels/${values.slug || slugify(values.name) || "…"}`} error={errors.slug}>
            <Input {...text("slug")} placeholder={slugify(values.name) || "made from the name"} />
          </Field>
        </div>
        <Field label="Description" hint="Two or three short paragraphs. What makes it special?" error={errors.description} required>
          <Textarea {...text("description")} rows={6} maxLength={4000} />
        </Field>
        <Field label="Hotel class" error={errors.starRating} required>
          <Select value={values.starRating} onValueChange={(value) => set("starRating", value)}>
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 4, 3, 2, 1].map((stars) => (
                <SelectItem key={stars} value={String(stars)}>
                  {stars} {stars === 1 ? "star" : "stars"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FormCard>

      <FormCard section={SECTIONS[1]}>
        <Field label="Street address" error={errors.address} required>
          <Input {...text("address")} autoComplete="off" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City" error={errors.city} required>
            <Input {...text("city")} />
          </Field>
          <Field label="Country" error={errors.country} required>
            <Input {...text("country")} />
          </Field>
          <Field label="Latitude" hint="For example 36.4618" error={errors.latitude} required>
            <Input {...text("latitude")} inputMode="decimal" />
          </Field>
          <Field label="Longitude" hint="For example 25.3753" error={errors.longitude} required>
            <Input {...text("longitude")} inputMode="decimal" />
          </Field>
        </div>
      </FormCard>

      <FormCard section={SECTIONS[2]}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Check-in from" error={errors.checkInTime} required>
            <Input type="time" {...text("checkInTime")} />
          </Field>
          <Field label="Check-out by" error={errors.checkOutTime} required>
            <Input type="time" {...text("checkOutTime")} />
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
          max={12}
          uploadsEnabled={uploadsEnabled}
          error={errors.images}
          itemErrors={imageErrors}
        />
      </FormCard>

      <FormCard section={SECTIONS[4]}>
        <AmenityPicker options={amenities} value={values.amenityIds} onChange={(ids) => set("amenityIds", ids)} />
      </FormCard>

      <FormCard section={SECTIONS[5]}>
        <div className="grid gap-3">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
            <Checkbox checked={values.isActive} onCheckedChange={(on) => set("isActive", on === true)} className="mt-0.5" />
            <span>
              <span className="font-medium">Live</span>
              <span className="block text-muted-foreground">Guests can find and book this hotel. Turn off to hide it; bookings are kept.</span>
            </span>
          </label>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
            <Checkbox checked={values.isFeatured} onCheckedChange={(on) => set("isFeatured", on === true)} className="mt-0.5" />
            <span>
              <span className="font-medium">Featured</span>
              <span className="block text-muted-foreground">Shown first on the home page.</span>
            </span>
          </label>
        </div>
      </FormCard>
    </SectionedForm>
  );
}

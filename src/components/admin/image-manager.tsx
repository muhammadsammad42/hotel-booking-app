"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowDownIcon, ArrowUpIcon, CircleAlertIcon, GripVerticalIcon, ImagePlusIcon, Loader2Icon, StarIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";

import { uploadSignatureAction } from "@/app/(admin)/admin/_actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ManagedImage = { url: string; alt: string };

type ImageManagerProps = {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  max: number;
  /** Cloudinary is configured, so files can be dropped here. */
  uploadsEnabled: boolean;
  error?: string;
  /** Per-image errors, e.g. a missing description, keyed by index. */
  itemErrors?: Record<number, string>;
};

const altFromFile = (name: string) => name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim() || "Photo";

/**
 * Photos in display order; the first is the cover. Drag the handle (or use
 * the arrow buttons) to reorder. Add by URL, or drop files when Cloudinary
 * is set up.
 */
export function ImageManager({ images, onChange, max, uploadsEnabled, error, itemErrors = {} }: ImageManagerProps) {
  const [url, setUrl] = React.useState("");
  const [urlError, setUrlError] = React.useState<string>();
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const [dropActive, setDropActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const full = images.length >= max;

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function addUrl() {
    const value = url.trim();
    if (!/^https:\/\/\S+$/.test(value)) {
      setUrlError("Paste a full image address that starts with https://");
      return;
    }
    if (images.some((image) => image.url === value)) {
      setUrlError("That photo is already in the list");
      return;
    }
    onChange([...images, { url: value, alt: "" }]);
    setUrl("");
    setUrlError(undefined);
  }

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, max - images.length);
    if (!list.length) return;
    const signature = await uploadSignatureAction().catch(() => ({ enabled: false }) as const);
    if (!signature.enabled) {
      toast.error("Uploads are not set up", { description: "Add the Cloudinary keys to .env, or add photos by URL." });
      return;
    }
    setUploading((count) => count + list.length);
    const added: ManagedImage[] = [];
    for (const file of list) {
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", signature.apiKey);
        body.append("timestamp", String(signature.timestamp));
        body.append("folder", signature.folder);
        body.append("signature", signature.signature);
        const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, { method: "POST", body });
        if (!response.ok) throw new Error(await response.text());
        const result = (await response.json()) as { secure_url: string };
        added.push({ url: result.secure_url, alt: altFromFile(file.name) });
      } catch {
        toast.error(`Could not upload ${file.name}`, { description: "Check the file and try again." });
      } finally {
        setUploading((count) => count - 1);
      }
    }
    if (added.length) onChange([...images, ...added]);
  }

  return (
    <div className="grid gap-4">
      {images.length > 0 && (
        <ol className="grid gap-3" aria-label="Photos, in display order">
          {images.map((image, index) => (
            <li
              key={image.url}
              draggable
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                if (dragIndex === null) return;
                event.preventDefault();
                setOverIndex(index);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "grid grid-cols-[auto_5rem_minmax(0,1fr)] items-start gap-3 rounded-xl border bg-card p-3 transition-[border-color,box-shadow,opacity] duration-150 ease-soft sm:grid-cols-[auto_6.5rem_minmax(0,1fr)_auto]",
                dragIndex === index && "opacity-50",
                overIndex === index && dragIndex !== index && "border-primary shadow-lift",
              )}
            >
              <span className="flex h-full cursor-grab items-center text-muted-foreground active:cursor-grabbing" aria-hidden>
                <GripVerticalIcon className="size-4" />
              </span>
              <div className="relative aspect-4/3 overflow-hidden rounded-md bg-muted">
                <Image src={image.url} alt="" fill sizes="104px" className="object-cover" />
                {index === 0 && (
                  <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded-full bg-card px-1.5 py-0.5 text-xs font-semibold shadow-xs">
                    <StarIcon className="size-3 fill-star text-star" aria-hidden />
                    Cover
                  </span>
                )}
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`alt-${index}`}>
                  Photo {index + 1} description (for screen readers)
                </label>
                <Input
                  id={`alt-${index}`}
                  value={image.alt}
                  onChange={(event) => onChange(images.map((item, i) => (i === index ? { ...item, alt: event.target.value } : item)))}
                  placeholder="What the photo shows, e.g. Infinity pool at sunset"
                  aria-invalid={itemErrors[index] ? true : undefined}
                  maxLength={160}
                  className="h-10"
                />
                {itemErrors[index] && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <CircleAlertIcon className="size-3.5" aria-hidden />
                    {itemErrors[index]}
                  </p>
                )}
              </div>
              <div className="col-span-3 flex justify-end gap-1 sm:col-span-1 sm:flex-col">
                <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, index - 1)}>
                  <ArrowUpIcon aria-hidden />
                  <span className="sr-only">Move photo {index + 1} up</span>
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" disabled={index === images.length - 1} onClick={() => move(index, index + 1)}>
                  <ArrowDownIcon aria-hidden />
                  <span className="sr-only">Move photo {index + 1} down</span>
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(images.filter((_, i) => i !== index))}>
                  <Trash2Icon className="text-destructive" aria-hidden />
                  <span className="sr-only">Remove photo {index + 1}</span>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {uploadsEnabled && (
        <div
          onDragOver={(event) => {
            if (dragIndex !== null) return;
            event.preventDefault();
            setDropActive(true);
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(event) => {
            if (dragIndex !== null) return;
            event.preventDefault();
            setDropActive(false);
            void upload(event.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border border-dashed border-input p-6 text-center transition-colors duration-150 ease-soft",
            dropActive && "border-primary bg-primary/5",
            full && "pointer-events-none opacity-50",
          )}
        >
          {uploading > 0 ? <Loader2Icon className="size-6 animate-spin text-primary" aria-hidden /> : <UploadCloudIcon className="size-6 text-muted-foreground" aria-hidden />}
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {uploading > 0 ? `Uploading ${uploading} ${uploading === 1 ? "photo" : "photos"}…` : "Drop photos here to upload them to Cloudinary"}
          </p>
          <Button type="button" variant="outline" size="sm" disabled={full || uploading > 0} onClick={() => fileRef.current?.click()}>
            Choose files
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              if (event.target.files) void upload(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      )}

      <div className="grid gap-1.5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="image-url">
            Image address
          </label>
          <Input
            id="image-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addUrl();
              }
            }}
            placeholder="https://images.unsplash.com/photo-…"
            aria-invalid={urlError ? true : undefined}
            disabled={full}
          />
          <Button type="button" variant="outline" onClick={addUrl} disabled={full}>
            <ImagePlusIcon aria-hidden />
            Add photo
          </Button>
        </div>
        <p className={cn("flex items-start gap-1.5 text-sm", urlError || error ? "text-destructive" : "text-muted-foreground")}>
          {(urlError || error) && <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />}
          {urlError ?? error ?? `${images.length} of ${max} photos. The first one is the cover.${uploadsEnabled ? "" : " Add CLOUDINARY_* keys to enable uploads."}`}
        </p>
      </div>
    </div>
  );
}

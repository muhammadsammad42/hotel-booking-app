"use client";

import * as React from "react";
import type { z } from "zod";

import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";

/**
 * Form state with inline validation: a field is checked when it loses focus,
 * then on every change after that, so errors never appear while the guest is
 * still typing for the first time.
 */
export function useValidatedFields<Schema extends z.ZodObject>(schema: Schema, initial: z.input<Schema>) {
  type Values = z.input<Schema>;
  type Name = keyof Values & string;

  const [values, setValues] = React.useState<Values>(initial);
  const [touched, setTouched] = React.useState<Partial<Record<Name, boolean>>>({});
  const [errors, setErrors] = React.useState<FieldErrors<Values>>({});

  const validateField = React.useCallback(
    (name: Name, value: unknown) => {
      const field = schema.shape[name] as z.ZodType | undefined;
      const result = field?.safeParse(value);
      return result && !result.success ? result.error.issues[0]?.message : undefined;
    },
    [schema],
  );

  function bind(name: Name) {
    return {
      name,
      value: values[name] as string,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setValues((current) => ({ ...current, [name]: value }));
        if (touched[name]) setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
      },
      onBlur: () => {
        setTouched((current) => ({ ...current, [name]: true }));
        setErrors((current) => ({ ...current, [name]: validateField(name, values[name]) }));
      },
    };
  }

  /** Validates everything; returns the parsed data, or null after showing errors. */
  function validateAll(): z.output<Schema> | null {
    const result = schema.safeParse(values);
    if (result.success) return result.data;
    const next = fieldErrors(result.error) as FieldErrors<Values>;
    setErrors(next);
    setTouched(Object.fromEntries(Object.keys(values as object).map((key) => [key, true])) as Partial<Record<Name, boolean>>);
    const first = Object.keys(next)[0];
    if (first) document.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    return null;
  }

  return { values, errors, setErrors, bind, validateAll };
}

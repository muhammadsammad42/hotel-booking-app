"use client";

import * as React from "react";

import type { DateRange } from "@/components/ui/date-range-picker";
import { fromIsoDate, toIsoDate } from "@/lib/dates";
import { DEFAULT_FILTERS } from "@/lib/search/params";

export type BookableRoom = {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  totalInventory: number;
};

type HotelBookingValue = {
  hotelSlug: string;
  rooms: BookableRoom[];
  room: BookableRoom;
  setRoomId: (id: string) => void;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  guests: number;
  setGuests: (guests: number) => void;
  /** Rooms of the chosen type needed for the guests. */
  roomCount: number;
  checkIn: string | null;
  checkOut: string | null;
  /** Opens the date picker, e.g. when Reserve is pressed without dates. */
  datesOpen: boolean;
  setDatesOpen: (open: boolean) => void;
  reserveHref: string | null;
};

const HotelBookingContext = React.createContext<HotelBookingValue | null>(null);

type ProviderProps = {
  hotelSlug: string;
  rooms: BookableRoom[];
  initial: { checkIn: string | null; checkOut: string | null; guests: number; roomId?: string };
  children: React.ReactNode;
};

/**
 * The stay being planned on a hotel page: room, dates and guests. Shared by
 * the room cards, the booking card and the mobile booking bar, and mirrored
 * to the URL so a reload or a shared link keeps it.
 */
export function HotelBookingProvider({ hotelSlug, rooms, initial, children }: ProviderProps) {
  const fitting = rooms.find((room) => room.maxGuests >= initial.guests) ?? rooms[0];
  const [roomId, setRoomId] = React.useState(rooms.some((room) => room.id === initial.roomId) ? initial.roomId! : fitting.id);
  const [range, setRange] = React.useState<DateRange | undefined>(
    initial.checkIn && initial.checkOut ? { from: fromIsoDate(initial.checkIn), to: fromIsoDate(initial.checkOut) } : undefined,
  );
  const [guests, setGuests] = React.useState(initial.guests);
  const [datesOpen, setDatesOpen] = React.useState(false);

  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  const roomCount = Math.max(1, Math.ceil(guests / room.maxGuests));
  const complete = Boolean(range?.from && range.to && range.to > range.from);
  const checkIn = complete ? toIsoDate(range!.from!) : null;
  const checkOut = complete ? toIsoDate(range!.to!) : null;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (checkIn && checkOut) {
      params.set("checkIn", checkIn);
      params.set("checkOut", checkOut);
    } else {
      params.delete("checkIn");
      params.delete("checkOut");
    }
    if (guests !== DEFAULT_FILTERS.guests) params.set("guests", String(guests));
    else params.delete("guests");
    params.set("room", roomId);
    const query = params.toString();
    window.history.replaceState(window.history.state, "", query ? `?${query}` : window.location.pathname);
  }, [checkIn, checkOut, guests, roomId]);

  const reserveHref =
    checkIn && checkOut
      ? `/book?${new URLSearchParams({
          hotel: hotelSlug,
          room: roomId,
          checkIn,
          checkOut,
          guests: String(guests),
          rooms: String(roomCount),
        })}`
      : null;

  return (
    <HotelBookingContext.Provider
      value={{
        hotelSlug,
        rooms,
        room,
        setRoomId,
        range,
        setRange,
        guests,
        setGuests,
        roomCount,
        checkIn,
        checkOut,
        datesOpen,
        setDatesOpen,
        reserveHref,
      }}
    >
      {children}
    </HotelBookingContext.Provider>
  );
}

export function useHotelBooking() {
  const context = React.useContext(HotelBookingContext);
  if (!context) throw new Error("useHotelBooking must be used inside HotelBookingProvider");
  return context;
}

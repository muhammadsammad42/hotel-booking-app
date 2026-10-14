"use client";

import * as React from "react";

import type { DateRange } from "@/components/ui/date-range-picker";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { quote, stayFromCalendar, type Quote, type RoomCalendar } from "@/lib/booking/engine";
import { fromIsoDate, toIsoDate } from "@/lib/dates";
import { DEFAULT_FILTERS } from "@/lib/search/params";

export type BookableRoom = {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  totalInventory: number;
};

export type RoomStay = {
  quote: Quote;
  /** Fewest free rooms on any night of the stay. */
  minAvailable: number;
  bookable: boolean;
};

type HotelBookingValue = {
  hotelSlug: string;
  rooms: BookableRoom[];
  room: BookableRoom;
  setRoomId: (id: string) => void;
  calendars: Record<string, RoomCalendar>;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  guests: number;
  setGuests: (guests: number) => void;
  /** Rooms of the chosen type needed for the guests. */
  roomCount: number;
  /** True when the guests need more rooms than one booking can take. */
  tooManyGuests: boolean;
  checkIn: string | null;
  checkOut: string | null;
  /** The chosen room for the chosen dates, or null without dates. */
  stay: RoomStay | null;
  /** Any room type for the chosen dates and guests. */
  stayFor: (room: BookableRoom) => RoomStay | null;
  /** Opens the date picker, e.g. when Reserve is pressed without dates. */
  datesOpen: boolean;
  setDatesOpen: (open: boolean) => void;
  reserveHref: string | null;
};

const HotelBookingContext = React.createContext<HotelBookingValue | null>(null);

type ProviderProps = {
  hotelSlug: string;
  rooms: BookableRoom[];
  calendars: Record<string, RoomCalendar>;
  initial: { checkIn: string | null; checkOut: string | null; guests: number; roomId?: string };
  children: React.ReactNode;
};

/**
 * The stay being planned on a hotel page: room, dates and guests. Prices and
 * availability come from the room calendars loaded on the server and run
 * through the same engine the server uses, so changes show instantly. The
 * server recalculates everything again when the booking is made.
 */
export function HotelBookingProvider({ hotelSlug, rooms, calendars, initial, children }: ProviderProps) {
  const fitting = rooms.find((room) => room.maxGuests >= initial.guests) ?? rooms[0];
  const [roomId, setRoomId] = React.useState(
    rooms.some((room) => room.id === initial.roomId) ? initial.roomId! : fitting.id,
  );
  const [range, setRange] = React.useState<DateRange | undefined>(
    initial.checkIn && initial.checkOut
      ? { from: fromIsoDate(initial.checkIn), to: fromIsoDate(initial.checkOut) }
      : undefined,
  );
  const [guests, setGuests] = React.useState(initial.guests);
  const [datesOpen, setDatesOpen] = React.useState(false);

  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  const complete = Boolean(range?.from && range.to && range.to > range.from);
  const checkIn = complete ? toIsoDate(range!.from!) : null;
  const checkOut = complete ? toIsoDate(range!.to!) : null;

  const roomsNeeded = (candidate: BookableRoom) => Math.max(1, Math.ceil(guests / candidate.maxGuests));
  const roomCount = Math.min(roomsNeeded(room), BOOKING_CONFIG.maxRooms);
  const tooManyGuests = roomsNeeded(room) > BOOKING_CONFIG.maxRooms;

  const stayFor = React.useCallback(
    (candidate: BookableRoom): RoomStay | null => {
      if (!checkIn || !checkOut) return null;
      const calendar = calendars[candidate.id];
      const nights = calendar && stayFromCalendar(calendar, checkIn, checkOut);
      if (!nights) return null;
      const count = Math.min(Math.max(1, Math.ceil(guests / candidate.maxGuests)), BOOKING_CONFIG.maxRooms);
      return {
        quote: quote({ nights: nights.nights, rooms: count }),
        minAvailable: nights.minAvailable,
        bookable: nights.minAvailable >= count && Math.ceil(guests / candidate.maxGuests) <= BOOKING_CONFIG.maxRooms,
      };
    },
    [calendars, checkIn, checkOut, guests],
  );
  const stay = stayFor(room);

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
    checkIn && checkOut && stay?.bookable
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
        calendars,
        range,
        setRange,
        guests,
        setGuests,
        roomCount,
        tooManyGuests,
        checkIn,
        checkOut,
        stay,
        stayFor,
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

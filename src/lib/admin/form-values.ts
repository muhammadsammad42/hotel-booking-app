// Values for the admin hotel and room type forms. Numbers are kept as text
// while editing, so a half-typed "18" is not turned into 18 too early.
import type { HotelInput, RoomTypeInput } from "@/lib/validation/admin";

export type HotelFormValues = Omit<HotelInput, "latitude" | "longitude" | "starRating"> & {
  latitude: string;
  longitude: string;
  starRating: string;
};

type RoomNumberKeys = "maxGuests" | "sizeSqm" | "basePrice" | "totalInventory";
export type RoomTypeFormValues = Omit<RoomTypeInput, RoomNumberKeys> & Record<RoomNumberKeys, string>;

export const EMPTY_HOTEL: HotelFormValues = {
  name: "",
  slug: "",
  description: "",
  city: "",
  country: "",
  address: "",
  latitude: "",
  longitude: "",
  starRating: "4",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  isFeatured: false,
  isActive: true,
  images: [],
  amenityIds: [],
};

export const EMPTY_ROOM_TYPE: RoomTypeFormValues = {
  name: "",
  slug: "",
  description: "",
  beds: "",
  maxGuests: "2",
  sizeSqm: "",
  basePrice: "",
  totalInventory: "",
  isActive: true,
  images: [],
  amenityIds: [],
};

type HotelRecord = {
  name: string;
  slug: string;
  description: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
  isFeatured: boolean;
  isActive: boolean;
  images: { url: string; alt: string }[];
  amenities: { id: string }[];
};

export function hotelToForm(hotel: HotelRecord): HotelFormValues {
  return {
    name: hotel.name,
    slug: hotel.slug,
    description: hotel.description,
    city: hotel.city,
    country: hotel.country,
    address: hotel.address,
    latitude: String(hotel.latitude),
    longitude: String(hotel.longitude),
    starRating: String(hotel.starRating),
    checkInTime: hotel.checkInTime,
    checkOutTime: hotel.checkOutTime,
    isFeatured: hotel.isFeatured,
    isActive: hotel.isActive,
    images: hotel.images,
    amenityIds: hotel.amenities.map((amenity) => amenity.id),
  };
}

type RoomRecord = {
  name: string;
  slug: string;
  description: string;
  beds: string;
  maxGuests: number;
  sizeSqm: number;
  basePrice: number;
  totalInventory: number;
  isActive: boolean;
  images: { url: string; alt: string }[];
  amenities: { id: string }[];
};

export function roomTypeToForm(room: RoomRecord): RoomTypeFormValues {
  return {
    name: room.name,
    slug: room.slug,
    description: room.description,
    beds: room.beds,
    maxGuests: String(room.maxGuests),
    sizeSqm: String(room.sizeSqm),
    basePrice: String(room.basePrice / 100),
    totalInventory: String(room.totalInventory),
    isActive: room.isActive,
    images: room.images,
    amenityIds: room.amenities.map((amenity) => amenity.id),
  };
}

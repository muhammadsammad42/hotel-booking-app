import type { AmenityCategory } from "../../src/generated/prisma/client";

export type SeedAmenity = {
  name: string;
  iconKey: string;
  category: AmenityCategory;
};

export const amenities = [
  // Hotel-wide
  { name: "Free Wi-Fi", iconKey: "wifi", category: "GENERAL" },
  { name: "Free parking", iconKey: "square-parking", category: "GENERAL" },
  { name: "Air conditioning", iconKey: "snowflake", category: "GENERAL" },
  { name: "Heating", iconKey: "thermometer", category: "GENERAL" },
  { name: "Outdoor pool", iconKey: "waves", category: "WELLNESS" },
  { name: "Infinity pool", iconKey: "waves-ladder", category: "WELLNESS" },
  { name: "Spa", iconKey: "flower-2", category: "WELLNESS" },
  { name: "Sauna", iconKey: "heater", category: "WELLNESS" },
  { name: "Fitness centre", iconKey: "dumbbell", category: "WELLNESS" },
  { name: "Restaurant", iconKey: "utensils", category: "DINING" },
  { name: "Bar", iconKey: "martini", category: "DINING" },
  { name: "Breakfast included", iconKey: "croissant", category: "DINING" },
  { name: "Room service", iconKey: "concierge-bell", category: "DINING" },
  { name: "24-hour front desk", iconKey: "clock", category: "SERVICES" },
  { name: "Airport transfer", iconKey: "plane", category: "SERVICES" },
  { name: "Concierge", iconKey: "bell-ring", category: "SERVICES" },
  { name: "Laundry service", iconKey: "shirt", category: "SERVICES" },
  { name: "Private beach", iconKey: "umbrella", category: "OUTDOORS" },
  { name: "Water sports", iconKey: "sailboat", category: "OUTDOORS" },
  { name: "Guided hikes", iconKey: "mountain", category: "OUTDOORS" },
  { name: "Desert safari", iconKey: "compass", category: "OUTDOORS" },
  { name: "Rooftop terrace", iconKey: "building-2", category: "OUTDOORS" },
  { name: "Garden", iconKey: "trees", category: "OUTDOORS" },
  { name: "Fireplace lounge", iconKey: "flame", category: "ENTERTAINMENT" },
  { name: "Kids club", iconKey: "baby", category: "ENTERTAINMENT" },
  // In-room
  { name: "Sea view", iconKey: "sunset", category: "ROOM" },
  { name: "Mountain view", iconKey: "mountain-snow", category: "ROOM" },
  { name: "City view", iconKey: "building", category: "ROOM" },
  { name: "Balcony", iconKey: "door-open", category: "ROOM" },
  { name: "Private pool", iconKey: "waves", category: "ROOM" },
  { name: "Minibar", iconKey: "wine", category: "ROOM" },
  { name: "Coffee machine", iconKey: "coffee", category: "ROOM" },
  { name: "Smart TV", iconKey: "tv", category: "ROOM" },
  { name: "Work desk", iconKey: "laptop", category: "ROOM" },
  { name: "In-room safe", iconKey: "lock", category: "ROOM" },
  { name: "Living area", iconKey: "sofa", category: "ROOM" },
  { name: "Rain shower", iconKey: "shower-head", category: "BATHROOM" },
  { name: "Bathtub", iconKey: "bath", category: "BATHROOM" },
  { name: "Bathrobes", iconKey: "shirt", category: "BATHROOM" },
] as const satisfies readonly SeedAmenity[];

export type AmenityName = (typeof amenities)[number]["name"];

// Demo catalogue. The hotels are fictional; the photos are representative
// Unsplash images, so alt text describes what each photo shows rather than
// claiming it is the named property.
import type { AmenityName } from "./amenities";

export type SeedImage = { url: string; alt: string };

export type SeedReview = { rating: number; comment: string };

export type SeedRoomType = {
  name: string;
  slug: string;
  description: string;
  maxGuests: number;
  beds: string;
  sizeSqm: number;
  /** USD cents per night. */
  basePrice: number;
  totalInventory: number;
  amenities: AmenityName[];
  images: SeedImage[];
};

export type SeedHotel = {
  name: string;
  slug: string;
  /** Leisure destinations get a larger holiday-season uplift than cities. */
  kind: "beach" | "city" | "mountain" | "desert";
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
  amenities: AmenityName[];
  /** The first image is also used as the cover. */
  images: SeedImage[];
  roomTypes: SeedRoomType[];
  reviews: SeedReview[];
};

function img(photoId: string, alt: string): SeedImage {
  return {
    url: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&q=80`,
    alt,
  };
}

export const hotels: SeedHotel[] = [
  {
    name: "Coral Lagoon Resort",
    slug: "coral-lagoon-resort",
    kind: "beach",
    description:
      "A private-island resort wrapped in a shallow turquoise lagoon, twenty minutes by speedboat from Malé. Villas stand on stilts over the water or hide among the palms a few steps from the sand, and every one of them faces the sea.\n\nDays here are unhurried: snorkel the house reef straight from your deck, drift between the pool and the beach, and end with grilled reef fish under the stars. The spa, dive centre and three restaurants are all within a barefoot walk.",
    city: "North Malé Atoll",
    country: "Maldives",
    address: "Coral Lagoon Island, North Malé Atoll 20026",
    latitude: 4.3125,
    longitude: 73.589,
    starRating: 5,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    isFeatured: true,
    amenities: [
      "Free Wi-Fi",
      "Air conditioning",
      "Infinity pool",
      "Spa",
      "Fitness centre",
      "Restaurant",
      "Bar",
      "Breakfast included",
      "Room service",
      "Airport transfer",
      "Private beach",
      "Water sports",
      "Kids club",
    ],
    images: [
      img("1573843981267-be1999ff37cd", "Overwater villas on stilts in a clear turquoise lagoon"),
      img("1514282401047-d79a71a590e8", "Aerial view of overwater villas along a winding jetty"),
      img("1586500036706-41963de24d8b", "White sand beach with palm trees and thatched umbrellas"),
      img("1505881502353-a1986add3762", "Wooden jetty leading across shallow water to a palm-covered island"),
      img("1562790351-d273a961e0e9", "Aerial view of a curved swimming pool between palm trees"),
      img("1512100356356-de1b84283e18", "Seaplane on the shoreline beside a thatched roof and palm trees"),
    ],
    roomTypes: [
      {
        name: "Lagoon View Room",
        slug: "lagoon-view-room",
        description:
          "A calm, light-filled room with floor-to-ceiling windows onto the lagoon. Wake up to the sound of the water and step out to the beach in under a minute.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 42,
        basePrice: 42000,
        totalInventory: 10,
        amenities: ["Sea view", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1501117716987-c8c394bb29df", "Bedroom with sheer curtains and a window looking out over the sea"),
          img("1551776235-dde6d482980b", "Close-up of crisp white bed linen"),
        ],
      },
      {
        name: "Beach Bungalow",
        slug: "beach-bungalow",
        description:
          "A timber bungalow set back among the palms with its own path to the sand. Warm wood, a deep soaking tub and an outdoor rain shower make it the classic island stay.",
        maxGuests: 3,
        beds: "1 king bed and 1 daybed",
        sizeSqm: 68,
        basePrice: 64000,
        totalInventory: 8,
        amenities: ["Sea view", "Balcony", "Air conditioning", "Minibar", "Coffee machine", "Rain shower", "Bathtub", "Bathrobes"],
        images: [
          img("1584132915807-fd1f5fbc078f", "Timber bedroom with a white bed and sunlight through shuttered doors"),
          img("1552321554-5fefe8c9ef14", "Bright white bathroom with plants on the windowsill"),
        ],
      },
      {
        name: "Overwater Villa",
        slug: "overwater-villa",
        description:
          "The resort's signature villa, built over the lagoon with a private deck, steps down into the water and a glass floor panel in the lounge. Sunsets are best watched from the daybed.",
        maxGuests: 3,
        beds: "1 king bed",
        sizeSqm: 95,
        basePrice: 98000,
        totalInventory: 6,
        amenities: ["Sea view", "Balcony", "Living area", "Air conditioning", "Minibar", "Coffee machine", "Rain shower", "Bathtub", "Bathrobes"],
        images: [
          img("1602002418082-a4443e081dd1", "Villa lounge with glass doors opening to a deck over the lagoon"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "The overwater villa was everything we hoped for. We snorkelled with reef sharks straight off our deck every morning, and the staff remembered our names from day one." },
      { rating: 5, comment: "Faultless from the boat transfer to the last breakfast. The house reef is alive with fish and the spa is worth every minute." },
      { rating: 4, comment: "Beautiful island and a lovely beach bungalow. Dinner prices are high even for the Maldives, but the half-board option softened that." },
      { rating: 5, comment: "Our honeymoon could not have been better. Quiet, spotless and the sunsets from the jetty are unreal." },
      { rating: 5, comment: "Great service and a gorgeous lagoon. Wi-Fi was patchy in the bungalow, which honestly turned out to be a blessing." },
    ],
  },
  {
    name: "Caldera Blue Suites",
    slug: "caldera-blue-suites",
    kind: "beach",
    description:
      "Carved into the cliffs of Oia, Caldera Blue Suites looks straight across the sunken volcano to the open Aegean. Whitewashed terraces step down the hillside, each with its own view of the famous Santorini sunset.\n\nBreakfast is served on your terrace, the infinity pool seems to pour into the sea, and the marble lanes of the village start at the front door.",
    city: "Santorini",
    country: "Greece",
    address: "Nikolaou Nomikou 14, Oia 847 02, Santorini",
    latitude: 36.4618,
    longitude: 25.3753,
    starRating: 5,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    isFeatured: true,
    amenities: [
      "Free Wi-Fi",
      "Air conditioning",
      "Infinity pool",
      "Spa",
      "Restaurant",
      "Bar",
      "Breakfast included",
      "Room service",
      "Airport transfer",
      "Concierge",
      "Rooftop terrace",
    ],
    images: [
      img("1570077188670-e3a8d69ac5ff", "Whitewashed cliffside village above the sea at dusk"),
      img("1613395877344-13d4a8e0d49e", "Blue-domed churches overlooking the sea in bright sunlight"),
      img("1586611292717-f828b167408c", "Infinity pool terrace with sun loungers facing the open sea"),
      img("1533105079780-92b9be482077", "Narrow whitewashed lane with flowers opening onto a deep blue bay"),
      img("1530841377377-3ff06c0ca713", "White church with blue domes above a calm sea"),
      img("1559339352-11d035aa65de", "Seaside terrace restaurant with tables set under a canopy"),
    ],
    roomTypes: [
      {
        name: "Classic Double",
        slug: "classic-double",
        description:
          "A bright, breezy room with handmade textiles and a shared terrace a few steps away. The most affordable way to stay on the caldera.",
        maxGuests: 2,
        beds: "1 queen bed",
        sizeSqm: 24,
        basePrice: 26000,
        totalInventory: 8,
        amenities: ["Air conditioning", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1571508601891-ca5e7a713859", "Bright bedroom with patterned cushions, plants and framed prints"),
          img("1551776235-dde6d482980b", "Close-up of crisp white bed linen"),
        ],
      },
      {
        name: "Caldera View Suite",
        slug: "caldera-view-suite",
        description:
          "A cave-style suite with curved white walls and a private terrace over the caldera. Breakfast arrives at your door each morning.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 38,
        basePrice: 42000,
        totalInventory: 6,
        amenities: ["Sea view", "Balcony", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathrobes"],
        images: [
          img("1559599238-308793637427", "White bed with a tufted headboard beneath a gold-framed mirror"),
          img("1584622650111-993a426fbf0a", "Modern bathroom with a glass walk-in shower and double vanity"),
        ],
      },
      {
        name: "Honeymoon Suite",
        slug: "honeymoon-suite",
        description:
          "The most private terrace in the hotel, with a heated plunge pool and an uninterrupted sunset view. Champagne on arrival is included.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 52,
        basePrice: 56000,
        totalInventory: 3,
        amenities: ["Sea view", "Private pool", "Balcony", "Living area", "Air conditioning", "Minibar", "Coffee machine", "Bathtub", "Bathrobes"],
        images: [
          img("1512918728675-ed5a9ecdebfd", "Bright white suite with a padded wall and polished stone floor"),
          img("1552321554-5fefe8c9ef14", "Bright white bathroom with plants on the windowsill"),
        ],
      },
      {
        name: "Private Pool Villa",
        slug: "private-pool-villa",
        description:
          "A two-storey villa at the quiet end of the property with its own pool, sun terrace and outdoor dining area. Ideal for families or two couples.",
        maxGuests: 4,
        beds: "2 king beds",
        sizeSqm: 110,
        basePrice: 89000,
        totalInventory: 2,
        amenities: ["Sea view", "Private pool", "Balcony", "Living area", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes"],
        images: [
          img("1600596542815-ffad4c1539a9", "White two-storey villa with glass balconies beside a private pool"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "We watched the sunset from our own terrace every evening instead of fighting the crowds at the castle. Breakfast with that view is something I will never forget." },
      { rating: 5, comment: "The cave suite stayed cool all day and the team carried our bags up every one of those steps. Exceptional hospitality." },
      { rating: 4, comment: "Stunning location and a beautiful pool. Be ready for a lot of stairs; it is Oia, after all." },
      { rating: 5, comment: "Booked the honeymoon suite for our anniversary. The plunge pool at sunset was the highlight of our whole trip to Greece." },
      { rating: 4, comment: "Lovely rooms and friendly staff. The classic double is compact, but you are never in it with a village like this outside." },
    ],
  },
  {
    name: "Tirta Segara Resort",
    slug: "tirta-segara-resort",
    kind: "beach",
    description:
      "Set on the limestone cliffs of Uluwatu, Tirta Segara is a low-rise resort of gardens, lily ponds and pools that step down towards the Indian Ocean. Thatched pavilions and open-air living rooms keep you close to the breeze.\n\nSurf breaks, beach clubs and the cliff-top temple are minutes away. Back at the resort, a Balinese spa and a sunset bar make it easy to do very little.",
    city: "Uluwatu, Bali",
    country: "Indonesia",
    address: "Jalan Pantai Segara 8, Pecatu, Badung, Bali 80361",
    latitude: -8.8291,
    longitude: 115.0849,
    starRating: 4,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    isFeatured: true,
    amenities: [
      "Free Wi-Fi",
      "Free parking",
      "Air conditioning",
      "Outdoor pool",
      "Infinity pool",
      "Spa",
      "Restaurant",
      "Bar",
      "Breakfast included",
      "Airport transfer",
      "Garden",
      "Water sports",
    ],
    images: [
      img("1610641818989-c2051b5e2cfd", "Palm trees and pavilions reflected in a still infinity pool"),
      img("1571003123894-1f0594d2b5d9", "Curtained cabanas beside an infinity pool at dusk"),
      img("1567636788276-40a47795ba4d", "Swimming pool lined with sun loungers in a tropical garden"),
      img("1551918120-9739cb430c6d", "Guest standing in an infinity pool that overlooks a beach"),
      img("1563911302283-d2bc129e7570", "Thatched huts and palm trees around a freeform pool"),
      img("1518548419970-58e3b4079ab2", "Sea temple on a rocky outcrop at sunset"),
      img("1544161515-4ab6ce6db874", "Therapist pouring oil during a spa massage"),
    ],
    roomTypes: [
      {
        name: "Garden Deluxe Room",
        slug: "garden-deluxe-room",
        description:
          "A ground-floor room that opens onto a private garden courtyard. Carved teak, cool stone floors and a deep bathtub set the tone.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 40,
        basePrice: 14000,
        totalInventory: 12,
        amenities: ["Air conditioning", "Balcony", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub"],
        images: [
          img("1611892440504-42a792e24d32", "Warm wood-panelled bedroom with a low bed and a garden window"),
          img("1552321554-5fefe8c9ef14", "Bright white bathroom with plants on the windowsill"),
        ],
      },
      {
        name: "Canopy Suite",
        slug: "canopy-suite",
        description:
          "An upper-floor suite among the treetops with a separate lounge and a wide balcony facing the ocean. The best room in the house for sunrise.",
        maxGuests: 3,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 62,
        basePrice: 23000,
        totalInventory: 8,
        amenities: ["Sea view", "Balcony", "Living area", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathrobes"],
        images: [
          img("1566665797739-1674de7a421a", "Suite with dark timber walls and a bed dressed in white and grey"),
          img("1584622650111-993a426fbf0a", "Modern bathroom with a glass walk-in shower and double vanity"),
        ],
      },
      {
        name: "Two-Bedroom Pool Villa",
        slug: "two-bedroom-pool-villa",
        description:
          "A walled villa with two en-suite bedrooms, an open living pavilion and a ten-metre private pool. A villa host prepares breakfast in your kitchen each morning.",
        maxGuests: 5,
        beds: "2 king beds",
        sizeSqm: 180,
        basePrice: 46000,
        totalInventory: 4,
        amenities: ["Private pool", "Living area", "Balcony", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes"],
        images: [
          img("1600585154340-be6161a56a0c", "Glass-walled villa lit from within beneath a large tree at dusk"),
          img("1560448204-e02f11c3d0e2", "Open-plan living room with sofas and large windows"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "The pool villa was bigger than our apartment at home. Our host made nasi goreng for breakfast and arranged a driver for the whole stay." },
      { rating: 3, comment: "Lovely pool and spa, but our first room was close to the road and the scooters start early. Staff moved us on day two, which helped a lot." },
      { rating: 5, comment: "Peaceful, green and beautifully kept. The sunset bar became our evening ritual." },
      { rating: 4, comment: "Great value for Uluwatu. The garden room was quiet and the bathtub is enormous." },
      { rating: 5, comment: "Friendly staff, a spotless suite and the best breakfast we had in Bali. We extended by two nights." },
    ],
  },
  {
    name: "The Clifton Grand",
    slug: "the-clifton-grand",
    kind: "city",
    description:
      "A landmark address in Clifton, a short drive from the Arabian Sea promenade and Karachi's best restaurants. Behind the arched façade, a palm-filled courtyard and pool offer a rare pocket of calm in the city.\n\nRooms are generous and quiet, the lobby lounge serves the city's favourite high tea, and the business centre, gym and airport transfers make work trips simple.",
    city: "Karachi",
    country: "Pakistan",
    address: "Block 4, Khayaban-e-Iqbal, Clifton, Karachi 75600",
    latitude: 24.8138,
    longitude: 67.03,
    starRating: 5,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    isFeatured: true,
    amenities: [
      "Free Wi-Fi",
      "Free parking",
      "Air conditioning",
      "Outdoor pool",
      "Spa",
      "Fitness centre",
      "Restaurant",
      "Breakfast included",
      "Room service",
      "24-hour front desk",
      "Airport transfer",
      "Concierge",
      "Laundry service",
    ],
    images: [
      img("1544124499-58912cbddaad", "Grand cream façade with tall arched windows under a blue sky"),
      img("1535827841776-24afc1e255ac", "Hotel courtyard with palm trees around a fountain pool, seen from above"),
      img("1625244724120-1fd1d34d00f6", "Marble lobby with a crystal chandelier and gilded reception desk"),
      img("1615460549969-36fa19521a4f", "Lap pool with sun loungers and umbrellas beside the hotel wing"),
      img("1414235077428-338989a2e8c0", "Plated dishes and glassware on a candlelit dinner table"),
      img("1534438327276-14e5300c3a48", "Gym with rows of dumbbells and floor-to-ceiling windows"),
    ],
    roomTypes: [
      {
        name: "Superior King",
        slug: "superior-king",
        description:
          "A comfortable, well-planned room with a large work desk and blackout curtains. A reliable base for business or a short city stay.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 30,
        basePrice: 9500,
        totalInventory: 12,
        amenities: ["City view", "Air conditioning", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1631049307264-da0ec9d70304", "Hotel room with a king bed, grey headboard and bedside lamps"),
          img("1496417263034-38ec4f0b665a", "White pillows and a bedside lamp against a dark blue wall"),
        ],
      },
      {
        name: "Deluxe Twin",
        slug: "deluxe-twin",
        description:
          "Two beds, a seating corner and extra floor space make this the pick for colleagues or friends travelling together.",
        maxGuests: 3,
        beds: "2 double beds",
        sizeSqm: 36,
        basePrice: 11000,
        totalInventory: 10,
        amenities: ["City view", "Air conditioning", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1595576508898-0ad5c879a061", "Twin room with two beds dressed in white and teal"),
        ],
      },
      {
        name: "Executive King",
        slug: "executive-king",
        description:
          "A larger corner room on the upper floors with lounge access, evening refreshments and a late check-out.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 42,
        basePrice: 15000,
        totalInventory: 8,
        amenities: ["City view", "Air conditioning", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1618773928121-c32242e63f39", "Spacious hotel room with a king bed, warm lamps and a wide window"),
          img("1584622650111-993a426fbf0a", "Modern bathroom with a glass walk-in shower and double vanity"),
        ],
      },
      {
        name: "Sea Breeze Suite",
        slug: "sea-breeze-suite",
        description:
          "A one-bedroom suite with a separate living and dining room, looking west towards the sea. Includes airport transfers and lounge access.",
        maxGuests: 4,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 75,
        basePrice: 26000,
        totalInventory: 4,
        amenities: ["Sea view", "Living area", "Air conditioning", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1629140727571-9b5c6f6267b4", "Bedroom with floor-length grey curtains and a softly lit bed"),
          img("1560448204-e02f11c3d0e2", "Open-plan living room with sofas and large windows"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "Easily the best stay I have had in Karachi. The courtyard pool is an oasis and the breakfast spread, halwa puri included, is superb." },
      { rating: 4, comment: "Very comfortable room and a fast airport transfer. Traffic around Clifton in the evening is heavy, so leave early for dinner plans." },
      { rating: 5, comment: "Stayed for a family wedding. Staff went out of their way for us, and the high tea in the lobby is worth a visit on its own." },
      { rating: 4, comment: "Solid business hotel with a proper desk, quick Wi-Fi and a good gym. Exactly what I needed for a week of meetings." },
      { rating: 5, comment: "The suite was huge and spotless. Loved the sea breeze in the evening and the warm welcome at reception." },
    ],
  },
  {
    name: "Hotel Kumo Shibuya",
    slug: "hotel-kumo-shibuya",
    kind: "city",
    description:
      "A design hotel four minutes on foot from Shibuya Crossing. Rooms are compact in the Tokyo way but carefully planned, with deep beds, blackout blinds and big windows over the neon streets below.\n\nThe ground-floor bar pours Japanese whisky until late, the restaurant serves a seasonal set breakfast, and three train lines are on the doorstep.",
    city: "Tokyo",
    country: "Japan",
    address: "2-14 Dogenzaka, Shibuya City, Tokyo 150-0043",
    latitude: 35.6595,
    longitude: 139.7005,
    starRating: 4,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    isFeatured: false,
    amenities: [
      "Free Wi-Fi",
      "Air conditioning",
      "Heating",
      "Fitness centre",
      "Restaurant",
      "Bar",
      "24-hour front desk",
      "Concierge",
      "Laundry service",
      "Rooftop terrace",
    ],
    images: [
      img("1542051841857-5f90071e7989", "Busy city street at night lined with neon signs and billboards"),
      img("1517840901100-8179e982acb7", "Illuminated hotel sign on a dark building at night"),
      img("1517248135467-4c7edcad34c4", "Modern restaurant with dark wood tables and pendant lights"),
      img("1514933651103-005eec06c04b", "Bar with timber counter, stools and chalkboard menus"),
      img("1540959733332-eab4deabeeaf", "Pedestrians in a brightly lit shopping street at night"),
      img("1536098561742-ca998e48cbcc", "Red and white lattice tower above a city street at sunset"),
      img("1490806843957-31f4c9a91c65", "Snow-capped volcano framed by cherry blossom branches"),
    ],
    roomTypes: [
      {
        name: "Compact Queen",
        slug: "compact-queen",
        description:
          "A smart, efficient room for one or two, with a queen bed, rain shower and everything within arm's reach.",
        maxGuests: 2,
        beds: "1 queen bed",
        sizeSqm: 18,
        basePrice: 16000,
        totalInventory: 12,
        amenities: ["Air conditioning", "Heating", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1586105251261-72a756497a11", "Minimal bedroom with a black bed, line-art prints and a brass wall lamp"),
          img("1496417263034-38ec4f0b665a", "White pillows and a bedside lamp against a dark blue wall"),
        ],
      },
      {
        name: "City View King",
        slug: "city-view-king",
        description:
          "A corner room on the upper floors with windows on two sides and a window seat for watching the city light up.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 28,
        basePrice: 24000,
        totalInventory: 8,
        amenities: ["City view", "Air conditioning", "Heating", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1568495248636-6432b97bd949", "Bed beside tall black-framed windows with a city view at sunset"),
          img("1584622650111-993a426fbf0a", "Modern bathroom with a glass walk-in shower and double vanity"),
        ],
      },
      {
        name: "Skyline Suite",
        slug: "skyline-suite",
        description:
          "The top-floor suite, with a separate lounge, a soaking tub by the window and a skyline view that runs to the horizon.",
        maxGuests: 3,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 55,
        basePrice: 48000,
        totalInventory: 3,
        amenities: ["City view", "Living area", "Air conditioning", "Heating", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1616594039964-ae9021a400a0", "Suite with a white channel-tufted bed, dark walls and a city view"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "You cannot beat the location. We walked to the crossing in minutes and still slept in complete silence on the eleventh floor." },
      { rating: 4, comment: "Small room, as expected in Tokyo, but cleverly designed and spotless. The bar downstairs has a great whisky list." },
      { rating: 5, comment: "The skyline suite at night is something else. Staff helped us book restaurants we would never have found on our own." },
      { rating: 4, comment: "Comfortable bed, powerful shower, easy access to three train lines. Breakfast is good but not cheap." },
      { rating: 4, comment: "Stylish and efficient. Luggage storage and late check-out made our last day easy." },
    ],
  },
  {
    name: "Galata Pera House",
    slug: "galata-pera-house",
    kind: "city",
    description:
      "A restored nineteenth-century townhouse on a cobbled lane below the Galata Tower. High ceilings, parquet floors and antique kilims sit alongside modern bathrooms and very good beds.\n\nBreakfast is a proper Turkish spread in the courtyard garden. From the front door it is a ten-minute walk downhill to the Bosphorus ferries and a short tram ride to the old city.",
    city: "Istanbul",
    country: "Türkiye",
    address: "Serdar-ı Ekrem Sokak 27, Beyoğlu, 34425 Istanbul",
    latitude: 41.0256,
    longitude: 28.9741,
    starRating: 4,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    isFeatured: false,
    amenities: [
      "Free Wi-Fi",
      "Air conditioning",
      "Heating",
      "Restaurant",
      "Bar",
      "Breakfast included",
      "24-hour front desk",
      "Airport transfer",
      "Concierge",
      "Garden",
      "Rooftop terrace",
    ],
    images: [
      img("1524231757912-21f4fe3a7200", "Stone tower rising above city rooftops in warm evening light"),
      img("1522798514-97ceb8c4f1c8", "Courtyard café with green chairs, patterned tiles and tall plants"),
      img("1555396273-367ea4eb4db5", "Airy café with timber tables and a staircase to a mezzanine"),
      img("1541432901042-2d8bd64b4a9b", "Domed mosque with six minarets at sunset"),
      img("1552566626-52f8b828add9", "Warmly lit restaurant with copper lamps and leather chairs"),
      img("1470337458703-46ad1756a187", "Bartender straining a cocktail over ice into a glass"),
    ],
    roomTypes: [
      {
        name: "Cosy Double",
        slug: "cosy-double",
        description:
          "A snug room at the back of the house, quiet at night and filled with morning light. Perfect for a short city break.",
        maxGuests: 2,
        beds: "1 double bed",
        sizeSqm: 20,
        basePrice: 11000,
        totalInventory: 8,
        amenities: ["Air conditioning", "Heating", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1540518614846-7eded433c457", "Bedroom with a white quilted bed, orange cushions and abstract art"),
        ],
      },
      {
        name: "Deluxe Room",
        slug: "deluxe-room",
        description:
          "A generous room with original parquet, a velvet reading chair and a marble bathroom with a walk-in shower.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 28,
        basePrice: 15000,
        totalInventory: 8,
        amenities: ["City view", "Air conditioning", "Heating", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "In-room safe"],
        images: [
          img("1591088398332-8a7791972843", "Boutique room with a patterned headboard, teal bench and mustard chair"),
          img("1552321554-5fefe8c9ef14", "Bright white bathroom with plants on the windowsill"),
        ],
      },
      {
        name: "Pera Classic King",
        slug: "pera-classic-king",
        description:
          "A front-facing room with tall windows, a tufted headboard and a small Juliet balcony over the lane.",
        maxGuests: 3,
        beds: "1 king bed and 1 single bed",
        sizeSqm: 34,
        basePrice: 19000,
        totalInventory: 5,
        amenities: ["City view", "Balcony", "Air conditioning", "Heating", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Bathtub", "In-room safe"],
        images: [
          img("1505693416388-ac5ce068fe85", "Classic bedroom with a tufted headboard and an upholstered bench"),
        ],
      },
      {
        name: "Heritage Suite",
        slug: "heritage-suite",
        description:
          "The former drawing room of the house, now a suite with a separate salon, wood panelling and a view towards the Golden Horn.",
        maxGuests: 3,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 58,
        basePrice: 32000,
        totalInventory: 2,
        amenities: ["City view", "Living area", "Air conditioning", "Heating", "Work desk", "Minibar", "Coffee machine", "Smart TV", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1590490360182-c33d57733427", "Elegant suite with a tufted sofa, heavy curtains and a bed in the alcove"),
          img("1590381105924-c72589b9ef3f", "Wood-panelled sitting room with a writing desk and warm lamps"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "A beautiful old house with real character. Breakfast in the courtyard, with simit, honey and kaymak, set us up for long days of walking." },
      { rating: 5, comment: "Perfect location under the Galata Tower. The team booked our ferry tickets and a hammam, and recommended a meyhane we went back to twice." },
      { rating: 5, comment: "Charming rooms and very kind staff. The lane is steep and cobbled, so bring sensible shoes." },
      { rating: 4, comment: "Loved the heritage suite. You can hear the call to prayer and the street musicians in the evening, which we enjoyed, but light sleepers should ask for a back room." },
      { rating: 5, comment: "Felt like staying with friends who happen to own a gorgeous townhouse. We will be back in spring." },
    ],
  },
  {
    name: "Baltit Heights Lodge",
    slug: "baltit-heights-lodge",
    kind: "mountain",
    description:
      "A family-run stone and timber lodge above Karimabad, looking across the Hunza Valley to Rakaposhi and the peaks of the Karakoram. Apricot and cherry orchards surround the terraces, and the valley glows gold in autumn.\n\nEvenings are spent by the fire with chapshuro and walnut cake. By day the team arranges walks to the old forts, jeep trips to Attabad Lake and Passu, and guided treks for every level.",
    city: "Hunza",
    country: "Pakistan",
    address: "Fort Road, Karimabad, Hunza, Gilgit-Baltistan 15700",
    latitude: 36.3259,
    longitude: 74.6603,
    starRating: 4,
    checkInTime: "13:00",
    checkOutTime: "11:00",
    isFeatured: true,
    amenities: [
      "Free Wi-Fi",
      "Free parking",
      "Heating",
      "Restaurant",
      "Breakfast included",
      "Airport transfer",
      "Guided hikes",
      "Garden",
      "Fireplace lounge",
      "Laundry service",
    ],
    images: [
      img("1596394516093-501ba68a0ba6", "Bed and bistro table on a timber deck high above a mountain lake"),
      img("1454496522488-7a8e488e8606", "Jagged snow-covered peaks under drifting clouds"),
      img("1586375300773-8384e3e4916f", "Gravel path with a rustic wooden railing leading to a timber chalet"),
      img("1464822759023-fed622ff2c3b", "Wide river valley between mountain ranges under a blue sky"),
      img("1506905925346-21bda4d32df4", "Mountain peaks rising above a sea of cloud at dawn"),
      img("1519681393784-d120267933ba", "Milky Way above snow-dusted mountains at night"),
      img("1589553416260-f586c8f1514f", "Hiker walking through a rocky mountain valley"),
    ],
    roomTypes: [
      {
        name: "Orchard Room",
        slug: "orchard-room",
        description:
          "A warm, simple room on the garden level that opens straight onto the orchard. Hand-woven rugs and thick duvets keep it cosy on cold nights.",
        maxGuests: 2,
        beds: "1 double bed",
        sizeSqm: 22,
        basePrice: 7000,
        totalInventory: 8,
        amenities: ["Heating", "Coffee machine", "Rain shower", "Work desk"],
        images: [
          img("1522771739844-6a9f6d5f14af", "Bed with patterned cushions beside a wooden nightstand and a warm lamp"),
        ],
      },
      {
        name: "Valley View Deluxe",
        slug: "valley-view-deluxe",
        description:
          "An upper-floor room with a private balcony facing Rakaposhi. Watch the first light reach the summit from your bed.",
        maxGuests: 3,
        beds: "1 king bed and 1 single bed",
        sizeSqm: 30,
        basePrice: 10500,
        totalInventory: 6,
        amenities: ["Mountain view", "Balcony", "Heating", "Coffee machine", "Rain shower", "Work desk"],
        images: [
          img("1576354302919-96748cb8299e", "White pillows on a bed with a rustic timber headboard"),
          img("1551776235-dde6d482980b", "Close-up of crisp white bed linen"),
        ],
      },
      {
        name: "Summit Suite",
        slug: "summit-suite",
        description:
          "The lodge's largest room, with a stone feature wall, a sunken lounge and glass on three sides. The deck is the best seat in the valley at sunset.",
        maxGuests: 4,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 55,
        basePrice: 18000,
        totalInventory: 2,
        amenities: ["Mountain view", "Balcony", "Living area", "Heating", "Minibar", "Coffee machine", "Smart TV", "Bathtub", "Bathrobes"],
        images: [
          img("1578683010236-d716f9a3f461", "Open-plan suite with a platform bed, stone wall and wraparound windows"),
          img("1584622650111-993a426fbf0a", "Modern bathroom with a glass walk-in shower and double vanity"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "Waking up to Rakaposhi from the balcony was worth the long drive up the Karakoram Highway. The family who run the lodge treated us like their own guests at home." },
      { rating: 5, comment: "Came in October for the autumn colours and the valley was golden. Dinner by the fire, fresh apricot juice at breakfast and a brilliant guide for the Ultar meadow trek." },
      { rating: 4, comment: "Simple, clean and very warm hospitality. Hot water and Wi-Fi can be slow in the evenings, which is normal for Hunza." },
      { rating: 5, comment: "The summit suite deck at sunset is the best view I have ever had from a hotel room. Do the jeep trip to Passu, they organise everything." },
      { rating: 5, comment: "Lovely orchard room and delicious local food. Bring layers, nights are cold even in early summer." },
    ],
  },
  {
    name: "Larch & Stone Alpine Lodge",
    slug: "larch-and-stone-alpine-lodge",
    kind: "mountain",
    description:
      "A lakeside lodge in the Dolomites, built from local larch and pale stone at the edge of an emerald alpine lake. In summer, rowing boats wait at the jetty; in winter, the forest trails turn to snow.\n\nThe spa has a lake-view sauna and an outdoor hot pool, and the kitchen cooks South Tyrolean dishes with produce from the valley's farms.",
    city: "Braies, Dolomites",
    country: "Italy",
    address: "Via Lago 12, 39030 Braies, South Tyrol",
    latitude: 46.6943,
    longitude: 12.0854,
    starRating: 4,
    checkInTime: "15:00",
    checkOutTime: "10:30",
    isFeatured: false,
    amenities: [
      "Free Wi-Fi",
      "Free parking",
      "Heating",
      "Spa",
      "Sauna",
      "Restaurant",
      "Bar",
      "Breakfast included",
      "Guided hikes",
      "Fireplace lounge",
      "Garden",
    ],
    images: [
      img("1482192505345-5655af888cc4", "Wooden boathouse on stilts at the edge of an alpine lake"),
      img("1501785888041-af3ef285b470", "Rowing boat on an emerald lake surrounded by mountains"),
      img("1476514525535-07fb3b4ae5f1", "View from a wooden rowing boat towards steep mountain walls"),
      img("1418065460487-3e41a6c84dc5", "Mist drifting through a dense pine forest"),
      img("1548777123-e216912df7d8", "Snow-covered forest seen from above"),
      img("1540555700478-4be289fbecef", "Rolled towel, lotion, candle and tulips laid out for a spa treatment"),
    ],
    roomTypes: [
      {
        name: "Alpine Double",
        slug: "alpine-double",
        description:
          "A quiet forest-facing room with pale timber, wool blankets and a rain shower. Breakfast and afternoon cake are included.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 26,
        basePrice: 21000,
        totalInventory: 10,
        amenities: ["Mountain view", "Heating", "Coffee machine", "Smart TV", "Rain shower", "Bathrobes", "In-room safe"],
        images: [
          img("1521783988139-89397d761dce", "Bed with navy cushions beside a white nightstand and reading lamp"),
          img("1496417263034-38ec4f0b665a", "White pillows and a bedside lamp against a dark blue wall"),
        ],
      },
      {
        name: "Lakeside Junior Suite",
        slug: "lakeside-junior-suite",
        description:
          "A bright suite with a lounge area and a balcony directly over the water. The morning reflections on the lake are the reason to book it.",
        maxGuests: 3,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 40,
        basePrice: 34000,
        totalInventory: 6,
        amenities: ["Mountain view", "Balcony", "Living area", "Heating", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathrobes", "In-room safe"],
        images: [
          img("1600210492486-724fe5c67fb0", "Sunlit lounge with a leather sofa, armchairs and a gallery wall"),
          img("1552321554-5fefe8c9ef14", "Bright white bathroom with plants on the windowsill"),
        ],
      },
      {
        name: "Family Chalet Suite",
        slug: "family-chalet-suite",
        description:
          "Two bedrooms, a living room with a fireplace and a private sauna, in a separate chalet wing. Room for the whole family and all the ski gear.",
        maxGuests: 5,
        beds: "1 king bed and 3 single beds",
        sizeSqm: 78,
        basePrice: 52000,
        totalInventory: 3,
        amenities: ["Mountain view", "Balcony", "Living area", "Heating", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1598928506311-c55ded91a20c", "Elegant living room with white sofas, a fireplace and built-in shelves"),
          img("1560185007-cde436f6a4d0", "Dining and sitting area with timber floors and pendant lamps"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "We rowed out on the lake before breakfast and had it to ourselves. The sauna with a view of the water is pure magic after a day of hiking." },
      { rating: 5, comment: "Outstanding food, especially the dumplings and the apple strudel. Rooms smell of fresh timber and the beds are superb." },
      { rating: 4, comment: "A beautiful, peaceful place. The lake gets busy with day visitors around midday in summer, so explore early or late." },
      { rating: 5, comment: "The family chalet was perfect for the five of us. The kids still talk about the boats and the hot chocolate." },
      { rating: 4, comment: "Lovely staff and a great spa. Check-out at 10:30 felt early, but they stored our bags and let us use the spa until the afternoon." },
    ],
  },
  {
    name: "Dune Haven Desert Resort",
    slug: "dune-haven-desert-resort",
    kind: "desert",
    description:
      "Forty-five minutes from downtown Dubai and a world away from it, Dune Haven sits among the rolling dunes of Al Marmoom. Low white pavilions, shaded courtyards and long reflecting pools are designed around the changing desert light.\n\nRide out at dawn on a camel or in a vintage 4x4, cool off in your private pool through the midday heat, and dine under the stars at the open-air majlis.",
    city: "Dubai",
    country: "United Arab Emirates",
    address: "Al Marmoom Desert Conservation Reserve, Al Qudra Road, Dubai",
    latitude: 24.8386,
    longitude: 55.3489,
    starRating: 5,
    checkInTime: "15:00",
    checkOutTime: "12:00",
    isFeatured: false,
    amenities: [
      "Free Wi-Fi",
      "Free parking",
      "Air conditioning",
      "Outdoor pool",
      "Spa",
      "Fitness centre",
      "Restaurant",
      "Bar",
      "Breakfast included",
      "Room service",
      "Airport transfer",
      "Concierge",
      "Desert safari",
    ],
    images: [
      img("1551882547-ff40c63fe5fa", "White pavilions and palm trees reflected in a pool under a purple dusk sky"),
      img("1473580044384-7ba9967e16a0", "Wind-rippled sand dunes under a hazy sun"),
      img("1564501049412-61c2a3083791", "White resort building and sun loungers beside a large pool at dusk"),
      img("1547234935-80c7145ec969", "Red desert plain with rugged mountains on the horizon"),
      img("1542314831-068cd1dbfeeb", "Illuminated pavilion and swimming pool beneath a deep blue evening sky"),
      img("1512453979798-5ea266f8880c", "City skyline of towers and highways in golden morning haze"),
    ],
    roomTypes: [
      {
        name: "Dune View King",
        slug: "dune-view-king",
        description:
          "A serene room with a shaded terrace facing the open dunes. Sunrise from the daybed is the best show in the desert.",
        maxGuests: 2,
        beds: "1 king bed",
        sizeSqm: 48,
        basePrice: 31000,
        totalInventory: 10,
        amenities: ["Balcony", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathrobes", "In-room safe"],
        images: [
          img("1587985064135-0366536eab42", "Softly lit bedroom with a patterned bedspread and sheer curtains"),
          img("1584622650111-993a426fbf0a", "Modern bathroom with a glass walk-in shower and double vanity"),
        ],
      },
      {
        name: "Majlis Suite",
        slug: "majlis-suite",
        description:
          "A suite built around a traditional sitting room, with low sofas, local artwork and a courtyard for evening tea.",
        maxGuests: 3,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 72,
        basePrice: 47000,
        totalInventory: 6,
        amenities: ["Living area", "Balcony", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1565031491910-e57fac031c41", "Lounge with cream sofas, armchairs and textured artwork on the wall"),
        ],
      },
      {
        name: "Oasis Terrace Suite",
        slug: "oasis-terrace-suite",
        description:
          "A corner suite with a wide terrace, an outdoor shower and a plunge pool shaded by date palms.",
        maxGuests: 3,
        beds: "1 king bed and 1 sofa bed",
        sizeSqm: 90,
        basePrice: 62000,
        totalInventory: 4,
        amenities: ["Private pool", "Living area", "Balcony", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1600607687939-ce8a6c25118c", "Modern living room with a white sofa and a timber feature wall"),
          img("1551776235-dde6d482980b", "Close-up of crisp white bed linen"),
        ],
      },
      {
        name: "Private Pool Villa",
        slug: "private-pool-villa",
        description:
          "A two-bedroom villa with its own walled garden, a twelve-metre pool and a dedicated host. Total privacy, with the dunes as your only neighbours.",
        maxGuests: 5,
        beds: "2 king beds",
        sizeSqm: 210,
        basePrice: 110000,
        totalInventory: 2,
        amenities: ["Private pool", "Living area", "Balcony", "Air conditioning", "Minibar", "Coffee machine", "Smart TV", "Rain shower", "Bathtub", "Bathrobes", "In-room safe"],
        images: [
          img("1600566753190-17f0baa2a6c3", "Modern timber-clad villa with a walled sandy courtyard"),
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: "The silence out here is the real luxury. We did the dawn camel ride, then spent the afternoon in our plunge pool watching oryx wander past." },
      { rating: 5, comment: "Dinner at the open-air majlis under a sky full of stars was the best meal of our trip. Service is warm without being stuffy." },
      { rating: 4, comment: "Stunning architecture and a superb spa. It is hot at midday from May onwards, so plan activities for early morning and evening." },
      { rating: 5, comment: "Worth every dirham. The villa host arranged a falconry session for the kids and a private dune dinner for us." },
      { rating: 3, comment: "A beautiful resort, but at this price I expected quicker service at the pool, and breakfast felt rushed on the weekend." },
    ],
  },
];

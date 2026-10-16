// Builds an iCalendar (.ics) file for a stay: an all-day event from check-in
// to check-out (DTEND is exclusive, like check-out). Pure, so it is tested.

type IcsInput = {
  reference: string;
  hotelName: string;
  roomName: string;
  address: string;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  guests: number;
  url: string;
  now: Date;
};

/** Escapes text for an iCalendar value (RFC 5545, 3.3.11). */
function escape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Splits lines longer than 75 octets, as the format requires. */
function fold(line: string) {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = ` ${rest.slice(75)}`;
  }
  parts.push(rest);
  return parts.join("\r\n");
}

const compactDate = (iso: string) => iso.replaceAll("-", "");
const compactStamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function buildStayIcs(input: IcsInput) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sarai//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.reference}@sarai`,
    `DTSTAMP:${compactStamp(input.now)}`,
    `DTSTART;VALUE=DATE:${compactDate(input.checkIn)}`,
    `DTEND;VALUE=DATE:${compactDate(input.checkOut)}`,
    `SUMMARY:${escape(`Stay at ${input.hotelName}`)}`,
    `LOCATION:${escape(input.address)}`,
    `DESCRIPTION:${escape(
      `Booking ${input.reference}\n${input.roomName}, ${input.guests} ${input.guests === 1 ? "guest" : "guests"}.\nCheck-in from ${input.checkInTime} local time.`,
    )}`,
    `URL:${input.url}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

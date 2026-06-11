import moment from "moment";

const formatIsoDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

const get5LastYear = () => {
  const last5Years = [];
  for (let i = 0; i < 5; i++) {
    last5Years.push(moment().subtract(i, "years").format("YYYY"));
  }

  // console.log('last5Years :', last5Years);
  return last5Years;
};

/**
 * Convert a date-time string into a date-only string (YYYY-MM-DD).
 *
 * This function safely handles:
 * - null or undefined values
 * - invalid date strings
 *
 * The conversion uses the native `Date` object and returns
 * a normalized ISO date (UTC-based).
 *
 * @param value - Date-time string (ISO format recommended),
 *                e.g. "2023-07-01T15:54:00"
 * @returns Date-only string in format "YYYY-MM-DD",
 *          or an empty string if the input is invalid
 *
 * @example
 * toDateOnly("2023-07-01T15:54:00");
 * // "2023-07-01"
 *
 * @example
 * toDateOnly(null);
 * // ""
 *
 * @example
 * toDateOnly("invalid-date");
 * // ""
 */
const toDateOnly = (value?: string | null): string => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

export { formatIsoDate, get5LastYear, toDateOnly };

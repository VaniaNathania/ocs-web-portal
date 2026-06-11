export const camelToSnakeCase = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};

export const snakeToCamelCase = (str: string) => {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
};

export const toCamelCase = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/(?:^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (match, group1) =>
      group1.toUpperCase()
    )
    .replace(/[^a-zA-Z0-9]/g, "");
};

export const snakeToTitleCase = (str: string) => {
  return String(str)
    .split("_") // Split the string by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(" "); // Join the words with spaces
};

export const capitalizeWords = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const urlWords = (str: string) => {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

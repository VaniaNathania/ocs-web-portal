interface BooleanBadgeProps {
  value: "Y" | "N";
}

export const BooleanBadge = ({ value }: BooleanBadgeProps) => {
  const isActive = value === "Y";
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      }`}
    >
      {isActive ? "Yes" : "No"}
    </span>
  );
};

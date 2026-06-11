import { Input } from "@mui/material";
import { DirMenuManagementData } from "./CompProvider";

export interface EditValuesType {
  partyName: string;
  url: string;
  privCode: string;
  iconUrl: string;
  // Add other fields as needed
}

const EditableInput = ({
  value,
  onChange,
  style,
}: {
  value: any;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}) => {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  );
};

export const EditableCell = ({
  data,
  field,
  editValues,
  handleInputChange,
}: {
  data: DirMenuManagementData;
  field: keyof Partial<DirMenuManagementData>;
  editValues: Partial<DirMenuManagementData>;
  handleInputChange: (key: string, value: string) => void;
}) => {
  return (
    <EditableInput
      value={editValues[field] || ""}
      onChange={(value) => handleInputChange(field, value)}
      style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
    />
  );
};

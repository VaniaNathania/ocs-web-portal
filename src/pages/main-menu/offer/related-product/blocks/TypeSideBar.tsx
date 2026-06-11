import { toast } from "sonner";

export const initialStateSideBar: {
  category_name: string;
  category_code: string;
  remarks: string;
} = {
  category_name: "",
  category_code: "",
  remarks: "",
};

export const validateFormSideBar = (
  formField: typeof initialStateSideBar,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  const requiredFields = [
    { key: "category_name", label: "Category Name" },
    { key: "category_code", label: "Category Code" },
    { key: "remarks", label: "Remarks" },
  ];

  const newErrors: Record<string, string> = {};
  let isValid = true;

  requiredFields.forEach(({ key, label }) => {
    if (
      formField[key as keyof typeof formField] === "" ||
      formField[key as keyof typeof formField] === null ||
      formField[key as keyof typeof formField] === undefined
    ) {
      newErrors[key] = `${label} is required`;
      toast.error(`${label} is required`);
      isValid = false;
    }
  });

  setErrors(newErrors);
  return isValid;
};

import { Trash } from "lucide-react";
import { toast } from "sonner";

export const deleteToast = (entity = "Service") => {
  toast(`${entity} Deleted`, {
    icon: <Trash size={18} className="text-red-500" />,
    description: `The selected ${entity.toLowerCase()} has been successfully removed.`,
    style: {
      backgroundColor: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#7F1D1D",
    },
  });
};

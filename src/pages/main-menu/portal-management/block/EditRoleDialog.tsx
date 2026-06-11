import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loading } from "./loadingBlock";
import { X } from "lucide-react";
import { KeenIcon } from "@/components";
import { DialogWrapper } from "../../role-management/generalUseComp";
export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
}

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isEditing: boolean;
  handleEditDialog: (status: boolean) => void;
}

export const EditRoleDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Update Confirmation",
  description = "Are you sure you want to Update the selected item(s)? This action cannot be undone.",
  isEditing,
  handleEditDialog,
}: EditRoleDialogProps) => {
  if (!open) return;
  return (
    <DialogWrapper
      title={title}
      onClose={onClose}
      size={{ width: "sm" }}
      handleDialog={handleEditDialog}
      isOpen={open}
    >
      <div className="flex flex-col space-y-5 mt-5">
        <div>{description}</div>
        {!isEditing ? (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </DialogWrapper>
  );
};

// const DialogWrapper = ({
//   children,
//   title,
//   onClose,
//   size = { width: "6xl", height: "93vh" },
// }: WrapperProps) => {
//   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     // Close only if clicked directly on the backdrop
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in transition-transform"
//       onClick={handleBackdropClick}
//     >
//       <div
//         className={`bg-white rounded-lg shadow-lg w-full max-w-${size.width} h-[${size.height}] overflow-hidden flex flex-col z-10`}
//       >
//         {/* Header */}
//         <div className="bg-gray-100 px-5 py-3 border-b flex justify-between items-center">
//           <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="mb-5 h-full">{children}</div>
//       </div>
//     </div>
//   );
// };

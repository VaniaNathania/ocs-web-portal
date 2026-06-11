import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { useCompList } from "../hook/useComp";

export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
}

interface size {
  width: string;
  height: string;
}

interface WrapperProps {
  children: React.ReactNode;
  title: string;
  desc?: string;
  onClose: () => void;
  detail?: boolean;
  size?: size;
  isOpen: boolean;
  handleDialog: (open: boolean) => void;
  scrollAble?: boolean;
}

export const DirMenuDialogWrapper = ({
  children,
  title,
  desc = "",
  onClose,
  detail = true,
  size = { width: "6xl", height: "93vh" },
  isOpen,
  handleDialog,
  scrollAble = true,
}: WrapperProps) => {
  const { selectedRow } = useCompList();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicked directly on the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Dialog open={isOpen} onOpenChange={(open) => handleDialog(open)}>
        <DialogContent
          className={`container-fixed max-w-${size.width} h-[${size.height}] flex flex-col p-0 overflow-hidden [&>button]:hidden`}
        >
          <DialogHeader className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {desc}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <KeenIcon icon="cross" className="text-sm" />
            </Button>
          </DialogHeader>

          <DialogBody
            className={`p-5 pt-0 ${scrollAble ? "scrollable-y" : ""}`}
          >
            <div>
              {detail && (
                <div className="sticky z-20 top-0 bg-white">
                  <div className="flex flex-row space-x-5 w-full py-5">
                    {/* Menu Name */}
                    <div className="flex flex-col w-1/3 sm:w-1/2">
                      <label className="block text-sm font-medium text-gray-700">
                        Directory Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter Menu name"
                        autoComplete="off"
                        className=""
                        value={selectedRow?.name}
                        disabled={true}
                      />
                    </div>

                    {/* Menu Code */}
                    {/* <div className="flex flex-col w-1/3 sm:w-1/2">
                      <label className="block text-sm font-medium text-gray-700">
                        Directory Code
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter Menu name"
                        autoComplete="off"
                        className=""
                        value={selectedRow?.privCode}
                        disabled={true}
                      />
                    </div> */}
                  </div>
                  <hr className="border-[0.5px]" />
                </div>
              )}
              {children}
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};

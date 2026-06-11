import { createContext, useContext, useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void> | void;
  isDeleting?: boolean;
};

type ConfirmDialogContextType = {
  confirm: (options: ConfirmOptions) => void;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(
  null
);

export const ConfirmDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    await options.onConfirm?.();
    setIsOpen(false);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {/* Universal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col p-5 px-5">
            <h1 className="mb-5 text-lg font-semibold">
              {options.title || "Confirm Delete"}
            </h1>
            <p className="text-sm text-gray-600 mb-4">{options.message}</p>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              {options.cancelText || "Cancel"}
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            >
              {options.isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </div>
              ) : (
                options.confirmText || "Delete"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context)
    throw new Error(
      "useConfirmDialog must be used within ConfirmDialogProvider"
    );
  return context;
};

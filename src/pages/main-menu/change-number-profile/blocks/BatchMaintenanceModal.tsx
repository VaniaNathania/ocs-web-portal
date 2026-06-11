import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";

const API_URL_REF = apiConfigRef.ref;

interface BatchMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TemplateType = "excel" | "txt" | "csv";

const BatchMaintenanceModal = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}: BatchMaintenanceModalProps) => {
  const { PostData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("excel");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTemplateClick = () => {
    setShowTemplateModal(true);
  };

  const handleTemplateDownload = () => {
    const templates = {
      excel: "BatchMaintenanceTemplateXLSX.xlsx",
      txt: "BatchMaintenanceTemplateTXT.txt",
      csv: "BatchMaintenanceTemplateCSV.csv"
    };

    const filename = templates[selectedTemplate];
    const fullPath = `/media/template-files/${filename}`;
    
    const link = document.createElement("a");
    link.href = fullPath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowTemplateModal(false);
  };

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.error("Please upload a file");
      return;
    }

    const validExtensions = ['.xlsx', '.txt', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a file with a valid extension (.xlsx, .txt, .csv)");
      return;
    }

    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB. Please upload a smaller file.");
      return;
    }

    if (file.size === 0) {
      toast.error("The uploaded file is empty. Please upload a valid file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('operType', 'BATCH_MAINTENANCE');

      const response = await PostData(
        `${API_URL_REF}/api/number-profile/batch-maintenance`,
        formData
      );

      if (response?.status) {
        const { processed = 0, success = 0, failed = 0 } = response.data || {};

        toast.success(
          `Batch maintenance completed. Processed: ${processed}, Success: ${success}, Failed: ${failed}`
        );
        
        onClose();
        onSuccess?.();
        handleReset();
      } else {
        const errorMessage = response?.message || "Failed to process batch maintenance";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to process batch maintenance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      handleReset();
      onClose();
    }
  };

  return (
    <>
      {/* Main Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="container-fixed max-w-[600px] flex flex-col p-5 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Batch Maintenance by File</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <Input 
                type="file" 
                className="flex-1" 
                ref={fileInputRef} 
                accept=".xlsx, .txt, .csv"
                disabled={isSubmitting}
              />
              <Button 
                onClick={handleTemplateClick} 
                disabled={isSubmitting}
                variant="default"
                className="whitespace-nowrap"
              >
                File Template
              </Button>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button 
              variant="default"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isSubmitting}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="container-fixed max-w-[400px] flex flex-col p-5 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Batch File Template</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="excel"
                name="template"
                value="excel"
                checked={selectedTemplate === "excel"}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="excel" className="text-sm cursor-pointer">
                Excel File Template
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="txt"
                name="template"
                value="txt"
                checked={selectedTemplate === "txt"}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="txt" className="text-sm cursor-pointer">
                Txt File Template
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="csv"
                name="template"
                value="csv"
                checked={selectedTemplate === "csv"}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="csv" className="text-sm cursor-pointer">
                Csv File Template
              </label>
            </div>
          </div>

          <DialogFooter className="flex justify-end">
            <Button 
              onClick={handleTemplateDownload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BatchMaintenanceModal;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";

const API_URL_REF = apiConfigRef.ref;


const AddBatchZoneValue = () => {
  const {
    showAddBatchZoneValue,
    handleAddBatchZoneValue,
    selectedChildrenSide,
    onSubmitSuccess,
  } = useZoneMainListContext();

  const { PostData } = useCallApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const filename = "Template.xlsx";
    const fullPath = `/media/template-files/${filename}`;
    
    const link = document.createElement("a");
    link.href = fullPath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.error("please upload a file");
      return;
    }

    const validExtensions = ['.xlsx', '.txt', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast.error("please upload a file with a valid extension (.xlsx, .txt, .csv)");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB. Please upload a smaller file.");
      return;
    }

  
    if (file.size === 0) {
      toast.error("The uploaded file is empty. Please upload a valid file.");
      return;
    }

    if (!selectedChildrenSide?.zoneId) {
      toast.error("please select a zone first");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('zoneId', selectedChildrenSide.zoneId.toString());
      formData.append('operType', 'ADD'); // Add operType for batch add operation

      const response = await PostData(
        `${API_URL_REF}/api/zone/batch-update-zone-value`,
        formData
      );

      if (response?.status) {

        const {inserted = 0, updated = 0} = response.data || {};

        toast.success(
          `Batch zone value completed. Added: ${inserted} record(s), Updated: ${updated} record(s).`
        );
        
        handleAddBatchZoneValue(false);
        onSubmitSuccess();
        handleReset();
      } else {
        const errorMessage = response?.message || "Failed to add batch zone value";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to add batch zone value");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showAddBatchZoneValue} onOpenChange={handleAddBatchZoneValue}>
      <DialogContent className="container-fixed max-w-xl h-[30vh]">
        <DialogHeader>
          <DialogTitle>Batch Add Zone Value</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-row gap-3">
          <div className="flex flex-row items-center py-5 gap-2 w-3/4">
            <label className="text-sm">Upload File</label>
            <Input 
            type="file" 
            className="flex-1" 
            ref={fileInputRef} 
            accept=".xlsx, .txt, .csv"
            disabled={isSubmitting}
            />
          </div>

    
          <div className="flex flex-row items-center py-5 gap-2 w-1/4">
            <Button onClick={handleDownloadTemplate} disabled={isSubmitting} >

              File
              Template</Button>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="default"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedChildrenSide?.zoneId}
          >{isSubmitting ? "Submitting..." : "Submit"}</Button>
          <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBatchZoneValue;

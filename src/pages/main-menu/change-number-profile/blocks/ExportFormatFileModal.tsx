import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExportFileFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
  isExporting: boolean;
}

type FileFormatType = "xlsx" | "html" | "csv" | "pdf";

const ExportFileFormatModal = ({ isOpen, onClose, onExport, isExporting }: ExportFileFormatModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<FileFormatType>("xlsx");

  const handleExport = () => {
    onExport(selectedFormat);

    if (isExporting === false) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[400px] flex flex-col p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Export File Format</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <fieldset disabled={isExporting}>
          <div className="space-y-3 py-4">
            <div className="flex items-center space-x-2">
              <input type="radio" id="xlsx" name="fileFormat" value="xlsx" checked={selectedFormat === "xlsx"} onChange={(e) => setSelectedFormat(e.target.value as FileFormatType)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              <label htmlFor="xlsx" className="text-sm cursor-pointer">
                XLSX Document
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="radio" id="html" name="fileFormat" value="html" checked={selectedFormat === "html"} onChange={(e) => setSelectedFormat(e.target.value as FileFormatType)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              <label htmlFor="html" className="text-sm cursor-pointer">
                HTML Document
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="radio" id="csv" name="fileFormat" value="csv" checked={selectedFormat === "csv"} onChange={(e) => setSelectedFormat(e.target.value as FileFormatType)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              <label htmlFor="csv" className="text-sm cursor-pointer">
                CSV Document
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="radio" id="pdf" name="fileFormat" value="pdf" checked={selectedFormat === "pdf"} onChange={(e) => setSelectedFormat(e.target.value as FileFormatType)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
              <label htmlFor="pdf" className="text-sm cursor-pointer">
                PDF Document
              </label>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="default" onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              OK
            </Button>
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFileFormatModal;

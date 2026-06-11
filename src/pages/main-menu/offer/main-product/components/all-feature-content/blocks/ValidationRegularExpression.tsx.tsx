import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";

interface ValidationRegularExpressionProps {
  isOpen: boolean;
  onClose: () => void;
  isNotMatch: any;
}

const ValidationRegularExpression: React.FC<ValidationRegularExpressionProps> = ({ isOpen, onClose, isNotMatch }) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex flex-row space-x-3 pl-3">
              <KeenIcon icon="information" className="text-lg text-blue-700"/>
              <DialogTitle className="text-lg font-medium text-gray-800">Information</DialogTitle>
            </div>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600" />
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            <div className="">
              <Label className="text-gray-700 text-center text-md">{isNotMatch ? <p>The test value does not meet the configured rule.</p> : <p>The test value meets the configured rule.</p>}</Label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button variant="default" onClick={onClose} className="px-6 h-9 border-gray-300 text-white">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ValidationRegularExpression;

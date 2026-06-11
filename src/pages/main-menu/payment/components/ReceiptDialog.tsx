import { useEffect, useState } from "react";
import {
  DialogWrapper,
  ParentDialogProps,
} from "@/pages/main-menu/role-management/generalUseComp";

interface ReceiptReqDialogProp extends ParentDialogProps {
  blob?: Blob;
}

const ReceiptReqDialog = ({
  isOpen,
  handleDialog,
  blob,
}: ReceiptReqDialogProp) => {
  const [pdfUrl, setPdfUrl] = useState<string>();

  useEffect(() => {
    if (!blob) return;
    //  console.log(blob instanceof Blob, "is blob", blob.type);

    const url = URL.createObjectURL(blob);
    setPdfUrl(url);

    // cleanup to avoid memory leak
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleDialog}
      title="Receipt"
      size={{ width: "6xl" }}
    >
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="600px"
          style={{ border: "none" }}
        />
      )}
    </DialogWrapper>
  );
};

export default ReceiptReqDialog;

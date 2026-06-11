import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdviceTypeContext } from "../hooks/useAdviceTypeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SenderParameter = () => {
  const { showSenderParamter, setShowSenderParameter, selectedMessageChannel, formData, setFormData } =
    useAdviceTypeContext();

  const updateSenderParam = (key: string, value: string) => {
    setFormData({
      ...formData,
      senderParam: {
        ...formData.senderParam,
        [key]: value,
      },
    });
  };

  const renderSenderForm = () => {
    switch (selectedMessageChannel) {
      case "EMAIL":
        return (
          <div className="flex flex-col gap-3 py-5">
            <div className="flex flex-row items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <label className="text-sm w-32">MAIL_CC_TO</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.MAIL_CC_TO || ""}
                  onChange={(e) => updateSenderParam("MAIL_CC_TO", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-40">MAIL_TO</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.MAIL_TO || ""}
                  onChange={(e) => updateSenderParam("MAIL_TO", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <label className="text-sm w-32">MAIL_BCC_TO</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.MAIL_BCC_TO || ""}
                  onChange={(e) => updateSenderParam("MAIL_BCC_TO", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-40">MAIL_ATTACHMENT</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.MAIL_ATTACHMENT || ""}
                  onChange={(e) => updateSenderParam("MAIL_ATTACHMENT", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <label className="text-sm w-32">MAIL_SUBJECT</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.MAIL_SUBJECT || ""}
                  onChange={(e) => updateSenderParam("MAIL_SUBJECT", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-40">SRC_ADDR</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.SRC_ADDR || ""}
                  onChange={(e) => updateSenderParam("SRC_ADDR", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <label className="text-sm w-32">OPT_SRC_ADDR</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.OPT_SRC_ADDR || ""}
                  onChange={(e) => updateSenderParam("OPT_SRC_ADDR", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-40">CALLBACK_SERVICE</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.CALLBACK_SERVICE || ""}
                  onChange={(e) => updateSenderParam("CALLBACK_SERVICE", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <label className="text-sm w-32">ALTERNATE_NAME</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.ALTERNATE_NAME || ""}
                  onChange={(e) => updateSenderParam("ALTERNATE_NAME", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-40">BOUNCE_ADDRESS</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.BOUNCE_ADDRESS || ""}
                  onChange={(e) => updateSenderParam("BOUNCE_ADDRESS", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case "MMS":
      case "SMS":
        return (
          <div className="flex flex-col gap-3 py-5">
            <div className="flex flex-row items-center px-5 justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm w-40">SOURCE_ADDRESS_TON</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.SOURCE_ADDRESS_TON || ""}
                  onChange={(e) => updateSenderParam("SOURCE_ADDRESS_TON", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-32">SOURCE_ADDRESS</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.SOURCE_ADDRESS || ""}
                  onChange={(e) => updateSenderParam("SOURCE_ADDRESS", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row items-center px-5 justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm w-40">CALLBACK_SERVICE</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData?.senderParam?.CALLBACK_SERVICE || ""}
                  onChange={(e) => updateSenderParam("CALLBACK_SERVICE", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case "TV":
        return (
          <div className="flex flex-col gap-3 py-5">
            <div className="flex flex-row items-center px-5 justify-between">
              <div className="flex items-center gap-5">
                <label className="text-sm w-32">CALLBACK_SERVICE</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData.senderParam?.CALLBACK_SERVICE || ""}
                  onChange={(e) => updateSenderParam("CALLBACK_SERVICE", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm w-32">CYCLE_DURATION</label>
                <Input
                  type="text"
                  className="w-96 h-8 text-sm"
                  value={formData.senderParam?.CYCLE_DURATION || ""}
                  onChange={(e) => updateSenderParam("CYCLE_DURATION", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-row items-center gap-2 px-4 py-5">
            <label className="text-sm w-40">CALLBACK_SERVICE</label>
            <Input
              type="text"
              className="flex-1 h-8 text-sm"
              value={formData.senderParam?.CALLBACK_SERVICE || ""}
              onChange={(e) => updateSenderParam("CALLBACK_SERVICE", e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={showSenderParamter} onOpenChange={setShowSenderParameter}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Send Parameter Management</DialogTitle>
        </DialogHeader>

        {renderSenderForm()}

        <DialogFooter className="flex justify-end gap-3">
          <Button variant="default" className="text-sm px-5" onClick={() => setShowSenderParameter(false)}>
            Ok
          </Button>

          <Button variant="outline" className="text-sm px-5" onClick={() => setShowSenderParameter(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SenderParameter;

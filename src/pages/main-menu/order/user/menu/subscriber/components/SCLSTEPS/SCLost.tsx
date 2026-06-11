import { KeenIcon } from "@/components";
import { useSubscriberListContext } from "../../hooks";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import SCLStep1 from "./components/SCLostStep1";
import SCLStep2 from "./components/SCLostStep2";
import SCLStep3 from "./components/SCLostStep3";
import { SCLProvider } from "./hooks/context";
import Main from "./block/main";

export interface SCLOST {
  susPensionReasonId: string;
  otherReason: string;
  lostType: string;
}

const SCLost = () => {
  const { selectedSubs, setShowDialog, setSelectedOperation } =
    useSubscriberListContext();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<SCLOST>({
    susPensionReasonId: "0",
    otherReason: "",
    lostType: "0",
  });

  const onConfirmCancel = async () => {
    setShowConfirm(false);
    setSelectedOperation(undefined);
  };

  return (
    <SCLProvider>
      <Main />
    </SCLProvider>
  );
};

export default SCLost;

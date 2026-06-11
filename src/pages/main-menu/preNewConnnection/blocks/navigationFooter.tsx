import { Button } from "@/components/ui/button";
import { usePreNew } from "../hooks/context";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { KeenIcon } from "@/components";
import { PopUpDialog } from "../../role-management/generalUseComp";
import { Loading } from "../../role-management/block/loadingBlock";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";

const NavFooter = () => {
  const {
    step,
    setStep,
    setTimeLine,
    form,
    setForm,
    setTriggerSubmit,
    ResetStep,
    fetchBatchPreNewConnection,
    BatchPreNewResp,
    menuPrivAccess,
  } = usePreNew();
  const [isDialogCancelOpen, setIsDialogCancelOpen] = useState<boolean>(false);

  const StepManipulation = (isUp: boolean) => {
    if (step === 0 && !form.actionType) {
      toast.error("Please Select Action Type!");
      return;
    }
    if (step == 3 && isUp) return;
    setTimeLine((prev) =>
      prev.map((item, index) => {
        if (index === step) return { ...item, isCurrent: false };
        if (index === step + (isUp ? 1 : -1))
          return { ...item, isCurrent: true };

        return item;
      }),
    );

    setStep(isUp ? step + 1 : step - 1);
    // setTriggerOk(false);
  };

  // const ResetStep = () => {
  //   setTimeLine((prev) =>
  //     prev.map((item, index) => {
  //       if (index === 0) return { ...item, isCurrent: true };
  //       return { ...item, isCurrent: false };
  //     }),
  //   );

  //   setStep(0);

  //   setForm(initForm);

  //   setTriggerOk(false);
  // };

  const handleCancel = async () => {
    ResetStep();

    setIsDialogCancelOpen(false);

    setTriggerSubmit(false);

    // setShowDialogSuccess(true);

    toast.success("Cancel Success");
  };

  const handleOpenConfirm = () => {
    setForm((prev) => ({
      ...prev,
      isConfirm: true,
    }));
  };

  const handleSubmit = async () => {
    await fetchBatchPreNewConnection();
  };

  useEffect(() => {
    //  console.log("step", step);
  }, [step]);

  const disabledStep = () => {
    const disabledStep =
      (step === 1 && form.selectItems.length === 0) ||
      (step === 2 && form.tempTable.length === 0);
    return disabledStep;
  };

  return (
    <div
      className={`flex flex-row ${step > 0 ? "justify-between" : "justify-end"} items-center w-full`}
    >
      {form.isLoading && <Loading />}
      {/* Dialog Confirm Cancel */}
      <PopUpDialog
        title="Confirm"
        desc="Are you sure to cancel the process?"
        isOpen={isDialogCancelOpen}
        handleDialog={setIsDialogCancelOpen}
        onConfirm={handleCancel}
      />

      {/* Dialog Confirm Submit */}
      <PopUpDialog
        isOpen={form.isConfirm}
        handleDialog={(open) => {
          setForm((prev) => ({
            ...prev,
            isConfirm: open,
          }));
        }}
        title="Confirm"
        desc="Are You Sure To Submit The Proccess?"
        onConfirm={handleSubmit}
      />

      {/* Dialog Success Submit */}
      <PopUpDialog
        isOpen={form.isSuccess}
        handleDialog={(open) => {
          setForm((prev) => ({
            ...prev,
            isSuccess: open,
          }));
        }}
        type="alert"
        alertType="success"
        title="Success"
        desc={`Succeed in batch pre-new connection. The batch number is ${BatchPreNewResp?.wholesaleDto.wholesaleCode}`}
      />

      {step > 0 && (
        <Button
          variant={"outline"}
          size={"sm"}
          onClick={() => StepManipulation(false)}
        >
          <span>
            <KeenIcon icon="left" />
          </span>
          Previous
        </Button>
      )}
      <div className="flex flex-row gap-2">
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            size={"sm"}
            onClick={() => {
              if (step < 3) {
                StepManipulation(true);
              } else {
                setTriggerSubmit(true);

                if (
                  !form.selectedAreaId ||
                  !form.selectedDefLangId ||
                  !form.selectedOrgId ||
                  !form.reqDate
                ) {
                  toast.error("Please fill all required fields!");
                  return;
                }

                handleOpenConfirm();
              }
            }}
            disabled={disabledStep()}
          >
            {step < 3 ? "Next" : "Submit"}
          </Button>
        </AccessWrapper>
        {step > 0 && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setIsDialogCancelOpen(true)}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default NavFooter;

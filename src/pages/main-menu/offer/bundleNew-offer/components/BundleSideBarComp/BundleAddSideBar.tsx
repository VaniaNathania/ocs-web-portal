import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useBundleOfferContext } from "../../hooks/useBundleOfferContext";
import { initStateAddSideBar, reqFields } from "../../types/BundleTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import useApiBundleNew from "../../UseApiBundle/UseApiBundleNew";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Value } from "@radix-ui/react-select";
import { RefreshCcw, RefreshCw } from "lucide-react";

const BundleAddSideBar = () => {
  const {
    ShowAddSideBarBund,
    setShowAddSideBarBund,
    handleDialogSideBar,
    refreshBundCategorySideBar,
    errorsBund,
    setErrorsBund,
    alertAdd,
    setAlertAdd,
    setSubmittAdd,
    submittAdd,
  } = useBundleOfferContext();
  const { createAddSideBarBund } = useApiBundleNew();

  const parentRefBund = useRef<any | null>(null);
  const [formAddSideBar, setFormAddSideBar] = useState(initStateAddSideBar);

  const handleResetFormAddSideBar = () => {
    setFormAddSideBar(initStateAddSideBar);
    setErrorsBund({});
    setAlertAdd({ show: false, message: "" });
  };

  useEffect(() => {
    if (ShowAddSideBarBund === false) {
      handleResetFormAddSideBar();
    }
  }, [ShowAddSideBarBund]);

  const validateFormSideBar = () => {
    const newErrorsBund: Record<string, string> = {};
    let isValidBund = true;
    const fieldsAdd = reqFields;

    setAlertAdd({ show: false, message: "" });

    fieldsAdd.forEach(({ key, label }) => {
      const valueFields = formAddSideBar[key as keyof typeof formAddSideBar];
      const emptyBund =
        valueFields === "" ||
        valueFields === null ||
        valueFields === undefined ||
        (typeof valueFields === "number" &&
          valueFields === 0 &&
          key !== "spId");

      if (emptyBund) {
        newErrorsBund[key] = `${label} is Required`;
        isValidBund = false;
      }
    });

    if (
      formAddSideBar.effDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formAddSideBar.effDate)
    ) {
      newErrorsBund.effDate = "Effective Date must be in format YYYY-MM-DD";
      isValidBund = false;
    }

    setErrorsBund(newErrorsBund);

    if (!isValidBund) {
      const firstErrorBund = Object.values(newErrorsBund)[0];
      setAlertAdd({
        show: true,
        message: firstErrorBund || "Please fill in all required fields",
      });
    }

    return isValidBund;
  };

  const handleSubmitAddSideBar = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateFormSideBar()) {
        return;
      }

      setSubmittAdd(true);
      setAlertAdd({ show: false, message: "" });

      try {
        const response = await createAddSideBarBund(formAddSideBar);
        if (response?.status) {
          handleResetFormAddSideBar();

          toast.success("Category created successfully");
          await refreshBundCategorySideBar();

          const AddActivity = {
            module: "Manage Related Product",
            description: `Create Category => ${formAddSideBar.offerCatgName}`,
            action: "C",
          };
          doSaveLogActivity(AddActivity);

          handleDialogSideBar(false);
        } else {
          const messageErrBund =
            response?.message || "Failed to create Category. Please try again.";
          toast.error(messageErrBund);
          setAlertAdd({
            show: true,
            message: messageErrBund,
          });
        }
      } catch (error: any) {
        const messageErrBund =
          error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating category:", error);
        toast.error(messageErrBund);
        setAlertAdd({
          show: true,
          message: messageErrBund,
        });
      } finally {
        setSubmittAdd(false);
      }
    },
    [formAddSideBar, handleDialogSideBar]
  );

  return (
    <Dialog open={ShowAddSideBarBund} onOpenChange={handleDialogSideBar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>
        <DialogBody ref={parentRefBund}>
          <div className="flex flex-col">
            <form onSubmit={handleSubmitAddSideBar}>
              <div className="card-body grid gap-5">
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Category Name<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errorsBund.offerCatgName ? "border-red-500" : ""}`}
                    type="text"
                    autoComplete="off"
                    placeholder="Category Name (Max 60 chars)"
                    maxLength={60}
                    value={formAddSideBar.offerCatgName}
                    onChange={({ target }) => {
                      const val = target.value;
                      if (val.length <= 60) {
                        setFormAddSideBar((prev) => ({
                          ...prev,
                          offerCatgName: target.value,
                        }));
                      }
                      setErrorsBund((prev) => ({ ...prev, offerCatgName: "" }));
                    }}
                  />
                  <p className="text-xs text-gray-500 col-span-8 ml-[calc(25%+0.5rem)]">
                    {formAddSideBar.offerCatgName.length}/60 characters
                  </p>
                  {errorsBund.offerCatgName && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errorsBund.offerCatgName}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Category Code<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errorsBund.offerCatgCode ? "border-red-500" : ""}`}
                    type="text"
                    autoComplete="off"
                    placeholder="Category Code (letters, numbers, hyphens, underscores only)"
                    maxLength={60}
                    value={formAddSideBar.offerCatgCode}
                    onChange={({ target }) => {
                      setFormAddSideBar((prev) => ({
                        ...prev,
                        offerCatgCode: target.value,
                      }));

                      setErrorsBund((prev) => ({ ...prev, offerCatgName: "" }));
                    }}
                  />
                  {errorsBund.offerCatgCode && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errorsBund.offerCatgCode}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`input col-span-6 ${errorsBund.effDate ? "border-red-500" : ""}`}
                    type="date"
                    autoComplete="off"
                    value={formAddSideBar.effDate}
                    onChange={({ target }) => {
                      setFormAddSideBar((prev) => ({
                        ...prev,
                        effDate: target.value,
                      }));
                      setErrorsBund((prev) => ({ ...prev, effDate: "" }));
                    }}
                  />
                  {errorsBund.effDate && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errorsBund.effDate}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-8 gap-2 items-center">
                  <label className="form-label flex items-center gap-1 col-span-2">
                    Comment
                  </label>
                  <Textarea
                    className={`input col-span-6 ${errorsBund.comments ? "border-red-500" : ""}`}
                    autoComplete="off"
                    placeholder="Comment"
                    value={formAddSideBar.comments}
                    onChange={({ target }) => {
                      setFormAddSideBar((prev) => ({
                        ...prev,
                        comments: target.value,
                      }));
                      setErrorsBund((prev) => ({ ...prev, comments: "" }));
                    }}
                    rows={3}
                  />
                  {errorsBund.comments && (
                    <span className="text-red-500 text-xs mt-1 col-span-8 ml-[calc(25%+0.5rem)]">
                      {errorsBund.comments}
                    </span>
                  )}
                </div>
                <div className="flex justify-end gap-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetFormAddSideBar}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                    disabled={submittAdd}
                  >
                    {submittAdd ? (
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    ) : null}
                    {submittAdd ? "Creating...." : "Create"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default BundleAddSideBar;

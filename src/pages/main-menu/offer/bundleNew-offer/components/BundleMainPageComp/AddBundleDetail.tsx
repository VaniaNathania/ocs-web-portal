import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useBundleOfferContext } from "../../hooks/useBundleOfferContext";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  EffTypeDetailBundAdd,
  FormDatasAddBundDetail,
  FormFieldDatasDetailBund,
  initBundDetailAdd,
  lifeCycleTypeAddDetail,
  reqFieldsBundDetail,
  serviceTypeAddDetail,
} from "../../types/BundleTypes";
import useApiBundleNew from "../../UseApiBundle/UseApiBundleNew";
import { toast } from "sonner";
import { useDataGrid } from "@/components";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const AddBundleDetail = () => {
  const {
    handleAddDialogBundDetail,
    showAddBundleDetail,
    handleDialogSideBar,
    alertAdd,
    errorsBund,
    submittAdd,
    selectCategorySideId,
    setSubmittAdd,
    setAlertAdd,
    setErrorsBund,
    refreshBundCategorySideBar,
    triggerReloadBundle,
  } = useBundleOfferContext();

  // const { reload } = useDataGrid();

  const {
    createBundDetailAdd,
    getLifeCycleTypeService,
    getServiceTypeAddDetail,
  } = useApiBundleNew();

  const [alertBundDetail, setAlertBundDetail] = useState({
    show: false,
    message: "",
  });

  const [formDatasAddBundDetail, setFormDatasAddBundDetail] =
    useState<FormDatasAddBundDetail>(initBundDetailAdd);
  const [formFieldDatasDetail, setFormFieldDatasDetail] =
    useState<FormFieldDatasDetailBund>({
      agreementperiodinput: null,
      agreementperiodselect: null,
      automaticrenewal: "N",
    });
  const [lifeCycleTypeAddDetail, setLifeCycleTypeAddDetail] = useState<
    lifeCycleTypeAddDetail[]
  >([]);
  const [serviceTypeAddDetail, setServiceTypeDetail] = useState<
    serviceTypeAddDetail[]
  >([]);
  const [selectEffType, setSelectEffType] = useState<string[]>([]);
  const [effTypeOpenDetail, setEffTypeOpenDetail] = useState(false);

  const fetchingLifeCycleTypeAddDetail = async (spId: number) => {
    try {
      const response = await getLifeCycleTypeService(spId);

      if (response?.data) {
        setLifeCycleTypeAddDetail(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Service Type Data");
    }
  };

  const fetchingServiceTypeAddDetail = async (page: number, size: number) => {
    try {
      const response = await getServiceTypeAddDetail(page, size);

      if (response?.data) {
        setServiceTypeDetail(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Service Type Data");
    }
  };

  const resetFormBundDetail = () => {
    setFormDatasAddBundDetail(initBundDetailAdd);
    setErrorsBund({});
    setAlertAdd({ show: false, message: "" });
  };

  const validateFormAddBundDetail = () => {
    const required = reqFieldsBundDetail;
    const newBundDetailErr: Record<string, string> = {};
    let validBundDetail = true;

    setAlertAdd({ show: false, message: "" });

    required.forEach(({ key, label }) => {
      let value;
      if (key.startsWith("offer.")) {
        const offerFieldDetail = key.replace("offer.", "");
        value =
          formDatasAddBundDetail.offer[
            offerFieldDetail as keyof typeof formDatasAddBundDetail.offer
          ];
      } else {
        value = formDatasAddBundDetail[key as keyof FormDatasAddBundDetail];
      }

      const emptyAddBunDet =
        value === "" || value === null || value === undefined;

      if (emptyAddBunDet) {
        newBundDetailErr[key] = `${label} is Required`;
        validBundDetail = false;
      }
    });

    setErrorsBund(newBundDetailErr);

    if (!validBundDetail) {
      const firstBundDetErr = Object.values(newBundDetailErr)[0];
      setAlertAdd({
        show: true,
        message: firstBundDetErr || "Please fill in all required fields",
      });
    }

    return validBundDetail;
  };

  const paylodApiDetail = JSON.parse(
    JSON.stringify(formDatasAddBundDetail, (key, value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      return value;
    }),
  );

  const handleSubmitAddBundDetail = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateFormAddBundDetail()) {
        return;
      }

      setSubmittAdd(true);
      setAlertAdd({ show: false, message: "" });

      try {
        const response = await createBundDetailAdd(paylodApiDetail);

        if (response?.status) {
          resetFormBundDetail();
          toast.success("Bundle Created Successfully");
          await refreshBundCategorySideBar();

          triggerReloadBundle();

          const createBundDetailActv = {
            module: "Manage Bundle",
            description: `Create Bundle => ${formDatasAddBundDetail.offer.offerName}`,
            action: "C",
          };
          doSaveLogActivity(createBundDetailActv);
        } else {
          const errDetailMessage =
            response?.message ||
            "Failed to create Main Product. Please try again.";
          toast.error(errDetailMessage);
          setAlertAdd({
            show: true,
            message: errDetailMessage,
          });
        }
      } catch (error: any) {
        const errDetailMessage =
          error?.message || "Something went wrong. Please try again.";
        toast.error(errDetailMessage);
        setAlertAdd({
          show: true,
          message: errDetailMessage,
        });
      } finally {
        setSubmittAdd(false);
      }
    },
    [formDatasAddBundDetail, handleAddDialogBundDetail, triggerReloadBundle],
  );

  const handleChangeInputAddDetail = (
    field: string,
    value: string | number,
  ) => {
    if (field.startsWith("offer")) {
      const offAddField = field.replace("offer.", "");
      setFormDatasAddBundDetail((prev) => ({
        ...prev,
        offer: {
          ...prev.offer,
          [offAddField]: value,
        },
      }));
    } else {
      setFormDatasAddBundDetail((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    if (errorsBund[field]) {
      setErrorsBund((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCancelAddDetail = () => {
    handleAddDialogBundDetail(false);
  };

  useEffect(() => {
    if (showAddBundleDetail === false) {
      resetFormBundDetail();
    }

    if (showAddBundleDetail) {
      setFormDatasAddBundDetail((prev) => ({
        ...prev,
        offerCatgId: selectCategorySideId ? Number(selectCategorySideId) : 1,
      }));
      fetchingLifeCycleTypeAddDetail(formDatasAddBundDetail.offer.spId);
      fetchingServiceTypeAddDetail(1, 10);
    } else {
      setFormDatasAddBundDetail((prev) => ({
        ...prev,
        servType: "",
      }));
    }
  }, [showAddBundleDetail, selectCategorySideId]);

  useEffect(() => {
    const joinEffType = selectEffType.join("|");
    setFormDatasAddBundDetail((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        effType: joinEffType,
      },
    }));
  }, [selectEffType]);

  return (
    <Dialog open={showAddBundleDetail} onOpenChange={handleAddDialogBundDetail}>
      <DialogContent className="max-w-6xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Bundle Detail</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {alertAdd.show && (
            <div className="m-4 p-3 bg-red-50 border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{alertAdd.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmitAddBundDetail}>
            <div className="mb-6">
              <label className="form-label pb-2">
                Bundle Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formDatasAddBundDetail.offer.offerName}
                onChange={(e) =>
                  handleChangeInputAddDetail("offer.offerName", e.target.value)
                }
                disabled={submittAdd}
                placeholder="Enter Bundle Name"
                className={
                  errorsBund["offer.offerName"] ? "border-red-500" : ""
                }
              />
              {errorsBund["offer.offerName"] && (
                <p className="text-red-500 text-xs mt-1 ">
                  {errorsBund["offer.offerName"]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label pb-2">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formDatasAddBundDetail.offer.effDate}
                    onChange={(e) =>
                      handleChangeInputAddDetail(
                        "offer.effDate",
                        e.target.value,
                      )
                    }
                    disabled={submittAdd}
                    className={
                      errorsBund["offer.effDate"] ? "border-red-500" : ""
                    }
                  />
                  {errorsBund["offer.effDate"] && (
                    <p className="text-red-500 text-xs mt-1 ">
                      {errorsBund["offer.effDate"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="form-label pb-2">
                    Bundle Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formDatasAddBundDetail.offer.offerCode}
                    onChange={(e) =>
                      handleChangeInputAddDetail(
                        "offer.offerCode",
                        e.target.value,
                      )
                    }
                    disabled={submittAdd}
                    placeholder="Enter Code"
                    className={
                      errorsBund["offer.offerCode"] ? "border-red-500" : ""
                    }
                  />
                  {errorsBund["offer.offerCode"] && (
                    <p className="text-red-500 text-xs mt-1 ">
                      {errorsBund["offer.offerCode"]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="form-label pb-2">
                    Paid Flag <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="paidFlag"
                        value="N"
                        checked={formDatasAddBundDetail.paidFlag === "N"}
                        onChange={(e) =>
                          handleChangeInputAddDetail("paidFlag", e.target.value)
                        }
                        disabled={submittAdd}
                        className="mr-2"
                      />
                      Pre-Paid
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="radio"
                        name="paidFlag"
                        value="Y"
                        checked={formDatasAddBundDetail.paidFlag === "Y"}
                        onChange={(e) =>
                          handleChangeInputAddDetail("paidFlag", e.target.value)
                        }
                        disabled={submittAdd}
                        className="mr-2"
                      />
                      Post-Paid
                    </label>
                    {errorsBund["paidFlag"] && (
                      <p className="text-red-500 text-xs mt-1 ">
                        {errorsBund["paidFlag"]}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Automatic Renewal
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="flex items-center space-x-2">
                      <Input
                        type="radio"
                        name="autorenewal"
                        value="Y"
                        checked={formFieldDatasDetail.automaticrenewal === "Y"}
                        onChange={({ target }) =>
                          setFormFieldDatasDetail((prev) => ({
                            ...prev,
                            automaticrenewal: target.value,
                          }))
                        }
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Input
                        type="radio"
                        name="autorenewal"
                        value="N"
                        checked={formFieldDatasDetail.automaticrenewal === "N"}
                        onChange={({ target }) =>
                          setFormFieldDatasDetail((prev) => ({
                            ...prev,
                            automaticrenewal: target.value,
                          }))
                        }
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label pb-2">Remaks</label>
                  <textarea
                    placeholder="Tulis disini....."
                    value={formDatasAddBundDetail.offer.comments}
                    onChange={(e) =>
                      handleChangeInputAddDetail(
                        "offer.comments",
                        e.target.value,
                      )
                    }
                    className="w-full input h-14 p-2"
                    disabled={submittAdd}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Expiry Date</label>
                  <Input
                    type="date"
                    value={formDatasAddBundDetail.offer.expDate}
                    onChange={(e) =>
                      handleChangeInputAddDetail(
                        "offer.expDate",
                        e.target.value,
                      )
                    }
                    disabled={submittAdd}
                    className={
                      errorsBund["offer.expDate"] ? "border-red-500" : ""
                    }
                    min={formDatasAddBundDetail.offer.effDate || undefined}
                  />
                </div>

                <div>
                  <label className="form-label pb-2">Effective Type</label>
                  <Popover
                    open={effTypeOpenDetail}
                    onOpenChange={setEffTypeOpenDetail}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-center"
                      >
                        <span className="truncate w-[85%] text-left">
                          {selectEffType.length === 0
                            ? "Select Effective Type"
                            : EffTypeDetailBundAdd.filter((item) =>
                                selectEffType.includes(item.value),
                              )
                                .map((item) => item.label)
                                .join("|")}
                        </span>
                        <MdKeyboardArrowDown className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[520px]">
                      <div className="flex flex-col gap-2">
                        {EffTypeDetailBundAdd.map((item) => (
                          <label
                            key={item.value}
                            className="flex items-center gap-2 text-md"
                          >
                            <Checkbox
                              checked={selectEffType.includes(item.value)}
                              onCheckedChange={(c) => {
                                setSelectEffType((prev) =>
                                  c
                                    ? [...prev, item.value]
                                    : prev.filter((val) => val !== item.value),
                                );
                              }}
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    LifeCycle Type
                  </label>
                  <Select
                    value={formDatasAddBundDetail.lifecycleType || ""}
                    onValueChange={(val) =>
                      handleChangeInputAddDetail("lifecycleType", val)
                    }
                    disabled={submittAdd}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="--- Please Select ---" />
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      className="max-h-60 overflow-y-auto"
                    >
                      {lifeCycleTypeAddDetail.map((type) => (
                        <SelectItem
                          key={type.lifecycleType}
                          value={type.lifecycleType.toString()}
                        >
                          {type.lifecycleTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Agreement Period
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <Input
                      className="input"
                      type="number"
                      placeholder="Agreement Period"
                      autoComplete="off"
                      min={0}
                      value={formFieldDatasDetail.agreementperiodinput ?? ""}
                      onChange={({ target }) =>
                        setFormFieldDatasDetail((prev) => ({
                          ...prev,
                          agreementperiodinput:
                            target.value === "" ? null : target.value,
                        }))
                      }
                    />
                    <Select
                      onValueChange={(val) =>
                        setFormFieldDatasDetail((prev) => ({
                          ...prev,
                          agreementperiodselect: val === "" ? null : val,
                        }))
                      }
                      value={
                        formFieldDatasDetail.agreementperiodselect ?? undefined
                      }
                    >
                      <SelectTrigger className="w-full border rounded px-2 py-1 text-sm mt-1">
                        <SelectValue className="--- Please Select ---" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Year</SelectItem>
                        <SelectItem value="M">Month</SelectItem>
                        <SelectItem value="W">Week</SelectItem>
                        <SelectItem value="D">Day</SelectItem>
                        <SelectItem value="H">Hour</SelectItem>
                        <SelectItem value="C">Billing Cycle</SelectItem>
                        <SelectItem value="S">Exact Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="form-label pb-2">Product Line</label>
                  <Select
                    value={formDatasAddBundDetail.prodType}
                    onValueChange={(val) => {
                      handleChangeInputAddDetail("prodType", val);
                      handleChangeInputAddDetail("offer.prodType", val);
                    }}
                    disabled={submittAdd}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="--- Please Select ---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">Fix</SelectItem>
                      <SelectItem value="M">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelAddDetail}
                disabled={submittAdd}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittAdd}>
                {submittAdd ? "Creating" : "Create"}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddBundleDetail;

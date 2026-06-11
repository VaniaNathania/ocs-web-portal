import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionUpdatePriceRatingSchema } from "../rating/types/form";
import { useSubscriptionPriceCreateContext } from "../../hooks";
import AccountItemSearchSelect from "../SelectSearchAccountItemType";
import { PricePlanService } from "@/common/api/price-plan/endpoints";

const API_URL = apiConfig.service_price_plan;
type SubscriptionUpdatePriceRatingForm = z.infer<
  typeof subscriptionUpdatePriceRatingSchema
>;

const EditPriceVersionZone = () => {
  const {
    showEditPriceDialog,
    handleEditPriceDialog,
    selectedPrice,
    selectedRatePlan,
    selectedEvent,
    priceVersionDate,
    setSelectedMapping,
  } = useSubscriptionPriceCreateContext();
  const {  dataPricePlan, dataPricePlanDetail  } = usePortalData();

  const { GetData, PutData } = useCallApi();
  const { GET_REATTR } = PricePlanService();

  const [accountTypes, setAccountTypes] = useState<
    { id: number; acctItemTypeName: string }[]
  >([]);
  const [calculateUnit, setCalculateUnit] = useState<
    { id: number; reAttrName: string }[]
  >([]);

  const methods = useForm<SubscriptionUpdatePriceRatingForm>({
    resolver: zodResolver(subscriptionUpdatePriceRatingSchema),
    defaultValues: {
      effDate: "",
      expDate: "",
      priceName: "",
      acctItemTypeId: undefined,
      price: undefined,
      payIndicator: null,
      rum: undefined,
      reAttr: undefined,
      comments: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
  const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const resetForm = () => {
    reset();
  };

  const getCalculateUnit = async () => {
    try {
      const response = await GET_REATTR();

      setCalculateUnit(response?.data);
    } catch (error) {
      console.error("Error fetching calculate unit data:", error);
    }
  };

  const getAccountItemType = async () => {
    try {
      const response = await GetData(`${API_URL}/acct/item-type-name/list`, {});

      setAccountTypes(response?.data);
    } catch (error) {
      console.error("Error fetching account type data:", error);
    }
  };

  const fetchDefaultValue = useCallback(async (selectedPrice: number) => {
    setIsLoading(true);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 300));
    const fetchData = await GetData(
      `${API_URL}/price/detail/${selectedPrice}`,
      {},
    );
    const [response] = await Promise.all([fetchData, minDelay]);

    if (response.status) {
      setValue("effDate", response.data?.effDate);
      setValue("expDate", response.data?.expDate);
      setValue("priceName", response.data?.priceName);
      setValue("acctItemTypeId", response.data?.acctItemTypeId);
      setValue("price", response.data?.value);
      setValue("payIndicator", response.data?.payIndicator);
      setValue("rum", response.data?.rum);
      setValue("reAttr", response.data?.reAttr);
      setValue("comments", response.data?.remarks);
    }
    setIsLoading(false);
  }, []);

  const doUpdatePrice = async (
    formField: SubscriptionUpdatePriceRatingForm,
    priceId: number,
  ) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/price/update/${priceId}`,
        formField,
      );

      if (response?.status) {
        setSelectedMapping(null);
        toast.success(response?.message);
        handleEditPriceDialog(false, null);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error creating Rate Plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: SubscriptionUpdatePriceRatingForm) => {
    // console.log(data);
    doUpdatePrice(data, selectedPrice ?? 0);
  };

  const isValidDate = (str: string) => {
    return !!str && str !== "-" && !isNaN(Date.parse(str));
  };

  useEffect(() => {
    getAccountItemType();
    getCalculateUnit();
  }, []);

  useEffect(() => {
    if (!showEditPriceDialog) {
      resetForm();
    }
  }, [showEditPriceDialog]);

  useEffect(() => {
    if (selectedPrice) {
      // if (priceVersionDate) {
      //   const [effDateRaw, expDateRaw] = priceVersionDate.split(" - ");
      //   const effDate = effDateRaw?.trim() || "";

      //   const rawExpDate = expDateRaw?.trim();
      //   const expDate = rawExpDate && rawExpDate !== "-" ? rawExpDate : "";

      //   setFormField((prev) => ({
      //     ...prev,
      //     effDate,
      //     expDate,
      //   }));

      //   setIsEffDateDisabled(isValidDate(effDate));
      //   setIsExpDateDisabled(isValidDate(expDate));
      // } else {
      //   setIsEffDateDisabled(false);
      //   setIsExpDateDisabled(false);
      // }
      fetchDefaultValue(selectedPrice);
    }
  }, [selectedPrice]);
  //  console.log(errors);
  return (
    <Dialog
      open={showEditPriceDialog}
      onOpenChange={(open) => handleEditPriceDialog(open, null)}
    >
      <DialogContent className="max-w-[1200px] p-0 gap-0 bg-white rounded-lg shadow-xl">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Edit Price
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <DialogBody className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-pulse flex space-x-4 w-full">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-500">Loading Price Details...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Effective Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Effective Date
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`w-full transition-colors ${
                      errors.effDate
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    type="date"
                    {...register("effDate")}
                    placeholder="Select effective date"
                    disabled={true}
                  />
                  {errors.effDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.effDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Expiry Date
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`w-full transition-colors ${
                      errors.expDate
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    type="date"
                    {...register("expDate")}
                    placeholder="Select expiry date"
                    disabled={true}
                  />
                  {errors.expDate && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.expDate.message}
                    </p>
                  )}
                </div>

                {/* Price Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Price Name
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className={`w-full transition-colors ${
                      errors.priceName
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    type="text"
                    {...register("priceName")}
                    placeholder="Enter price name"
                  />
                  {errors.priceName && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.priceName.message}
                    </p>
                  )}
                </div>

                {/* Two Column Layout for Price and Calculate Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("price")}
                      placeholder="0.00"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <Input
                    className="w-full mt-8 bg-gray-100 border border-dashed border-gray-400 text-gray-600 cursor-not-allowed"
                    type="number"
                    min="0"
                    value={watch("acctItemTypeId") || ""}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Calculate Unit <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors"
                      type="number"
                      min="0"
                      {...register("rum", { valueAsNumber: true })}
                      placeholder="Enter calculation unit"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Unit
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={String(watch("reAttr")) ?? ""}
                      onValueChange={(value) => {
                        setValue("reAttr", Number(value));
                      }}
                    >
                      <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-200 transition-colors">
                        <SelectValue placeholder="Select account item type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                        {/* {calculateUnit.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id.toString()}
                            className="cursor-pointer"
                          >
                            {item.reAttrName}
                          </SelectItem>
                        ))} */}
                        <SelectItem value="101" className="cursor-pointer">
                          Occurance
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Account Item Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Result Account Item Type{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  {/* GANTI SELECT INI */}
                  <AccountItemSearchSelect
                    value={watch("acctItemTypeId")}
                    onChange={(value) => setValue("acctItemTypeId", value!)}
                    placeholder="Search account item type..."
                    error={!!errors.acctItemTypeId}
                    className="w-full"
                  />

                  {/* Tambahkan error message jika ada */}
                  {errors.acctItemTypeId && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.acctItemTypeId.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none"
                  rows={3}
                  {...register("comments")}
                  placeholder="Enter remarks"
                />
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleEditPriceDialog(false, null)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceVersionZone;

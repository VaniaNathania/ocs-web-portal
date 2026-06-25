import { Input } from "@/components/ui/input";
import { useSubscriptionPriceCreateContext } from "../../../../hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Calendar, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { periodType, SubscriptionCreateBenefitFormType } from "../AddPriceDialog";
import { Control, Controller, useFormContext, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { SubscriptionUpdateBenefitFormType } from "../EditPriceDialog";

type BenefitFormType = SubscriptionCreateBenefitFormType | SubscriptionUpdateBenefitFormType;

type BenefitValueProps<T extends BenefitFormType> = {
  periodType: periodType;
  setPeriodType: React.Dispatch<React.SetStateAction<periodType>>;
  // methods: UseFormReturn<T>;
};

const API_URL = apiConfig.service_price_plan;

const BenefitValue = <T extends BenefitFormType>({ periodType, setPeriodType }: BenefitValueProps<T>) => {
  const { GetData } = useCallApi();
  const {
    register,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BenefitFormType>();

  const balFlags = watch("balFlags");
  const reAttrId = watch("reAttrId");
  const acctBalanceTypeId = watch("acctBalanceTypeId");
  const subscriberOnly = watch("subscriberOnly");
  const offsetOfEffectiveDateUnit = watch("offsetOfEffectiveDateUnit");
  const durationOfAvailabilityUnit = watch("durationOfAvailabilityUnit");
  const relativePeriodUnit = watch("relativePeriodUnit");
    const { selectedPriceVer, setSelectedPriceVer} = useSubscriptionPriceCreateContext();
    const [isEffDateDisabled, setIsEffDateDisabled] = useState(false);
    const [isExpDateDisabled, setIsExpDateDisabled] = useState(false);
      const expiryDate = (selectedPriceVer as any)?.expDate;


  const [accountBalanceType, setAccountBalanceType] = useState<{ acctResId: string; acctResName: string }[]>([]);

  const [timeUnit, setTimeUnit] = useState<
    {
      timeUnit: string;
      timeUnitName: string;
    }[]
  >([]);

  const [eventFeaturesType, setEventFeaturesType] = useState<{ reAttrId: number; reAttrName: string }[]>([]);

  //helper untuk convert string to number
  const transformOptionalNumber = (value: unknown) => {
    if (value === "" || value === undefined || value === null) {
      return null;
    }

    return Number(value);
  };

  const fetchEventFeature = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/re-attr/list`, {
        reType: 3,
        spId: 0,
      });

      if (response.status) {
        setEventFeaturesType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching event feature");
    }
  };

  const GetTimeUnitType = async () => {
    try {
      const response = await GetData(`${API_URL}/time-unit/list?notExact=Y`, {});

      if (response.status) {
        setTimeUnit(response?.data);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Error fetching time unit data");
    }
  };

  const GetAccountBalanceType = async () => {
    try {
      const response = await GetData(`${API_URL}/account-balance/acct-res-list`, {});

      setAccountBalanceType(response?.data);
    } catch (error) {
      console.error("Error fetching account type data:", error);
    }
  };

  useEffect(() => {
    GetAccountBalanceType();
    GetTimeUnitType();
    fetchEventFeature();
  }, []);

  useEffect(() => {
    if (periodType === "relative") {
      setValue("absoluteEffectiveDate", null);
      setValue("absoluteExpiryDate", null);
    } else if (periodType === "absolute") {
      setValue("relativeEffectiveTime", null);
      setValue("relativeExpiryTime", null);
      setValue("relativePeriodUnit", null);
      setValue("offsetOfEffectiveDate", null);
      setValue("offsetOfEffectiveDateUnit", null);
      setValue("durationOfAvailability", null);
      setValue("durationOfAvailabilityUnit", null);
    }
  }, [periodType, setValue]);

  return (
    <div className="p-5 space-y-6">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Benefit Value
          </label>
          <Input type="text" {...register("benefitValue")} placeholder="Enter benefit value" className={`${errors.benefitValue ? "border-red-500" : ""}`} />
          {errors.benefitValue && <p className="text-xs text-red-500 mt-1">{errors.benefitValue.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Calculation Unit */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> Calculation Unit
            </label>
            <Input
              type="number"
              className={`w-full ${errors.calculationUnit ? "border-red-500" : ""}`}
              placeholder="Enter Calculate Unit"
              min={0}
              onKeyDown={(e) => {
                if (e.key === "." || e.key === "," || e.key === "-") {
                  e.preventDefault();
                }
              }}
              {...register("calculationUnit", {
                setValueAs: (value) => {
                  if (value === "" || value === undefined) return null;
                  return Number(value);
                },
              })}
            />
            {errors.calculationUnit && <p className="text-xs text-red-500 mt-1">{errors.calculationUnit.message}</p>}
          </div>

          {/* reAttrId Select */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> (Calculation Unit) Per
            </label>
            <Controller
              control={control}
              name="reAttrId"
              rules={{ required: "Calculation Unit Per is required" }}
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))}>
                  <SelectTrigger className={`w-full ${errors.reAttrId ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Account Balance Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventFeaturesType.map((item) => (
                      <SelectItem key={item.reAttrId} value={String(item.reAttrId)}>
                        {item.reAttrName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.reAttrId && <p className="text-xs text-red-500 mt-1">{errors.reAttrId.message}</p>}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Controller
          control={control}
          name="acctBalanceTypeId"
          rules={{ required: "Account Balance Type is required" }}
          render={({ field }) => (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Account Balance Type
              </label>
              <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))}>
                <SelectTrigger className={`w-full ${errors.acctBalanceTypeId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select Account Balance Type" />
                </SelectTrigger>
                <SelectContent>
                  {accountBalanceType.map((item) => (
                    <SelectItem key={item.acctResId} value={String(item.acctResId)}>
                      {item.acctResName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.acctBalanceTypeId && <p className="text-xs text-red-500 mt-1">{errors.acctBalanceTypeId.message}</p>}
            </div>
          )}
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Subscriber Only</label>
          <Select value={watch("subscriberOnly") ?? ""} onValueChange={(val) => setValue("subscriberOnly", val === "null" ? null : val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Subscriber Only" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">Select Subscriber Only</SelectItem>
              <SelectItem value="Y">Yes</SelectItem>
              <SelectItem value="N">No</SelectItem>
            </SelectContent>
          </Select>
          {/* {errors.subscriberOnly && (
            <p className="text-xs text-red-500 mt-1">
              {errors.subscriberOnly.message}
            </p>
          )} */}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Cycle Floor Limit</label>
            <Input
              type="text"
              placeholder="Enter Cycle Floor Limit"
              {...register("cycleFloorLimit", {
                setValueAs: transformOptionalNumber,
              })}
            />
            {errors.cycleFloorLimit && <p className="text-xs text-red-500 mt-1">{errors.cycleFloorLimit.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Cycle Ceil Limit</label>
            <Input
              type="text"
              placeholder="Enter Cycle Ceil Limit"
              {...register("cycleCeilLimit", {
                setValueAs: transformOptionalNumber,
              })}
            />
            {errors.cycleCeilLimit && <p className="text-xs text-red-500 mt-1">{errors.cycleCeilLimit.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Daily Floor Limit</label>
            <Input
              type="text"
              placeholder="Enter Daily Floor Limit"
              {...register("dailyFloorLimit", {
                setValueAs: transformOptionalNumber,
              })}
            />
            {errors.dailyFloorLimit && <p className="text-xs text-red-500 mt-1">{errors.dailyFloorLimit?.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Daily Ceil Limit</label>
            <Input
              type="text"
              placeholder="Enter Daily Ceil Limit"
              {...register("dailyCeilLimit", {
                setValueAs: transformOptionalNumber,
              })}
            />
            {errors.dailyCeilLimit && <p className="text-xs text-red-500 mt-1">{errors.dailyCeilLimit.message}</p>}
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Period Type</label>
            <Select value={periodType} onValueChange={(e) => setPeriodType(e as "absolute" | "relative")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Period Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="absolute">Absolut</SelectItem>
                <SelectItem value="relative">Relative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Maximum Days</label>
            <Input
              type="text"
              placeholder="Enter Maximum Days"
              {...register("maximumDays", {
                setValueAs: (value) => {
                  if (value === "" || value === undefined) return null;
                  return Number(value);
                },
              })}
            />
            {errors.maximumDays && <p className="text-xs text-red-500 mt-1">{errors.maximumDays.message}</p>}
          </div>
        </div>

        {periodType === "relative" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Balance Flag</label>
              <Select value={balFlags ?? ""} onValueChange={(e) => setValue("balFlags", e)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Balance Flag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="00000000">Value Free</SelectItem>
                  <SelectItem value="10100000">Value Paid</SelectItem>
                </SelectContent>
              </Select>
              {errors.balFlags && <p className="text-xs text-red-500 mt-1">{errors.balFlags.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Relative Period Type</label>
              <Select value={relativePeriodUnit ?? ""} onValueChange={(e) => setValue("relativePeriodUnit", e as "M" | "D" | "S")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Relative Period Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Month</SelectItem>
                  <SelectItem value="D">Day</SelectItem>
                  <SelectItem value="S">Seconds</SelectItem>
                </SelectContent>
              </Select>
              {errors.relativePeriodUnit && <p className="text-xs text-red-500 mt-1">{errors.relativePeriodUnit.message}</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Balance Flag</label>
            <Select value={balFlags ?? ""} onValueChange={(e) => setValue("balFlags", e)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Balance Flag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00000000">Value Free</SelectItem>
                <SelectItem value="10100000">Value Paid</SelectItem>
              </SelectContent>
            </Select>
            {errors.balFlags && <p className="text-xs text-red-500 mt-1">{errors.balFlags.message}</p>}
          </div>
        )}
      </div>

      {periodType === "absolute" && (
        <>
          {/* Row 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">*</span> Absolute Effective Date
              </label>
              <div className="relative w-full">
                <input
                  type="date"
                  id="absoluteEffectiveDate"
                  {...register("absoluteEffectiveDate")}
                  className={`w-full transition-colors border border-gray-300 rounded-md text-sm p-2  ${errors.absoluteEffectiveDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "focus:border-blue-500 focus:ring-blue-200"}`}
                  disabled={isEffDateDisabled}
                  min={expiryDate ? expiryDate : undefined}
                  onChange={(e) => {
                    setValue("absoluteEffectiveDate", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    const currentExpiry = watch("absoluteExpiryDate");
                    if (currentExpiry && new Date(currentExpiry) < new Date(e.target.value)) {
                      setValue("absoluteExpiryDate", null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                />
              </div>
              {errors.absoluteEffectiveDate && (
                  <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.absoluteEffectiveDate.message}
                  </p>
                )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Absolute Expiry Date</label>
              <div className="relative w-full">
                <input type="date" {...register("absoluteExpiryDate")} className="w-full transition-colors border border-gray-300 text-sm rounded-md p-2" disabled={isExpDateDisabled} min={watch("absoluteEffectiveDate") || undefined} />
              </div>
              {errors.absoluteExpiryDate && <p className="text-xs text-red-500 mt-1">{errors.absoluteExpiryDate.message}</p>}
            </div>
          </div>
        </>
      )}

      {periodType === "relative" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offset of EffectiveDate */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                <span className="text-red-500">* </span>
                Offset of Effective Date
              </label>
              <Input
                type="text"
                placeholder="Enter Offset of Effective Date"
                {...register("offsetOfEffectiveDate", {
                  setValueAs: transformOptionalNumber,
                })}
              />
              {errors.offsetOfEffectiveDate && <p className="text-xs text-red-500 mt-1">{errors.offsetOfEffectiveDate.message}</p>}
            </div>

            {/* Effective Unit */}
            <Controller
              control={control}
              name="offsetOfEffectiveDateUnit"
              rules={{
                required: "Offset of effective date unit is required",
              }}
              render={({ field }) => (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <Select value={field.value ?? ""} onValueChange={(val) => field.onChange(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Effective Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeUnit.map((item) => (
                        <SelectItem key={item.timeUnit} value={item.timeUnit}>
                          {item.timeUnitName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.offsetOfEffectiveDateUnit && <p className="text-xs text-red-500 mt-1">{errors.offsetOfEffectiveDateUnit.message}</p>}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duration of Availability */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Duration of Availability <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter Duration of Availability"
                {...register("durationOfAvailability", {
                  setValueAs: transformOptionalNumber,
                })}
              />
              {errors.durationOfAvailability && <p className="text-xs text-red-500 mt-1">{errors.durationOfAvailability.message}</p>}
            </div>

            {/* Availability Unit */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <Select
                value={durationOfAvailabilityUnit || ""}
                onValueChange={(e) => {
                  setValue("durationOfAvailabilityUnit", e);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Availability Unit" />
                </SelectTrigger>
                <SelectContent>
                  {timeUnit.map((item) => (
                    <SelectItem key={item.timeUnit} value={item.timeUnit}>
                      {item.timeUnitName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.durationOfAvailabilityUnit && <p className="text-xs text-red-500 mt-1">{errors.durationOfAvailabilityUnit.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Relative Effective Time</label>
              <Input type="time" placeholder="Enter Relative Effective Time" {...register("relativeEffectiveTime")} />
              {errors.relativeEffectiveTime && <p className="text-xs text-red-500 mt-1">{errors.relativeEffectiveTime.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Relative Expiry Time</label>
              <Input type="time" placeholder="Enter Relative Expiry Time" {...register("relativeExpiryTime")} />
              {errors.relativeExpiryTime && <p className="text-xs text-red-500 mt-1">{errors.relativeExpiryTime.message}</p>}
            </div>
          </div>
        </>
      )}

      {/* Row 7 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Offset of Absolute Expiry</label>
          <Input
            type="text"
            placeholder="Enter Offset of Absolute Expiry"
            {...register("offsetOfAbsoluteExpiry", {
              setValueAs: transformOptionalNumber,
            })}
          />
          {errors.offsetOfAbsoluteExpiry && <p className="text-xs text-red-500 mt-1">{errors.offsetOfAbsoluteExpiry.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default BenefitValue;

import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { periodType, RecurringCreateBenefitFormType } from "../AddPriceDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Controller, useFormContext } from "react-hook-form";
import { RecurringUpdateFormType } from "../EditPriceDialog";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { SearchSelect } from "@/components/common/SearchSelect";

type BenefitFormType = RecurringCreateBenefitFormType | RecurringUpdateFormType;

type BenefitValueProps<T extends BenefitFormType> = {
  periodType: periodType;
  setPeriodType: React.Dispatch<React.SetStateAction<periodType>>;
};

const API_URL = apiConfig.service_price_plan;

const BenefitValue = <T extends BenefitFormType>({ periodType, setPeriodType }: BenefitValueProps<T>) => {
  const { GetData } = useCallApi();
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<BenefitFormType>();

  const { GET_ACCT_BALANCE } = AcctConfService();

  const balFlags = watch("balFlags");
  const reAttrId = watch("reAttrId");
  const acctBalanceTypeId = watch("acctBalanceTypeId");
  const subscriberOnly = watch("subscriberOnly");
  const offsetOfEffectiveDateUnit = watch("offsetOfEffectiveDateUnit");
  const durationOfAvailabilityUnit = watch("durationOfAvailabilityUnit");
  const relativePeriodUnit = watch("relativePeriodUnit");

  const [accountBalanceType, setAccountBalanceType] = useState<{ acctResId: number; acctResName: string }[]>([]);

  const [timeUnit, setTimeUnit] = useState<
    {
      timeUnit: string;
      timeUnitName: string;
    }[]
  >([]);

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

  const GetAccountBalanceType = async (acctResName?: string) => {
    try {
      const response = await GET_ACCT_BALANCE({
        page: 1,
        size: 50,
        sortDirection: "ASC",
        acctResName: !acctResName ? undefined : acctResName,
      });

      setAccountBalanceType(response?.data);
    } catch (error) {
      console.error("Error fetching account type data:", error);
    }
  };

  useEffect(() => {
    GetAccountBalanceType();
    GetTimeUnitType();
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
      setValue("absoluteEffectiveDate", "");
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
          <Input
            type="number"
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === "." || e.key === ",") {
                e.preventDefault();
              }
            }}
            {...register("benefitValue", {
              setValueAs: (value) => {
                if (!value) return undefined;
                return Number(value ?? "");
              },
            })}
          />
          {errors.benefitValue && <p className="text-xs text-red-500 mt-1">{errors.benefitValue.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> Calculation Unit
            </label>
            <Input
              type="number"
              className="w-full"
              min={0}
              onKeyDown={(e) => {
                if (e.key === "." || e.key === "," || e.key === "-") {
                  e.preventDefault();
                }
              }}
              {...register("calculationUnit", {
                setValueAs: (value) => {
                  if (!value) return undefined;
                  return Number(value);
                },
              })}
            />

            {errors.calculationUnit && <p className="text-xs text-red-500 mt-1">{errors.calculationUnit.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              <span className="text-red-500">*</span> (Calculation Unit) Per
            </label>
            <Select value={reAttrId ? String(reAttrId) : ""} onValueChange={(e) => setValue("reAttrId", Number(e))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select " />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="101">Occurence</SelectItem>
              </SelectContent>
            </Select>
            {errors.reAttrId && <p className="text-xs text-red-500 mt-1">{errors.reAttrId.message}</p>}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500">*</span> Account Balance Type
          </label>
          <Select value={acctBalanceTypeId ? String(acctBalanceTypeId) : ""} onValueChange={(e) => setValue("acctBalanceTypeId", Number(e))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Account Balance Type" />
            </SelectTrigger>
            <SearchSelect
              onSearch={(query: string) => GetAccountBalanceType(query)}
              onSelect={(value) =>
                // setDetailItems({
                //   ...detailItems,
                //   mappingSrcValue: String(value),
                // })
                setValue("acctBalanceTypeId", Number(value))
              }
              selectedValue={String(watch("acctBalanceTypeId"))}
            >
              {accountBalanceType?.map((item) => (
                <SelectItem key={item.acctResId} value={String(item.acctResId)}>
                  {item.acctResName}
                </SelectItem>
              ))}
            </SearchSelect>
          </Select>
          {errors.acctBalanceTypeId && <p className="text-xs text-red-500 mt-1">{errors.acctBalanceTypeId.message}</p>}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Subscriber Only</label>
          <Select value={subscriberOnly || ""} onValueChange={(e) => setValue("subscriberOnly", e === "Y" ? "Y" : "N")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Subscriber Only" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">Yes</SelectItem>
              <SelectItem value="N">No</SelectItem>
            </SelectContent>
          </Select>
          {errors.subscriberOnly && <p className="text-xs text-red-500 mt-1">{errors.subscriberOnly.message}</p>}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Cycle Floor Limit</label>
            <Controller
              control={control}
              name="cycleFloorLimit"
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="Enter Cycle Floor Limit"
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Cycle Ceil Limit</label>
            <Controller
              control={control}
              name="cycleCeilLimit"
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="Enter Cycle Ceil Limit"
                  className="w-full"
                />
              )}
            />
            {errors.cycleCeilLimit && <p className="text-xs text-red-500 mt-1">{errors.cycleCeilLimit.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Daily Floor Limit</label>
            <Controller
              control={control}
              name="dailyFloorLimit"
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="Enter Daily Floor Limit"
                  className="w-full"
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Daily Ceil Limit</label>
            <Controller
              control={control}
              name="dailyCeilLimit"
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="Enter Daily Ceil Limit"
                  className="w-full"
                />
              )}
            />
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
            <Controller
              control={control}
              name="maximumDays"
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                  }}
                  placeholder="Enter Maximum Days"
                  className="w-full"
                />
              )}
            />
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
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Enter Absolute Effective Date"
                  {...register("absoluteEffectiveDate", {
                    required: "Absolute Effective Date is required",
                  })}
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {errors.absoluteEffectiveDate && <p className="text-xs text-red-500 mt-1">{errors.absoluteEffectiveDate.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Absolute Expiry Date</label>
              <div className="relative">
                <Input type="date" placeholder="Enter Absolute Expiry Date" {...register("absoluteExpiryDate")} />
                <CalendarDays className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
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
              <Controller
                control={control}
                name="offsetOfEffectiveDate"
                rules={{
                  required: periodType === "relative" ? "Offset of Effective Date is required" : false,
                }}
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? null : Number(v));
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                    }}
                    placeholder="Enter Offset of Effective Date"
                    className="w-full"
                  />
                )}
              />
              {errors.offsetOfEffectiveDate && <p className="text-xs text-red-500 mt-1">{errors.offsetOfEffectiveDate.message}</p>}
            </div>

            {/* Effective Unit */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Unit</label>
              <Select
                value={offsetOfEffectiveDateUnit ?? ""}
                onValueChange={(e) => {
                  setValue("offsetOfEffectiveDateUnit", e);
                }}
              >
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duration of Availability */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Duration of Availability</label>
              <Input type="text" placeholder="Enter Duration of Availability" {...register("durationOfAvailability", { valueAsNumber: true })} />
              {errors.durationOfAvailability && <p className="text-xs text-red-500 mt-1">{errors.durationOfAvailability.message}</p>}
            </div>

            {/* Availability Unit */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Unit</label>
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
          <Controller
            control={control}
            name="offsetOfAbsoluteExpiry"
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={field.value ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === "" ? null : Number(v));
                }}
                onWheel={(e) => e.currentTarget.blur()}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
                placeholder="Enter Offset of Absolute Expiry"
                className="w-full"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default BenefitValue;

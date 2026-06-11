import React, { useEffect, useState } from "react";

import { MdHelpOutline } from "react-icons/md";
import { duration } from "moment";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { BalanceType } from "../CreateBenefitDialog";
import SearchSelectBalancedComponent from "../../SearchSelectBalancedComponent";

interface BenefitValueTabProps {
  formField: any;
  setFormField: (field: any) => void;
  errors: any;
  setErrors: (errors: any) => void;
  acctType: any[];
  reAttr: any[];
  periodType: "absolute" | "relative";
  setPeriodType: (type: "absolute" | "relative") => void;
}

const API_URL = apiConfig.service_price_plan;

const BenefitValueTab: React.FC<BenefitValueTabProps> = ({
  formField,
  setFormField,
  errors,
  setErrors,
  acctType,
  reAttr,
  periodType,
  setPeriodType,
}) => {
  const { GetData } = useCallApi();
  const [timeUnitList, setTimeUnitList] = useState<any[]>();
  const [balFlagsType, setBalFlagsType] = useState<string>("");
  const [isNeedStatistic, setIsNeedStatistic] = useState<boolean>(false);
  const [balanceType, setBalanceType] = useState<BalanceType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimeUnits = async () => {
      try {
        const response = await GetData(
          `${API_URL}/time-unit/list?notExact=Y`,
          {}
        );
        setTimeUnitList(response?.data);
      } catch (error) {
        console.error("Error fetching time unit data:", error);
      }
    };
    fetchTimeUnits();
  }, []);

  useEffect(() => {
    let balFlags = "";

    if (balFlagsType === "free") {
      balFlags = isNeedStatistic ? "00100000" : "00000000";
    } else if (balFlagsType === "paid") {
      balFlags = isNeedStatistic ? "10100000" : "10000000";
    }

    setFormField({
      ...formField,
      balFlags: balFlags || null,
    });
  }, [balFlagsType, isNeedStatistic]);

  const GetAccountBalanceType = async (acctResName?: string) => {
    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL}/account-balance/acct-res-list?spId=0`,
        {
          page: 1,
          size: 50,
          sortDirection: "ASC",
          acctResName: !acctResName ? undefined : acctResName,
        }
      );

      setBalanceType(response?.data);
    } catch (error) {
      console.error("Error fetching account type data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAccountBalanceType();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-4">
            {/* Benefit Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <span className="text-red-500">*</span>Benefit Value
              </label>
              <input
                className="input"
                type="text"
                value={formField.benefitValue}
                onChange={(e) =>
                  setFormField({ ...formField, benefitValue: e.target.value })
                }
              />
            </div>

            {/* Balance Type dengan SearchSelect */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <span className="text-red-500">*</span>Balance Type
              </label>
              <SearchSelectBalancedComponent
                options={balanceType}
                value={formField.acctBalanceTypeId}
                onChange={(value: any) =>
                  setFormField({ ...formField, acctBalanceTypeId: value })
                }
                placeholder="Select balance type"
                loading={loading}
              />{" "}
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {/* Calculation Unit & Currency - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Calculation Unit */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span>Calculation Unit
                </label>
                <input
                  className="input"
                  type="number"
                  value={formField.calculationUnit ?? ""}
                  onChange={(e) =>
                    setFormField({
                      ...formField,
                      calculationUnit:
                        e.target.value === "" ? null : parseInt(e.target.value),
                    })
                  }
                />
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span>Currency
                </label>
                <select
                  className="input"
                  value={formField.reAttrId}
                  onChange={(e) =>
                    setFormField({
                      ...formField,
                      reAttrId: e.target.value,
                    })
                  }
                >
                  <option value="">Select</option>
                  {reAttr.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.reAttrName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limits Configuration Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1 - Floor Limits */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cycle Floor Limit</label>
              <input
                className="input"
                type="number"
                value={formField.cycleFloorLimit ?? ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    cycleFloorLimit:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Floor Limit</label>
              <input
                className="input"
                type="number"
                value={formField.dailyFloorLimit ?? ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    dailyFloorLimit:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Column 2 - Ceil Limits */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cycle Ceil Limit</label>
              <input
                className="input"
                type="number"
                value={formField.cycleCeilLimit ?? ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    cycleCeilLimit:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Ceil Limit</label>
              <input
                className="input"
                type="number"
                value={formField.dailyCeilLimit ?? ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    dailyCeilLimit:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscriber Only</label>
              <select
                className="input"
                value={formField.subscriberOnly || ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    subscriberOnly: e.target.value,
                  })
                }
              >
                <option value="">---Please Select---</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Balance Flags</label>
              <select
                className="input"
                value={balFlagsType}
                onChange={(e) => setBalFlagsType(e.target.value)}
              >
                <option value="">---Please Select---</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Days</label>
              <input
                className="input"
                type="number"
                value={formField.maximumDays ?? ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    maximumDays:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Is Need Statistic</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="isNeedStatistic"
                  checked={isNeedStatistic}
                  onChange={(e) => setIsNeedStatistic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isNeedStatistic"
                  className="ml-2 text-sm text-gray-700"
                >
                  Enable statistics
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Configuration Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Period Configuration
        </h3>

        {/* Period Type Radio Buttons */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Period Type</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="periodType"
                value="absolute"
                checked={periodType === "absolute"}
                onChange={() => {
                  setFormField({
                    ...formField,
                    durationOfAvailability: null,
                    relativeEffectiveTime: null,
                    relativeExpiryTime: null,
                    relativePeriodUnit: null,
                    offsetOfEffectiveDateUnit: null,
                    durationOfAvailabilityUnit: null,
                    absoluteEffectiveDate: "",
                    absoluteExpiryDate: null,
                  });
                  setPeriodType("absolute");
                }}
                className="text-blue-600"
              />
              <span className="text-sm">Absolute Value</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="periodType"
                value="relative"
                checked={periodType === "relative"}
                onChange={() => {
                  setFormField({
                    ...formField,
                    durationOfAvailability: null,
                    relativeEffectiveTime: null,
                    relativeExpiryTime: null,
                    relativePeriodUnit: null,
                    offsetOfEffectiveDateUnit: null,
                    durationOfAvailabilityUnit: null,
                    absoluteEffectiveDate: null,
                    absoluteExpiryDate: null,
                  });
                  setPeriodType("relative");
                }}
                className="text-blue-600"
              />
              <span className="text-sm">Relative Period</span>
            </label>
          </div>
        </div>

        {periodType === "absolute" && (
          <div className="space-y-4 pl-4 border-l-2 border-blue-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Absolute Effective Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={formField.absoluteEffectiveDate || ""}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        absoluteEffectiveDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Absolute Expiry Date
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={formField.absoluteExpiryDate || ""}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        absoluteExpiryDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Full Width - Offset */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Offset of Absolute Expiry
              </label>
              <input
                className="input"
                type="number"
                value={formField.offsetOfAbsoluteExpiry ?? ""}
                onChange={(e) =>
                  setFormField({
                    ...formField,
                    offsetOfAbsoluteExpiry:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}

        {periodType === "relative" && (
          <div className="space-y-4 pl-4 border-l-2 border-green-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    *Offset of Effective Date
                  </label>
                  <input
                    className="input"
                    type="number"
                    value={formField.offsetOfEffectiveDate ?? ""}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        offsetOfEffectiveDate:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    *Duration of Availability
                  </label>
                  <input
                    className="input"
                    type="number"
                    value={formField.durationOfAvailability ?? ""}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        durationOfAvailability:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Relative Effective Time (hh:mm)
                  </label>
                  <input
                    className="input"
                    type="time"
                    value={formField.relativeEffectiveTime || ""}
                    onChange={(e) => {
                      setFormField({
                        ...formField,
                        relativeEffectiveTime: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Offset of Absolute Expiry
                  </label>
                  <input
                    className="input"
                    type="number"
                    value={formField.offsetOfAbsoluteExpiry ?? ""}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        offsetOfAbsoluteExpiry:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Offset of Effective Date Unit
                  </label>
                  <select
                    className="input"
                    value={formField.offsetOfEffectiveDateUnit}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        offsetOfEffectiveDateUnit: e.target.value,
                      })
                    }
                  >
                    <option value="">Select</option>
                    {timeUnitList?.map((item) => (
                      <option key={item.timeUnit} value={item.timeUnit}>
                        {item.timeUnitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Duration of Availability Unit
                  </label>
                  <select
                    className="input"
                    value={formField.durationOfAvailabilityUnit}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        durationOfAvailabilityUnit: e.target.value,
                      })
                    }
                  >
                    <option value="">Select</option>
                    {timeUnitList?.map((item) => (
                      <option key={item.timeUnit} value={item.timeUnit}>
                        {item.timeUnitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Relative Expiry Time (hh:mm)
                  </label>
                  <input
                    className="input"
                    type="time"
                    value={formField.relativeExpiryTime || ""}
                    onChange={(e) => {
                      setFormField({
                        ...formField,
                        relativeExpiryTime: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Relative Period Unit
                  </label>
                  <select
                    className="input"
                    value={formField.relativePeriodUnit || ""}
                    onChange={(e) =>
                      setFormField({
                        ...formField,
                        relativePeriodUnit: e.target.value,
                      })
                    }
                  >
                    <option value="">---Please Select---</option>
                    <option value="D">Day</option>
                    <option value="M">Month</option>
                    <option value="S">Second</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenefitValueTab;

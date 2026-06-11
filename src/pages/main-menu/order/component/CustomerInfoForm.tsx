import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useOrder } from "../hooks/orderContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipLabel } from "../../role-management/generalUseComp";
import {
  AttrCustDto,
  CustomerInfo,
  MasterDataOrder,
} from "../models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AttrCust } from "../block/AttrCust";
import { AttrRec } from "../models/types";
import { toast } from "sonner";

export interface CustForm {
  disable?: boolean;
  form?: CustomerInfo;
  setForm?: React.Dispatch<SetStateAction<CustomerInfo>>;
  isNew?: boolean;
  showPassField?: boolean;
  errors?: Record<string, string>;
  setErrors?: React.Dispatch<SetStateAction<Record<string, string>>>;
  attrRec?: AttrRec;
  setAttrRec?: Dispatch<SetStateAction<AttrRec>>;
}

const API_ORDER = apiConfigOrder.order;

const CustInfoForm = ({
  disable = false,
  form,
  setForm,
  isNew = true,
  showPassField = true,
  errors,
  setErrors,
  attrRec = {},
  setAttrRec = () => {},
}: CustForm) => {
  const { orderUseQuery } = useOrder();
  const [confPass, setConfPass] = useState<string>("");
  const _masterDataOrder: MasterDataOrder = orderUseQuery.data!;
  const { title, certType, areas, attr, impGrade, industry, occupation } =
    _masterDataOrder;

  const { GetData } = useCallApi();

  const fetchCustAttr = async (): Promise<AttrCustDto[]> => {
    try {
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/custommer/qry-cust-type-attr-list`,
        { custType: "A", spId: 0 },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      const temp: AttrCustDto[] = resp.data;

      const tempRec: AttrRec = {};

      temp.map((item) => {
        tempRec[`${item.attrId}`] = item;
      });

      //  console.log(tempRec);

      setAttrRec(tempRec);

      return resp.data;
    } catch (error) {
      //  console.log(error);

      return [];
    }
  };

  const custAttr: UseQueryResult<AttrCustDto[]> = useQuery({
    queryKey: ["cust-attr"],
    queryFn: fetchCustAttr,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    //  console.log(errors);
  }, [errors]);

  // useEffect(() => {
  // //  console.log(form);
  // }, [form]);
  return (
    <div className="flex flex-col gap-5">
      {/* === Basic Information === */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-center gap-2">
          <div className="h-4 border-r-4 border-primary" />
          <h2>Basic Information</h2>
        </div>

        <div className="grid grid-cols-2 text-sm gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <TooltipLabel className="w-40" text="Customer Name" required />
              <Input
                disabled={disable}
                className="flex-1"
                size={"sm"}
                value={form?.custName}
                onChange={(e) => {
                  if (!setForm) return;

                  const value = e.target.value;

                  setForm((prev) => ({ ...prev, custName: value }));

                  if (!setErrors) return;

                  setErrors((prev) => {
                    if (!prev) return prev; // or return {}
                    const { custName: _, ...rest } = prev;
                    return rest;
                  });
                }}
              />
            </div>
            {(errors ?? {})["custName"] && (
              <div className="flex flex-row items-center">
                <div className="w-40" />
                <span className="text-red-500">Please fill this field</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <TooltipLabel className="w-40" text="Customer Type" required />
              <Select
                disabled
                onValueChange={(e) => {
                  if (!setForm) return;
                  setForm((prev) => ({ ...prev, custType: e }));
                  if (!setErrors) return;

                  setErrors((prev) => {
                    if (!prev) return prev; // or return {}
                    const { custType: _, ...rest } = prev;
                    return rest;
                  });
                }}
                value={form?.custType}
              >
                <SelectTrigger className="flex-1" size="sm">
                  <SelectValue placeholder="Select Customer Type" />
                </SelectTrigger>
                <SelectContent>
                  {/* {attr.map((item) => (
                    <SelectItem
                      key={item.valueMark}
                      value={item.attrValueId.toString()}
                    >
                      {item.valueMark}
                    </SelectItem>
                  ))} */}
                  <SelectItem key={"A"} value={"A"}>
                    Individual Customer
                  </SelectItem>
                  <SelectItem key={"C"} value={"C"}>
                    Corporate Customer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(errors ?? {})["custType"] && (
              <div className="flex flex-row items-center">
                <div className="w-40" />
                <span className="text-red-500">Please fill this field</span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Important Grade" />
            <Select
              disabled={disable}
              onValueChange={(e) => {
                if (!setForm) return;
                setForm((prev) => ({ ...prev, impGradeId: parseInt(e) }));
              }}
              value={
                form?.impGradeId?.toString() !== "0"
                  ? form?.impGradeId?.toString()
                  : ""
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {impGrade.map((item) => (
                  <SelectItem
                    key={item.impGradeId?.toString()}
                    value={item.impGradeId?.toString()}
                  >
                    {item.impGradeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Gender" />
            <div className="flex-1 flex flex-row gap-2">
              <label className="flex items-center gap-2">
                <Input
                  type="radio"
                  disabled={disable}
                  checked={form?.gender === "M"}
                  onChange={() => {
                    if (!setForm) return;

                    setForm((prev) => ({ ...prev, gender: "M" }));
                  }}
                  className="w-[15px] h-[15px] accent-primary"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2">
                <Input
                  type="radio"
                  disabled={disable}
                  checked={form?.gender === "F"}
                  onChange={() => {
                    if (!setForm) return;

                    setForm((prev) => ({ ...prev, gender: "F" }));
                  }}
                  className="w-[15px] h-[15px] accent-primary"
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Title" />
            <Select
              disabled={disable}
              onValueChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, custTitleId: parseInt(e) }));
              }}
              value={
                form?.custTitleId?.toString() !== "0"
                  ? form?.custTitleId?.toString()
                  : ""
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Title" />
              </SelectTrigger>
              <SelectContent>
                {title.map((item) => (
                  <SelectItem
                    key={item.titleId?.toString()}
                    value={item.titleId?.toString()}
                  >
                    {item.titleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Birthday" />
            <input
              type="datetime-local"
              disabled={disable}
              className="flex-1 border-[0.8px] p-1 rounded-md border-slate-200 
              focus:border-primary focus:ring-primary outline-none 
              disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={form?.birthdayDay}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, birthdayDay: e.target.value }));
              }}
            />
          </div>
        </div>
      </div>

      {/* === Doc Information === */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-center gap-2">
          <div className="h-4 border-r-4 border-primary" />
          <h2>Doc Information</h2>
        </div>

        <div className="grid grid-cols-2 text-sm gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <TooltipLabel className="w-40" text="Doc Type" required />
              <Select
                disabled={disable}
                onValueChange={(e) => {
                  if (!setForm) return;

                  setForm((prev) => ({ ...prev, certTypeId: parseInt(e) }));
                  if (!setErrors) return;

                  setErrors((prev) => {
                    if (!prev) return prev; // or return {}
                    const { certTypeId: _, ...rest } = prev;
                    return rest;
                  });
                }}
                value={
                  form?.certTypeId?.toString() !== "0"
                    ? form?.certTypeId?.toString()
                    : ""
                }
              >
                <SelectTrigger className="flex-1" size="sm">
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {certType.map((item) => (
                    <SelectItem
                      key={item.certTypeId?.toString()}
                      value={item.certTypeId?.toString()}
                    >
                      {item.certTypeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(errors ?? {})["certTypeId"] && (
              <div className="flex flex-row items-center">
                <div className="w-40" />
                <span className="text-red-500">Please fill this field</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <TooltipLabel className="w-40" text="Doc Number" required />
              <Input
                disabled={disable}
                className="flex-1"
                size={"sm"}
                value={form?.certNbr}
                onChange={(e) => {
                  if (!setForm) return;

                  setForm((prev) => ({ ...prev, certNbr: e.target.value }));
                  if (!setErrors) return;

                  setErrors((prev) => {
                    if (!prev) return prev; // or return {}
                    const { certNbr: _, ...rest } = prev;
                    return rest;
                  });
                }}
              />
            </div>
            {(errors ?? {})["certNbr"] && (
              <div className="flex flex-row items-center">
                <div className="w-40" />
                <span className="text-red-500">Please fill this field</span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Doc Issue Organization" />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.issueOrg}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, issueOrg: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Doc Effective Date" />
            <input
              type="datetime-local"
              disabled={disable}
              className="flex-1 border-[0.8px] p-1 rounded-md border-slate-200 
              focus:border-primary focus:ring-primary outline-none 
              disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={form?.effDate}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, effDate: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Doc Expiry Date" />
            <input
              type="datetime-local"
              disabled={disable}
              className="flex-1 border-[0.8px] p-1 rounded-md border-slate-200 
              focus:border-primary focus:ring-primary outline-none 
              disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={form?.expDate}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, expDate: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Doc Issue Date" />
            <input
              type="datetime-local"
              disabled={disable}
              className="flex-1 border-[0.8px] p-1 rounded-md border-slate-200 
              focus:border-primary focus:ring-primary outline-none 
              disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              value={form?.issueDate}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, issueDate: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center col-span-2">
            <TooltipLabel className="w-40" text="Doc Address" />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.certAddress}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, certAddress: e.target.value }));
              }}
            />
          </div>
        </div>
      </div>

      {/* === Customer Details === */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-row items-center gap-2">
          <div className="h-4 border-r-4 border-primary" />
          <h2>Customer Details</h2>
        </div>

        <div className="grid grid-cols-2 text-sm gap-2">
          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Contact Phone" />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.phoneNumber}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, phoneNumber: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Email" />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.email}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, email: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Area" />
            <Select
              disabled={disable}
              onValueChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, areaId: parseInt(e) }));
              }}
              value={
                form?.areaId?.toString() !== "0" ? form?.areaId?.toString() : ""
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((item) => (
                  <SelectItem
                    key={item.areaId?.toString()}
                    value={item.areaId?.toString()}
                  >
                    {item.areaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Postal Code" />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.zipcode}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, zipcode: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Address" />
            <Input
              disabled={disable}
              className="flex-1"
              size={"sm"}
              value={form?.address}
              onChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, address: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Industry" />
            <Select
              disabled={disable}
              onValueChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, industryId: parseInt(e) }));
              }}
              value={
                form?.industryId?.toString() !== "0"
                  ? form?.industryId?.toString()
                  : ""
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                {industry.map((item) => (
                  <SelectItem
                    key={item.industryId?.toString()}
                    value={item.industryId?.toString()}
                  >
                    {item.industryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row items-center">
            <TooltipLabel className="w-40" text="Occupation" />
            <Select
              disabled={disable}
              onValueChange={(e) => {
                if (!setForm) return;

                setForm((prev) => ({ ...prev, occupationId: parseInt(e) }));
              }}
              value={
                form?.occupationId?.toString() !== "0"
                  ? form?.occupationId?.toString()
                  : ""
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupation.map((item) => (
                  <SelectItem
                    key={item.occupationId?.toString()}
                    value={item.occupationId?.toString()}
                  >
                    {item.occupationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isNew && (
            <div className="flex flex-row items-center">
              <TooltipLabel className="w-40" text="Religion" />
              <Input
                disabled={disable}
                className="flex-1"
                size={"sm"}
                value={form?.religionName}
                onChange={(e) => {
                  if (!setForm) return;

                  setForm((prev) => ({
                    ...prev,
                    religionName: e.target.value,
                  }));
                }}
              />
            </div>
          )}

          {isNew && (
            <>
              <div className="flex flex-row items-center">
                <TooltipLabel className="w-40" text="First Name" />
                <Input
                  disabled={disable}
                  className="flex-1"
                  size={"sm"}
                  value={form?.firstName}
                  onChange={(e) => {
                    if (!setForm) return;

                    setForm((prev) => ({ ...prev, firstName: e.target.value }));
                  }}
                />
              </div>

              <div className="flex flex-row items-center">
                <TooltipLabel className="w-40" text="Second Name" />
                <Input
                  disabled={disable}
                  className="flex-1"
                  size={"sm"}
                  value={form?.secondName}
                  onChange={(e) => {
                    if (!setForm) return;

                    setForm((prev) => ({
                      ...prev,
                      secondName: e.target.value,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-row items-center">
                <TooltipLabel className="w-40" text="Third Name" />
                <Input
                  disabled={disable}
                  className="flex-1"
                  size={"sm"}
                  value={form?.thirdName}
                  onChange={(e) => {
                    if (!setForm) return;

                    setForm((prev) => ({ ...prev, thirdName: e.target.value }));
                  }}
                />
              </div>

              <div className="flex flex-row items-center">
                <TooltipLabel className="w-40" text="Fourth Name" />
                <Input
                  disabled={disable}
                  className="flex-1"
                  size={"sm"}
                  value={form?.fourName}
                  onChange={(e) => {
                    if (!setForm) return;

                    setForm((prev) => ({ ...prev, fourName: e.target.value }));
                  }}
                />
              </div>

              {showPassField && (
                <div className="flex flex-row items-center">
                  <TooltipLabel className="w-40" text="Password" />
                  <Input
                    disabled={disable}
                    type="password"
                    className="flex-1"
                    size={"sm"}
                    value={form?.pwd}
                    onChange={(e) => {
                      if (!setForm) return;
                      const value = e.target.value;

                      setForm((prev) => ({ ...prev, pwd: value }));

                      if (!setErrors) return;

                      setErrors((prev) => {
                        if (value !== confPass) {
                          return {
                            ...prev,
                            confPass: "Password Didn't Match",
                          };
                        }

                        if (!prev) return prev; // or return {}

                        const { confPass: _, ...rest } = prev;
                        return rest;
                      });
                    }}
                  />
                </div>
              )}

              {showPassField && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row items-center">
                    <TooltipLabel className="w-40" text="Confirm Password" />
                    <Input
                      type="password"
                      disabled={disable}
                      className="flex-1"
                      size={"sm"}
                      value={confPass}
                      onChange={(e) => {
                        const value = e.target.value;

                        setConfPass(value);

                        if (!setErrors) return;

                        setErrors((prev) => {
                          if (value !== form?.pwd) {
                            return {
                              ...prev,
                              confPass: "Password Didn't Match",
                            };
                          }

                          if (!prev) return prev; // or return {}
                          const { confPass: _, ...rest } = prev;
                          return rest;
                        });
                      }}
                    />
                  </div>
                  {(errors ?? {})["confPass"] && (
                    <div className="flex flex-row items-center">
                      <div className="w-40" />
                      <span className="text-red-500">
                        Password didn't match
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-row items-center col-span-2">
                <TooltipLabel className="w-40" text="Remarks" />
                <Input
                  disabled={disable}
                  className="flex-1"
                  size={"sm"}
                  value={form?.comments}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* === Additional Details === */}
      {(custAttr.data?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-row items-center gap-2">
            <div className="h-4 border-r-4 border-primary" />
            <h2>Additional Information</h2>
          </div>
          <div className="grid grid-cols-2 text-sm gap-2">
            {custAttr.data?.map((attr) => (
              <div className="flex flex-row min-w-0">
                <TooltipLabel className="w-40" text={attr.attrName ?? ""} />
                <AttrCust
                  attrId={attr.attrId}
                  rowData={attr}
                  rec={attrRec}
                  setRec={setAttrRec}
                  disable={disable}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustInfoForm;

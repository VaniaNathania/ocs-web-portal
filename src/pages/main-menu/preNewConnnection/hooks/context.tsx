import React, { createContext, useContext, useState, SetStateAction, useEffect, Dispatch } from "react";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { TimelineItem } from "../../order/user/menu/subscriber/components/dialog/components/subs-info/components/common/timeline";
import { BatchPreNewConnectionProps, formPreNew, ResourceTypeProps, UploadFilesState } from "../interface";
import { toast } from "sonner";
import { menuAccess, useRoleCheck } from "../../role-management/hook/useRoleCheck";

interface PreNewContextType {
  timeLine: TimelineItem[];
  setTimeLine: Dispatch<SetStateAction<TimelineItem[]>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: formPreNew;
  setForm: Dispatch<SetStateAction<formPreNew>>;
  currentPage: number | null;
  setCurrentPage: Dispatch<SetStateAction<number | null>>;
  initForm: formPreNew;
  triggerSubmit: boolean;
  setTriggerSubmit: Dispatch<SetStateAction<boolean>>;
  triggerOk: boolean;
  setTriggerOk: Dispatch<SetStateAction<boolean>>;
  formattedPrice: (value: number | string | null | undefined, digit?: number) => string;
  initialUploadFiles: UploadFilesState;
  resourceType: ResourceTypeProps[];
  fetchBatchPreNewConnection: () => Promise<void>;
  ResetStep: () => void;
  BatchPreNewResp: BatchPreNewConnectionProps | undefined;
  setBatchPreNewResp: Dispatch<SetStateAction<BatchPreNewConnectionProps | undefined>>;
  menuPrivAccess: menuAccess;
}

const initialUploadFiles: UploadFilesState = {
  ICCID: { files: [], fileNames: [] },
  SERVICENUMBER: { files: [], fileNames: [] },
};

const initForm: formPreNew = {
  actionType: undefined,
  operationType: "0",
  resourceType: "0",
  searchType: "0",
  showDialog: false,
  selectItems: [],
  productAlias: {},
  timeUnit: {},
  effectiveDuration: {},
  effectiveType: {},
  detailValue: {},
  expandedRows: [],
  subsPlanAttrFijiDialog: [],
  subsPlanAttrFijiRow: {},
  clientKeyToOfferId: {},
  vasPnFijiDatas: [],
  timeUnitDatas: [],
  subsPlanId: undefined,
  getSubsPlanName: "",
  isVasPnFijiLoading: false,
  selectedItemStep3: undefined,
  selectedPrefix: "",
  isLoading: false,
  tempTableName: undefined,
  uploadResponse: undefined,
  batchDealFiles: undefined,
  statusResp: undefined,
  tempTable: [],
  uploadFiles: initialUploadFiles,
  areaDetail: [],
  defLanguage: [],
  orgData: [],
  remarks: null,
  selectedAreaId: undefined,
  selectedDefLangId: undefined,
  selectedOrgId: undefined,
  reqDate: "",
  selectedItemDialog: null,
  isSuccess: false,
  isConfirm: false,
  isCancel: false,
  bathcByRangeResp: undefined,
  accNbrBegin: undefined,
  accNbrEnd: undefined,
  iccidBegin: undefined,
  iccidEnd: undefined,
  quantityAccNbrResp: undefined,
  quantityIccidResp: undefined,
  searchQuantity: undefined,
  custId: undefined,
  custName: undefined,
  hvcCustomer: "N",
  dataRegulerFlag: "Y",
};

// Create the context with proper typing
export const PreNewContext = createContext<PreNewContextType | undefined>(undefined);

const API_URL = apiConfigOrder.order;

export const PreNewProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkMenusPriv } = useRoleCheck();
  const { GetData, PostData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [triggerSubmit, setTriggerSubmit] = useState<boolean>(false);
  const [triggerOk, setTriggerOk] = useState<boolean>(false);
  const [BatchPreNewResp, setBatchPreNewResp] = useState<BatchPreNewConnectionProps>();

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv("/main-menu/preNewConnnection/PreNewConnection", "addStatus"),
    deleteStatus: checkMenusPriv("/main-menu/preNewConnnection/PreNewConnection", "deleteStatus"),
    readStatus: checkMenusPriv("/main-menu/preNewConnnection/PreNewConnection", "readStatus"),
    editStatus: checkMenusPriv("/main-menu/preNewConnnection/PreNewConnection", "editStatus"),
  };

  const [timeLine, setTimeLine] = useState<TimelineItem[]>([
    {
      label: "Selection Action Type",
      isCurrent: true,
      code: "step1",
    },
    {
      label: "Select Subscription Plan",
      isCurrent: false,
      code: "step2",
    },
    {
      label: "Select Resource",
      isCurrent: false,
      code: "step3",
    },
    {
      label: "Submit",
      isCurrent: false,
      code: "step4",
    },
  ]);
  const [form, setForm] = useState<formPreNew>(initForm);
  const [currentPage, setCurrentPage] = useState<number | null>(null);

  const resourceType: ResourceTypeProps[] = [
    {
      label: "Binding - Service Number",
      key: "0",
    },
    {
      label: "Binding - ICCID",
      key: "1",
    },
    {
      label: "UnBound",
      key: "2",
    },
  ];

  const formattedPrice = (value: number | string | null | undefined, digit = 5) => {
    if (value === null || value === undefined) return "0.00000";

    const raw = value.toString().replace("-", "");

    const amount = Number(raw) / 100000;

    const finalAmount = amount.toLocaleString("en-US", {
      minimumFractionDigits: digit,
      maximumFractionDigits: digit,
    });

    return finalAmount;
  };

  useEffect(() => {
    //  console.log("FORM: ", form);
  }, [form]);

  const ResetStep = () => {
    setTimeLine((prev) =>
      prev.map((item, index) => {
        if (index === 0) return { ...item, isCurrent: true };
        return { ...item, isCurrent: false };
      }),
    );

    setStep(0);

    setForm(initForm);
  };

  const fetchBatchPreNewConnection = async () => {
    try {
      setForm((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const payload = {
        prefix: form.selectedPrefix,
        hasGmGoods: false,
        banding: true,
        accordAccNbr: true,
        accNbrBegin: form.operationType === "1" ? form.tempTable[0].accNbr : null,
        accNbrEnd: form.operationType === "1" ? form.tempTable[form.tempTable.length - 1].accNbr : null,
        iccidBegin: form.operationType === "1" ? form.tempTable[0].iccid : null,
        iccidEnd: form.operationType === "1" ? form.tempTable[form.tempTable.length - 1].iccid : null,
        modelId: null,
        seqNbrBegin: null,
        seqNbrEnd: null,
        tableName: form.tempTableName,
        accNbrOrgId: 1,
        iccidOrgId: 1,
        seqNbrOrgId: 1,
        wholesaleDto: {
          wholesaleId: null,
          subsEventId: 1,
          orgId: form.selectedOrgId,
          reqDate: form.reqDate,
          createdDate: null,
          comments: null,
          commisionAmount: null,
          wholesaleCode: null,
          invoiceNo: null,
          startNbr: form.operationType === "1" ? form.tempTable[0].accNbr : null,
          endNbr: form.operationType === "1" ? form.tempTable[form.tempTable.length - 1].accNbr : null,
          offerId: form.selectedItemDialog?.indepProdSpecId,
          partyType: "A",
          partyCode: "1",
          priority: 200,
          state: "A",
          spId: 0,
          subsPlanId: form.selectedItemDialog?.id,
          extAttr: {
            areaId: form.selectedAreaId,
            isFile: form.operationType === "0" ? "Y" : "N",
            defLangId: form.selectedDefLangId,
            custId: form.custId ?? null,
            dpOfferList: form.selectItems.map(({ __clientKey, __level, __rowType, __isDuplicate, __parentId, __oriClientKey, ...rest }) => ({
              ...rest,
              // oriOfferSeq: __oriClientKey,
              // offerSeq: __clientKey,
            })),
            pricePlanId: form.selectItems.filter((item) => item.defaultFlag !== "Y").map((v) => v.id),
            dependProdSpecId: form.selectItems.filter((item) => item.defaultFlag === "Y").map((v) => v.id),
            indepProdAttrList: form.subsPlanAttrFijiDialog[0]?.attrValueList
              .filter((item) => item.value === form.subsPlanAttrFijiDialog[0].defaultValue)
              .map((item) => ({
                attrId: item.baseAttrId,
                attrValue: item.attrValueId,
                valueMark: item.valueMark,
                value: item.value,
                parentAttrValueId: item.parentAttrValueId,
                parentAttrId: item.parentAttrId,
                spId: item.spId,
                seq: item.seq,
              })),
            dpOfferAttrList: form.selectItems
              .filter((item) => item.defaultFlag !== "Y")
              .map((item) => {
                const attrs = form.subsPlanAttrFijiRow[item.id] || [];
                const detail = form.detailValue[item.__clientKey];

                const mappedAttrs = attrs.map((attr) => {
                  let value = null;
                  let valueMark = null;

                  // ambil dari user input kalau ada
                  if (detail && detail.attrId === attr.attrId) {
                    value = detail.attrValues;
                    valueMark = detail.attrValues;
                  }

                  // fallback ke default
                  else if (attr.defaultValue !== null) {
                    value = attr.defaultValue;

                    const found = attr.attrValueList?.find((v) => v.value === attr.defaultValue);

                    valueMark = found?.valueMark || attr.defaultValue;
                  }

                  return {
                    attrId: attr.attrId,
                    value,
                    oldValue: null,
                    operationType: "A",
                    valueMark,
                    oldValueMark: "",
                    attrName: attr.attrName,
                    attrValue: value,
                  };
                });

                return {
                  offerId: item.id,
                  dpOfferOrderAttr: mappedAttrs,
                };
              }),
          },
          prefix: form.selectedPrefix,
          custId: form.custId ?? null,
          contactChannelId: null,
          custOrderId: null,
        },
        servType: "15",
        spId: 0,
        subsEventId: 1,
      };

      //  console.log(payload);

      const response = await PostData(`${API_URL}/api/order-entry/pre-new-connection/batch-pre-new-connection`, payload);

      if (response?.status) {
        // toast.success("Success!");
        setBatchPreNewResp(response.data);

        ResetStep();

        setForm((prev) => ({
          ...prev,
          isConfirm: false,
          isSuccess: true,
        }));

        setTriggerSubmit(false);

        // return response.data;
      } else {
        toast.error(response?.message || "Failed!");
      }
    } catch (err) {
      toast.error("Failed!");
      console.error(err);
    } finally {
      setForm((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const value = {
    form,
    setForm,
    timeLine,
    setTimeLine,
    step,
    setStep,
    currentPage,
    setCurrentPage,
    initForm,
    triggerSubmit,
    setTriggerSubmit,
    formattedPrice,
    resourceType,
    initialUploadFiles,
    fetchBatchPreNewConnection,
    ResetStep,
    BatchPreNewResp,
    setBatchPreNewResp,
    triggerOk,
    setTriggerOk,
    menuPrivAccess,
  };
  return <PreNewContext.Provider value={value}>{children}</PreNewContext.Provider>;
};

// Custom hook to use the context
export const usePreNew = () => {
  const context = useContext(PreNewContext);
  if (context === undefined) {
    throw new Error("usePreNew must be used within an PreNewProvider");
  }
  return context;
};

export default PreNewContext;

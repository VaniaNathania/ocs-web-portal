import { KeenIcon } from "@/components";
import {
  DialogWrapper,
  ParentDialogProps,
} from "../../role-management/generalUseComp";
import CustInfoForm from "../component/CustomerInfoForm";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useOrder } from "../hooks/orderContext";
import { defaultCustomerInfo } from "./AddCustomerDialog";
import { CustDetail, CustomerInfo } from "../models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AttrRec } from "../models/types";

const API_URL = apiConfigOrder.order;

const CustDetailInfoDialog = ({ isOpen, handleDialog }: ParentDialogProps) => {
  const [isClose, setIsClose] = useState<boolean>(false);
  const { selectedUser } = useOrder();
  const [form, setForm] = useState<CustomerInfo>(defaultCustomerInfo);
  const { PostData } = useCallApi();
  const [attrRec, setAttrRec] = useState<AttrRec>({});

  const fetchCustDetail = async (): Promise<CustDetail | undefined> => {
    try {
      const resp = await PostData(
        `${API_URL}/api/order-entry/custommer/query-cust-detail`,
        {
          custId: selectedUser?.custId,
          custQueryFlagDto: {
            qryCust: true,
            qryCustAttrValue: true,
            qryCustAttrValueXml: true,
            qryCatg: true,
            qryCustSpecialGroup: true,
            qrySubs: true,
            qryAcct: true,
            qryCustEvaluateResult: true,
            qryContactMan: true,
            qryContactManAttrValue: true,
            qryContactManAttrValueXml: true,
            qryParentCust: true,
            qryChildCust: true,
          },
        },
      );
      if (!resp?.status) {
        toast.error(resp?.message);
        return undefined;
      }

      const temp: CustDetail = resp.data;
      const tempAttr: AttrRec = {};

      temp.custAttrValueExDtoList.map((attr) => {
        tempAttr[`${attr.attrId}`] = { ...attr, oldAttrValue: attr.attrValue };
      });

      setAttrRec(tempAttr);
      return resp.data;
    } catch (error) {
      //  console.log(error);

      return undefined;
    }
  };

  const queryDetail: UseQueryResult<CustDetail | undefined> = useQuery({
    queryKey: ["cust-detail", selectedUser],
    queryFn: fetchCustDetail,
    enabled: !!selectedUser,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setForm(selectedUser ?? defaultCustomerInfo);
  }, [selectedUser]);
  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleDialog}
      title="Customer detail"
      //    size={{ width: "6xl" }}
    >
      <div className="flex flex-col pt-2">
        <div
          className={`flex flex-col border-2 p-2 gap-5 rounded-md transition-all duration-500 ${isClose ? "max-h-12 overflow-hidden" : "max-h-[1200px] overflow-visible"}`}
        >
          <div className="flex flex-row justify-between h-8 items-center border-b-2">
            <div>Customer Information</div>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={() => setIsClose(!isClose)}
            >
              <KeenIcon
                icon="down"
                className={`transition-all duration-300 ${isClose ? "rotate-180" : "rotate-0"}`}
              />
            </Button>
          </div>
          <CustInfoForm
            form={form}
            setForm={setForm}
            disable={true}
            isNew={false}
            attrRec={attrRec}
            setAttrRec={setAttrRec}
          />

          <div className="flex flex-row gap-2 justify-end">
            <Button variant={"outline"} size={"sm"} disabled>
              Modify
            </Button>
            <Button variant={"outline"} size={"sm"} disabled>
              Modify History
            </Button>
            <Button variant={"outline"} size={"sm"} disabled>
              Change Password
            </Button>
            <Button variant={"outline"} size={"sm"} disabled>
              Reset Password
            </Button>
            <Button variant={"outline"} size={"sm"} disabled>
              Bill Delivery Information
            </Button>
          </div>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default CustDetailInfoDialog;

import { Button } from "@/components/ui/button";
import AccountInfoMainForm from "./MainForm";
import { useEffect, useState } from "react";
import SelectAccComp from "@/pages/main-menu/order/component/SelectAccComp";
import ModHistoryAccInfo from "../dialog/modifyHistory/ModHistory";
import PaymentHistoryAccInfo from "../dialog/paymentHistory/PaymentHistory";
import { useOrderUser } from "../../../hooks/context";
import { AccountInfo } from "@/pages/main-menu/order/models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { toast } from "sonner";

const API_URL = apiConfigOrder.order;

const Main = () => {
  const { selectedUser } = useOrder();
  const { selectedAcc } = useOrderUser();
  const [disable, setDisable] = useState<boolean>(true);
  const [edit, setEdit] = useState<boolean>(true);
  const [showModHistory, setShowModHistory] = useState<boolean>(false);
  const [showPayHistory, setShowPayHistory] = useState<boolean>(false);
  const [form, setForm] = useState<AccountInfo | undefined>();
  const { PutData } = useCallApi();

  const onSubmit = async () => {
    try {
      const payload = {
        acctDto: {
          acctId: selectedAcc?.acctId,
          custId: selectedUser?.custId,
          billFlag: form?.billFlag,
          postpaid: form?.postpaid,
          billingCycleTypeId: form?.billingCycleTypeId,
          defaultFlag: form?.defaultFlag,
          paymentType: form?.paymentType,
          paymentMethodId: form?.paymentMethodId,
          deliverMethod: form?.deliverMethod,
          partyType: form?.partyType,
          partyCode: form?.partyCode,
          billCurrency: form?.billCurrency,
          acctNbr: null,
        },
        custBillDeliveryInfoDto: {
          custBillDeliveryInfoId: form?.custBillDeliveryInfoId,
          fileType: form?.custBillDelivery?.fileType,
          email: form?.custBillDelivery?.email,
          ccEmail: form?.custBillDelivery?.ccEmail,
          smsNbr: form?.custBillDelivery?.smsNbr,
          faxNbr: form?.custBillDelivery?.faxNbr,
          zipcode: form?.custBillDelivery?.zipcode,
          partyType: form?.custBillDelivery?.partyType,
          partyCode: form?.custBillDelivery?.partyCode,
          state: form?.custBillDelivery?.state,
          detailInfo: form?.custBillDelivery?.detailInfo,
          custId: selectedUser?.custId,
        },
      };
      const resp = await PutData(
        `${API_URL}/api/order-entry/acct/mod-acct`,
        payload,
      );
      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      return toast.success(resp.message);
    } catch (error) {
      return toast.error("Client Side Error");
    }
  };

  useEffect(() => {
    setForm(selectedAcc);
    // console.log(selectedAcc, "ini select Acc");
  }, [selectedAcc]);

  return (
    <div className="m-1 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md">
      <SelectAccComp />
      <AccountInfoMainForm
        disable={disable}
        formVal={form}
        setFormVal={setForm}
        isEdit={edit}
      />
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <Button
            size={"sm"}
            disabled={!selectedAcc}
            variant={"outline"}
            onClick={() => setShowModHistory(true)}
          >
            Modify History
          </Button>
          <Button
            size={"sm"}
            disabled={!selectedAcc}
            variant={"outline"}
            onClick={() => setShowPayHistory(true)}
          >
            Payment History
          </Button>
        </div>
        {disable ? (
          <Button
            size={"sm"}
            disabled={!selectedAcc}
            onClick={() => {
              setDisable(false);
              setEdit(true);
            }}
          >
            Edit
          </Button>
        ) : (
          <div className="flex flex-row gap-2">
            <Button
              size={"sm"}
              disabled={!selectedAcc}
              onClick={() => {
                onSubmit();
                setDisable(true);
                setEdit(false);
              }}
            >
              Save
            </Button>
            <Button
              size={"sm"}
              disabled={!selectedAcc}
              variant={"outline"}
              onClick={() => {
                setDisable(true);
                setForm(selectedAcc);
                setEdit(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      <ModHistoryAccInfo
        isOpen={showModHistory}
        handleDialog={setShowModHistory}
      />
      <PaymentHistoryAccInfo
        isOpen={showPayHistory}
        handleDialog={setShowPayHistory}
      />
    </div>
  );
};

export default Main;

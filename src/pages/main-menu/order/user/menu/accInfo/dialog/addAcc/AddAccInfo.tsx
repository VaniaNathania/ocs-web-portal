import {
  DialogWrapper,
  ParentDialogProps,
} from "@/pages/main-menu/role-management/generalUseComp";
import AccountInfoMainForm from "../../block/MainForm";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AccountInfo } from "@/pages/main-menu/order/models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useOrderUser } from "../../../../hooks/context";

const defaultAccAdd: AccountInfo = {
  defLangId: "",
  noSubsFlag: "",
  rutName: "",
  needUpload: "",
  allowModStateDate: "",
  custBillDeliveryInfoId: undefined,
  industryId: "",
  billFlag: "Y",
  deliverMethod: "",
  creditLimit: "",
  custBillDelivery: {
    updateDate: "",
    ccEmail: "",
    detailInfo: "",
    stdAddr: "",
    partyCodeName: "",
    partyType: "A",
    spId: "0",
    zipcode: "",
    custBillDeliveryInfoId: undefined,
    createdDate: "",
    smsNbr: "",
    partyCode: "1",
    custId: "",
    state: "A",
    faxNbr: "",
    email: "",
    fileType: "",
    stdAddrId: "",
  },
  balId: "",
  state: "A",
  createPartyType: "",
  bankAcctIssueDate: "",
  isHybridOffer: "",
  defaultFlag: "N",
  billFormatName: "",
  billingCycleTypeName: "PREPAID",
  acctId: 0,
  fingerMark: "",
  payerNumber: "",
  paymentMethodName: "",
  bankId: "",
  billAddress: "",
  operationType: "",
  billingCycleType: "",
  bankAcctNbr: "",
  stdAddrId: "",
  updateDate: "",
  rutNbr: "",
  routingId: "1",
  postpaid: "N",
  bankName: "",
  partyType: "",
  paymentComments: "",
  paymentType: "A",
  paymentTypeName: "Automatic Payment",
  isLock: "",
  bankAcctExpDate: "",
  paymentMethodId: 1,
  mandateId: "",
  custId: "",
  billFormatId: "",
  bankAcctName: "",
  createPartyCode: "",
  deliverMethodName: "",
  acctAttrValueList: "",
  bankCardType: "",
  acctName: "",
  custName: "",
  spId: "",
  parentAcctId: "",
  billingCycleTypeId: undefined,
  createdDate: "",
  billCurrency: undefined,
  partyCode: "",
  stateDate: "",
  acctNbr: "",
};

const API_URL = apiConfigOrder.order;

const AddAccInfo = ({ isOpen, handleDialog }: ParentDialogProps) => {
  const [form, setForm] = useState<AccountInfo | undefined>(defaultAccAdd);
  const { selectedUser } = useOrder();
  const { setRefreshKey } = useOrderUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { PostData } = useCallApi();

  useEffect(() => {
    setForm(defaultAccAdd);
  }, [isOpen]);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = {
        acctDto: {
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

      const resp = await PostData(
        `${API_URL}/api/order-entry/acct/add-acct`,
        payload,
      );

      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      handleDialog(false);
      setRefreshKey((prev) => prev + 1);
      return toast.success(resp.message);
    } catch (error) {
      return toast.error("Client Side Error");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <DialogWrapper
      title="Add Account"
      isOpen={isOpen}
      handleDialog={handleDialog}
      size={{ width: "6xl" }}
    >
      <div>
        {isLoading && <Loading />}
        <AccountInfoMainForm
          disable={false}
          formVal={form}
          setFormVal={setForm}
        />
        <div className="flex flex-row w-full justify-end gap-2">
          <Button size={"sm"} onClick={onSubmit}>
            Save
          </Button>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => handleDialog(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default AddAccInfo;

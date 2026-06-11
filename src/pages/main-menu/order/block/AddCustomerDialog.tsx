import { useEffect, useState } from "react";
import {
  DialogWrapper,
  ParentDialogProps,
} from "../../role-management/generalUseComp";
import CustInfoForm from "../component/CustomerInfoForm";
import SimpleAddCustInfo from "../component/SimpleAddCustInfo";
import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { CustomerInfo } from "../models/interfaces";
import { Loading } from "../../role-management/block/loadingBlock";
import { AttrRec } from "../models/types";
import { useOrder } from "../hooks/orderContext";

export const defaultCustomerInfo: CustomerInfo = {
  certTypeName: "",
  defLangId: 0,
  needUpload: "",
  certTypeId: 0,
  cert: "",
  thirdName: "",
  certAddress: "",
  expDate: "",
  effDate: "",
  industryId: 0,
  areaName: "",
  occupationId: 0,
  isWs: "",
  custTypeName: "",
  state: "",
  createPartyType: "",
  custCreditGradeName: "",
  impGradeName: "",
  certNbr: "",
  netType: "",
  contactFixNbr: "",
  zipcode: "",
  firstName: "",
  phoneNumber: "",
  titleName: "",
  birthdayDay: "",
  custType: "A",
  custCreditGradeId: 0,
  custSubSegment: "",
  operationType: "",
  pwd: "",
  stdAddrId: 0,
  updateDate: "",
  routingId: 0,
  gender: "",
  custSegment: "",
  occupationName: "",
  impGradeId: 0,
  decisionMakers: "",
  decisionMakersContact: "",
  religionId: 0,
  partyType: "",
  fourName: "",
  custTitleId: 0,
  custId: 0,
  religionName: "",
  issueDate: "",
  email: "",
  secondName: "",
  industryName: "",
  address: "",
  comments: "",
  vatNo: "",
  createPartyCode: "",
  certId: 0,
  custName: "",
  spId: 0,
  custCode: "",
  issueOrg: "",
  parentId: 0,
  createdDate: "",
  areaId: 0,
  partyCode: "",
  issueCountry: "",
  stateDate: "",
};

const API_URL = apiConfigOrder.order;

const AddCostomerDialog = ({ isOpen, handleDialog }: ParentDialogProps) => {
  const { PostData } = useCallApi();
  const [form, setForm] = useState<CustomerInfo>(defaultCustomerInfo);
  const [simple, setSimple] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attrRec, setAttrRec] = useState<AttrRec>({});
  const { setSelectedUser } = useOrder();

  const AddNewCust = async () => {
    try {
      setIsLoading(true);
      // console.log(form);

      const nextErrors: Record<string, string> = {};

      if (!form.certTypeId) nextErrors.certTypeId = "Please Fill This Field";

      if (!form.certNbr) nextErrors.certNbr = "Please Fill This Field";

      if (!form.custName) nextErrors.custName = "Please Fill This Field";

      if (!form.custType) nextErrors.custType = "Please Fill This Field";

      // now this is CORRECT
      if (
        Object.keys(nextErrors).length > 0 ||
        Object.keys(errors).length > 0
      ) {
        setErrors({ ...nextErrors, ...errors });
        //  console.log(nextErrors);
        return;
      }

      const payload = {
        customer: {
          custId: null,
          custCode: null,
          custName: form.custName || null, //req
          firstName: form.firstName || null,
          secondName: form.secondName || null,
          thirdName: form.thirdName || null,
          fourName: form.fourName || null,
          custType: form.custType || null, //req
          certId: form.certId || null,
          parentId: form.parentId || null,
          areaId: form.areaId || null,
          impGradeId: form.impGradeId || null,
          address: form.address || null,
          industryId: form.industryId || null,
          occupationId: form.occupationId || null,
          custTitleId: form.custTitleId || null,
          email: form.email || null,
          gender: form.gender || null,
          birthdayDay: new Date(form.birthdayDay ?? "") || null,
          phoneNumber: form.phoneNumber || null,
          pwd: form.pwd || null,
          doc: {
            certId: null,
            certTypeId: form.certTypeId || null, //req
            certNbr: form.certNbr || null, //req
            issueOrg: form.issueOrg || null,
            issueDate: new Date(form.issueDate ?? "") || null,
            effDate: new Date(form.effDate ?? "") || null,
            expDate: new Date(form.expDate ?? "") || null,
            certAddress: new Date(form.certAddress ?? "") || null,
          },
          custAttrValueExDtoList: Object.entries(attrRec).map(
            ([key, value]) => ({ key, ...value }),
          ),
        },
      };

      const resp = await PostData(
        `${API_URL}/api/order-entry/custommer/add-cust`,
        payload,
      );

      if (resp?.status) {
        toast.success("Success Adding Customer");
        setSelectedUser(resp.data);
        handleDialog(false);
        return;
      } else {
        toast.error("failed to add customer");
      }

      // console.log(payload);
    } catch (error) {
      toast.error("Error Adding Customer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setForm(defaultCustomerInfo);
  }, [isOpen]);

  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleDialog}
      size={{ width: "6xl" }}
      title="Add Customer"
    >
      <div
        className={`flex flex-col relative gap-5 transition-all duration-700 ${simple ? "h-[300px]" : "h-[707.6px]"}`}
      >
        {isLoading && <Loading />}
        {simple ? (
          <SimpleAddCustInfo
            form={form}
            setForm={setForm}
            disable={false}
            isNew={true}
            errors={errors}
            setErrors={setErrors}
          />
        ) : (
          <CustInfoForm
            form={form}
            setForm={setForm}
            disable={false}
            isNew={true}
            errors={errors}
            setErrors={setErrors}
            attrRec={attrRec}
            setAttrRec={setAttrRec}
          />
        )}
        <div
          className={`flex -bottom-5 w-full border-t-2 bg-white justify-end gap-2 p-2 ${simple ? "absolute" : "sticky"}`}
        >
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setSimple(!simple)}
          >
            <KeenIcon
              icon="up"
              className={`transition-all duration-700 ${simple ? "rotate-180" : "rotate-0"}`}
            />
          </Button>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => handleDialog(false)}
          >
            Cancel
          </Button>
          <Button size={"sm"} onClick={AddNewCust}>
            Add
          </Button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default AddCostomerDialog;

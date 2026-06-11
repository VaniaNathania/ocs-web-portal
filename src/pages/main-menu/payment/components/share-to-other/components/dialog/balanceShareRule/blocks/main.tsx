import { Button } from "@/components/ui/button";
import BalanceShare from "../components/BalanceShare";
import BalanceShareDetail from "../components/BalanceShareDetail";
import { useBalShareRule } from "../hooks/context";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { useShareToOther } from "../../../../hooks/context";
import { PayloadBALShareRule } from "../models/interfaces";

const API_URL = apiConfig.service_payment;

const Main = () => {
  const { form, setError, subsSimple, checkNumber } = useBalShareRule();
  const { setBalShare } = useShareToOther();
  const { PostData } = useCallApi();
  const submit = async () => {
    try {
      const checkBalShare = await checkNumber();
      if (!checkBalShare.status) {
        return toast.error("Please fill form correctly");
      }
      const tempError: Record<string, string> = {};
      if (!form?.balShare.children || form.balShare.children.length === 0)
        return toast.error("Bal Share Detail cannot be empty");
      if (!form?.balShare?.children?.[0]?.detailEffDate) {
        tempError["detailEffDate"] = "required";
      } else if (form?.balShare.children[0].detailExpDate) {
        const eff = new Date(form?.balShare.children[0].detailEffDate ?? "");
        const exp = new Date(form?.balShare.children[0].detailExpDate ?? "");
        if (eff > exp) tempError["detailExpDate"] = "false";
      }
      if (Object.values(tempError).length > 0) {
        toast.error("Please fill the form correctly");
        return setError(tempError);
      }
      const payload: PayloadBALShareRule = {
        ...form,
        acctId: form?.acctId,
        pSubsId: checkBalShare?.subsInfo?.subsId ?? 0,
        balShare: {
          ...form?.balShare,
          ceilLimit: (form?.balShare.ceilLimit ?? 0) * 100000,
          dailyCeilLimit: (form?.balShare.dailyCeilLimit ?? 0) * 100000,
          children: form?.balShare.children?.map((ch) => ({
            ...ch,
            subsId: checkBalShare?.subsInfo?.subsId ?? 0,
            balShareId: form.balShare.balShareId,
          })),
        },
      };
      const resp = await PostData(
        `${API_URL}/api/payment/deal-bal-share-to-other`,
        payload,
      );

      if (!resp?.status) {
        return toast.error(resp?.message);
      }

      setBalShare(false);
      return toast.success(resp.message);
    } catch (error) {
      //  console.log(error);

      return toast.error("Error Communicating with server");
    }
  };
  return (
    <div className="flex flex-col gap-5 mt-5">
      <BalanceShare />
      <BalanceShareDetail />
      <div className="flex flex-row justify-end gap-2">
        <Button size={"sm"} onClick={submit}>
          Submit
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => setBalShare(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Main;

import { AccountInfo } from "@/pages/main-menu/order/models/interfaces";
import { useEffect, useState } from "react";
import { useOrderSubsDetail } from "../../../hooks/SubsDetailContext";
import AccountInfoMainForm from "@/pages/main-menu/order/user/menu/accInfo/block/MainForm";
import { useOrderUser } from "@/pages/main-menu/order/user/hooks/context";

const AcctInfoAcctDetail = () => {
  const { subsBaseDetail } = useOrderSubsDetail();
  const { acctList } = useOrderUser();
  const [disable, setDisable] = useState<boolean>(true);
  const [form, setForm] = useState<AccountInfo | undefined>();

  useEffect(() => {
    const temp: AccountInfo | undefined = acctList?.data?.find(
      (item) => item.acctId === subsBaseDetail.data?.acctId,
    );

    // console.log("ini acct info didapet", temp);

    if (temp) setForm(temp);
  }, [subsBaseDetail]);

  return (
    <div className="">
      <AccountInfoMainForm
        disable={disable}
        formVal={form}
        setFormVal={setForm}
      />
    </div>
  );
};

export default AcctInfoAcctDetail;

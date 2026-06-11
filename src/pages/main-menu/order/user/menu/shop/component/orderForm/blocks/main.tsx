import { KeenIcon } from "@/components";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useOrderShop } from "../../../hooks/shopContext";
import Steps1 from "./step1";
import { AddDialog } from "./addDialog";
import Steps2 from "./step2";
import Steps3 from "./step3";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useOrderForm } from "../hooks/context";
import { SubsListDetail } from "@/pages/main-menu/order/models/interfaces";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { OrderList } from "../../../../order/models/interfaces";
import { formatDate, formatDateTime } from "@/hooks/generalHooks";

const Main = () => {
  const { setShowOrderForm, selectedTableItem, step, setStep } = useOrderShop();
  const { selectedUser } = useOrder();

  const { isLoading, form, orderNbr } = useOrderForm();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const onConfirmCancel = async () => {
    setShowConfirm(false);
    setStep(0);
    setShowOrderForm(false);
  };

  const onSubmit = async () => {
    try {
      let SubsLocal: Record<string, SubsListDetail> = JSON.parse(
        localStorage.getItem("SUBS") ?? "{}",
      );
      let custSubs: Record<string, number[]> = JSON.parse(
        localStorage.getItem("CUST_SUBS") ?? "{}",
      );
      let Order: Record<string, OrderList> = JSON.parse(
        localStorage.getItem("ORDER") ?? "{}",
      );
      let custOrder: Record<string, number[]> = JSON.parse(
        localStorage.getItem("CUST_ORDER") ?? "{}",
      );
      let seq: Record<string, number> = JSON.parse(
        localStorage.getItem("SEQ") ?? '{"SUBS":121312027, "ORDER":1}',
      );

      const custId: number = selectedUser?.custId ?? 0;

      //  console.log(selectedTableItem);

      const newSubs: SubsListDetail = {
        subsId: seq["SUBS"],
        servType: selectedTableItem?.servType ?? 0,
        servTypeName: "GSM(Convergent)",
        prefix: form?.simCard?.prefix ?? "",
        accNbr: form?.simCard?.accNbr ?? "",
        prodState: "G",
        prodStateName: "Inactive",
        blockReason: "",
        completedDate: new Date().toString(),
        activeDate: undefined,
        agreementExpDate: undefined,
        offerId: selectedTableItem?.indepProdSpecId ?? 0,
        offerName: selectedTableItem?.indepProdSpecName ?? "",
        acctNbr: form?.acct?.acctNbr ?? "",
        acctId: form?.acct?.acctId ?? 0,
        blockReasonCode: "00000000000000",
        subsNextStateDto: {
          nextState: "D",
          nextStateName: "Grace",
          nextStateDate: "2026-12-31T10:13:48",
          isIndividual: "false",
        },
        offerType: selectedTableItem?.offerType.toString() ?? "2",
        children: undefined,
        parentSubs: undefined,
        subsPlanId: selectedTableItem?.offerId ?? 0,
        subsPlanName: selectedTableItem?.offerName ?? "",
        offerVerId: selectedTableItem?.offerVerId ?? 0,
        bundleMemAlias: undefined,
      };

      const newOrder: OrderList = {
        orderItemId: seq["ORDER"],
        orderNbr: orderNbr,
        offerName: selectedTableItem?.indepProdSpecName ?? "",
        subsPlanName: selectedTableItem?.offerName ?? "",
        offerId: selectedTableItem?.indepProdSpecId ?? 0,
        subsEventId: 1,
        eventName: "New Connection",
        offerType: selectedTableItem?.offerType.toString() ?? "2",
        custOrderId: seq["ORDER"],
        accNbr: form?.simCard?.accNbr ?? "",
        orderState: "C",
        orderStateName: "Completion",
        createdMan: "",
        acceptChannelName: "",
        createdDate: formatDateTime(),
        completedDate: formatDateTime(),
        contactChannelId: 0,
        contactChannelName: "",
        children: undefined,
        orderType: "B",
        bundleMemAlias: undefined,
        routingId: undefined,
        timerEventId: undefined,
      };

      //  console.log("ini newSubs", newSubs, selectedUser?.custId, newOrder);

      SubsLocal[seq["SUBS"]] = newSubs;
      Order[seq["ORDER"]] = newOrder;

      if (!custSubs[custId]) custSubs[custId] = [newSubs.subsId];
      else custSubs[custId] = [...custSubs[custId], newSubs.subsId];
      if (!custOrder[custId]) custOrder[custId] = [newOrder.orderItemId];
      else custOrder[custId] = [...custOrder[custId], newOrder.orderItemId];

      seq["SUBS"] = seq["SUBS"] + 1;
      seq["ORDER"] = seq["ORDER"] + 1;

      localStorage.setItem("SEQ", JSON.stringify(seq));
      localStorage.setItem("SUBS", JSON.stringify(SubsLocal));
      localStorage.setItem("ORDER", JSON.stringify(Order));
      localStorage.setItem("CUST_SUBS", JSON.stringify(custSubs));
      localStorage.setItem("CUST_ORDER", JSON.stringify(custOrder));

      // console.log("Ini Subs local", SubsLocal);
    } catch (error) {
      //  console.log(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-white p-5 gap-5">
      {isLoading && <Loading />}

      <div className="w-full flex flex-row justify-between items-center">
        <div>New Connection / {selectedTableItem?.offerName}</div>
        <Button
          size={"sm"}
          variant={"ghost"}
          onClick={() => {
            if (step !== 2) {
              setShowConfirm(true);
              return;
            }
            setShowOrderForm(false);
          }}
        >
          <KeenIcon icon="cross" />
        </Button>
      </div>
      <AddDialog />
      <div className="flex-1 w-full">
        {step === 0 && <Steps1 />}
        {step === 1 && <Steps2 />}
        {step === 2 && <Steps3 />}
      </div>
      {step !== 2 ? (
        <div className="flex flex-row justify-between items-center w-full">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Previous
          </Button>
          <div className="flex flex-row gap-2">
            <Button
              size={"sm"}
              onClick={() => {
                if (step == 1) onSubmit();
                // else
                setStep(step + 1);
              }}
            >
              Next
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setShowConfirm(true)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row justify-end items-center w-full">
          <Button
            size={"sm"}
            onClick={() => {
              setShowOrderForm(false);
              setStep(0);
            }}
          >
            OK
          </Button>
        </div>
      )}
      <PopUpDialog
        isOpen={showConfirm}
        handleDialog={setShowConfirm}
        onConfirm={onConfirmCancel}
        desc="Are you sure to cancel your order?"
        bgOn={false}
      />
    </div>
  );
};

export default Main;

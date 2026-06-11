import { Button } from "@/components/ui/button";
import SubsListFormHeader from "../../header";
import { usePFDial } from "../hooks/context";
import { useSubscriberListContext } from "../../../hooks";
import { StepForm, stepItem } from "@/components/ui/stepForm";
import Step1 from "../components/step1";
import Step2 from "../components/step2";
import Step3 from "../components/step3";
import Step4 from "../components/step4";
import {
  EventPaymentData,
  StartOrderFlow,
} from "../../modifysubscriber/model/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useEffect } from "react";

const API_URL = apiConfigOrder.order;

const Main = () => {
  const {
    step,
    setStep,
    allData,
    form,
    setAllData,
    paymentMethod,
    defaultBal,
    amount,
    dateError,
  } = usePFDial();
  const { setSelectedOperation, setIsLoading, isLoading } =
    useSubscriberListContext();
  const { PostData } = useCallApi();
  const stepItems: stepItem[] = [
    {
      item: <Step1 />,
    },
    {
      item: <Step2 />,
    },
    {
      item: <Step3 />,
    },
    {
      item: <Step4 />,
    },
  ];

  // useEffect(() => {
  // //  console.log("di main", form);
  // }, [form]);

  const nextFlow2 = async () => {
    try {
      setIsLoading(true);
      if (!allData) return;
      //  console.log(form);

      const payload: StartOrderFlow = {
        ...allData,
        // cashDeskFee: mockCashDeskFee,
        orderItemList: [
          {
            ...allData.orderItemList[0],
            custProf: {
              ...allData.orderItemList[0].custProf,
              address: form?.address,
              areaId: form?.areaId,
              birthdayDay: form?.birthdayDay,
              comments: form?.comments,
              custTitleId: form?.custTitleId,
              effDate: form?.effDate,
              expDate: form?.expDate,
              email: form?.email,
              firstName: form?.firstName,
              fourName: form?.fourName,
              gender: form?.gender,
              issueDate: form?.issueDate,
              issueOrg: form?.issueOrg,
              phoneNumber: form?.phoneNumber,
              secondName: form?.secondName,
              thirdName: form?.thirdName,
              zipcode: form?.zipcode,
            },
          },
        ],
        // subsId: selectedSubs?.subsId,
      };

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_2`,
        payload,
      );
      const temp: StartOrderFlow = resp?.data;
      //  console.log("ini ke next 2", payload);
      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      if (!temp.cashDeskFee) {
        const step3 = await PostData(
          `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
          temp,
        );
        if (step3?.status) setStep((prev) => prev + 2);
      } else if (!temp.cashDeskFee[0].children[0].children) {
        const step3 = await PostData(
          `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
          temp,
        );
        if (step3?.status) setStep((prev) => prev + 2);
      } else setStep((prev) => prev + 1);
      setAllData(resp.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const nextFlow3 = async () => {
    try {
      setIsLoading(true);
      //  console.log("ini dari step 2", allData);

      if (!allData) return;
      if (!defaultBal) return;
      if (!allData.cashDeskFee) return;
      if (!amount && paymentMethod.length > 0)
        return toast.error("Please input amount");
      if (dateError) return toast.error(dateError);

      const mockeventPaymentData: EventPaymentData = {
        eventInstIdList: undefined, // ini gk dapet bentuk list
        fromCsr: true,
        createdDate: undefined,
        spId: 0,
        partyType: "A",
        eventPaymentId: undefined, // ini gk dapet
        eventPaymentSn: undefined, // ini gk dapet
        charge: allData.cashDeskFee[0].receivableCharge * -1,
        acctId: defaultBal.acctId,
        oriCharge: allData.cashDeskFee[0].receivableCharge * -1,

        instantPaymentList: paymentMethod.includes("0")
          ? [
              {
                createdDate: undefined,
                spId: 0,
                returnAmount:
                  Number(amount.cash) * 100000 -
                  allData.cashDeskFee[0].receivableCharge,
                partyType: "F",
                eventPaymentId: undefined, //ini gk dapet
                paymentId: undefined, // ini gk dapet
                charge: allData.cashDeskFee[0].receivableCharge * -1,
                paymentMethodId: 1,
                submitAmount: Number(amount.cash) * -100000,
                partyCode: "1",
              },
            ]
          : undefined,

        balDeductDataList: paymentMethod.includes("1")
          ? [
              {
                deductAcctBook: {
                  acctResId: defaultBal?.acctResId,
                  preSuttleBal: defaultBal?.preSuttleBal,
                  createdDate: undefined,
                  preExpDate: undefined,
                  acctId: defaultBal?.acctId,
                  refAttr: defaultBal?.refAttr,
                  seconds: defaultBal?.seconds,
                  spId: 0,
                  preEffDate: undefined,
                  eventInstId: undefined, // ini gk dapet
                  effSeconds: defaultBal?.effSeconds,
                  preBalance: defaultBal?.preBalance,
                  billId: undefined, // ini gk dapet
                  partyType: "A",
                  acctBookType: "Q",
                  contactChannelId: 1,
                  eventPaymentId: undefined, // ini gk dapet
                  balId: defaultBal?.balId, // ini gk dapet
                  acctBookId: undefined, // ini gk dapet
                  charge:
                    (Number(amount.balance) + Number(amount.cash)) * 100000,
                  partyCode: "1",
                },

                balDeductCharge: Number(amount.balance) * 100000,
                acctId: defaultBal?.acctId,
                balDeductAcctResId: 1,
                eventInstId: undefined, // ini gk dapet
                priceId:
                  allData.cashDeskFee[0]?.children[0].children[0]?.children[0]
                    ?.priceId ?? 0,
                effSeconds: defaultBal?.effSeconds,
                deductSeq: 1,
                effDate: undefined,
                acctBookId: undefined, // ini gk dapet
                seq: 0,
              },
            ]
          : [],

        contactChannelId: 1,
        discountCharge: 0,
        partyCode: "1",
      };
      const payload: StartOrderFlow = {
        ...allData,
        eventPaymentData: mockeventPaymentData,
      };
      // console.log("ini ke next 3", payload);
      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
        payload,
      );
      // console.log("ini ke next 3", payload);
      if (!resp?.status) {
        return toast.error(resp?.message);
      }
      const temp: StartOrderFlow = resp?.data;
      setStep((prev) => prev + 1);
      setAllData(temp);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <SubsListFormHeader />
      {isLoading && <Loading />}
      <div className="flex-1 w-full">
        <StepForm items={stepItems} step={step} label={false} />
      </div>
      <div className="flex flex-row justify-between p-5">
        {step < 3 && (
          <Button
            variant="outline"
            onClick={() => setStep((prev) => prev - 1)}
            disabled={step == 0}
          >
            Previous
          </Button>
        )}
        {step < 3 ? (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedOperation(undefined)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                //  console.log(dateError);

                if (step == 0 && dateError != "") {
                  return toast.error("Error Processing");
                }
                if (step == 0 && dateError == "") {
                  setStep((prev) => prev + 1);
                }
                if (step == 1) nextFlow2();
                if (step == 2) nextFlow3();
              }}
            >
              {step < 3 ? "Next" : "Done"}
            </Button>
          </div>
        ) : (
          <Button
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => {
              if (dateError == "") setSelectedOperation(undefined);
            }}
          >
            {"Done"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Main;

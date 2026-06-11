import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SIMCardDetail } from "@/pages/main-menu/order/models/interfaces";
import { useSubscriberListContext } from "../../../hooks";
import { useReplacement } from "../hooks/context";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import SectionTitle from "../../sectionTitle";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/* Mock data (temporary) */
/* ------------------------------------------------------------------ */

const API_REF = apiConfigRef.ref;

const RepSteps1 = () => {
  const { GetData } = useCallApi();
  const { form, setForm, RepInfoUseQuery, allData } = useReplacement();
  const [currSim, setCurrSim] = useState<SIMCardDetail>();

  const FetchSimCard = async (
    iccid: string,
  ): Promise<SIMCardDetail | undefined> => {
    try {
      const resp = await GetData(
        `${API_REF}/change-number-profile/qry-sim-card-details`,
        {
          iccidBegin: iccid,
          iccidEnd: iccid,
          search: "",
          page: 1,
          size: 1,
          sortBy: "SIM_CARD_ID",
          sortDirection: "asc",
        },
      );
      if (!resp.status) {
        toast.error(resp.message);
        return;
      }
      const temp: SIMCardDetail = resp.data[0];
      return temp;
    } catch (error) {}
  };

  const FetchNewSimCard = async () => {
    try {
      if (!form.newSIMCard.iccid) return;
      const temp = await FetchSimCard(form.newSIMCard.iccid);
      if (!temp) {
        toast.error("Iccid not found");
        return;
      }
      if (temp.simState === "A") {
        toast.error("Sim Card is Active");
        return;
      }
      if (temp.isBindingFlag === "Y") {
        toast.error("Sim Card is already binded");
        return;
      }
      setForm((prev) => ({ ...prev, newSIMCard: temp }));
    } catch (error) {}
  };

  const FetchCurrSimCard = async () => {
    const strIccid =
      allData?.orderItemList[0].iccid ??
      allData?.orderItemList[0].oldIccid ??
      "";
    if (!strIccid) return;
    const temp = await FetchSimCard(strIccid);
    setCurrSim(temp);
  };

  useEffect(() => {
    FetchCurrSimCard();
  }, [allData]);

  return (
    <div className="flex flex-col gap-2">
      {/* ================= Current Information ================= */}
      <SectionTitle title="Current Information" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="ICCID" isRequired>
          <Input size="sm" value={currSim?.iccid} disabled />
        </BuildFormRow>

        <BuildFormRow label="SIM Card Type" isRequired>
          <Input size="sm" value={currSim?.simTypeName} disabled />
        </BuildFormRow>

        <BuildFormRow label="HLR Belongs To" isRequired>
          <Input size="sm" value={currSim?.hlrName} disabled />
        </BuildFormRow>
      </div>

      {/* ================= New SIM Card ================= */}
      <SectionTitle title="New SIM Card" className="mt-5" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="ICCID" isRequired>
          <Input
            size="sm"
            value={form.newSIMCard.iccid}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                newSIMCard: { ...prev.newSIMCard, iccid: e.target.value },
              }))
            }
            onBlur={FetchNewSimCard}
          />
        </BuildFormRow>

        <BuildFormRow label="SIM Card Restore">
          <Input
            type="checkbox"
            className="w-[20px] h-[20px] items-center"
            disabled
          />
        </BuildFormRow>

        <BuildFormRow label="SIM Card Type">
          <Input size="sm" value={form.newSIMCard.simTypeName} disabled />
        </BuildFormRow>

        <BuildFormRow label="IMSI">
          <Input size="sm" value={form.newSIMCard.imsi} disabled />
        </BuildFormRow>

        <BuildFormRow label="PIN1">
          <Input size="sm" value={form.newSIMCard.pin1} disabled />
        </BuildFormRow>

        <BuildFormRow label="PUK1">
          <Input size="sm" value={form.newSIMCard.puk1} disabled />
        </BuildFormRow>

        <BuildFormRow label="PIN2">
          <Input size="sm" value={form.newSIMCard.pin2} disabled />
        </BuildFormRow>

        <BuildFormRow label="PUK2">
          <Input size="sm" value={form.newSIMCard.puk2} disabled />
        </BuildFormRow>

        <BuildFormRow label="Comment">
          <Input size="sm" value={form.remarks} />
        </BuildFormRow>
      </div>

      {/* ================= Order Information ================= */}
      <SectionTitle title="Order Information" className="mt-5" />

      <div
        className={`grid grid-cols-2 gap-10 ${!form.susPensionReasonId ? "gap-y-0" : "gap-y-2"} w-full`}
      >
        <BuildFormRow label="Order Reason">
          <div
            className={`flex items-center ${!form.susPensionReasonId ? "gap-0" : "gap-2"}  w-full`}
          >
            <Select
              value={form.susPensionReasonId?.toString()}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  susPensionReasonId: Number(value),
                }))
              }
            >
              <SelectTrigger size="sm" className="flex-1">
                <SelectValue placeholder="Select Order Reason" />
              </SelectTrigger>
              <SelectContent>
                {suspensionReason.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
                {RepInfoUseQuery?.data?.orderReason.map((item) => (
                  <SelectItem
                    key={item.orderReasonId}
                    value={item.orderReasonId.toString()}
                  >
                    {item.orderReasonName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                !form.susPensionReasonId ? "max-w-0" : "max-w-[40px]"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    susPensionReasonId: undefined,
                  }))
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            </div>
          </div>
        </BuildFormRow>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            !form.susPensionReasonId
              ? "opacity-0 max-h-0"
              : "opacity-100 max-h-20"
          }`}
        >
          <BuildFormRow label="Other Order Reason">
            <Input
              size="sm"
              value={form.otherReason}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  otherReason: e.target.value,
                }))
              }
            />
          </BuildFormRow>
        </div>
      </div>
    </div>
  );
};

export default RepSteps1;

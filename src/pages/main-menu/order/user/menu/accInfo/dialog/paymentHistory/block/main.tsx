import {
  DialogWrapper,
  ParentDialogProps,
} from "@/pages/main-menu/role-management/generalUseComp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ModHistoryTable from "./PaymentHistoryTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderAccInfo } from "../../../hooks/accInfoContext";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ContactChannel,
  PaymentHistoryQuery,
} from "../../../models/interfaces";
import { useOrderPaymentHistoryAccInfo } from "../hook/paymentHistoryContext";
import { useState } from "react";
import { defaultPaymentQuery } from "../models/mock";

const API_URL = apiConfigOrder.order;

const Main = ({ isOpen, handleDialog }: ParentDialogProps) => {
  const { accInfoUseQuery } = useOrderAccInfo();
  const { query, setQuery } = useOrderPaymentHistoryAccInfo();
  const { GetData } = useCallApi();

  const [tempQuery, setTempQuery] =
    useState<PaymentHistoryQuery>(defaultPaymentQuery);

  const fetchContact = async () => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/order/qry-contact-channel-list`,
        { spId: 0 },
      );

      if (!resp.message) return [];
      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const contactChannel: UseQueryResult<ContactChannel[]> = useQuery({
    queryKey: ["payment-history"],
    queryFn: fetchContact,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  return (
    <DialogWrapper
      title="Modify History"
      isOpen={isOpen}
      handleDialog={handleDialog}
      size={{ width: "6xl" }}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5 my-5">
          <div className="flex flex-row items-center gap-2">
            <Label className="w-24">Payment Method</Label>
            <Select
              value={tempQuery.paymentMethodId?.toString() ?? ""}
              onValueChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  paymentMethodId: Number(e),
                }))
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                {accInfoUseQuery.data?.paymentMethod.map((item) => (
                  <SelectItem
                    key={item.paymentMethodId}
                    value={item.paymentMethodId.toString()}
                  >
                    {item.paymentMethodName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-24">Contact Channel</Label>
            <Select
              value={tempQuery.contactChannelId?.toString() ?? ""}
              onValueChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  contactChannelId: Number(e),
                }))
              }
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Contact" />
              </SelectTrigger>
              <SelectContent>
                {contactChannel.data?.map((item) => (
                  <SelectItem
                    key={item.contactChannelId}
                    value={item.contactChannelId.toString()}
                  >
                    {item.contactChannelName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-24">Start Date</Label>
            <input
              type="datetime-local"
              className="input input-sm bg-white flex-1"
              value={tempQuery.tradeBeginTime ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  tradeBeginTime: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <Label className="w-24">End Date</Label>
            <input
              type="datetime-local"
              className="input input-sm bg-white flex-1"
              value={tempQuery.tradeEndTime ?? ""}
              onChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  tradeEndTime: e.target.value,
                }))
              }
            />
          </div>
          <div />
          <div className="flex flex-row gap-2 justify-end">
            <Button
              size={"sm"}
              onClick={() => {
                setQuery({ ...tempQuery, pageNumber: 1 });
              }}
            >
              Query
            </Button>
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                setQuery(defaultPaymentQuery);
                setTempQuery(defaultPaymentQuery);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <ModHistoryTable />
      </div>
    </DialogWrapper>
  );
};

export default Main;

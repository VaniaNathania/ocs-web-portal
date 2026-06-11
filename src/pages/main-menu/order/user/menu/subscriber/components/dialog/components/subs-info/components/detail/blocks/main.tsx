import { DefaultTooltip } from "@/components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrderSubsDetail } from "../../../../../hooks/SubsDetailContext";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SIMCardDetail } from "@/pages/main-menu/order/models/interfaces";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";

const API_URL = apiConfigRef.ref;

const Main = () => {
  const { subsBaseDetail } = useOrderSubsDetail();
  const { GetData } = useCallApi();

  const fetchSimCard = async (): Promise<SIMCardDetail | undefined> => {
    try {
      const resp = await GetData(
        `${API_URL}/change-number-profile/qry-sim-card-details`,
        {
          search: "",
          page: 1,
          size: 1,
          sortBy: "simCardId",
          sortDirection: "asc",
          imsiBegin: subsBaseDetail.data?.imsi,
          imsiEnd: subsBaseDetail.data?.imsi,
        },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return undefined;
      }

      return resp.data[0];
    } catch (error) {
      toast.error("Client Side Error");
      return undefined;
    }
  };

  const SimCardDetail: UseQueryResult<SIMCardDetail | undefined> = useQuery({
    queryKey: ["sim-card-detail", subsBaseDetail.data?.imsi],
    enabled: !!subsBaseDetail.data,
    queryFn: fetchSimCard,
    refetchOnWindowFocus: false,
  });
  // console.log(detail);/

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Service Number" placement="top">
          <Label className="w-1/3 truncate">Service Number</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.accNbr}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Main Product" placement="top">
          <Label className="w-1/3 truncate">Main Product</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.offerName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Subscription Plan" placement="top">
          <Label className="w-1/3 truncate">Subscription Plan</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.subsPlanName}
        />
      </div>
      {/* created staff gk tau dari mana */}
      {/* <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Created Staff" placement="top">
          <Label className="w-1/3 truncate">Created Staff</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.subsPlanOffer.offerName}
        />
      </div> */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="State" placement="top">
          <Label className="w-1/3 truncate">State</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.prodStateName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Block Reason" placement="top">
          <Label className="w-1/3 truncate">Block Reason</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.blockReasonName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Activation Date" placement="top">
          <Label className="w-1/3 truncate">Activation Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.stateDate}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Agreement Effective Date" placement="top">
          <Label className="w-1/3 truncate">Agreement Effective Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.agreementEffDate}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Agreement Expiry Date" placement="top">
          <Label className="w-1/3 truncate">Agreement Expiry Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.agreementExpDate}
        />
      </div>
      {/* subs catalog masih gk tau */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Subscriber Catalog" placement="top">
          <Label className="w-1/3 truncate">Subscriber Catalog</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.subsCatgNameList}
        />
      </div>
      {/* harus nya prodnextstatename */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Next State" placement="top">
          <Label className="w-1/3 truncate">Next State</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.subsNextStateDto?.nextStateName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Next State Date" placement="top">
          <Label className="w-1/3 truncate">Next State Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.subsNextStateDto?.nextStateDate}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="IMSI" placement="top">
          <Label className="w-1/3 truncate">IMSI</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.imsi}
        />
      </div>
      {/* kemungkinan dari fetch api ke IMSI */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="PUK1" placement="top">
          <Label className="w-1/3 truncate">PUK1</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={SimCardDetail.data?.puk1}
          // value={subsBaseDetail.data?.PUK1}
        />
      </div>
      {/* kemungkinan dari fetch api ke IMSI */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="PUK2" placement="top">
          <Label className="w-1/3 truncate">PUK2</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={SimCardDetail.data?.puk2}

          // value={subsBaseDetail.data?.imsi}
        />
      </div>
      {/* gk tau var nya */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Subscriper Special" placement="top">
          <Label className="w-1/3 truncate">Subscriber Special</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.imsi}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Customer Name" placement="top">
          <Label className="w-1/3 truncate">Customer Name</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.custName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Customer Type" placement="top">
          <Label className="w-1/3 truncate">Customer Type</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.custType}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Doc Number" placement="top">
          <Label className="w-1/3 truncate">Doc Number</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={`${subsBaseDetail.data?.certNbr} [${subsBaseDetail.data?.certTypeName}] `}
        />
      </div>
      {/* ini kemungkinan refereance ke id deflangid terus ambil name nya*/}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Default Language" placement="top">
          <Label className="w-1/3 truncate">Default Language</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.defLangId}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Account Number" placement="top">
          <Label className="w-1/3 truncate">Account Number</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.acctNbr}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Billing Cycle Type" placement="top">
          <Label className="w-1/3 truncate">Billing Cycle Type</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.billingCycleTypeName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Prepaid" placement="top">
          <Label className="w-1/3 truncate">Prepaid</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.postPaid === "N" ? "Yes" : "No"}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Area" placement="top">
          <Label className="w-1/3 truncate">Area</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.areaName}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Accepted Organization" placement="top">
          <Label className="w-1/3 truncate">Accepted Organization</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.orgName}
        />
      </div>
      {/* ini tebak tebakan var banyak value yang sama */}
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Accepted Date" placement="top">
          <Label className="w-1/3 truncate">Accepted Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.completedDate}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Routing Id" placement="top">
          <Label className="w-1/3 truncate">Routing Id</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.routingId}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Subs Name" placement="top">
          <Label className="w-1/3 truncate">Subs Name</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          value={subsBaseDetail.data?.subsPlanName}
        />
      </div>
      {/* gk tau var field nya */}
      {/* <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Hybrid Account" placement="top">
          <Label className="w-1/3 truncate">Hybrid Account</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.acctEx.hy}
        />
      </div> */}
      {/* <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Hybrid Billing Cycle" placement="top">
          <Label className="w-1/3 truncate">Hybrid Billing Cycle</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.acctEx.hy}
        />
      </div> */}
      {/* gk tau field nya */}
      {/* <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Reserved Date" placement="top">
          <Label className="w-1/3 truncate">Reserved Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.acctEx.hy}
        />
      </div> */}
      {/* gk tau field nya */}
      {/* <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="First Reserved Date" placement="top">
          <Label className="w-1/3 truncate">First Reserved Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.acctEx.hy}
        />
      </div> */}
      {/* gk tau field nya */}
      {/* <div className="flex flex-row items-center gap-2">
        <DefaultTooltip title="Second Reserved Date" placement="top">
          <Label className="w-1/3 truncate">Second Reserved Date</Label>
        </DefaultTooltip>
        <Input
          className="flex-1"
          size={"sm"}
          disabled
          // value={subsBaseDetail.data?.acctEx.hy}
        />
      </div> */}
      {subsBaseDetail.data?.prodAttrValueExDtoList?.map((item, index) => {
        return (
          <div className="flex flex-row items-center gap-2" key={index}>
            <DefaultTooltip title={item.attrName} placement="top">
              <Label className="w-1/3 truncate">{item.attrName}</Label>
            </DefaultTooltip>
            <Input className="flex-1" size={"sm"} disabled value={item.value} />
          </div>
        );
      })}
    </div>
  );
};

export default Main;

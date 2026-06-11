import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSubscriberListContext } from "../hooks";
import ModifySubscriberDetailStepTwo from "./ModifySubscriberDetailStepTwo";
import { mockModSubs } from "./mockModSubs";
import { DefaultTooltip, KeenIcon } from "@/components";
import { FeatureData } from "@/pages/main-menu/offer/main-product/components/DetailCategoryContent/FeatureTabContent";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AttrFieldOrder } from "../blocks/AttrFieldOrder";
import {
  AttrOrder,
  CustomerInfo,
  SubsListDetail,
} from "@/pages/main-menu/order/models/interfaces";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";

interface ModifySubscriberDetailProps {
  onBack: () => void;
}

const API_URL = apiConfigOrder.order;

const ModifySubscriberDetail: React.FC<ModifySubscriberDetailProps> = ({
  onBack,
}) => {
  const {
    handleModifySubscriberDetailAddDialog,
    ownedOffer,
    // fetchOwnedOffer,
    selectedSubs,
  } = useSubscriberListContext();
  const { selectedUser } = useOrder();
  const [step, setStep] = useState(1);
  const [childShow, setChildShow] = useState<{ [id: string]: boolean }>({});
  const [attrShow, setAttrShow] = useState<{ [id: string]: boolean }>({});
  const [attrRec, setAttrRec] = useState<{ [id: string]: AttrOrder[] }>({});
  const { GetData } = useCallApi();

  const mapToOrderPayload = (subs: SubsListDetail, cust: CustomerInfo) => {
    return {
      custId: cust.custId,
      custName: cust.custName,
      acctId: subs.acctId,

      subsEventId: 0,
      contactChannelId: 0,

      subsId: subs.subsId,
      offerId: subs.offerId,
      servType: subs.servType,
      quantity: 1,

      subsPlanId: subs.subsPlanId,
      subsPlanName: subs.subsPlanName,
      acctNbr: subs.acctNbr,

      routingId: cust.routingId,
    };
  };

  // useEffect(() => {
  //   fetchOwnedOffer();
  // }, []);

  const toggleChild = (id: string) => {
    setChildShow((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchAttr = async (offerId: number): Promise<AttrOrder[]> => {
    try {
      const payload = {
        offerId: offerId,
        subsPlanId: selectedSubs?.subsPlanId,
      };
      const resp = await GetData(
        `${API_URL}/api/order-entry/subs-plan/qry-subs-plan-attr-fiji`,
        payload,
      );

      if (resp.status) {
        return resp.data;
      }
      toast.error(resp.message);
      return [];
    } catch (error) {
      toast.error("Failed to fetch data");
      return [];
    }
  };

  const toggleAttr = async (id: string) => {
    try {
      setAttrShow((prev) => ({ ...prev, [id]: !prev[id] }));
      if (attrShow[id] || attrRec[id]?.length > 0) return;
      const attr: AttrOrder[] = await fetchAttr(Number(id));
      setAttrRec((prev) => ({ ...prev, [id]: attr }));
    } catch (error) {
    } finally {
      //  console.log(attrRec);
    }
  };

  return (
    <>
      {step === 2 ? (
        <ModifySubscriberDetailStepTwo onBack={() => setStep(1)} />
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-800">
                SC_1000_Prepaid_Reguler
              </h1>
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Service Info */}
            <div className="flex gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📱</span>
                <span>Service Number: 73007362</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📋</span>
                <span>Offer Name: Telkomcel Prepaid Channel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                <span>Subscription Plan Name: SC_1000_Prepaid_Reguler</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Select Service */}
            <div className="bg-white rounded-lg shadow-sm mb-4">
              <div className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Select Service
                  </h2>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-700">
                    Select Service
                  </h3>
                  <button
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
                    onClick={() => handleModifySubscriberDetailAddDialog(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                {ownedOffer.map((item) => {
                  // const [childShow, setChildShow] = useState<boolean>(false);

                  return (
                    <div className="flex flex-col overflow-hidden rounded-md border-2">
                      <div className="p-2 bg-gray-50 items-center flex flex-row justify-between">
                        <div className="flex flex-row gap-2">
                          <div className="w-1 h-6 bg-yellow-400 rounded" />
                          {/* {item.name} */}
                        </div>
                        <Button
                          size={"sm"}
                          variant={"ghost"}
                          // onClick={() => toggleChild(item.id?.toString() ?? "")}
                        >
                          <KeenIcon
                            icon="down"
                            // className={`transition-all duration-300 ${childShow[item.id ?? ""] ? "rotate-180" : "rotate-0"}`}
                          />
                        </Button>
                      </div>

                      {/* {item.children?.map((child) => {
                        return (
                          <div
                            className={`flex flex-col transition-all duration-300 overflow-hidden 
                              ${childShow[item.id ?? ""] ? `${attrShow[child.offerId ?? ""] ? "h-[140px]" : "h-[80px]"}` : "h-0"}`}
                          >
                            <div className=" px-5 items-center flex flex-row justify-between">
                              <div className="flex flex-row gap-2 text-primary">
                                {child.offerName}
                              </div>
                            </div>
                            <div className=" px-5 grid grid-cols-9">
                              <div className="col-span-2 flex flex-col">
                                <div className="text-xs opacity-50 truncate">
                                  OTC
                                </div>
                                <div className="text-sm text-orange-400 truncate">
                                  {child.offer?.saleListPrice}
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-xs opacity-50 truncate">
                                  MRC
                                </div>
                                <div className="text-sm text-orange-400 truncate">
                                  {child.offer?.rentListPrice}
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-xs opacity-50 truncate">
                                  Effective Type
                                </div>
                                <div className="text-sm flex flex-row">
                                  <div className="truncate ">
                                    2020/12/01 16:01:10
                                  </div>
                                  <div>
                                    <KeenIcon icon="notepad-edit" />
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <div className="text-xs opacity-50 truncate">
                                  Effective Duration {`{Date}`}
                                </div>
                                <div className="text-sm flex flex-row">
                                  <div className="truncate ">Forever</div>
                                  <div>
                                    <KeenIcon icon="notepad-edit" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap justify-end">
                                <Button variant={"ghost"} size={"sm"}>
                                  <KeenIcon icon="trash" />
                                </Button>
                                <Button
                                  variant={"ghost"}
                                  size={"sm"}
                                  onClick={() => {
                                  //  console.log(child);

                                    toggleAttr(child.offerId?.toString() ?? "");
                                  }}
                                >
                                  <KeenIcon
                                    icon="down"
                                    className={`transition-all duration-300 ${attrShow[child.offerId ?? ""] ? "rotate-180" : "rotate-0"}`}
                                  />
                                </Button>
                              </div>
                            </div>
                            <div
                              className={`bg-orange-200 px-5 flex flex-row transition-all  duration-300 overflow-hidden overflow-x-auto
                            items-center gap-2  ${attrShow[child.offerId ?? ""] ? "h-20" : "h-0"}`}
                            >
                              {!attrRec[String(child.offerId)] && (
                                <div>No Data</div>
                              )}
                              {attrRec[String(child.offerId)]?.map((attr) => {
                                return (
                                  <div className="flex flex-col text-xs w-40">
                                    <DefaultTooltip
                                      title={attr.attrName}
                                      placement="top"
                                    >
                                      <Label className="truncate">
                                        {attr.attrName}
                                      </Label>
                                    </DefaultTooltip>
                                    <AttrFieldOrder
                                      offerId={child.offerId ?? 0}
                                      attrId={attr.attrId}
                                      rowData={attrRec[String(child.offerId)]}
                                      setRowData={setAttrRec}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })} */}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Order Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Order Information
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reservation Time
                    </label>
                    <input
                      type="datetime-local"
                      placeholder="Format: yyyy-mm-dd hh:ss"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
              <Button variant="outline" onClick={onBack}>
                Previous
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">Cancel</Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModifySubscriberDetail;

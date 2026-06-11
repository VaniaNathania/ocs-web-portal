import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriberListContext } from "../hooks";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loading } from "@/components/common/Loading";
import { operationItems } from "@/pages/main-menu/order/models/interfaces";

interface OptDialogProps {
  servType?: number;
  subsId?: number;
}

const API_URL = apiConfigOrder.order;

const OperationDialog = ({ servType, subsId }: OptDialogProps) => {
  const {
    showOperationDialog,
    handleOperationDialog,
    setShowDialog,
    setSelectedOperation,
  } = useSubscriberListContext();

  const { GetData } = useCallApi();
  const [operationGroups, setOperationGroups] = useState<
    { title: string; items: operationItems[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const init = async () => {
    try {
      setIsLoading(true);
      const resp = await GetData(
        `${API_URL}/api/order-entry/serv-type-event/qry-serv-type-event-rela`,
        { servType: servType, subsId: subsId },
      );

      if (resp.status) {
        const optItem: operationItems[] = resp.data;

        const groups: { title: string; items: operationItems[] }[] = [];

        optItem.forEach((item) => {
          let group = groups.find((g) => g.title === item.eventTypeName);

          if (!group) {
            group = {
              title: item.eventTypeName,
              items: [],
            };
            groups.push(group);
          }

          group.items.push(item);
        });

        setOperationGroups(groups);
        return;
      }

      return toast.error(`${resp.message}`);
    } catch (error) {
      //  console.log(error);
      return toast.error("failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showOperationDialog) return;
    init();
  }, [showOperationDialog]);

  // const enable = [
  //   "Modify Subscriber",
  //   "Suspension Under Request",
  //   "SIM Card Lost",
  //   "Termination",
  //   "Change Subscrber Profile",
  //   "Replacement",
  // ];

  return (
    <Dialog open={showOperationDialog} onOpenChange={handleOperationDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Operation Dialog</DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <div className="space-y-5 text-sm text-gray-800 px-5 py-5">
          {isLoading && <Loading />}
          {operationGroups.map((group) => (
            <div
              key={group.title}
              className="flex items-center gap-6 border-b border-dotted last:border-0 pb-3"
            >
              {/* Label Section */}
              <span className="min-w-[90px] font-semibold text-gray-700">
                {group.title}
              </span>

              {/* Button Section */}
              <div className="flex flex-wrap flex-1">
                {group.items.map((item) => (
                  <Button
                    size={"sm"}
                    variant={"link"}
                    key={item.subsEventId}
                    onClick={() => {
                      // setShowDialog(item.displayName ?? item.eventName);
                      setSelectedOperation(item);
                      handleOperationDialog(false);
                    }}
                    disabled={!item.active}
                  >
                    {item.displayName ?? item.eventName}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { OperationDialog };

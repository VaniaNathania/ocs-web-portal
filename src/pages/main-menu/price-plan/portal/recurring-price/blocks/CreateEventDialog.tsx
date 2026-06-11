import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRecurringPriceContext } from "../hooks";

const API_URL = apiConfig.service_price_plan;

const CreateEventDialog = () => {
  const { GetData, PostData } = useCallApi();
  const {  selectedOfferVerId, dataPricePlan  } = usePortalData();
  const { showCreateEventDialog, handleCreateEventDialog, doGetListEvent } =
    useRecurringPriceContext();

  const [eventMenu, setEventMenu] = useState<EventMenuRecurringList[]>([]);
  const [selectedReIds, setSelectedReIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getEventByReType = async () => {
    setLoading(true);
    try {
      const reType = 9;
      const response = await GetData(`${API_URL}/event/recurring/list`, {
        offerVerId: selectedOfferVerId,
      });
      if (response && response.data) {
        setEventMenu(response.data);
      }
    } catch (error) {
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const doCreateEvent = async (selectedReType: string[]) => {
    setLoading(true);
    try {
      const response = await PostData(`${API_URL}/event/recurring/create`, {
        pricePlanId: dataPricePlan?.pricePlanId,
        offerVerId: selectedOfferVerId,
        recurringReType: selectedReType,
      });

      if (response?.status) {
        toast.success(response.message);
        handleCreateEventDialog(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
      doGetListEvent();
    }
  };

  useEffect(() => {
    if (showCreateEventDialog) {
      getEventByReType();
    }
  }, [showCreateEventDialog]);

  useEffect(() => {
    if (showCreateEventDialog === false) {
      setSelectedReIds([]);
    }
  }, [showCreateEventDialog]);

  return (
    <Dialog open={showCreateEventDialog} onOpenChange={handleCreateEventDialog}>
      <DialogContent className="overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle>Recurring Event</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4 py-4">
            {/* Search (blm berfungsi utk skrg baru placeholder aja) */}
            {/* <Input placeholder="Event Name" /> */}

            <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded px-3 py-2">
              {loading ? (
                <p className="text-sm text-gray-500">Loading events...</p>
              ) : eventMenu.length > 0 ? (
                eventMenu.map((event) => (
                  <label
                    key={event.recurringReType}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReIds.includes(event.recurringReType)}
                      onChange={() => {
                        setSelectedReIds((prev) =>
                          prev.includes(event.recurringReType)
                            ? prev.filter((id) => id !== event.recurringReType)
                            : [...prev, event.recurringReType]
                        );
                      }}
                      className="w-4 h-4"
                    />
                    <span>{event.recurringReTypeName}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No events available</p>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleCreateEventDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              doCreateEvent(selectedReIds);
            }}
            disabled={loading || selectedReIds.length === 0}
          >
            {loading ? "Creating..." : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;

import { useAuthContext } from "@/auth";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscriptionPriceCreateContext } from "../hooks";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";

const API_URL = apiConfig.service_price_plan;

const CreateEventDialog = ({
  position,
}: {
  position?: { top: number; left: number };
}) => {
  const { GetData, PostData } = useCallApi();
  const {  selectedOfferVerId  } = usePortalData();
  const { showCreateEventDialog, handleCreateEventDialog, doGetListEvent } =
    useSubscriptionPriceCreateContext();

  const [eventByRe, setEventByRe] = useState<EventByReTypeProps[]>([]);
  const [selectedReIds, setSelectedReIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const getEventByReType = async () => {
    setLoading(true);
    try {
      const reType = 3;
      const response = await GetData(`${API_URL}/event/${reType}`, {});
      if (response && response.data) {
        setEventByRe(response.data);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const doCreateEvent = async (selectedReId: number[]) => {
    setLoading(true);
    try {
      const response = await PostData(`${API_URL}/event/create`, {
        offerVerId: selectedOfferVerId,
        reId: selectedReId,
      });

      if (response?.status) {
        toast.success(response.message);
        handleCreateEventDialog(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error creating event:", error);
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
          <DialogTitle>Subscription Event</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4 py-4">
            {/* Search (blm berfungsi utk skrg baru placeholder aja) */}
            {/* <Input placeholder="Event Name" /> */}

            <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded px-3 py-2">
              {loading ? (
                <p className="text-sm text-gray-500">Loading events...</p>
              ) : eventByRe.length > 0 ? (
                eventByRe.map((event) => (
                  <label
                    key={event.reId}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReIds.includes(event.reId)}
                      onChange={() => {
                        setSelectedReIds((prev) =>
                          prev.includes(event.reId)
                            ? prev.filter((id) => id !== event.reId)
                            : [...prev, event.reId]
                        );
                      }}
                      className="w-4 h-4"
                    />
                    <span>{event.reName}</span>
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

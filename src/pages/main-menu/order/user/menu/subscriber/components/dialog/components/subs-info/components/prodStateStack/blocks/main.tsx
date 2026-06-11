import { useEffect, useState } from "react";
import { useOrderSubsDetailSubsInfo } from "../../../hooks/SubsDetailSubsInfoContext";
import {
  prodStateTrackAfter,
  prodStateTrackBefore,
} from "@/pages/main-menu/order/models/interfaces";
import {
  prodStateTrackAfterMock,
  prodStateTrackBeforeMock,
} from "../../../models/mockData";
import Timeline, { TimelineItem } from "../../common/timeline";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useSubscriberListContext } from "@/pages/main-menu/order/user/menu/subscriber/hooks";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useOrderSubsDetail } from "../../../../../hooks/SubsDetailContext";

interface prodStateStack {
  before: prodStateTrackBefore[];
  after: prodStateTrackAfter[];
}

const API_URL = apiConfigOrder.order;

const Main = () => {
  const [stack, setStack] = useState<prodStateStack>();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>();
  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();
  const { subsBaseDetail } = useOrderSubsDetail();

  const fetchStateSubs = async (): Promise<prodStateStack> => {
    try {
      const [beforeResp, afterResp] = await Promise.all([
        GetData(`${API_URL}/api/order-entry/subs-info/qryProdStateChangeLog`, {
          prodId: selectedSubs?.subsId,
          // offerId: subsBaseDetail?.data?.offerId,
        }),
        GetData(`${API_URL}/api/order-entry/subs-info/querySubsStateCycle`, {
          prodId: selectedSubs?.subsId,
          prodCurrState: selectedSubs?.prodState,
          prodState: selectedSubs?.prodState,
          offerId: subsBaseDetail?.data?.offerId,
          acctId: subsBaseDetail.data?.acctId,
        }),
      ]);

      if (!beforeResp.status || !afterResp.data) {
        toast.error("Failed to fetch state");
        return {
          before: [],
          after: [],
        };
      }

      return {
        before: beforeResp.data,
        after: afterResp.data,
      };
    } catch (error) {
      toast.error("Client Side Error");
      return {
        before: [],
        after: [],
      };
    }
  };

  const StateSubsList = useQuery({
    queryKey: ["state-subs", selectedSubs],
    queryFn: fetchStateSubs,
    refetchOnWindowFocus: false,
  });

  const buildTimeline = (
    before: prodStateTrackBefore[],
    after: prodStateTrackAfter[],
  ): TimelineItem[] => {
    const beforeMapped: TimelineItem[] = before.map((item) => ({
      label: item.oldProdStateName,
      date: item.updateDate,
      code: item.oldProdState,
      isCurrent: false,
    }));

    const current: TimelineItem = {
      label: subsBaseDetail.data?.prodStateName ?? "",
      date: subsBaseDetail.data?.prodStateDate.replace(/\//g, "-") ?? "",
      code: subsBaseDetail.data?.prodState ?? "",
      isCurrent: true,
    };

    const afterMapped: TimelineItem[] = after.map((item) => ({
      label: item.nextStateName,
      date: item.nextStateDate.replace(/\//g, "-"),
      code: item.nextState,
      isCurrent: false,
    }));

    return [...beforeMapped, current, ...afterMapped];
  };

  useEffect(() => {
    const timeline = buildTimeline(
      StateSubsList.data?.before ?? [],
      StateSubsList.data?.after ?? [],
    );
    setTimelineItems(timeline);
  }, [StateSubsList]);

  return (
    <div className="flex w-full justify-center overflow-y-auto">
      <Timeline items={timelineItems ?? []} />
    </div>
  );
};

export default Main;

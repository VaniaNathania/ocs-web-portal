import Timeline from "../../order/user/menu/subscriber/components/dialog/components/subs-info/components/common/timeline";
import { usePreNew } from "../hooks/context";

const Status = () => {
  const { timeLine } = usePreNew();

  return (
    <div className="flex w-full justify-center overflow-y-auto mt-5">
      <Timeline items={timeLine} size="xl" date={false} />
    </div>
  );
};

export default Status;

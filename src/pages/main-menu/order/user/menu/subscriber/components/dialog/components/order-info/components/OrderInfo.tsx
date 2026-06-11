import { DefaultTooltip } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Query from "./Query";
import Table from "./Table";

const OrderInfo = () => {
  return (
    <div className="flex flex-col gap-5">
      {/* <Query /> */}
      <Table />
    </div>
  );
};

export default OrderInfo;

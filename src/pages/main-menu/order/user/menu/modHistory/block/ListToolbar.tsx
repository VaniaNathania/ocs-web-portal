import { DefaultTooltip, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SelectAccComp from "@/pages/main-menu/order/component/SelectAccComp";
import { useState } from "react";

const ListToolBar = () => {
  const [feature, setFeature] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleReset = () => {
    setFeature("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full items-end">
        {/* <DefaultTooltip title={"Select Account"} placement="top">
          <Button variant="default" className="h-8" onClick={SelectAccComp}>
            Select Account
          </Button>
        </DefaultTooltip> */}
        <SelectAccComp />

        <div className="flex w-full gap-4 items-center py-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Feature Name</label>
            <Select value={feature} onValueChange={setFeature}>
              <SelectTrigger className="h-9 w-[230px]">
                <SelectValue placeholder="Select Feature Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Account Manager</SelectItem>
                <SelectItem value="2">2G Service Brand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Start Date</label>
            <div className="input input-sm w-[180px]">
              From
              <Input
                type="date"
                placeholder="from"
                className="border-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">End Date</label>
            <div className="input input-sm w-[170px]">
              To
              <Input
                type="date"
                placeholder="to"
                className="border-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="h-[24px]"></div>
            <div className="flex flex-row gap-3">
              <DefaultTooltip title="Query" placement="top">
                <Button variant="default" className="h-8">
                  <KeenIcon icon="magnifier" />
                </Button>
              </DefaultTooltip>

              <DefaultTooltip title="Reset" placement="top">
                <Button variant="outline" className="h-8" onClick={handleReset}>
                  <KeenIcon icon="arrow-circle-left" />
                </Button>
              </DefaultTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListToolBar;

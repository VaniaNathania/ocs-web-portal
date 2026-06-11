import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useSubscriberNotesMainListContext } from "../hooks/useSubscriberNotesContext";
import { SubsNotesQuery } from "../models/interfaces";
import { useDataGrid } from "@/components";

const ListToolBar = () => {
  const { NotesSelectSubsList, query, setQuery } =
    useSubscriberNotesMainListContext();
  const [tempQuery, setTempQuery] = useState<SubsNotesQuery>({
    type: "active",
  });
  const { table } = useDataGrid();
  const [selectedSubscriberType, setSelectedSubscriberType] = useState<
    "active" | "inActive"
  >("active");
  const [beginDate, setBeginDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRadioChange = (type: "active" | "inActive") => {
    setSelectedSubscriberType(type);
    setTempQuery((prev) => ({ ...prev, type: type }));
  };

  const handleReset = () => {
    setSelectedSubscriberType("active");
    setTempQuery({ type: "active" });
    setQuery({ type: "active" });
    setBeginDate("");
    setEndDate("");
  };

  useEffect(() => {
    if (!table) return;
    setTempQuery(query);

    //  console.log(query);

    table.getColumn("createdDate")?.setFilterValue(
      query.startDate || query.endDate
        ? {
            start: new Date(query.startDate ?? ""),
            end: new Date(query.endDate ?? ""),
          }
        : undefined,
    );
  }, [query, table]);

  return (
    <div className="card-header border-b-0 px-5 py-5 flex flex-col gap-8">
      <div className="grid grid-cols-2">
        {/* === LEFT SIDE === */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Active Subscribers */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-25">
              Active Subscribers
            </label>
            <input
              type="radio"
              name="subscriber"
              className="h-4 w-4"
              checked={selectedSubscriberType === "active"}
              onChange={() => handleRadioChange("active")}
            />
            <Select
              value={tempQuery?.selectedActiveIdx?.toString() ?? ""}
              onValueChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  selectedActiveIdx: Number(e),
                }))
              }
              disabled={selectedSubscriberType === "inActive"}
            >
              <SelectTrigger className="h-9 w-[220px]">
                <SelectValue placeholder="Select Active Subscriber" />
              </SelectTrigger>
              <SelectContent>
                {NotesSelectSubsList.data?.active.map((item, index) => (
                  <SelectItem value={item.subsId.toString()} key={index}>
                    {item.accNbr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Begin Date */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-[155px]">Begin Date</label>
            <div className="input input-sm w-[220px]">
              From
              <Input
                type="date"
                className="h-9 border-none pl-10"
                value={tempQuery.startDate ?? ""}
                onChange={(e) =>
                  setTempQuery((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE === */}
        <div className="flex flex-col gap-4">
          {/* inActive Subscribers */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-25">
              inActive Subscribers
            </label>
            <input
              type="radio"
              name="subscriber"
              className="h-4 w-4"
              checked={selectedSubscriberType === "inActive"}
              onChange={() => handleRadioChange("inActive")}
            />
            <Select
              value={tempQuery?.selectedInActiveIdx?.toString() ?? ""}
              onValueChange={(e) =>
                setTempQuery((prev) => ({
                  ...prev,
                  selectedInActiveIdx: Number(e),
                }))
              }
              disabled={selectedSubscriberType === "active"}
            >
              <SelectTrigger className="h-9 w-[220px]">
                <SelectValue placeholder="Select Subscriber" />
              </SelectTrigger>
              <SelectContent>
                {NotesSelectSubsList.data?.inActive.map((item, index) => (
                  <SelectItem value={item.subsId.toString()} key={index}>
                    {item.accNbr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* End Date + Buttons */}
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium w-[165px]">End Date</label>
              <div className="input input-sm w-[220px]">
                To
                <Input
                  type="date"
                  className="h-9 border-none pl-14"
                  value={tempQuery.endDate ?? ""}
                  onChange={(e) =>
                    setTempQuery((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col ml-auto">
        <div className="flex gap-2">
          <Button className="h-9" onClick={() => setQuery(tempQuery)}>
            Query
          </Button>
          <Button variant="outline" className="h-9" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListToolBar;

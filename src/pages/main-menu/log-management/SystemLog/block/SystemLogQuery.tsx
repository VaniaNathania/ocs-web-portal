import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallApi } from "@/hooks";
import { UserMQuery } from "../hook/SystemLogProvider";
import { useSystemLog } from "../hook/useSystemLog";

const toDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
};

const today = new Date();
const start = new Date(today);
start.setHours(0, 0, 0, 0);
const end = new Date(today);
end.setHours(23, 59, 0, 0);

const defaultQuery: UserMQuery = {
  logId: null,
  comments: null,
  startTime: toDateTimeLocal(start),
  endTime: toDateTimeLocal(end),
  srcIp: null,
  civilId: null,
  eventType: null,
  eventCode: null,
  eventSrc: null,
  bisTransID: null,
  page: 1,
  size: 10,
  sortBy: "logDate",
  sortDirection: "desc",
};

interface EventSourceOption {
  text: string;
  value: string;
}

interface EventTypeOption {
  text: string;
  value: string;
}

interface EventCodeOption {
  text: string;
  value: string;
}

export const SystemLogQuery = () => {
  const { setQuery, query: currentQuery } = useSystemLog();
  const { GetData } = useCallApi();
  const [eventSource, setEventSources] = useState<EventSourceOption[]>([]);
  const [eventType, setEventType] = useState<EventTypeOption[]>([]);
  const [eventCode, setEventCode] = useState<EventCodeOption[]>([]);

  useEffect(() => {
    // Hardcode Event Types berdasarkan data yang ada di response
    const eventTypeOptions: EventTypeOption[] = [
      { text: "Audit", value: "audit" },
      { text: "Login", value: "login" },
      { text: "Logout", value: "logout" },
      { text: "page log", value: "page log" },
    ];
    setEventType(eventTypeOptions);
  }, []);

  // Fetch Event Codes
  useEffect(() => {
    // Hardcode Event Types berdasarkan data yang ada di response
    const eventCodeOptions: EventCodeOption[] = [
      { text: "ADD", value: "ADD" },
      { text: "DELETE", value: "DELETE" },
      { text: "EDIT", value: "EDIT" },
      { text: "CANCEL", value: "CANCEL" },
      { text: "COPY", value: "COPY" },
      { text: "CONFIRM", value: "CONFIRM" },
      { text: "LOGIN_SUCCESS", value: "LOGIN_SUCCESS" },
      { text: "LOGIN_FAIL", value: "LOGIN_FAIL" },
      { text: "LOGOUT_SUCCESS", value: "LOGOUT_SUCCESS" },
      { text: "LOGOUT_FAIL", value: "LOGOUT_FAIL" },
    ];
    setEventCode(eventCodeOptions);
  }, []);

  const [formQuery, setFormQuery] = useState<UserMQuery>(defaultQuery);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const isChanged =
      JSON.stringify(formQuery) !== JSON.stringify(currentQuery);
    setHasUnsavedChanges(isChanged);
  }, [formQuery, currentQuery]);

  const handleChange = <K extends keyof UserMQuery>(
    key: K,
    val: Partial<UserMQuery>[K] | null,
  ) => {
    setFormQuery((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    const resetQuery = { ...defaultQuery, page: 1 };
    setFormQuery(resetQuery);
    setQuery(resetQuery);
    setHasUnsavedChanges(false);
  };

  const handleSubmit = () => {
    // console.log("📤 Submitting Query:", formQuery);
    const queryWithResetPage = { ...formQuery, page: 1 };
    setQuery(queryWithResetPage);
    setHasUnsavedChanges(false);
  };

  const hasfetch = useRef(false);

  useEffect(() => {
    if (formQuery.startTime && formQuery.endTime && !hasfetch.current) {
      //  console.log("StartTime:", formQuery.startTime.replace("T", " ") + ":00");
      //  console.log("EndTime:", formQuery.endTime.replace("T", " ") + ":00");
      hasfetch.current = true;
    }
  }, [formQuery]);

  return (
    <div className="bg-white m-5 rounded-md shadow-md p-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Log ID */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Log ID</label>
          <Input
            type="text"
            placeholder="Enter Log ID"
            className="h-8 text-sm"
            value={formQuery.logId ?? ""}
            onChange={(e) => handleChange("logId", e.target.value)}
          />
        </div> */}

        {/* Event Type */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Event Type
          </label>
          <Select
            onValueChange={(val) => handleChange("eventType", val)}
            value={formQuery.eventType || ""}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="--Please Select--" />
            </SelectTrigger>
            <SelectContent>
              {eventType.length > 0 ? (
                eventType.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.text}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  {/* No data available */}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Event Code */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Event Code
          </label>
          <Select
            onValueChange={(val) => handleChange("eventCode", val)}
            value={formQuery.eventCode || ""}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="--Please Select--" />
            </SelectTrigger>
            <SelectContent>
              {eventCode.length > 0 ? (
                eventCode.map((code) => (
                  <SelectItem key={code.value} value={code.value}>
                    {code.text}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-data" disabled>
                  {/* No data available */}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Source IP */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Source IP</label>
          <Input
            type="text"
            placeholder="Enter Source IP"
            className="h-8 text-sm"
            value={formQuery.srcIp ?? ""}
            onChange={(e) => handleChange("srcIp", e.target.value)}
          />
        </div> */}

        {/* Bis Trans ID */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Bis Trans ID
          </label>
          <Input
            type="text"
            placeholder="Enter Bis Trans ID"
            className="h-8 text-sm"
            value={formQuery.bisTransID ?? ""}
            onChange={(e) => handleChange("bisTransID", e.target.value)}
          />
        </div> */}

        {/* Log Date */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Log Date</label>
          <input
            type="datetime-local"
            className="h-8 text-sm px-2 border border-gray-300 rounded-md"
            value={formQuery.startTime ?? ""}
            onChange={(e) => handleChange("startTime", e.target.value)}
          />
        </div> */}

        {/* Remarks */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Remarks</label>
          <Input
            type="text"
            placeholder="Enter Remarks"
            className="h-8 text-sm"
            value={formQuery.comments ?? ""}
            onChange={(e) => handleChange("comments", e.target.value)}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full flex justify-end space-x-2 mt-4">
        <Button
          className="h-8 px-3 text-sm"
          variant="default"
          onClick={handleSubmit}
        >
          Query
        </Button>
        <Button
          className="h-8 px-3 text-sm"
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

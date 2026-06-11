import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { column } from "stylis";
import ListToolBar from "../block/ListToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useCallApi } from "@/hooks";
import {
  SubsNotesList,
  SubsNotesQuery,
  SubsNotesSelect,
} from "../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface ContextProps {
  data: string | null;
  setData: (value: string | null) => void;
  NotesSelectSubsList: UseQueryResult<SubsNotesSelect>;
  query: SubsNotesQuery;
  setQuery: Dispatch<SetStateAction<SubsNotesQuery>>;
}

const API_URL = apiConfigOrder.order;

const SubscriberNotesMainListContext = createContext<ContextProps | undefined>(
  undefined,
);

const SubscriberNotesMainContextListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const [query, setQuery] = useState<SubsNotesQuery>({
    type: "active",
  });

  const [formData, setFormData] = useState({
    staffId: 1,
    staffJobId: 1,
    partyType: null,
    partyCode: null,
    notes: "",
    subsId: 0,
    seq: null,
    createdDate: null,
    msisdn: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { selectedUser } = useOrder();

  const { GetData, PostData } = useCallApi();
  const fetchNotesSelectSubs = async (): Promise<SubsNotesSelect> => {
    try {
      const payloadActive = {
        states: "B,F",
        simCardState: "A",
        accNbrState: "C,Q",
        simState: "I,D,L",
        custId: selectedUser?.custId,
        accNbr: null,
        ustates: null,
      };
      const payloadInActive = {
        states: "B,F",
        simCardState: "A",
        accNbrState: "C,Q",
        simState: "I,D,L",
        custId: selectedUser?.custId,
        accNbr: null,
        ustates: null,
      };
      const [activeResp, inActiveResp] = await Promise.all([
        GetData(
          `${API_URL}/api/order-entry/order/qry-cust-subslist-by-state-fiji?states=B%2CF&simCardState=A&accNbrState=C%2CQ&simState=I%2CD%2CL&custId=${selectedUser?.custId}&accNbr=&ustates=`,
          {},
        ),
        GetData(
          `${API_URL}/api/order-entry/order/qry-cust-subslist-by-state-fiji?states=&simCardState=A&accNbrState=&simState=&custId=${selectedUser?.custId}&accNbr=&uStates=B%2CF`,
          {},
        ),
      ]);

      if (!activeResp.status || !inActiveResp.status) {
        toast.error("Error Fetching data");
        return {
          active: [],
          inActive: [],
        };
      }

      // console.log({ type: "active", selectedActiveIdx: activeResp.data[0] });

      setQuery({
        type: "active",
        selectedActiveIdx: activeResp.data[0].subsId,
      });

      return {
        active: activeResp.data,
        inActive: inActiveResp.data,
      };
    } catch (error) {
      toast.error("Client Side Error");
      return {
        active: [],
        inActive: [],
      };
    }
  };

  const NotesSelectSubsList: UseQueryResult<SubsNotesSelect> = useQuery({
    queryKey: ["notes-subs-select", selectedUser],
    queryFn: fetchNotesSelectSubs,
    refetchOnWindowFocus: false,
  });

  const fetchNotesTableSubs = async (): Promise<any[]> => {
    try {
      const tempSubs =
        query.type === "active"
          ? query.selectedActiveIdx
          : query.selectedInActiveIdx;
      if (!tempSubs) {
        toast.error("No Subs Id Inputed");
        return [];
      }
      const [list] = await Promise.all([
        GetData(`${API_URL}/api/order-entry/order/qry-subs-notes-list-fiji`, {
          subsId:
            query.type === "active"
              ? query.selectedActiveIdx
              : query.selectedInActiveIdx,
        }),
      ]);

      if (!list.status) {
        toast.error("Error Fetching data");
        return [];
      }

      return list.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const NotesTableSubsList: UseQueryResult<any[]> = useQuery({
    queryKey: ["notes-subs-table", query],
    queryFn: fetchNotesTableSubs,
    enabled: !!query.selectedActiveIdx,
    refetchOnWindowFocus: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    setIsLoading(true);

    if (!formData.msisdn) newErrors.msisdn = "Required";
    if (!formData.notes) newErrors.notes = "Required";

    try {
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Process form...
      //  console.log("Submitted:", formData);

      const resp = await PostData(
        `${API_URL}/api/order-entry/order/add-cust-subs-notes`,
        formData,
      );

      if (!resp?.status) {
        return toast.error(resp?.status);
      } else setRefresh((prev) => prev + 1);
      // setIsAddMode(false);
      setFormData({
        staffId: 1,
        staffJobId: 1,
        partyType: null,
        partyCode: null,
        notes: "",
        subsId: 0,
        seq: null,
        createdDate: null,
        msisdn: "",
      });
      setErrors({});
      return toast.success(resp.message);
    } catch (error) {
      return toast.error("Client Side Error");
    } finally {
      setIsLoading(false);
    }

    // console.log(formData);
  };

  const handleCancel = () => {
    setIsAddMode(false);
    setFormData({
      staffId: 1,
      staffJobId: 1,
      partyType: null,
      partyCode: null,
      notes: "",
      subsId: 0,
      seq: null,
      createdDate: null,
      msisdn: "",
    });
    setErrors({});
  };

  const column = useMemo<ColumnDef<SubsNotesList>[]>(
    () => [
      {
        id: "msisdn",
        accessorFn: (row) => row.msisdn,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Service Number"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "seq",
        accessorFn: (row) => row.seq,
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="SEQ" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "createdDate",
        accessorFn: (row) => row.createdDate,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Modify Date"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        filterFn: (row, columnId, value) => {
          const rowDate = new Date(row.getValue(columnId));
          const start = value?.start ? new Date(value.start) : null;
          const end = value?.end ? new Date(value.end) : null;

          if (start && rowDate < start) return false;
          if (end && rowDate > end) return false;

          return true;
        },
      },
      {
        id: "operator",
        accessorFn: (row) => row.operator,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Operator Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "notes",
        accessorFn: (row) => row.notes,
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Notes" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [],
  );

  return (
    <SubscriberNotesMainListContext.Provider
      value={{
        data,
        setData,
        NotesSelectSubsList,
        query,
        setQuery,
      }}
    >
      <div className="bg-white rounded-md m-5 shadow-md p-5">
        <div className="">
          <DataGridProvider
            data={NotesTableSubsList.data}
            columns={column}
            layout={{ card: true }}
            serverSide={false}
            toolbar={<ListToolBar />}
          >
            {children}
          </DataGridProvider>
        </div>
        <div className="pt-5">
          <div className="mb-5">
            <Button onClick={() => setIsAddMode(true)}>New</Button>
          </div>

          <div
            className={`border border-gray-300 rounded p-5 transition-all duration-300 overflow-hidden ${expand ? "h-[300px]" : "h-[65px] "}`}
          >
            <div
              className="text-lg font-medium mb-6 flex flex-row justify-between cursor-pointer"
              onClick={() => setExpand(!expand)}
            >
              <h2>{isAddMode ? "Add New Subscriber Note" : "Detail"}</h2>
              <div>
                <KeenIcon
                  icon="down"
                  className={` transition-all duration-300 ${expand ? "rotate-180" : "rotate-0"}`}
                />
              </div>
            </div>

            {isAddMode ? (
              // Mode Add
              <div>
                {Object.keys(errors).length > 0 && (
                  <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
                    Please fill in all required fields
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Service Number */}
                    <div className="flex items-center">
                      <label className="text-sm font-medium w-40 flex items-center">
                        <span className="text-red-500">*</span>Service Number
                      </label>
                      <Select
                        value={
                          formData.msisdn + "#" + formData.subsId.toString()
                        }
                        onValueChange={(value) => {
                          setFormData({
                            ...formData,
                            msisdn: value.split("#")[0],
                            subsId: Number(value.split("#")[1]),
                          });
                          setErrors({ ...errors, serviceNumber: "" });
                        }}
                      >
                        <SelectTrigger
                          className={`w-[300px] h-8 ${errors.msisdn ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="--Please Select--" />
                        </SelectTrigger>
                        <SelectContent>
                          {NotesSelectSubsList.data?.active.map(
                            (item, index) => (
                              <SelectItem
                                value={
                                  item.msisdn + "#" + item.subsId.toString()
                                }
                                // onClick={(e) =>
                                //   // setFormData((prev) => ({
                                //   //   ...prev,
                                //   //   msisdn: item.msisdn,
                                //   //   subsId: item.subsId,
                                //   // }))
                                // }
                                key={index}
                              >
                                {item.msisdn}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="flex items-center gap-5">
                      <label className="text-sm font-medium w-40">
                        <span className="text-red-500">*</span>Notes
                      </label>
                      <Input
                        type="text"
                        className={`w-full h-8 ${errors.notes ? "border-red-500" : ""}`}
                        placeholder="Enter notes"
                        value={formData.notes}
                        onChange={(e) => {
                          setFormData({ ...formData, notes: e.target.value });
                          setErrors({ ...errors, notes: "" });
                        }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 pt-4 justify-end">
                      <Button type="submit">Save</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left sides */}
                <div className="space-y-4">
                  {/* Service Number */}
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium w-40 flex items-center">
                      <span className="text-red-500">*</span>Service Number
                    </label>
                    <Select disabled>
                      <SelectTrigger className="w-[300px] h-8 flex-1">
                        <SelectValue placeholder="--Please Select--" />
                      </SelectTrigger>
                    </Select>
                  </div>

                  {/* Modify Date */}
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium w-40">
                      Modify Date
                    </label>
                    <Input
                      type="text"
                      className="w-[300px] h-8 flex-1"
                      placeholder="Modify Date"
                      disabled
                    />
                  </div>
                </div>

                {/* right sides */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium w-40 flex items-center">
                      Operator Name
                    </label>
                    <Input
                      type="text"
                      className="w-[300px] h-8 flex-1"
                      placeholder="Operator Name"
                      disabled
                    />
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium w-40 flex items-center">
                      SEQ
                    </label>
                    <Input
                      type="text"
                      className="w-[300px] h-8 flex-1"
                      placeholder="Seq"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 col-span-2">
                  <label className="text-sm font-medium w-40">
                    <span className="text-red-500">*</span>Notes
                  </label>
                  <Input
                    type="text"
                    className="w-full h-8 flex-1"
                    placeholder="notes"
                    disabled
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SubscriberNotesMainListContext.Provider>
  );
};

export {
  SubscriberNotesMainContextListProvider,
  SubscriberNotesMainListContext,
};

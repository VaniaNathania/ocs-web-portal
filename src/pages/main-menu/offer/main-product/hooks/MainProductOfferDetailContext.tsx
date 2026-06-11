import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  DefaultTooltip,
  KeenIcon,
  LoaderContainer,
  DataGridColumnHeader,
  DataGridProvider,
} from "@/components";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { useLanguage } from "@/i18n";
import { fCurrency } from "@/utils/FormatNumber";
import axios from "axios";
import moment from "moment";
import { ColumnDef } from "@tanstack/react-table";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
// import { AddGoodDialog, EditGoodDialog } from '../blocks';
import { snakeToTitleCase, urlWords } from "@/utils";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Notes } from "../blocks";
import { IconApproval } from "@/components/ui/icon-approval";
import { ListToolBar } from "../components/ListToolBar";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { Toaster } from "@/components/ui/sonner";
// import QRCode from 'react-qr-code';

interface selectedPosition {
  id: string;
  name: string;
  roles: string[];
  status: string;
}

interface InventoryProps {
  id: string;
  inventory_id: string;
  branch_id: string;
  branch_code: string;
  branch_name: string;
  department_id: string;
  department_name: string;
  employee_id: string;
  employee_name: string;
  start_at: string;
  condition_start: string;
  note_start: string;
  end_at: string;
  condition_end: string;
  note_end: string;
}
interface ContextProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  showEditMainProductOfferDialog: boolean;
  handleEditMainProductOfferDialog: (
    show: boolean,
    selected_history: InventoryProps | null
  ) => void;
  showAddMainProductOfferDialog: boolean;
  handleAddMainProductOfferDialog: (show: boolean) => void;
  inventory: InventoryProps[];
  selectedHistory: InventoryProps | null;
}

const initialProps: ContextProps = {
  date: undefined,
  setDate: () => {},
  showEditMainProductOfferDialog: false,
  handleEditMainProductOfferDialog: () => {},
  showAddMainProductOfferDialog: false,
  handleAddMainProductOfferDialog: () => {},
  inventory: [],
  selectedHistory: null,
};

const MainProductOfferDetailContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_assets;
const URL_DOMAIN = window.location.origin;

const MainProductOfferDetailContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataId, setDataId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { isRTL } = useLanguage();
  const { state } = useLocation();
  const { dataPricePlan } = state || {};
  const { auth } = useAuthContext();
  const { GetData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [loader, setLoader] = useState(false);
  const [showEditMainProductOfferDialog, setShowEditMainProductOfferDialog] =
    useState(false);
  const [showAddMainProductOfferDialog, setShowAddMainProductOfferDialog] =
    useState(false);

  const [inventory, setInventory] = useState<InventoryProps[]>([]);
  const [formHistoryUpdate, setFormHistoryUpdate] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [base64, setBase64] = useState("");
  const [selectedType, setSelectedType] = useState("Expression");
  const [promotion, setPromotion] = useState("No");
  const [activeTab, setActiveTab] = useState("Script Template");

  const intl = useIntl();

  const handleBackClick = () => {
    navigate("/inventory/list");
  };

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  const handleEditMainProductOfferDialog = useCallback(
    (show: boolean, selected_history: InventoryProps | null) => {
      setSelectedHistory(show ? selected_history : null);
      setShowEditMainProductOfferDialog(show);
    },
    []
  );

  const handleEditMainProductOffer = (row: any) => {
    setSelectedHistory(row);
    setShowEditMainProductOfferDialog(true);
  };

  const handleAddMainProductOfferDialog = useCallback((show: boolean) => {
    setShowAddMainProductOfferDialog(show);
  }, []);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.employee_name,
        id: "employee_name",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Pengguna" column={column} />
        ),

        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12",
          cellClassName: "w-1/12",
        },
      },
      {
        accessorFn: (row) => row.branch_name,
        id: "branch_name",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Cabang" column={column} />
        ),

        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12",
          cellClassName: "w-1/12",
        },
      },
      {
        accessorFn: (row) => row.department_name,
        id: "department_name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Departemen"
            column={column}
          />
        ),

        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12",
          cellClassName: "w-1/12",
        },
      },
      {
        id: "row.start_at",
        header: ({ column }) => (
          <DataGridColumnHeader title="Assign" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "text-center",
        },
        columns: [
          {
            id: "start_at",
            accessorFn: (row) => row.start_at,
            header: "Date",
            cell: (data: any) => {
              const html: JSX.Element[] = [];
              html.push(
                <p className="text-[12px] whitespace-nowrap">
                  <em>
                    {moment(data.row.original.start_at).format("DD-MM-YYYY")}
                  </em>
                </p>
              );

              return html;
            },
            meta: {
              headerClassName: "text-center",
              cellClassName: "text-center",
            },
          },
          {
            id: "row.condition_start",
            accessorFn: (row) => row.condition_start,
            header: "Kondisi",
            cell: (data: any) => {
              const html: JSX.Element[] = [];
              let condition = "";
              if (
                data?.row?.original?.condition_start === "new" ||
                data?.row?.original?.condition_start === "good"
              ) {
                condition = "text-green-500";
              } else if (
                data?.row?.original?.condition_start === "minor_damage"
              ) {
                condition = "text-orange-500";
              } else {
                condition = "text-red-500";
              }
              html.push(
                <p className={`${condition} font-bold italic`}>
                  {snakeToTitleCase(data?.row?.original?.condition_start)}
                </p>
              );

              return html;
            },
            meta: {
              headerClassName: "text-center",
              cellClassName: "text-center",
            },
          },
          {
            id: "row.note_start",
            accessorFn: (row) => row.note_start,
            header: "Note",
            cell: (data: any) => {
              const html: JSX.Element[] = [];
              html.push(<p>{data?.row?.original?.note_start}</p>);

              return html;
            },
            meta: {
              headerClassName: "",
              cellClassName: "",
            },
          },
        ],
      },
      {
        id: "row.end_at",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pengembalian" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "text-center",
        },
        columns: [
          {
            id: "end_at",
            accessorFn: (row) => row.end_at,
            header: "Date",
            cell: (data: any) => {
              const html: JSX.Element[] = [];
              html.push(
                <p className="text-[12px] whitespace-nowrap">
                  <em>
                    {moment(data.row.original.end_at).format("DD-MM-YYYY") ||
                      "-"}
                  </em>
                </p>
              );

              return html;
            },
            meta: {
              headerClassName: "text-center",
              cellClassName: "text-center",
            },
          },
          {
            id: "row.condition_end",
            accessorFn: (row) => row.condition_end,
            header: "Kondisi",
            cell: (data: any) => {
              const html: JSX.Element[] = [];
              let condition = "";
              if (
                data?.row?.original?.condition_end === "new" ||
                data?.row?.original?.condition_end === "good"
              ) {
                condition = "text-green-500";
              } else if (
                data?.row?.original?.condition_end === "minor_damage"
              ) {
                condition = "text-orange-500";
              } else {
                condition = "text-red-500";
              }

              html.push(
                <p className={`${condition} font-bold italic`}>
                  {snakeToTitleCase(data?.row?.original?.condition_end) || "-"}
                </p>
              );

              return html;
            },
            meta: {
              headerClassName: "text-center",
              cellClassName: "text-center",
            },
          },
          {
            id: "row.note_end",
            accessorFn: (row) => row.note_end,
            header: "Note",
            cell: (data: any) => {
              const html: JSX.Element[] = [];
              html.push(<p>{data?.row?.original?.note_end}</p>);

              return html;
            },
            meta: {
              headerClassName: "",
              cellClassName: "",
            },
          },
        ],
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: (data: any) => {
          const row = data.row.original;
          let dataReturn = false;
          dataReturn = row.end_at ? false : true;
          return (
            <div className="flex justify-center">
              <DefaultTooltip title={"Pengembalian"} placement={"top"}>
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => handleEditMainProductOfferDialog(true, row)}
                  disabled={!dataReturn}
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              </DefaultTooltip>
            </div>
          );
        },
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [dataPricePlan, handleEditMainProductOfferDialog]
  );

  if (isLoading) {
    return <div className="text-center">Fetching data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <MainProductOfferDetailContext.Provider
      value={{
        showEditMainProductOfferDialog,
        handleEditMainProductOfferDialog,
        showAddMainProductOfferDialog,
        handleAddMainProductOfferDialog,
        date,
        setDate,
        selectedHistory,
        inventory,
      }}
    >
      {children}
      <div className="" style={{ marginTop: "-1.25rem" }}>
        <div className="min-h-screen bg-white p-4">
          <div className="flex border rounded shadow-sm">
            {/* Discount List */}
            <div className="w-1/4 border-r p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm">Discount List</span>
                <button className="text-blue-500 font-bold text-lg">+</button>
              </div>
              <div className="text-center text-gray-400 mt-16">
                <div className="text-sm">No record to view</div>
              </div>
            </div>

            {/* Form Section */}
            <div className="w-3/4 p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
                  <div className="flex space-x-4 mt-1">
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="Expression"
                        checked={selectedType === "Expression"}
                        onChange={() => setSelectedType("Expression")}
                      />{" "}
                      Expression
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="Tabular"
                        checked={selectedType === "Tabular"}
                        onChange={() => setSelectedType("Tabular")}
                      />{" "}
                      Tabular
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Promotion</label>
                  <div className="flex space-x-4 mt-1">
                    <label>
                      <input
                        type="radio"
                        name="promo"
                        value="Yes"
                        checked={promotion === "Yes"}
                        onChange={() => setPromotion("Yes")}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="promo"
                        value="No"
                        checked={promotion === "No"}
                        onChange={() => setPromotion("No")}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Result Account Item
                  </label>
                  <select className="w-full border rounded px-2 py-1 text-sm mt-1">
                    <option>--- Please Select ---</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium">Remarks</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm mt-1"
                />
              </div>

              {/* Tabbed Area */}
              <div>
                <div className="flex border-b mb-2 text-sm">
                  {["Script Template", "Rule", "Remarks", "Sample"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>
                <div className="mt-2">
                  {activeTab === "Script Template" && (
                    <div>
                      <label className="text-sm font-medium">
                        Script Template
                      </label>
                      <select className="w-full border rounded px-2 py-1 text-sm mt-1">
                        <option>--- Please Select ---</option>
                      </select>
                    </div>
                  )}
                  {/* You can add Rule, Remarks, Sample tab contents here */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-2">
                <button className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600">
                  OK
                </button>
                <button className="border text-sm px-4 py-1 rounded hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainProductOfferDetailContext.Provider>
  );
};

export { MainProductOfferDetailContext, MainProductOfferDetailContextProvider };

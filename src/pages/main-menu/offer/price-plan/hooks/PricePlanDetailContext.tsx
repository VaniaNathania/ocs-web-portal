import React, {
  createContext,
  useCallback,
  useState,
} from "react";
import { apiConfig } from "@/config/api.config";
import { useLanguage } from "@/i18n";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { DateRange } from "react-day-picker";

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
  // handleAddMainProductOfferDialog: (show: boolean) => void;
  inventory: InventoryProps[];
  selectedHistory: InventoryProps | null;
}

const initialProps: ContextProps = {
  date: undefined,
  setDate: () => { },
  showEditMainProductOfferDialog: false,
  handleEditMainProductOfferDialog: () => { },
  showAddMainProductOfferDialog: false,
  // handleAddMainProductOfferDialog: () => { },
  inventory: [],
  selectedHistory: null,
};

const PricePlanDetailContext = createContext<ContextProps>(initialProps);

const API_URL = apiConfig.service_assets;
const URL_DOMAIN = window.location.origin;

const PricePlanDetailContextProvider = ({
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
  const [isEditing, setIsEditing] = useState(false);

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


  return (
    <PricePlanDetailContext.Provider
      value={{
        showEditMainProductOfferDialog,
        handleEditMainProductOfferDialog,
        showAddMainProductOfferDialog,
        date,
        setDate,
        selectedHistory,
        inventory,
      }}
    >
      {children}
      <div className="" style={{ marginTop: "-1.25rem" }}>
        <div className="min-h-screen bg-white p-4">
          <div className="border rounded shadow-sm">
            <h1 className="mt-5 ml-5 text-2xl font-semibold">Price Plan Detail</h1>
            {/* Form Section */}
            <div className="w-full p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium"><span className="text-red-500">*</span>Price Plan Name</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm mt-1"
                    disabled={!isEditing}
                    placeholder="Development For Hybrid DPP"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium"><span className="text-red-500">*</span>Price Plan Code</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm mt-1"
                    disabled={!isEditing}
                    placeholder="DPP_888"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Service Type
                  </label>
                  <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                    <option>--- Please Select ---</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium"><span className="text-red-500">*</span>Valid Period</label>
                  <div className="flex space-x-4 mt-1">
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="DPP_888"
                    />
                    <span>-</span>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="DPP_888"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    <span className="text-red-500">*</span>Apply Level
                  </label>
                  <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                    <option>--- Please Select ---</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    <span className="text-red-500">*</span>Price Plan Type
                  </label>
                  <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                    <option>--- Please Select ---</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Is Package</label>
                  <div className="flex space-x-4 mt-1">
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="Yes"
                        checked={selectedType === "Yes"}
                        onChange={() => setSelectedType("Yes")}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="No"
                        checked={selectedType === "No"}
                        onChange={() => setSelectedType("No")}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="mt-5 ml-5 text-2xl font-semibold">Order Rule</h1>
            {/* Form Section */}
            <div className="w-full p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">
                    Package Mode
                  </label>
                  <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                    <option>--- Please Select ---</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Quantyty Limit</label>
                  <div className="flex space-x-4 mt-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="Lower"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="Upper"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Sale Price</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm mt-1"
                    disabled={!isEditing}
                    placeholder="Development For Hybrid DPP"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rent Price</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm mt-1"
                    disabled={!isEditing}
                    placeholder="Development For Hybrid DPP"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Duplicate Order
                  </label>
                  <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                    <option>--- Please Select ---</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium"><span className="text-red-500">*</span>Effective Type</label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm mt-1"
                    disabled={!isEditing}
                    placeholder="DPP_888"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Order Time Limit</label>
                  <div className="flex space-x-4 mt-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="DPP_888"
                    />
                    <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                      <option>--- Please Select ---</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Automatic Renewal</label>
                  <div className="flex space-x-4 mt-1">
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="Yes"
                        checked={selectedType === "Yes"}
                        onChange={() => setSelectedType("Yes")}
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="type"
                        value="No"
                        checked={selectedType === "No"}
                        onChange={() => setSelectedType("No")}
                      />{" "}
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Agreement Period</label>
                  <div className="flex space-x-4 mt-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="DPP_888"
                    />
                    <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                      <option>--- Please Select ---</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Agreement Affective Type</label>
                  <div className="flex space-x-4 mt-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={!isEditing}
                      placeholder="DPP_888"
                    />
                    <select className="w-full border rounded px-2 py-1 text-sm mt-1" disabled={!isEditing}>
                      <option>--- Please Select ---</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div>
                <label className="text-sm font-medium">Remarks</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  disabled={!isEditing}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                {isEditing ? (
                  <button
                    className="bg-green-500 text-white text-sm px-4 py-1 rounded hover:bg-green-600"
                    onClick={() => {
                      // Simpan data di sini
                      setIsEditing(false);
                    }}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PricePlanDetailContext.Provider>
  );
};

export { PricePlanDetailContext, PricePlanDetailContextProvider };

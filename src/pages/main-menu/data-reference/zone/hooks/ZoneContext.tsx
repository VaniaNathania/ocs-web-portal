import { createContext, useCallback, useState } from "react";
import ZoneSideBar from "../component/ZoneSideBar";
import ZoneDetail from "../component/ZoneDetail";
import ZoneMapContent from "../component/ZoneMapContent";
import ExportZoneValue from "../blocks/ExportZoneValue";
import AddBatchZoneValue from "../blocks/AddBatchZoneValue";
import DeleteBatchZoneValue from "../blocks/DeleteBatchZoneValue";
import DeleteBatchZoneDetail from "../blocks/DeleteBatchZoneDetail";
import { DataGridProvider } from "@/components";
import DeleteZoneDetail from "../blocks/DeleteZoneDetail";
import DeleteZoneValueDetail from "../blocks/DeleteZoneValueDetail";
import { menuAccess, useRoleCheck } from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface ZoneValue {
  zoneId: number;
  value: string;
  effDate: string;
  expDate: string;
  comments: string;
  seq: number;
  operType?: string;
}

export interface zoneDetail {
  zoneId: number;
  zoneName: string;
  zoneCode: string;
  zoneMapId: number;
  spId: number;
  value: string;
  effDate: string;
  comments: string;
}

interface ContextProps {
  viewType: "parent" | "child";
  setViewType: (value: "parent" | "child") => void;

  valueDetail: "add" | "edit" | "view";
  setValueDetail: (value: "view" | "add" | "edit") => void;

  showExportZoneValue: boolean;
  setShowExportZoneValue: (show: boolean) => void;
  handleExportZoneValue: (show: boolean) => void;

  showAddBatchZoneValue: boolean;
  setShowAddBatchZoneValue: (show: boolean) => void;
  handleAddBatchZoneValue: (show: boolean) => void;

  showDeleteBatchZoneValue: boolean;
  setShowDeleteBatchZoneValue: (show: boolean) => void;
  handleDeleteBatchZoneValue: (show: boolean) => void;

  selectedItem: ZoneValue | null;
  handleSelectedItem: (item: ZoneValue) => void;

  zoneValueAdd: boolean;
  setZoneValueAdd: (show: boolean) => void;

  handleSelectParent: (parent: any) => void;
  handleSelectChild: (child: any) => void;

  selectedChildrenSide: any;
  setSelectedChildrenSide: (item: any) => void;

  onSubmitSuccess: any;
  refreshTrigger: number;

  showDeleteZoneDetail: boolean;
  setShowDeleteZoneDetail: (show: boolean) => void;
  handleDeleteZoneDetail: (show: boolean) => void;

  showDeleteZoneValueDetail: boolean;
  setShowDeleteZoneValueDetail: (show: boolean) => void;
  selectedParent: any | null;

  searchZoneValue: string;
  setSearchZoneValue: (value: string) => void;
  searchZoneValueResults: any[];
  setSearchZoneValueResults: (results: any[]) => void;
  showZoneValueDropdown: boolean;
  setShowZoneValueDropdown: (show: boolean) => void;
  handleSelectZoneValue: (item: any) => void;
  showDeleteBatchZoneDetail: boolean;
  setShowDeleteBatchZoneDetail: (show: boolean) => void;
  handleDeleteBatchZoneDetail: (show: boolean) => void;
  selectedZonesToDelete: Array<{zoneId: number; zoneName: string}> | null;
  setSelectedZonesToDelete: (zones: Array<{zoneId: number; zoneName: string}> | null) => void;
  menuPrivAccess?: menuAccess;
}

const InitialProps: ContextProps = {
  viewType: "parent",
  setViewType: () => {},

  valueDetail: "view",
  setValueDetail: () => {},

  showExportZoneValue: false,
  setShowExportZoneValue: () => {},
  handleExportZoneValue: () => {},

  showAddBatchZoneValue: false,
  setShowAddBatchZoneValue: () => {},
  handleAddBatchZoneValue: () => {},

  showDeleteBatchZoneValue: false,
  setShowDeleteBatchZoneValue: () => {},
  handleDeleteBatchZoneValue: () => {},

  selectedItem: null,
  handleSelectedItem: () => {},

  zoneValueAdd: false,
  setZoneValueAdd: () => {},

  handleSelectParent: () => {},
  handleSelectChild: () => {},

  selectedChildrenSide: null,
  setSelectedChildrenSide: () => {},

  onSubmitSuccess: () => {},
  refreshTrigger: 0,

  showDeleteZoneDetail: false,
  setShowDeleteZoneDetail: () => {},
  handleDeleteZoneDetail: () => {},

  showDeleteZoneValueDetail: false,
  setShowDeleteZoneValueDetail: () => {},

  selectedParent: null,
  searchZoneValue: "",
  setSearchZoneValue: () => {},
  searchZoneValueResults: [],
  setSearchZoneValueResults: () => {},
  showZoneValueDropdown: false,
  setShowZoneValueDropdown: () => {},
  handleSelectZoneValue: () => {},
  showDeleteBatchZoneDetail: false,
  setShowDeleteBatchZoneDetail: () => {},
  handleDeleteBatchZoneDetail: () => {},
  selectedZonesToDelete: null,
  setSelectedZonesToDelete: () => {},
  menuPrivAccess: undefined,
};

const ZoneMainListContext = createContext<ContextProps>(InitialProps);

const ZoneMainContextListProvider = ({ children }: { children: React.ReactNode }) => {
  const {checkMenusPriv} = useRoleCheck()
  const [viewType, setViewType] = useState<"parent" | "child">("parent");
  const [valueDetail, setValueDetail] = useState<"view" | "add" | "edit">("view");
  const [showExportZoneValue, setShowExportZoneValue] = useState(false);
  const [showAddBatchZoneValue, setShowAddBatchZoneValue] = useState(false);
  const [showDeleteBatchZoneValue, setShowDeleteBatchZoneValue] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ZoneValue | null>(null);
  const [selectedChildrenSide, setSelectedChildrenSide] = useState<any | null>(null);
  const [zoneValueAdd, setZoneValueAdd] = useState(false);
  const [showDeleteZoneDetail, setShowDeleteZoneDetail] = useState(false);
  const [showDeleteZoneValueDetail, setShowDeleteZoneValueDetail] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [searchZoneValue, setSearchZoneValue] = useState("");
  const [searchZoneValueResults, setSearchZoneValueResults] = useState<any[]>([]);
  const [showZoneValueDropdown, setShowZoneValueDropdown] = useState(false);
  const [showDeleteBatchZoneDetail, setShowDeleteBatchZoneDetail] = useState(false);
  const [selectedZonesToDelete, setSelectedZonesToDelete] = useState<Array<{zoneId: number; zoneName: string}> | null>(null);
  const menuPrivAccess: menuAccess = {
      addStatus: checkMenusPriv("/main-menu/data-reference/zone/ZonePage", "addStatus"),
      deleteStatus: checkMenusPriv("/main-menu/data-reference/zone/ZonePage", "deleteStatus"),
      editStatus: checkMenusPriv("/main-menu/data-reference/zone/ZonePage", "editStatus"),
      readStatus: checkMenusPriv("/main-menu/data-reference/zone/ZonePage", "readStatus"),
    }

  const handleExportZoneValue = useCallback((show: boolean) => {
    setShowExportZoneValue(show);
  }, []);

  const handleAddBatchZoneValue = useCallback((show: boolean) => {
    setShowAddBatchZoneValue(show);
  }, []);

  const handleDeleteBatchZoneValue = useCallback((show: boolean) => {
    setShowDeleteBatchZoneValue(show);
  }, []);

  const handleDeleteZoneDetail = useCallback((show: boolean) => {
    setShowDeleteZoneDetail(show);
  }, []);

  const handleSelectChild = (child: any) => {
    setViewType("child");
    setSelectedChildrenSide(child);
    setSelectedItem(null);
  };
  const handleSelectedItem = (item: ZoneValue) => {
    setSelectedItem(item);
  };
  
  const handleSelectParent = (parent: any) => {
    setViewType("parent");
    setSelectedParent(parent);
  };
  
  const onSubmitSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectZoneValue = (item: any) => {
    setSelectedItem(item); 
    setSearchZoneValue(item.value); 
    setShowZoneValueDropdown(false); 
    setViewType("child");
  };

  const handleDeleteBatchZoneDetail = useCallback((show: boolean) => {
    setShowDeleteBatchZoneDetail(show);
  }, []);

  return (
    <ZoneMainListContext.Provider
      value={{
        viewType,
        setViewType,
        valueDetail,
        setValueDetail,
        showExportZoneValue,
        setShowExportZoneValue,
        handleExportZoneValue,
        showAddBatchZoneValue,
        setShowAddBatchZoneValue,
        handleAddBatchZoneValue,
        showDeleteBatchZoneValue,
        setShowDeleteBatchZoneValue,
        handleDeleteBatchZoneValue,
        selectedItem,
        handleSelectedItem,
        zoneValueAdd,
        setZoneValueAdd,
        handleSelectParent,
        handleSelectChild,
        selectedChildrenSide,
        setSelectedChildrenSide,
        onSubmitSuccess,
        refreshTrigger,
        handleDeleteZoneDetail,
        showDeleteZoneDetail,
        setShowDeleteZoneDetail,
        selectedParent,
        showDeleteZoneValueDetail,
        setShowDeleteZoneValueDetail,
        searchZoneValue,
        setSearchZoneValue,
        searchZoneValueResults,
        setSearchZoneValueResults,
        showZoneValueDropdown,
        setShowZoneValueDropdown,
        handleSelectZoneValue,
        showDeleteBatchZoneDetail,
        setShowDeleteBatchZoneDetail,
        handleDeleteBatchZoneDetail,
        selectedZonesToDelete,
        setSelectedZonesToDelete,
        menuPrivAccess
      }}
    >
      <div className="flex flex-1 h-[calc(100vh-4rem)] mt-3 mx-3 gap-2 overflow-hidden">
        {/* Sidebar */}
        <ZoneSideBar />

        {/* Dialogs */}
        <ExportZoneValue />
        <AddBatchZoneValue />
        <DeleteBatchZoneValue />
        <DeleteBatchZoneDetail />
        <DeleteZoneDetail />
        <DeleteZoneValueDetail />

        {/* Main Content */}
        {viewType === "parent" ? <ZoneMapContent /> : <ZoneDetail />}
      </div>
    </ZoneMainListContext.Provider>
  );
};

export { ZoneMainContextListProvider, ZoneMainListContext };

import { createContext, Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import ReservationSideBar from "../component/ReservationRuleSidebar";
import ReservationRuleContent from "../component/ReservationRuleContent";

const API_URL_REF = apiConfigRef.ref;

export interface ReUsageList {
  reId: number;
  reName: string;
  reAttrName: string;
  reType: string;
  comments: string | null;
  parentReId: number;
  baseTableName: string;
  reCode: string;
  reAttr: number;
  limitValue?: string;
  value?: string;
  seq?: string;
  reservationAmount?: string;
  reservationUnit?: string;
  reservationLimit?: string;
  balLimit?: string;
  prodSpecName?: string | null; 
  prodSpecId?: number | null; 
  ruleScript?: string | null;
  children: ReUsageList[];
}

export interface mainProductProps {
  offerId: number | null;
  offerName: string | null;
  offerType: string;
  offerCode: string;
  networkTypeName: string;
  networkType: string;
  duplicateFlag: string;
  isPackage: string;
}

interface ContextProps {
  selectedItem: ReUsageList | null;
  setSelectedItem: Dispatch<SetStateAction<ReUsageList | null>>;
  reUsageList: ReUsageList[];
  setReUsageList: Dispatch<SetStateAction<ReUsageList[]>>;
  fetchReUsageList: () => Promise<void>;
  isLoadingList: boolean;
  setIsLoadingList: Dispatch<SetStateAction<boolean>>;
  searchContent: string;
  setSearchContent: Dispatch<SetStateAction<string>>;
  displayData: ReUsageList[];
  mode: "view" | "edit" | "new";
  setMode: Dispatch<SetStateAction<"view" | "edit" | "new">>;
  addNewReservation: (data: Partial<ReUsageList>) => void;
  updateReservation: (data: Partial<ReUsageList>) => void;
  deleteReservation: (reId: number) => void;
}

const ReservationMainListContext = createContext<ContextProps | undefined>(undefined);

const ReservationMainContextListProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData } = useCallApi();
  const [reUsageList, setReUsageList] = useState<ReUsageList[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReUsageList | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchContent, setSearchContent] = useState("");
  const [mode, setMode] = useState<"view" | "edit" | "new">("view");

  const getDisplayData = useCallback((): ReUsageList[] => {
    if (!selectedItem) return [];

    const isPureFolder = selectedItem.reType === "folder" && !selectedItem.reservationAmount;

    if (isPureFolder && selectedItem.children && selectedItem.children.length > 0) {
      const dynamicChildren = selectedItem.children.filter(
        (child) => child.reservationAmount && child.reType !== "folder" && child.reType !== "system"
      );

      if (dynamicChildren.length > 0) {
        return dynamicChildren;
      }

      return [];
    }

    const isLeafNode = !selectedItem.children || selectedItem.children.length === 0;

    if (
      isLeafNode &&
      selectedItem.reType !== "folder" &&
      selectedItem.reType !== "system" &&
      selectedItem.reservationAmount
    ) {
      return [selectedItem];
    }

    return [];
  }, [selectedItem]);

  const displayData = getDisplayData();

  const findAndUpdateNode = (
    nodes: ReUsageList[],
    targetId: number,
    callback: (node: ReUsageList, parent?: ReUsageList) => void,
    parent?: ReUsageList
  ): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.reId === targetId) {
        callback(node, parent);
        return true;
      }
      if (node.children && node.children.length > 0) {
        if (findAndUpdateNode(node.children, targetId, callback, node)) {
          return true;
        }
      }
    }
    return false;
  };

  const addNewReservation = useCallback(
    (data: Partial<ReUsageList>) => {
      if (!selectedItem) {
        toast.error("Please select a parent item first");
        return;
      }

      setReUsageList((prevList) => {
        const newList = JSON.parse(JSON.stringify(prevList)) as ReUsageList[];

        const getAllIds = (nodes: ReUsageList[]): number[] => {
          let ids: number[] = [];
          nodes.forEach((node) => {
            ids.push(node.reId);
            if (node.children) {
              ids = ids.concat(getAllIds(node.children));
            }
          });
          return ids;
        };

        const allIds = getAllIds(newList);
        const newId = Math.max(...allIds, 0) + 1;

        const extractNumber = (str: string) => {
          if (!str) return "0";
          const match = str.match(/^([\d,]+)/);
          return match ? match[1].replace(/,/g, "") : "0";
        };

        const newItem: ReUsageList = {
          reId: newId,
          reName: `${selectedItem.reName} Entry ${newId}`, // Unique name
          reAttrName: data.reAttrName || "-",
          reType: selectedItem.reType === "folder" ? "usage" : selectedItem.reType,
          comments: `New ${selectedItem.reName} entry`,
          parentReId: selectedItem.reId,
          baseTableName: selectedItem.baseTableName || "usage",
          reCode: `RC${newId}`,
          reAttr: newId,
          limitValue: extractNumber(data.reservationAmount || ""),
          value: extractNumber(data.reservationAmount || ""),
          seq: "1",
          reservationAmount: data.reservationAmount || "",
          reservationUnit: data.reservationUnit || "",
          reservationLimit: data.reservationLimit || "",
          balLimit: data.balLimit || "",
          prodSpecName: data.prodSpecName || "",
          ruleScript: data.ruleScript || "",
          children: [],
        };

        findAndUpdateNode(newList, selectedItem.reId, (node) => {
          if (!node.children) {
            node.children = [];
          }
          node.children.push(newItem);
        });

        return newList;
      });
    },
    [selectedItem]
  );

  // Update existing reservation
  const updateReservation = useCallback(
    (data: Partial<ReUsageList>) => {
      if (!selectedItem) {
        toast.error("No item selected to update");
        return;
      }

      setReUsageList((prevList) => {
        const newList = JSON.parse(JSON.stringify(prevList)) as ReUsageList[];

        findAndUpdateNode(newList, selectedItem.reId, (node) => {
          node.reservationAmount = data.reservationAmount || node.reservationAmount;
          node.reservationUnit = data.reservationUnit || node.reservationUnit;
          node.reservationLimit = data.reservationLimit || node.reservationLimit;
          node.balLimit = data.balLimit || node.balLimit;
          node.prodSpecName = data.prodSpecName !== undefined ? data.prodSpecName : node.prodSpecName;
          node.ruleScript = data.ruleScript !== undefined ? data.ruleScript : node.ruleScript;

          if (data.reservationAmount) {
            const numValue = data.reservationAmount.split(" ")[0].replace(/,/g, "");
            node.limitValue = numValue;
            node.value = numValue;
          }
        });

        return newList;
      });

      setSelectedItem((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reservationAmount: data.reservationAmount || prev.reservationAmount,
          reservationUnit: data.reservationUnit || prev.reservationUnit,
          reservationLimit: data.reservationLimit || prev.reservationLimit,
          balLimit: data.balLimit || prev.balLimit,
          prodSpecName: data.prodSpecName !== undefined ? data.prodSpecName : prev.prodSpecName,
          ruleScript: data.ruleScript !== undefined ? data.ruleScript : prev.ruleScript,
        };
      });
    },
    [selectedItem]
  );

  // Delete reservation
  const deleteReservation = useCallback((reId: number) => {
    setReUsageList((prevList) => {
      const newList = JSON.parse(JSON.stringify(prevList)) as ReUsageList[];

      findAndUpdateNode(newList, reId, (node, parent) => {
        if (parent && parent.children) {
          parent.children = parent.children.filter((child) => child.reId !== reId);
        }
      });

      return newList;
    });

    setSelectedItem((prev) => {
      if (prev?.reId === reId) {
        return null;
      }
      return prev;
    });
  }, []);

  const fetchReUsageList = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await GetData(`${API_URL_REF}/api/reservation-rule/qry-re-usage`, { spId: 0 });
      const responseData = response?.data;

      setReUsageList(responseData);
      return responseData;
    } catch (error: any) {
      console.error("Error fetching data side", error);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoadingList(false);
    }
  }, [GetData]);

  useEffect(() => {
    fetchReUsageList();
  }, []);

  return (
    <ReservationMainListContext.Provider
      value={{
        selectedItem,
        setSelectedItem,
        reUsageList,
        setReUsageList,
        fetchReUsageList,
        isLoadingList,
        setIsLoadingList,
        searchContent,
        setSearchContent,
        displayData,
        mode,
        setMode,
        addNewReservation,
        updateReservation,
        deleteReservation,
      }}
    >
      <div className="flex h-screen">
        <ReservationSideBar />
        <ReservationRuleContent />
      </div>
    </ReservationMainListContext.Provider>
  );
};

export { ReservationMainContextListProvider, ReservationMainListContext };

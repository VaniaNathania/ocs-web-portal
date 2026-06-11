import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  useEffect,
  useCallback,
  Dispatch,
} from "react";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import {
  ShopHeadItem,
  ShopTableItem,
} from "@/pages/main-menu/order/models/interfaces";
import { toast } from "sonner";

interface OrderShopContextType {
  search: string;
  setSearch: React.Dispatch<SetStateAction<string>>;
  selectedShopHeadItem?: ShopHeadItem;
  setSelectedShopHeadItem: React.Dispatch<
    SetStateAction<ShopHeadItem | undefined>
  >;
  selectedTableItem?: ShopTableItem;
  setSelectedTableItem: React.Dispatch<
    SetStateAction<ShopTableItem | undefined>
  >;
  shopHeadItems: ShopHeadItem[];
  setShopHeadItems: React.Dispatch<SetStateAction<ShopHeadItem[]>>;

  groupedTable: groupTable[];
  setGroupedTable: React.Dispatch<SetStateAction<groupTable[]>>;

  showOrderForm: boolean;
  setShowOrderForm: Dispatch<SetStateAction<boolean>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

// Create the context with proper typing
export const OrderShopContext = createContext<OrderShopContextType | undefined>(
  undefined,
);

const API_ORDER = apiConfigOrder.order;

interface groupTable {
  parentCatgId: string;
  childCatg?: ShopHeadItem[];
  row: ShopTableItem[];
}

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}

const API_URL = apiConfigOrder.order;

export const OrderShopProvider = ({ children }: OrderProviderProps) => {
  const [search, setSearch] = useState<string>("");
  const [selectedShopHeadItem, setSelectedShopHeadItem] =
    useState<ShopHeadItem>();
  const [selectedTableItem, setSelectedTableItem] = useState<ShopTableItem>();
  const [shopHeadItems, setShopHeadItems] = useState<ShopHeadItem[]>([]);
  const [groupedTable, setGroupedTable] = useState<groupTable[]>([]);
  const [showOrderForm, setShowOrderForm] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { GetData } = useCallApi();

  const GroupItem = (
    headItems: ShopHeadItem[],
    shopTableItem: ShopTableItem[],
  ) => {
    // console.log(groupedTable, "ini masuk");

    const grouped: groupTable[] = [];
    const shopHead: ShopHeadItem[] = [];

    for (const item of headItems) {
      if (item.parentCatgId) {
        // Find parent by matching nodeId
        const parentId = item.parentCatgId;
        const parentGroup = grouped.find((g) => g.parentCatgId === parentId);

        if (parentGroup) {
          parentGroup.childCatg = parentGroup.childCatg || [];
          parentGroup.childCatg.push(item);
        } else {
          // Parent not added yet — create placeholder group
          grouped.push({
            parentCatgId: parentId,
            childCatg: [item],
            row: [],
          });
        }
        grouped.push({
          parentCatgId: item.nodeId,
          childCatg: [],
          row: [],
        });
      } else {
        // Create a new top-level group
        grouped.push({
          parentCatgId: item.nodeId,
          childCatg: [],
          row: [],
        });
        shopHead.push(item);
      }
    }
    shopTableItem.forEach((item) => {
      const categoryExists = grouped.some(
        (head) => head.parentCatgId === item.parentCatgId,
      );
      if (!categoryExists) return;

      const existingGroup = grouped.find(
        (g) => g.parentCatgId === item.parentCatgId,
      );

      if (existingGroup) {
        existingGroup.row.push(item);
      } else {
        grouped.push({ parentCatgId: item.parentCatgId, row: [item] });
      }
    });

    setGroupedTable(grouped);

    setShopHeadItems(shopHead);
    setSelectedShopHeadItem(shopHead[0]);
  };

  const init = useCallback(async () => {
    // grouphead();
    try {
      setIsLoading(true);
      const [headResp, itemResp] = await Promise.all([
        GetData(`${API_URL}/api/order-entry/go-shop/qry-offer-catalog`, {}),
        GetData(
          `${API_URL}/api/order-entry/go-shop/qry-subs-plan-and-catg-by-offer-catg`,
          {},
        ),
      ]);
      if (!headResp.status) {
        return toast.error(headResp.message);
      }
      if (!itemResp.status) {
        return toast.error(itemResp.message);
      }

      GroupItem(headResp.data, itemResp.data);
    } catch (error) {
      toast.error("Error fetching shop");
    } finally {
      setIsLoading(false);
    }
    return;
  }, []);

  useEffect(() => {
    init();
  }, []);

  // useEffect(() => {
  //   GroupItem();
  // }, [shopHeadItems]);

  useEffect(() => {
    //  console.log(groupedTable, selectedShopHeadItem);
  }, [selectedShopHeadItem]);

  return (
    <OrderShopContext.Provider
      value={{
        search,
        setSearch,
        selectedShopHeadItem,
        setSelectedShopHeadItem,
        selectedTableItem,
        setSelectedTableItem,
        shopHeadItems,
        setShopHeadItems,
        groupedTable,
        setGroupedTable,
        showOrderForm,
        setShowOrderForm,
        step,
        setStep,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </OrderShopContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderShop = () => {
  const context = useContext(OrderShopContext);
  if (context === undefined) {
    throw new Error("useOrderShop must be used within an OrderProvider");
  }
  return context;
};

export default OrderShopContext;

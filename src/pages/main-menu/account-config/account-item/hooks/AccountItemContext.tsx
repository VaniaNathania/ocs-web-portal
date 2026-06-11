import { DataGridProvider } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColumnAcctItem } from "./ColumnAcctItem";
import ListToolbar from "../blocks/ListToolbar";
import { AcctConfService } from "@/common/api/account-config/endpoints";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";

export type DeleteAccountItemTypeKey = "accountItem";

interface ContextProps {
  listAccountItem: AccountItemDetail[];
  showDialog: { show: boolean; mode: "create" | "update" };
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    accountItem: AccountItemDetail | null,
  ) => void;
  selectedAccountItem: AccountItemDetail | null;
  setSelectedAccountItem: (accountItem: AccountItemDetail | null) => void;
  selectedDelete: number | null;
  setSelectedDelete: (id: number | null) => void;
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteAccountItemTypeKey | null;
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteAccountItemTypeKey | null;
  }) => void;
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteAccountItemTypeKey,
  ) => void;
  onConfirmDelete: (
    deleteType: DeleteAccountItemTypeKey,
    offerVerId?: number,
    eventId?: number,
    priceVerId?: number,
    subBalTypeId?: number,
  ) => void;
  doGetListAccountItem: (
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
  ) => void;
  doGetParent: () => void;
  parent: GetParent[];
  setParent: (parent: GetParent[]) => void;
  doGetChildren: () => void;
  childrenList: GetChild[];
  setChildrenList: (childrenList: GetChild[]) => void;
  doGetBalType: () => void;
  balType: GetBalType[];
  setBalType: (balanceType: GetBalType[]) => void;
  listBalanceType: SearchBalancedType[];
  setListBalanceType: (balanceType: SearchBalancedType[]) => void;
  isLoadingBalanceType: boolean;
  setIsLoadingBalanceType: (isLoadingBalanceType: boolean) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  handleSearchBalanceType: (searchTerm: string) => void;
}

const initialProps: ContextProps = {
  listAccountItem: [],
  showDialog: { show: false, mode: "create" },
  handleShowDialog: () => {},
  selectedAccountItem: null,
  setSelectedAccountItem: () => {},
  selectedDelete: null,
  setSelectedDelete: () => {},
  showDeleteConfirm: { show: false, deleteType: null },
  setShowDeleteConfirm: () => {},
  handleDeleteDialog: () => {},
  onConfirmDelete: () => {},
  doGetListAccountItem: () => {},
  doGetParent: () => {},
  parent: [],
  setParent: () => {},
  doGetChildren: () => {},
  childrenList: [],
  setChildrenList: () => {},
  doGetBalType: () => {},
  balType: [],
  setBalType: () => {},
  isLoadingBalanceType: false,
  listBalanceType: [],
  searchQuery: "",
  setSearchQuery: () => {},
  setIsLoadingBalanceType: () => {},
  setListBalanceType: () => {},
  handleSearchBalanceType: () => {},
};

const API_URL = apiConfig.service_price_plan;
const AccountItemContext = createContext<ContextProps>(initialProps);

const AccountItemProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData, DeleteData } = useCallApi();
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();
  const { menuPrivAccess } = useAccountConfigLayout();

  //state buat get
  const [parent, setParent] = useState<GetParent[]>([]);
  const [listAccountItem, setListAccountItem] = useState<AccountItemDetail[]>(
    [],
  );

  const [listBalanceType, setListBalanceType] = useState<any[]>([]);
  const [isLoadingBalanceType, setIsLoadingBalanceType] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [balType, setBalType] = useState<GetBalType[]>([]);
  const [childrenList, setChildrenList] = useState<GetChild[]>([]);
  //
  const [showDialog, setShowDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });

  const [selectedAccountItem, setSelectedAccountItem] =
    useState<AccountItemDetail | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteAccountItemTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });

  const handleShowDialog = (
    show: boolean,
    mode: "create" | "update",
    balanceType: AccountItemDetail | null,
  ) => {
    setShowDialog({ show, mode });
    setSelectedAccountItem(balanceType);
  };

  const handleDeleteDialog = (
    show: boolean,
    id: number | null,
    deleteType: DeleteAccountItemTypeKey = "accountItem",
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? id : null);
  };

  const onConfirmDelete = async (deleteType: DeleteAccountItemTypeKey) => {
    const itemId = selectedDelete;

    if (!itemId) {
      toast.error("No item selected for deletion");
      return;
    }

    try {
      let endpoint = "";
      let successMessage = "";
      let requestBody: any = null;

      switch (deleteType) {
        case "accountItem":
          endpoint = `${API_URL}/account-item-type/delete/${itemId}`;
          successMessage = "Account Item deleted successfully";
          break;
      }

      const response = await DeleteData(endpoint, requestBody);

      if (response?.status) {
        toast.success(successMessage);
      } else {
        toast.error(response?.message || `Failed to delete ${deleteType}`);
      }
    } catch (error: any) {
      toast.error(
        error.message || "Error Deleting Data. Please Check Your Connection!",
      );
    }
  };

  const doGetListBalanceType = async (
    page: number = 1,
    size: number = 100,
    sortBy: string = "ACCT_RES_ID",
    sortDirection: string = "DESC",
    acctResName: string = "",
  ) => {
    setIsLoadingBalanceType(true);
    try {
      const params: any = {
        page,
        size,
        order_field: sortBy,
        order_direction: sortDirection,
      };

      if (acctResName) {
        params.acctResName = acctResName;
      }

      const response: any = await GetData(
        `${API_URL}/account-balance/balance-type-with-mvno`,
        params,
      );

      setListBalanceType(response.data || []);
      return { data: response.data, totalCount: response.totalRows };
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error Fetching Balance Type Data");
      return { data: [], totalCount: 0 };
    } finally {
      setIsLoadingBalanceType(false);
    }
  };
  const handleSearchBalanceType = (searchTerm: string) => {
    setSearchQuery(searchTerm);
    doGetListBalanceType(1, 100, "ACCT_RES_ID", "DESC", searchTerm);
  };

  const [hasLoadedBalanceType, setHasLoadedBalanceType] = useState(false);

  useEffect(() => {
    if (
      (showDialog.show && showDialog.mode === "create") ||
      (showDialog.show && showDialog.mode === "update")
    ) {
      // ⭐ Cuma fetch kalau belum pernah load
      if (!hasLoadedBalanceType) {
        doGetListBalanceType(1, 100, "ACCT_RES_ID", "DESC", "").then(() => {
          setHasLoadedBalanceType(true);
        });
      }
    }

    // ⭐ Reset flag saat dialog ditutup
    if (!showDialog.show) {
      setHasLoadedBalanceType(false);
    }
  }, [showDialog, hasLoadedBalanceType]);

  const doGetParent = async () => {
    try {
      const response = await GET_ACCT_ITEM_TYPE({
        page: 1,
        size: 50,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
        spId: 0,
      });
      setParent(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };
  useEffect(() => {
    doGetParent();
  }, [showDialog]);

  // ini buat get pilihan account balance type
  const doGetChildren = async () => {
    try {
      const response = await GetData(
        `${API_URL}/account-item-type/bal-type/child?spId=0`,
        { page: 1, size: 50, sortBy: "bal_type", sortDirection: "asc" },
      );

      setChildrenList(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };

  // ini buat dapet get parent dari dogetchildren
  const doGetBalType = async () => {
    try {
      const response = await GetData(
        `${API_URL}/account-item-type/bal-type/list`,
        {},
      );
      setBalType(response.data);
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };

  const doGetListAccountItem = async (
    page: number,
    limit: number,
    sorting: any,
    filter: any,
  ) => {
    try {
      sorting =
        sorting.length == 0 ? [{ id: "acctItemTypeId", desc: false }] : sorting;
      filter =
        filter.length == 0
          ? {}
          : { acctItemTypeName: filter[0].value?.toLowerCase() };

      const response = await GetData(`${API_URL}/account-item-type/add-list`, {
        size: limit,
        page: page + 1,
        sortBy: sorting[0].id,
        sortDirection: sorting[0].desc == false ? "ASC" : "DESC",
        // filter: JSON.stringify(filter)
        ...filter,
      });
      // console.log(response);
      setListAccountItem(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
      return { data: [], totalCount: 0 };
    }
  };

  useEffect(() => {
    if (showDialog.show === true) {
      doGetBalType();
      doGetChildren();
    }
  }, [showDialog]);

  return (
    <AccountItemContext.Provider
      value={{
        listAccountItem,
        showDialog,
        handleShowDialog,
        selectedAccountItem,
        setSelectedAccountItem,
        selectedDelete,
        setSelectedDelete,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDeleteDialog,
        onConfirmDelete,
        doGetListAccountItem,
        doGetParent,
        parent,
        setParent,
        doGetChildren,
        childrenList,
        setChildrenList,
        doGetBalType,
        balType,
        setBalType,
        isLoadingBalanceType,
        listBalanceType,
        searchQuery,
        setIsLoadingBalanceType,
        setListBalanceType,
        setSearchQuery,
        handleSearchBalanceType,
      }}
    >
      <DataGridProvider
        columns={ColumnAcctItem(
          handleDeleteDialog,
          handleShowDialog,
          menuPrivAccess,
        )}
        pagination={{ size: 10 }}
        toolbar={<ListToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "acctItemTypeId", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListAccountItem(pageIndex, pageSize, sorting, columnFilters)
        }
      >
        {children}
      </DataGridProvider>
    </AccountItemContext.Provider>
  );
};

export { AccountItemContext, AccountItemProvider };

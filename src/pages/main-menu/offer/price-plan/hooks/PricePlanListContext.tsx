import { doSaveLogActivity } from "@/actions/GlobalActions";
import { DataGridColumnHeader, DataGridProvider, KeenIcon, DefaultTooltip, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import React, { createContext, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { DateRange } from "react-day-picker";
import { ListToolBar } from "../blocks/ListToolBar";
import { getAuth } from "@/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import DetailContent from "../components/SubDetailCategoryContent/DetailContent";
import { apiConfigOffer } from "@/config/api.config";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { EditDialog } from "../blocks/EditDialog";
import { toast } from "sonner";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import PricePlanPortalContent from "@/layouts/portal/price-plan/PricePlanPortalContent";

interface ContextProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  doExportData: (sorting: any, filter: any) => Promise<any>;
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
  showEditDialogTitle: boolean;
  handleEditDialogTitle: (show: boolean) => void;
  selectedMenuPricePlan: string | null;
  setSelectedMenuPricePlan: (id: string | null) => void;
  showDetailView: boolean;
  setShowDetailView: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (value: boolean) => void;
  handleEditDialog: (show: boolean) => void;
  showMainContentAddDialog: boolean;
  handleMainContentAddDialog: (show: boolean) => void;
  doGetListData: (page: number, limit: number, sorting: any, filter: any) => Promise<any>;
  isSidebarOpen: boolean;
  editDialogData: any | null;
  setEditDialogData: (data: any | null) => void;
  handleAddDialogsub: (show: boolean, catgid?: number) => void;
  showAddDialogSub: boolean;

  /** tambahan baru */
  addDialogCatgId: number | null;
  setAddDialogCatgId: (id: number | null) => void;

  /** tambahan function fetch */
  fetchOfferData: () => Promise<any>;
  getOfferMenuItems: (categoryId: string) => Promise<any>;
  refreshCategorySideBar: () => Promise<void>;
  isEditing: boolean;
  setIsEditing: (show: boolean) => void;
}

const initialProps: ContextProps = {
  date: undefined,
  setDate: () => {},
  doExportData: async () => ({ data: [], totalCount: 0 }),
  showEditDialogTitle: false,
  handleEditDialogTitle: () => {},
  showAddDialog: false,
  handleAddDialog: () => {},
  selectedMenuPricePlan: null,
  setSelectedMenuPricePlan: () => {},
  showDetailView: false,
  setShowDetailView: () => {},
  showEditDialog: false,
  setShowEditDialog: () => {},
  handleEditDialog: () => {},
  showMainContentAddDialog: false,
  handleMainContentAddDialog: () => {},
  doGetListData: async () => ({ data: [], totalCount: 0 }),
  isSidebarOpen: true,
  editDialogData: null,
  setEditDialogData: () => {},
  handleAddDialogsub: () => {},
  showAddDialogSub: false,

  /** tambahan baru */
  addDialogCatgId: null,
  setAddDialogCatgId: () => {},

  /** tambahan function fetch */
  fetchOfferData: async () => [],
  getOfferMenuItems: async () => [],
  refreshCategorySideBar: async () => {},
  isEditing: false,
  setIsEditing: () => {},
};

const PricePlanListContext = createContext<ContextProps>(initialProps);

const API_URL_OFFER = apiConfigOffer.offer;

const PricePlanOfferListContextProvider = ({ children }: { children: React.ReactNode }) => {
  /* state */
  const {menuPrivAccess, setHideOfferNavbar} = useOfferLayout();
  const { GetData } = useCallApi();
  const { DeleteData } = useCallApi();

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddDialogSub, setShowAddDialogSub] = useState(false);
  const [showEditDialogTitle, setshowEditDialogTitle] = useState(false);
  const [editDialogData, setEditDialogData] = useState<any | null>(null);
  const [selectedMenuPricePlan, setSelectedMenuPricePlan] = useState<string | null>("S");

  const [showPortalView, setShowPortalView] = useState(false);
  const [portalOfferVerId, setPortalOfferVerId] = useState<number | null>(null);
  const [portalData, setPortalData] = useState<any>(null);
  const [sidebarData, setSidebarData] = useState<any>(null);
  const [datasubmenu, setDataSubmenu] = useState<any>(null);
  const [submenuCountMap, setSubmenuCountMap] = useState<Record<string, number>>({});
  const [datasubmenuMap, setDatasubmenuMap] = useState<Record<string, any[]>>({});
  const [selectedOfferCatgId, setSelectedOfferCatgId] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setHideOfferNavbar(showPortalView);
  }, [showPortalView, setHideOfferNavbar]);

  const [selectedofferid, setSelectedOfferId] = useState<number | null | undefined>(null);
  const [selectedpersub, setSelectedPerSub] = useState<number | null | undefined>(null);
  const [sidebarSearchValue, setSidebarSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<any>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [offerDataByCategory, setOfferDataByCategory] = useState<Record<string, any[]>>({});
  const [catgid, setCatgId] = useState<string>("");
  const [catgIdParams, setCatgIdParams] = useState<number>(0);
  const [addDialogCatgId, setAddDialogCatgId] = useState<number | null>(null);
  const [isOpen2, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [serviceType, setServiceType] = useState<any[]>([]);
  const [servtypeid, setServtypeid] = useState<number | null>(null);
  const [packageflag, setPackageFlag] = useState<string | null>(null);
  const [sidebarSearchValueCode, setSidebarSearchValueCode] = useState("");
  const [searchResultcode, setSearchResultcode] = useState<any>([]);
  const [showSearchDropdownCode, setShowSearchDropdownCode] = useState(false);
  const searchCodeInputRef = useRef<HTMLInputElement>(null);
  const [isSearchingCode, setIsSearchingCode] = useState<boolean>(false);
  const [searchType, setSearchType] = useState<"name" | "code" | null>(null);
  const hasFetched = useRef(false); // ✅ penanda apakah sudah fetch
  const isSelectingRef = useRef(false);
  const searchCodeDropdownRef = useRef<HTMLDivElement>(null);
  const [rowData, setRowData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  // mapping kode ke label
  const mapEffType: Record<string, string> = {
    A: "Special Day",
    B: "Instant",
    C: "Next Day",
    D: "Next Week",
    E: "Next Month",
    F: "Next Billing Cycle",
    G: "The Cycle After Next Cycle",
    H: "Special Time",
  };

  const handleReload = useCallback(async () => {
    setRefreshKey((prev) => prev + 1);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const fetchSearchByName = async (search: string) => {
    if (search.trim() === "") {
      setSearchResult([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-plans-by-name`, {
        offerName: search,
      });
      if (response?.data) {
        setSearchResult(response?.data);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      setSearchResult([]);
      setShowSearchDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultSelect = async (selectedOffer: any) => {
    const categoryId = selectedOffer.offerCatgId.toString();

    // Reset openMenus, only open categoryId
    setOpenMenus({ [categoryId]: true });

    setSelectedOfferCatgId(selectedOffer.offerCatgId);
    setSelectedOfferId(selectedOffer.offerId); // This will highlight the searched item
    setSelectedPerSub(selectedOffer.perSub);
    setShowSearchDropdown(false);

    // Load submenu if not already loaded
    if (!offerDataByCategory[categoryId]) {
      const offerData = await getOfferMenuItems(categoryId);
      setOfferDataByCategory((prev) => ({
        ...prev,
        [categoryId]: offerData,
      }));
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (sidebarSearchValue) {
        fetchSearchByName(sidebarSearchValue.trim());
      } else {
        setSearchResult([]);
        setShowSearchDropdown(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [sidebarSearchValue]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node) && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleEditDialogTitle = useCallback((show: boolean) => {
    setshowEditDialogTitle(show);
  }, []);

  // const { showDetailView, setShowDetailView } = useContext(PricePlanListContext);
  const [showDetailView, setShowDetailView] = useState(false);

  const handleCategoryClick = async (categoryId: string) => {
    setShowDetailView(true);

    // Clear current selection when switching categories
    setSelectedOfferId(null);
    setSelectedPerSub(null);

    // The useEffect will handle auto-selecting first row
  };

  async function getOfferMenuItems(categoryId: string) {
    try {
      const apiParams = {
        offerCatgClass: "A",
        spId: 0,
        method: "qryPricePlanCatgMemAndCnt",
        offerCatgType: "4",
        policyFlag: "N",
        servType: null,
        isPackage: null,
        offerCatgId: categoryId,
      };

      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`, apiParams);

      let list = [];
      let safeList: any = [];

      // console.log("response", response);

      if (response?.status) {
        list = response?.data?.list ?? response?.data;
        safeList = Array.isArray(list) ? list : [];
        // console.log("✅ Data fetched for category:", categoryId, list); // log data
        // console.log(safeList)
        setDataSubmenu(safeList);

        setDatasubmenuMap((prev) => ({
          ...prev,
          [categoryId]: safeList,
        }));

        // ✅ Set count map DI SINI, bukan di luar
        setSubmenuCountMap((prev) => ({
          ...prev,
          [categoryId]: safeList.length ?? 0,
        }));

        return safeList;
      }

      return [];
    } catch (err) {
      console.error("❌ Error fetching offer data:", err);
      return [];
    }
  }

  const fetchOfferData = async () => {
    try {
      const apiParams = {
        offerCatgClass: "A",
        spId: 0,
        method: "qryRootCatg",
        offerCatgType: "4",
        policyFlag: "N",
      };

      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`, apiParams);
      if (response?.status) {
        const list = response?.data?.list ?? response?.data ?? [];
        const safeList = Array.isArray(list) ? list : [];
        setSidebarData(safeList);
        setCatgId(safeList[0].offerCatgId);
        setOpenMenus({ [safeList[0].offerCatgId]: true });
      }

      return [];
    } catch (err) {
      console.error("Error fetching offer data:", err);
      // setData([]);
      return [];
    }
  };

  const refreshCategorySideBar = useCallback(async () => {
    try {
      await fetchOfferData();
    } catch (error: any) {
      console.error("Error fetching category sidebar:", error);
    }
  }, [fetchOfferData]);

  useEffect(() => {
    getOfferMenuItems(catgid);
  }, [catgid]);

  useEffect(() => {
    fetchOfferData();
  }, []);

  const getDataTable = async (offercatgid: number, page: number, limit: number, sorting: any, filter: any, servtypeid: any, packageflag: any) => {
    try {
      // const sortBy = sorting?.[0]?.id || "SEQ";
      // const sortDirection = sorting?.[0]?.desc ? "desc" : "asc";
      //filter by servtype

      const queryParams = {
        search: filter?.search || "",
        page: page + 1,
        size: limit,
        sortBy: "SEQ",
        sortDirection: "asc",
        offerCatgId: offercatgid,
        spId: 0,
        servType: servtypeid === "null" ? null : servtypeid,
        isPackage: packageflag === "all" ? null : packageflag,
      };

      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-offer-list-by-catg-id`, queryParams);

      if (response?.status) {
        const list = response?.data?.list ?? response?.data ?? [];
        const safeList = Array.isArray(list) ? list : [];
        return {
          data: safeList,
          totalCount: response?.totalRows || safeList.length, // pastikan backend kirim totalCount
        };
      } else {
        console.warn("Unexpected data format:", response?.data);
        return { data: [], totalCount: 0 };
      }
    } catch (err) {
      console.error("Error fetching offer data:", err);
      return { data: [], totalCount: 0 };
    }
  };

  useEffect(() => {
    if (catgid || selectedOfferCatgId) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [catgid, selectedOfferCatgId]);

  const deleteDataTitle = async (offerCatgId: any, offerCatgName: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete ${offerCatgName} ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await DeleteData(`${API_URL_OFFER}/offer/category/del-offer-catg/${offerCatgId}`, {
            offerCatgId,
          });

          if (response?.status) {
            toast.success(`${offerCatgName} has been deleted.`);
            // window.location.reload();
            await refreshCategorySideBar();
          }
        } catch (error) {
          toast.error(`Something went wrong while deleting.${error}`);
          console.error(error);
        }
      }
    });
  };

  /* Data Grid Options */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "pricePlanName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Price Plan Name" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => {
          return (
            <button
              type="button"
              className="font-medium text-left px-2 py-1 rounded text-red-500 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPerSub(row.original.offerId);
                setRowData(row.original);
                setShowDetailView(true);
              }}
            >
              {row.original.offerName || "-"}
            </button>
          );
        },
      },
      {
        id: "pricePlanType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Price Plan Code" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => <p>{row.original.offerCode || "-"}</p>,
      },
      {
        id: "pricePlanCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Price Plan Type" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-2/12", cellClassName: "w-2/12" },
        cell: ({ row }) => <p>{row.original.offerType || "-"}</p>,
      },
      {
        id: "serviceType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Service Type" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-1/12", cellClassName: "w-1/12" },
        cell: ({ row }) => {
          const { servTypeName, networkTypeName } = row.original;

          return <p>{servTypeName || networkTypeName ? `${servTypeName ?? "-"} [${networkTypeName ?? "-"}]` : "-"}</p>;
        },
      },
      {
        id: "effectiveType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Type" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-1/12", cellClassName: "w-1/12" },
        cell: ({ row }) => {
          const effType = row.original.effType;

          if (!effType) return <p>-</p>;

          // kalau lebih dari satu, pisahkan lalu map
          const labels = effType
            .split("|") // pecah jadi array
            .map((code: string) => mapEffType[code] ?? "-") // ubah ke label
            .join(" | "); // gabungkan

          return <p>{labels}</p>;
        },
      },
      {
        id: "validPeriod",
        header: ({ column }) => <DataGridColumnHeader className="" title="Valid Period" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-1/12", cellClassName: "w-1/12" },
        cell: ({ row }) => (
          <p>
            {row.original.effDate || "-"} - {row.original.expDate || "-"}
          </p>
        ),
      },
      {
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader title="Actions" className="text-center" column={column} />,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12 text-center",
          cellClassName: "w-1/12 text-center",
        },
        cell: (data: any) => {
          const handleDelete = (offerId: any, offername: any) => {
            Swal.fire({
              title: "Are you sure?",
              text: `Do you really want to delete ${offername} ?`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "Yes, delete it!",
            }).then(async (result) => {
              if (result.isConfirmed) {
                try {
                  Swal.fire({
                    title: "Deleting...",
                    text: "Please wait while we delete the data.",
                    allowOutsideClick: false,
                    didOpen: () => {
                      Swal.showLoading();
                    },
                  });

                  const response = await DeleteData(`${API_URL_OFFER}/offer/price-plan/del-price-plan-offer/${offerId}`, { offerId });

                  Swal.close();

                  // if (response?.status) {
                  toast.success(`${offername} has been deleted.`);
                  setRefreshKey((prev) => prev + 1);
                  fetchOfferData();
                  if (selectedOfferCatgId == 0) getOfferMenuItems(String(catgid));
                  else getOfferMenuItems(String(selectedOfferCatgId));
                } catch (error) {
                  Swal.close();
                  toast.error(`Something went wrong while deleting.${error}`);
                  console.error(error);
                }
              }
            });
          };

          return (
            <div className="flex gap-2 justify-center">
              {/* Detail Button */}
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setShowDetailView(true);
                  setIsEditing(true);
                  setSelectedPerSub(data.row.original.offerId);
                }}
                title="View Details"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>

              {/* Delete Button */}
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                <button className="btn btn-sm btn-icon btn-clear btn-light" title="Delete" onClick={() => handleDelete(data.row.original.offerId, data.row.original.offerName)}>
                  <KeenIcon icon="trash" />
                </button>
              </AccessWrapper>
            </div>
          );
        },
      },
    ],
    [selectedOfferCatgId, catgid],
  );

  // Modified doGetListData - NO auto-selection for normal browsing
  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      const catgidnumber: number = Number(catgid);
      const servtypeidstring = String(servtypeid);

      if (selectedOfferCatgId == 0) {
        setCatgIdParams(catgidnumber);
        setAddDialogCatgId(catgidnumber);
      } else {
        setCatgIdParams(selectedOfferCatgId);
        setAddDialogCatgId(selectedOfferCatgId);
      }

      const targetId = selectedOfferCatgId || (catgidnumber > 0 ? catgidnumber : null);

      if (!targetId) {
        console.warn("No category id available yet");
        return { data: [], totalCount: 0 };
      }

      // Check if we have an active search (either name or code)
      const hasActiveSearch = (sidebarSearchValue && sidebarSearchValue.trim() !== "") || (sidebarSearchValueCode && sidebarSearchValueCode.trim() !== "");

      // If we have a selected item from search, we need special handling
      if (selectedofferid && hasActiveSearch && page === 0) {
        // First, get ALL data to find our selected item
        const allDataResult = await getDataTable(targetId, 0, 1000, sorting, filter, servtypeidstring, packageflag);

        if (allDataResult.data && allDataResult.data.length > 0) {
          const selectedItem = allDataResult.data.find((item) => item.offerId === selectedofferid);

          if (selectedItem) {
            // Remove selected item from original position
            const otherItems = allDataResult.data.filter((item) => item.offerId !== selectedofferid);

            // Put selected item first, then other items
            const reorderedData = [selectedItem, ...otherItems];

            // Apply pagination to reordered data
            const startIndex = page * limit;
            const endIndex = startIndex + limit;
            const paginatedData = reorderedData.slice(startIndex, endIndex);

            // console.log(`Moved selected item to first row (${searchType} search):`, selectedItem.offerName);
            return {
              data: paginatedData,
              totalCount: allDataResult.totalCount,
            };
          }
        }
      }

      // Normal pagination for non-search or other pages
      const result = await getDataTable(targetId, page, limit, sorting, filter, servtypeidstring, packageflag);
      return result;
    },
    [selectedOfferCatgId, catgid, servtypeid, packageflag, selectedofferid, sidebarSearchValue, sidebarSearchValueCode, searchType],
  );

  useEffect(() => {
    // Clear selection when switching categories without any active search
    const hasActiveSearch = (sidebarSearchValue && sidebarSearchValue.trim() !== "") || (sidebarSearchValueCode && sidebarSearchValueCode.trim() !== "");

    if (!hasActiveSearch) {
      setSelectedOfferId(null);
      setSelectedPerSub(null);
      setSearchType(null);
    }
  }, [selectedOfferCatgId, catgid, sidebarSearchValue, sidebarSearchValueCode]);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [selectedOfferCatgId, catgid, servtypeid, packageflag]);

  const handleAddDialogsub = useCallback((show: boolean, catgIdParams?: number) => {
    setShowAddDialogSub(show);
  }, []);

  const doExportData = async (sorting: any, filter: any) => {
    sorting = sorting.length === 0 ? [{ id: "created_at", desc: false }] : sorting;
    const startDate = date?.from ? format(date.from, "yyyy-MM-dd") : format(new Date(2024, 5, 1), "yyyy-MM-dd");
    const endDate = date?.to ? format(date.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    const filterObject: Record<string, string> = {};
    if (filter && Array.isArray(filter)) {
      filter.forEach((f: { id: string; value: string }) => {
        if (f?.id && f?.value) {
          filterObject[f.id] = f.value;
        }
      });
    }

    const filtes = {
      ...filterObject,
      application_date_from: startDate,
      application_date_to: endDate,
    };

    let param = {
      with_deleted: false,
      order_field: sorting[0].id,
      order_direction: sorting[0].desc === false ? "ASC" : "DESC",
      filter: JSON.stringify(filtes),
      token: await getAuth()?.access_token,
    };

    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;

    const createActivity = {
      module: "List Pengajuan Kredit",
      description: `Export List Pengajuan Kredit => ${parsedUser ? parsedUser.name : "Unknown User"}`,
      action: "E",
    };

    doSaveLogActivity(createActivity);
  };

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    ecommerce: true,
  });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => {
      const newMenus: Record<string, boolean> = {};
      // semua false kecuali yang dipilih
      newMenus[menu] = !(prev[menu] ?? false);
      return newMenus;
    });
  };

  const editData = (offerCatgName: any, effDate: any, offerCatgCode: any, comments: any, offercatgid: any) => {
    setEditDialogData({ offerCatgName, effDate, offerCatgCode, comments, offercatgid });
    setShowEditDialog(true); // ✅ buka dialog
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown custom kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchServiceType = async () => {
    if (hasFetched.current) return; // ✅ kalau sudah pernah fetch, langsung keluar

    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        page: 1,
        size: 9999,
        sortBy: "SERV_TYPE_NAME",
        sortDirection: "asc",
        search: "",
      });

      const total = response.totalRows || 0;
      setTotalRows(total);

      const dataArray = Array.isArray(response.data) ? response.data : [response.data];
      setServiceType(dataArray);

      hasFetched.current = true; // ✅ tandai sudah fetch
    } finally {
      setIsLoading(false);
    }
  };

  // helper aman
  const toLow = (v: any) => (v ?? "").toString().toLowerCase();
  const term = (search ?? "").toLowerCase();

  const filteredServiceTypes = serviceType.filter((item: any) => {
    const code = toLow(item?.networkTypeName);
    const name = toLow(item?.servTypeName);
    return code.includes(term) || name.includes(term);
  });

  const handleDropdownSelection = async (selectedOffer: any, isCodeSearch: boolean = false) => {
    const categoryId = selectedOffer.offerCatgId.toString();

    // Set search type indicator
    setSearchType(isCodeSearch ? "code" : "name");

    // Reset openMenus, only open categoryId
    setOpenMenus({ [categoryId]: true });

    setSelectedOfferCatgId(selectedOffer.offerCatgId);
    setSelectedOfferId(selectedOffer.offerId);
    setSelectedPerSub(selectedOffer.perSub);

    // Close appropriate dropdown
    if (isCodeSearch) {
      setShowSearchDropdownCode(false);
    } else {
      setShowSearchDropdown(false);
    }

    // Load submenu if not already loaded
    if (!offerDataByCategory[categoryId]) {
      const offerData = await getOfferMenuItems(categoryId);
      setOfferDataByCategory((prev) => ({
        ...prev,
        [categoryId]: offerData,
      }));
    }
  };

  const fetchSearchByCode = async (search: string) => {
    if (search.trim() === "") {
      setSearchResultcode([]);
      setShowSearchDropdownCode(false);
      return;
    }

    setIsSearchingCode(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/price-plan/qry-price-plans-by-name`, {
        offerCode: search,
      });
      if (response?.data) {
        setSearchResultcode(response?.data);
        setShowSearchDropdownCode(true);
      }
    } catch (error) {
      console.error("Error fetching code search data:", error);
      setSearchResultcode([]);
      setShowSearchDropdownCode(false);
    } finally {
      setIsSearchingCode(false);
    }
  };

  useEffect(() => {
    if (isSelectingRef.current) {
      return;
    }

    const delay = setTimeout(() => {
      if (sidebarSearchValueCode && sidebarSearchValueCode.trim() !== "") {
        fetchSearchByCode(sidebarSearchValueCode.trim());
      } else {
        setSearchResultcode([]);
        setShowSearchDropdownCode(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [sidebarSearchValueCode]);

  const clearSearchCode = () => {
    setSidebarSearchValueCode("");
    setSearchResultcode([]);
    setShowSearchDropdownCode(false);
    setSelectedOfferId(null);
    setSelectedPerSub(null);
    setSearchType(null);
  };

  const clearSearchName = () => {
    setSidebarSearchValue("");
    setSearchResult([]);
    setShowSearchDropdown(false);
    setSelectedOfferId(null);
    setSelectedPerSub(null);
    setSearchType(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node) && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }

      if (searchCodeDropdownRef.current && !searchCodeDropdownRef.current.contains(event.target as Node) && searchCodeInputRef.current && !searchCodeInputRef.current.contains(event.target as Node)) {
        setShowSearchDropdownCode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {showPortalView ? (
        <PricePlanPortalContent
          dataPricePlan={portalData}
          initialOfferVerId={portalOfferVerId}
          onBack={() => setShowPortalView(false)}
        />
      ) : showDetailView ? (
        <DetailContent
          onBack={() => {
            setShowDetailView(false);
            setIsEditing(false);
          }}
          offerid={selectedpersub}
          catgid={catgIdParams}
          onReload={handleReload}
          rowData={rowData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          fetchOfferData={fetchOfferData}
          onOpenPortal={(offerVerId, data) => {
            setPortalOfferVerId(offerVerId);
            setPortalData(data);
            setShowPortalView(true);
          }}
        />
      ) : (
        // <DetailContent category={selectedCategory} onBack={() => setShowDetailView(false)} />
        <PricePlanListContext.Provider
          value={{
            date,
            setDate,
            doExportData,
            showAddDialog,
            handleAddDialog,
            showEditDialogTitle,
            handleEditDialogTitle,
            editDialogData,
            setEditDialogData,
            selectedMenuPricePlan,
            setSelectedMenuPricePlan,
            showDetailView,
            setShowDetailView,
            showEditDialog,
            setShowEditDialog,
            doGetListData,
            handleEditDialog: (show: boolean) => setShowEditDialog(show),
            showMainContentAddDialog: false,
            handleMainContentAddDialog: (show: boolean) => {},
            isSidebarOpen,
            showAddDialogSub,
            handleAddDialogsub,
            addDialogCatgId,
            setAddDialogCatgId,
            fetchOfferData,
            getOfferMenuItems,
            refreshCategorySideBar,
            isEditing,
            setIsEditing,
          }}
        >
          <div className="flex container-fixed">
            {/* Sidebar */}
            <div className={`relative flex flex-col transition-all duration-300 shadow-md h-[90vh] ${isSidebarOpen ? "border-[1px] w-64 opacity-100" : "opacity-0 w-0"}`}>
              {/* Tombol toggle sidebar, posisinya vertikal tengah */}
              <button onClick={toggleSidebar} className="absolute -right-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md ">
                {isSidebarOpen ? <KeenIcon icon="left-square" /> : <KeenIcon icon="right-square" />}
              </button>

              <div className="p-3">
                {isSidebarOpen && (
                  <>
                    <div className="flex flex-row gap-2 items-center w-full justify-between">
                      <h2 className="font-bold text-lg">Price Plan</h2>
                      <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
                        <Button variant="default" className="h-7.5 w-7.5" onClick={() => handleAddDialog(true)}>
                          <KeenIcon icon="plus" />
                        </Button>
                      </AccessWrapper>
                    </div>
                    <form action="">
                      <div className="relative w-full">
                        <label className="input input-sm w-full flex items-center gap-2 mt-3">
                          <KeenIcon icon="magnifier" />
                          <input
                            ref={searchInputRef}
                            value={sidebarSearchValue}
                            onChange={(e) => {
                              // console.log("🟢 input berubah:", e.target.value);
                              setSidebarSearchValue(e.target.value);
                            }}
                            onFocus={() => {
                              if (searchResult.length > 0) {
                                setShowSearchDropdown(true);
                              }
                            }}
                            type="text"
                            placeholder="Search Price Plan Name..."
                            className="w-full"
                          />
                          {sidebarSearchValue && (
                            <button type="button" onClick={clearSearchName} className="text-gray-400 hover:text-gray-600 transition-colors">
                              ✕
                            </button>
                          )}
                        </label>
                        {showSearchDropdown && (
                          <div ref={searchDropdownRef} className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {searchResult.length > 0 ? (
                              <ul className="py-1">
                                {searchResult.map((offer: any, index: any) => (
                                  <li key={`${offer.offerId}-${index}`}>
                                    <button type="button" onClick={() => handleSearchResultSelect(offer)} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                                      <div className="flex items-center gap-2">
                                        <KeenIcon icon={offer.offerType === "Package" ? "package" : "gift"} className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm text-gray-900 truncate" title={offer.offerName}>
                                            {offer.offerName}
                                          </div>
                                          <div className="text-xs text-gray-500 truncate" title={offer.offerCode}>
                                            {offer.offerCode}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${offer.offerType === "Package" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                            {offer.offerType}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500 text-center">{isSearching ? "Searching..." : "No results found"}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="py-2 relative">
                        <label className="input input-sm w-full flex items-center gap-2">
                          <KeenIcon icon="magnifier" />
                          <input
                            ref={searchCodeInputRef}
                            type="text"
                            value={sidebarSearchValueCode}
                            onChange={(e) => setSidebarSearchValueCode(e.target.value)}
                            onFocus={() => {
                              if (searchResultcode.length > 0) {
                                setShowSearchDropdownCode(true);
                              }
                            }}
                            placeholder="Search Offer Code..."
                            className="w-full"
                          />
                          {sidebarSearchValueCode && (
                            <button type="button" onClick={clearSearchCode} className="text-gray-400 hover:text-gray-600 transition-colors">
                              ✕
                            </button>
                          )}
                        </label>

                        {showSearchDropdownCode && (
                          <div ref={searchCodeDropdownRef} className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {searchResultcode.length > 0 ? (
                              <ul className="py-1">
                                {searchResultcode.map((offer: any, index: any) => (
                                  <li key={`${offer.offerId}-${index}`}>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDropdownSelection(offer, true);
                                      }}
                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="flex items-center gap-2">
                                        <KeenIcon icon={offer.offerType === "Package" ? "package" : "gift"} className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          {/* Tampilkan code di atas, name di bawah */}
                                          <div className="font-medium text-sm text-gray-900 truncate" title={offer.offerCode}>
                                            {offer.offerCode}
                                          </div>
                                          <div className="text-xs text-gray-500 truncate" title={offer.offerName}>
                                            {offer.offerName}
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${offer.offerType === "Package" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                            {offer.offerType}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500 text-center">{isSearchingCode ? "Searching..." : "No results found"}</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row gap-2 items-center w-full mt-3">
                        {/* Product Line */}
                        <div className="w-1/2">
                          <Select
                            onValueChange={(value) => {
                              setPackageFlag(value || null);
                              setSelectedOfferId(null);
                            }}
                            value={packageflag || ""}
                          >
                            <SelectTrigger size="sm">
                              <SelectValue placeholder="Package Flag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="Y">Yes</SelectItem>
                              <SelectItem value="N">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Service Type */}
                        <div className="w-1/2">
                          <div className="w-full relative" ref={dropdownRef}>
                            {/* Selected Box */}
                            <div
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex justify-between items-center shadow-sm bg-white cursor-pointer h-8"
                              onClick={() => {
                                if (!isOpen2) {
                                  fetchServiceType(); // ✅ fetch hanya saat pertama kali buka
                                }
                                setIsOpen(!isOpen2);
                              }}
                            >
                              <span
                                title={selected ? `${selected.servTypeName} [${selected.networkTypeName}]` : "Service Type"}
                                className={`flex-1 truncate whitespace-nowrap overflow-hidden text-xs text-gray-800"
                                }`}
                              >
                                {selected ? `${selected.servTypeName} [${selected.networkTypeName}]` : "Service Type"}
                              </span>
                              <svg className={`w-4 h-4 ml-2 flex-shrink-0 transform transition-transform ${isOpen2 ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>

                            {/* Dropdown List */}
                            {isOpen2 && (
                              <div className="fixed border rounded-lg bg-white shadow-lg z-50 w-80">
                                {/* Search Box */}
                                <div className="p-2">
                                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search service type..." className="w-full border rounded px-2 py-1 text-sm" />
                                </div>

                                <div className="max-h-48 overflow-y-auto">
                                  {loading ? (
                                    <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                                  ) : filteredServiceTypes.length > 0 ? (
                                    <>
                                      {/* All Service Type option */}
                                      <div
                                        key="all"
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 ${!selected ? "bg-gray-100 font-medium" : ""}`}
                                        onClick={() => {
                                          setSelected({ servTypeName: "All Service Type", networkTypeName: "" });
                                          setServtypeid(null);
                                          setIsOpen(false);
                                        }}
                                      >
                                        All Service Type
                                      </div>

                                      {/* Service Type options */}
                                      {filteredServiceTypes.map((item: any) => (
                                        <div
                                          key={item.servType}
                                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-100 ${selected?.servType === item.servType ? "bg-gray-100 font-medium" : ""}`}
                                          onClick={() => {
                                            setSelected(item);
                                            setServtypeid(item.servType);
                                            setIsOpen(false);
                                            setSelectedOfferId(null);
                                          }}
                                        >
                                          {`${item.servTypeName ?? ""} [${item.networkTypeName}]`}
                                        </div>
                                      ))}
                                    </>
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>

              <ul className="mt-2 flex-1 text-sm px-2 overflow-y-auto">
                {sidebarData?.length > 0 ? (
                  sidebarData.map((item: any) => {
                    const offerid = item.offerCatgId?.toString();
                    const offername = item.offerCatgName;
                    const isSelected = selectedMenuPricePlan === offerid;
                    const isOpen: any = openMenus[offerid] || false;
                    const offerCatgId = item.offerCatgId;

                    return (
                      <li key={offerid}>
                        <button
                          onClick={() => {
                            setSelectedMenuPricePlan(offerid);
                            setSelectedOfferCatgId(offerCatgId);
                            toggleMenu(offerid);
                            getOfferMenuItems(offerid);
                          }}
                          className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition duration-200 ${isSelected ? "bg-gray-300 font-semibold" : ""}`}
                        >
                          <KeenIcon icon="package" className="w-4 h-4 mr-2 text-blue-600" />
                          {isSidebarOpen && (
                            <>
                              <span className="flex-1 text-left" title={offername}>
                                {offername}
                              </span>

                              <div className="flex items-center gap-1 ml-auto">
                                <span className={`text-white text-xs rounded-full px-2 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium ${isSelected ? "bg-blue-600" : "bg-red-500"}`}>{item.cnt}</span>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="w-[28px] h-[28px] flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-300 transition" onClick={(e) => e.stopPropagation()} title="Options">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        editData(item.offerCatgName, item.effDate, item.offerCatgCode, item.comments, item.offerCatgId);
                                        // handleEditSideBar(true, categoryId, categoryName);
                                      }}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    </AccessWrapper>
                                    <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDataTitle(offerCatgId, item.offerCatgName);
                                        // handleDeleteSideBar(true, categoryId, categoryName);
                                      }}
                                      className="text-red-500 focus:text-red-500"
                                    >
                                      <Trash className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                    </AccessWrapper>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <MdKeyboardArrowRight className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                              </div>
                            </>
                          )}
                        </button>

                        {/* Submenu */}
                        {isOpen && isSidebarOpen && (
                          <ul className="ml-4 font-light text-xs mt-1">
                            {(datasubmenuMap[offerid]?.length ?? 0) > 0 ? (
                              datasubmenuMap[offerid].map((offer: any) => {
                                const isHighlighted = offer.offerId === selectedofferid;
                                return (
                                  <li key={offer.offerId}>
                                    <button
                                      className={`flex items-center w-full text-left px-2 py-1.5 rounded transition-all duration-200 hover:bg-blue-50 hover:shadow-sm ${isHighlighted ? "bg-red-100 text-red-600 font-bold" : "text-red-500 hover:text-blue-800"}`}
                                      onClick={() => {
                                        setSelectedPerSub(offer.offerId);
                                        setShowDetailView(true);
                                        setRowData(offer);
                                      }}
                                    >
                                      <KeenIcon icon="package" className="w-4 h-4 mr-2 transition-colors duration-200" />
                                      <span className="truncate flex-1">{offer.offerName}</span>
                                    </button>
                                  </li>
                                );
                              })
                            ) : (
                              <li className="px-2 py-1.5 text-gray-500 italic">{datasubmenuMap[offerid] === undefined ? "Loading offers..." : "No offers found"}</li>
                            )}
                          </ul>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-400 italic">No categories available</li>
                )}
              </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-2 h-[90vh]">
              <div className="relative shadow-md border-[1px] h-full overflow-y-auto flex flex-col">
                {/* Toggle Button */}
                <button
                  onClick={toggleSidebar}
                  className={`transition-all duration-300 ${isSidebarOpen ? "opacity-0" : "opacity-100"} absolute -left-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md`}
                >
                  {isSidebarOpen ? <KeenIcon icon="left-square" /> : <KeenIcon icon="right-square" />}
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold mb-5 mt-5 ml-10">Price Plan</h2>

                {/* Table wrapper: biar full height & bisa scroll */}
                <div className="flex-1 pt-0">
                  <DataGridProvider
                    key={refreshKey}
                    columns={columns}
                    pagination={{ size: 10 }}
                    toolbar={<ListToolBar />}
                    layout={{ card: true }}
                    sorting={[{ id: "pricePlanName", desc: true }]}
                    serverSide={true}
                    onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListData(pageIndex, pageSize, sorting, columnFilters)}
                    getRowProps={(row) => {
                      const original = row.original as { offerId?: number };
                      const isHighlighted = original.offerId === selectedofferid;

                      // Check if any search is active
                      const hasActiveSearch = (sidebarSearchValue && sidebarSearchValue.trim() !== "") || (sidebarSearchValueCode && sidebarSearchValueCode.trim() !== "");

                      return {
                        className: `transition-colors cursor-pointer ${
                          // Only highlight if there's an active search and this row is selected
                          isHighlighted && hasActiveSearch ? "bg-red-100 text-red-600 font-bold border-l-4 border-red-500" : "hover:bg-blue-50"
                        }`,
                        onClick: () => {
                          // Allow manual row selection by clicking
                          setSelectedOfferId(original.offerId);
                          setSelectedPerSub(original.offerId);
                        },
                      };
                    }}
                  >
                    {children}
                    {showEditDialog && editDialogData && (
                      <EditDialog
                        data={editDialogData}
                        onClose={() => {
                          setShowEditDialog(false);
                          setEditDialogData(null);
                        }}
                      />
                    )}
                  </DataGridProvider>
                </div>
              </div>
            </div>
          </div>
        </PricePlanListContext.Provider>
      )}
    </>
  );
};

export { PricePlanListContext, PricePlanOfferListContextProvider };

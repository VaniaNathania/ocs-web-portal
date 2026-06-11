import React, {
  createContext,
  Dispatch,
  SetStateAction,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  KeenIcon,
  DataGrid,
  ScreenLoader,
  DataGridProvider,
  DataGridInner,
  Container,
} from "@/components";
import { ListToolBar } from "../blocks/ListToolBar";
import { Button } from "@/components/ui/button";
import { nonSelectedRowHighLight } from "@/styles/style";
import { ColumnDef } from "@tanstack/react-table";
import { OperationDialog } from "../blocks/OperationDialog";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { ModSubsService } from "../components/mockModSubs";
import { lazy } from "react";
import RegisterCustInfo from "../components/RegisterCustInfo/RegisterCustInfo";
import OneWayBlockOwe from "../components/OneWayBlockOwe/OneWayBlockOwe";
import {
  CustomerInfo,
  operationItems,
  SubsListDetail,
} from "@/pages/main-menu/order/models/interfaces";
import {
  DPOfferAttrList,
  DPOfferOrderList,
  StartOrderFlow,
} from "../components/modifysubscriber/model/interfaces";
import { useAuthContext } from "@/auth";
import BrandShiftForm from "../components/BSSteps/BrandShifting";
import SimCardRestore from "../components/SCRSTEPS/SimCardRestore";

const SuspensionUnderRequest = lazy(
  () => import("../components/SURSTEPS/SuspensionUnderRequest"),
);
const SCLost = lazy(() => import("../components/SCLSTEPS/SCLost"));
const Termination = lazy(() => import("../components/TermSteps/Termination"));
const ChangeSubsProf = lazy(
  () => import("../components/CSNSTEPS/ChangeSubscriberNumber"),
);
const Replacement = lazy(() => import("../components/RepSteps/Replacement"));
const SubsDetail = lazy(() => import("../components/dialog/SubscriberDetail"));
const UnderConstructSubsOrder = lazy(
  () => import("../blocks/UnderConstructionSubsOrder"),
);
const ModSubsForm = lazy(
  () => import("../components/modifysubscriber/ModifySubscriber"),
);
const BrandShifting = lazy(
  () => import("../components/BrandShifting/BrandShifting"),
);
const PFDial = lazy(() => import("../components/PFDial/PFDial"));
const ReactivationUnderRequest = lazy(
  () => import("../components/RURSTEPS/ReactivationUnderRequest"),
);

interface ContextProps {
  handleOperationDialog: (show: boolean) => void;
  showOperationDialog: boolean;
  setShowModifySubscriberDetailAddDialog: (show: boolean) => void;
  showModifySubscriberDetailAddDialog: boolean;
  handleModifySubscriberDetailAddDialog: (show: boolean) => void;
  selectedSubs?: SubsListDetail;
  setSelectedSubs: React.Dispatch<SetStateAction<SubsListDetail | undefined>>;

  availableOffer: ModSubsService[];
  setAvailableOffer: React.Dispatch<SetStateAction<ModSubsService[]>>;
  ownedOffer: DPOfferOrderList[];
  setOwnedOffer: React.Dispatch<SetStateAction<DPOfferOrderList[]>>;

  showDialog: string;
  setShowDialog: React.Dispatch<SetStateAction<string>>;

  filter: string;
  setFilter: React.Dispatch<SetStateAction<string>>;

  state: string;
  setState: React.Dispatch<SetStateAction<string>>;
  selectedOperation?: operationItems;
  setSelectedOperation: Dispatch<SetStateAction<operationItems | undefined>>;

  fetchOfferData: () => void;
  // fetchOwnedOffer: () => void;
  mapToOrderPayload: (
    subs: SubsListDetail | undefined,
    cust: CustomerInfo | undefined,
  ) => void;

  result: UseQueryResult;
  offerList: UseQueryResult<ModSubsService[], Error>;
  fetchStartOrderFlow: () => Promise<StartOrderFlow | undefined>;
  startOrderFlow: UseQueryResult<StartOrderFlow | undefined, Error>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const SubscriberListContext = createContext<ContextProps | undefined>(
  undefined,
);

const API_URL = apiConfigOrder.order;

const SubscriberListContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [availableOffer, setAvailableOffer] = useState<ModSubsService[]>([]);
  const [ownedOffer, setOwnedOffer] = useState<DPOfferOrderList[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOperationDialog, setShowOperationDialog] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDialog, setShowDialog] = useState<string>("");
  const [rows, setRows] = useState<SubsListDetail[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<operationItems>();
  const { GetData, PostData } = useCallApi();
  const { selectedUser } = useOrder();
  const { getUser } = useAuthContext();
  const [
    showModifySubscriberDetailAddDialog,
    setShowModifySubscriberDetailAddDialog,
  ] = useState(false);
  const [showModifySubscriberSuccess, setShowModifySubscriberSuccess] =
    useState(false);
  const [selectedSubs, setSelectedSubs] = useState<SubsListDetail>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const [state, setState] = useState<string>("G,A,D,E,C,H");

  const fetchStartOrderFlow = async (): Promise<StartOrderFlow | undefined> => {
    try {
      setIsLoading(true);

      if (!selectedOperation) return undefined;

      const startOrder = mapToOrderPayload(selectedSubs, selectedUser);

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/START_ORDER_FLOW`,
        [startOrder],
      );

      const temp: StartOrderFlow = resp?.data;

      return temp;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startOrderFlow: UseQueryResult<StartOrderFlow | undefined, Error> =
    useQuery({
      queryKey: ["start-order-flow-modify-subs", selectedOperation],
      queryFn: fetchStartOrderFlow,
      enabled: !!selectedSubs && !!selectedOperation,
      // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
      refetchOnWindowFocus: false,
    });

  const fetchSubsList = async () => {
    setIsLoading(true);
    let SubsLocal: Record<number, SubsListDetail> = JSON.parse(
      localStorage.getItem("SUBS") ?? "{}",
    );
    let cust: Record<number, number[]> = JSON.parse(
      localStorage.getItem("CUST_SUBS") ?? "{}",
    );

    const custSubs = cust[selectedUser?.custId ?? 0] ?? [];
    const localCust: SubsListDetail[] = [];

    custSubs.forEach((cs) => localCust.push(SubsLocal[cs]));

    const payload = {
      custId: selectedUser?.custId,
      prodState: state,
      spId: 0,
    };

    const resp = await GetData(
      `${API_URL}/api/order-entry/subs-product/qry-subs-list/fiji`,
      payload,
    );

    const list: SubsListDetail[] = resp?.data ?? [];

    // sorting
    let processed = [...list, ...localCust];
    // pagination
    //  console.log(processed);
    setIsLoading(false);

    return {
      rows: processed,
      totalCount: processed.length,
    };
  };

  const result = useQuery({
    queryKey: ["subs-list", selectedUser?.custId, refreshKey, filter, state],
    queryFn: fetchSubsList,
    enabled: !!selectedUser?.custId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleOperationDialog = (show: boolean) => {
    // console.log(show);

    setShowOperationDialog(show);
  };

  const handleModifySubscriberDetailAddDialog = (show: boolean) => {
    setShowModifySubscriberDetailAddDialog(show);
  };

  const fetchOfferData = async () => {
    try {
      // console.log("line 178", selectedSubs, selectedOperation);

      if (selectedOperation?.subsEventId != "189") return [];
      const resp = await GetData(
        `${API_URL}/api/order-entry/common-service/qry-vas-pn-fiji`,
        {
          subsPlanId: selectedSubs?.subsPlanId,
          offerType: "3,4",
        },
      );

      if (resp.status) {
        setAvailableOffer(resp.data);
        return resp.data;
      }
      setAvailableOffer([]);
      return toast.error(resp.message);
    } catch (error) {
      return toast.error("Failed to Fetch data");
    } finally {
      // setIsLoading(false);
    }
  };

  const offerList: UseQueryResult<ModSubsService[], Error> = useQuery({
    queryKey: ["Offer-List", selectedSubs, selectedOperation],
    queryFn: () => fetchOfferData(),
    // enabled: !!selectedSubs,
    refetchOnWindowFocus: false,
  });

  // const fetchOwnedOffer = async () => {
  //   setOwnedOffer(mockModSubsHave);
  // };

  useEffect(() => {
    // setRefreshKey(refreshKey + 1);
    setSelectedOperation(undefined);
    setState("G,A,D,E,C,H");
  }, [selectedUser]);

  const columns = useMemo<ColumnDef<SubsListDetail>[]>(
    () => [
      { accessorKey: "subsPlanName", header: "Offer Name" },
      {
        accessorKey: "accNbr",
        header: "Service Number",
        cell: ({ row }) => (
          <Button
            size={"sm"}
            variant={"ghost"}
            onClick={() => {
              setSelectedSubs(row.original);
              setShowDetail(true);
            }}
            className="text-primary"
          >
            {row.original.accNbr}
          </Button>
        ),
      },
      { accessorKey: "prodStateName", header: "State" },
      { accessorKey: "blockReason", header: "Block Reason" },
      { accessorKey: "terminationReason", header: "Termination Reason" },
      { accessorKey: "terminationDate", header: "Termination Date" },
      { accessorKey: "activationDate", header: "Activation Date" },
      { accessorKey: "agreementExpDate", header: "Agreement Expiry Date" },
      {
        accessorKey: "nextStateName",
        header: "Next State",
        cell: ({ row }) => {
          return <div>{row.original.subsNextStateDto?.nextStateName}</div>;
        },
      },
      {
        accessorKey: "nextStateDate",
        header: "Next State Date",
        cell: ({ row }) => {
          return (
            <div>
              {row.original.subsNextStateDto?.nextStateDate.replace("T", " ")}
            </div>
          );
        },
      },
      {
        accessorKey: "operation",
        header: "Operation",
        cell: ({ row }: any) => (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-sm text-blue-600 border-blue-400 hover:bg-blue-50"
              onClick={() => {
                setSelectedSubs(row.original);
                handleOperationDialog(true);
                // console.log(row.original);
              }}
            >
              <KeenIcon icon="settings" className="text-blue-500" />
              Operation
            </Button>
          </div>
        ),
      },
    ],
    [refreshKey, state, filter],
  );

  const mapToOrderPayload = (
    subs: SubsListDetail | undefined,
    cust: CustomerInfo | undefined,
  ) => {
    return {
      custId: cust?.custId,
      custName: cust?.custName,
      acctId: subs?.acctId,

      subsEventId: selectedOperation?.subsEventId,
      contactChannelId: selectedOperation?.contactChannelId,

      subsId: subs?.subsId,
      offerId: subs?.offerId,
      servType: subs?.servType,
      // quantity: 1,

      subsPlanId: subs?.subsPlanId,
      subsPlanName: subs?.subsPlanName,
      acctNbr: subs?.acctNbr,

      routingId: cust?.routingId,
      areaId: cust?.areaId,
      orgId: null, //ini gw gk ada
      quantity: 1, //ini gw gk ada
      offerVerId: subs?.offerVerId,
      indepProdSpecId: null, //ini gw gk ada
      postpaid: null, //ini gw gk ada
      ebgOrder: null, //ini gw gk ada
      opportunityId: cust?.occupationId,
      custQuotationId: null, //ini gw gk ada
      seq: null, //ini gw gk ada
      staffJobId: 1, //ini gw gk ada
      staffId: 1, //ini gw gk ada
      prodState: subs?.prodState,
      custModifyType: "", //ini gw gk ada
      bindOrderItemId: null, //ini gw gk ada
      bindType: "", //ini gw gk ada
      parentSubsId: subs?.parentSubs,
      operationType: cust?.operationType,
      bundleMemberAlias: subs?.bundleMemAlias,
      srcOrderItemId: null, //ini gw gk ada
      batchResNum: null, //ini gw gk ada
    };
  };

  const builder = () => {
    if (!selectedOperation)
      return (
        <div className="relative">
          {isLoading && <Loading />}
          <OperationDialog
            servType={selectedSubs?.servType}
            subsId={selectedSubs?.subsId}
          />
          <SubsDetail isOpen={showDetail} handleDialog={setShowDetail} />
          {/* <DataGrid
            key={`${result.data?.rows}`}
            columns={columns}
            data={result.data?.rows ?? []}
            pagination={{
              page: 1,
              size: 10,
            }}
            serverSide={false}
            toolbar={<ListToolBar />}
            layout={{ card: true }}
            getRowProps={(row) => ({
              className: nonSelectedRowHighLight,
              onDoubleClick: () => {
                setShowDetail(true);
                setSelectedSubs(row.original);
              },
            })}
          /> */}
          {/* <ListToolBar/> */}
          <DataGridProvider
            key={`${result}`}
            columns={columns}
            toolbar={<ListToolBar />}
            // serverSide
            getRowProps={(row) => ({
              className: nonSelectedRowHighLight,
              onDoubleClick: () => {
                setShowDetail(true);
                setSelectedSubs(row.original);
              },
            })}
            layout={{ card: true }}
            data={result.data?.rows}
          >
            <DataGridInner />
          </DataGridProvider>
        </div>
      );
    const operation = selectedOperation.subsEventId;
    return (
      <Suspense fallback={<ScreenLoader />}>
        {(() => {
          switch (operation) {
            case "189":
              return <ModSubsForm />;
            // return <div>Ini MOd subs{``}</div>;
            case "329":
              return <BrandShiftForm />;
            case "28":
              return <SuspensionUnderRequest />;
            case "29":
              return <ReactivationUnderRequest />;
            case "68":
              return <SCLost />;
            case "69":
              return <SimCardRestore />;
            case "46":
              return <Termination />;
            case "50":
              return <ChangeSubsProf />;
            case "66":
              return <Replacement />;
            case "123":
              return <PFDial />;
            case "30001":
              return <RegisterCustInfo />;
            case "389":
              return <OneWayBlockOwe />;
            default:
              return <UnderConstructSubsOrder />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <SubscriberListContext.Provider
      value={{
        // doGetListData,
        showOperationDialog,
        handleOperationDialog,
        setShowModifySubscriberDetailAddDialog,
        showModifySubscriberDetailAddDialog,
        handleModifySubscriberDetailAddDialog,
        selectedSubs,
        setSelectedSubs,
        startOrderFlow,
        availableOffer,
        setAvailableOffer,
        ownedOffer,
        setOwnedOffer,

        showDialog,
        setShowDialog,
        filter,
        setFilter,
        state,
        setState,
        selectedOperation,
        setSelectedOperation,

        fetchOfferData,
        // fetchOwnedOffer,
        mapToOrderPayload,
        result,
        offerList,
        fetchStartOrderFlow,
        isLoading,
        setIsLoading,
      }}
    >
      <Container className="p-1">{builder()}</Container>
    </SubscriberListContext.Provider>
  );
};

export { SubscriberListContext, SubscriberListContextProvider };

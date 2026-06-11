import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import PublicOfferGroup from "../PublicOfferGroup";
import { useMainProductOfferListContext } from "../../hooks";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import AddPrivateOfferGroup, {
  AvailableOffer,
  OfferGroupMem,
} from "../../blocks/AddPrivateOfferGroup";
import { Button } from "@/components/ui/button";
import {
  ButtonCursor,
  ParentChildNode,
  PopUpDialog,
  PopUpProps,
} from "@/pages/main-menu/role-management/generalUseComp";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useOfferGroupHook } from "../../hooks/useOfferGroupHooks";
import PrivateOfferGroupChildContent from "../PrivateOfferGroupChildContent";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface PrivateOfferGroupContentProps {
  rowData: any;
}

export interface OfferGroupData {
  groupName: string;
  groupMode: string;
  isNecessary: string;
  defaultValue: string;
  csrVisible: string;
  agreementPeriod: string;
  feature: string;
}

export interface OfferGroupDataNew {
  offerGroupId?: number;
  offerGroupName?: string;
  offerGroupCode?: string;
  offerGroupType?: string;
  groupType?: string;
  upperLimit?: number;
  lowerLimit?: number;
  effDate?: string;
  expDate?: string;
  createdDate?: string;
  state?: string;
  stateDate?: string;
  shareFlag?: string;
  indepProdSpecId?: number;
  comments?: string;
  spId?: number;
  offerVerId?: number;
  networkType?: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

interface offerGroupParent {
  comments: string | null;
  effDate: string;
  expDate: string | null;
  groupType: "B" | "C";
  indepProdSpecId: number | null;
  // lowerLimit: any | null;
  necessary: "0" | "1";
  offerGroupCode: any | null;
  offerGroupId?: number;
  offerGroupName?: string;
  offerGroupType?: string;
  offerSubsPlanVerId: any | null;
  offerVerId: number;
  seq?: number;
  shareFlag: string;
  state: "A" | "X";
  // upperLimit: any | null;
  child?: OfferGroupNode[];
}

interface offerGroupMemIn {
  offerGroupMemId?: number;
  offerGroupId?: number;
  offerId?: number;
  networkType?: string;
  networkTypeName?: string;
  isPackage?: "N" | "Y";
  defaultFlag?: string;
  quantity?: any | null;
  saleListPrice?: any | null;
  offerGroupType?: string;
  offerEffDate?: string;
  offerExpDate?: string;
  packageMemList: any | null;
}

interface OfferGroupNode
  extends offerGroupParent,
    ParentChildNode,
    offerGroupMemIn,
    OfferGroupMem,
    AvailableOffer {}

type DialogType = "add" | string | null;

// const API_URL_OFFER = apiConfigOffer.offer;

const PrivateOfferGroupContent: React.FC<PrivateOfferGroupContentProps> = ({
  rowData,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPublicOfferGroupOpen, setIsPublicOfferGroupOpen] = useState(false);
  const { GetData, PutData, DeleteData } = useCallApi();
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const { menuPrivAccess } = useOfferLayout();
  const [alert, setAlert] = useState<boolean>(false);
  const { setDetailData } = useOfferGroupHook();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [related, setRelated] = useState<OfferGroupNode[]>([]);
  const [pricePlan, setPricePlan] = useState<OfferGroupNode[]>([]);
  const [goods, setGoods] = useState<OfferGroupNode[]>([]);
  const [defaultPlan, setDefaultPlan] = useState<OfferGroupNode[]>([]);

  const { setDetailModalData, detailModalData } =
    useMainProductOfferListContext();

  // const [expandedRow, setExpandedRow] = useState<String | null>(null);

  const { selectedVer } = useOfferLayout();

  const fetchParent = async (
    type: string,
    // indepProdSpecId: number
  ): Promise<OfferGroupNode[]> => {
    // console.log(data, "di parent");

    try {
      // console.log("test", selectedVer);

      const param = {
        // indepProdSpecId: data.indepProdSpecId,
        offerGroupType: type,
        shareFlag: "1",
        indepProdSpecId: rowData.indepProdSpecId,
        state: "A",
        // offerVerId: selectedVer?.offerVerId ?? 0,
        spId: 0,
      };

      // console.log(param);

      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-offer-group-and-member`,
        param,
      );

      const responseData = response.data;

      return responseData;
    } catch (error) {
      // console.log(error);

      return [];
    }

    // return [];
  };

  useEffect(() => {
    //  console.log("INI DATANYA", rowData);
    //  console.log("ini detailmodal", detailModalData);
  }, [rowData]);

  const handleShowAddDialog = useCallback((open: boolean) => {
    setIsAddDialogOpen(open);
  }, []);

  const handleShowPublicOfferGroup = useCallback((open: boolean) => {
    setIsPublicOfferGroupOpen(open);
  }, []);

  const initializeData = async (type?: "3" | "4" | "5" | "6") => {
    setIsLoading(true);
    expanded.clear();

    try {
      if (!type) {
        const related: OfferGroupNode[] = await fetchParent("3");
        const pricePlan: OfferGroupNode[] = await fetchParent("4");
        const goodsProd: OfferGroupNode[] = await fetchParent("5");
        const defaultPlan: OfferGroupNode[] = await fetchParent("6");
        // setPartys(newPartys);
        setRelated(related);
        setPricePlan(pricePlan);
        setGoods(goodsProd);
        setDefaultPlan(defaultPlan);

        return;
      }
      switch (type) {
        case "3":
          const related: OfferGroupNode[] = await fetchParent("3");
          setRelated(related);
          break;
        case "4":
          const pricePlan: OfferGroupNode[] = await fetchParent("4");
          setPricePlan(pricePlan);
          break;

        case "5":
          const goodsProd: OfferGroupNode[] = await fetchParent("5");
          setGoods(goodsProd);
          break;

        case "6":
          const defaultPlan: OfferGroupNode[] = await fetchParent("6");
          setDefaultPlan(defaultPlan);

          break;

        default:
          break;
      }
      // setSelectedDir(newPartys[0]);
      // setExpanded((prev) => new Set(prev).add(0));

      hasFetched.current = true;
    } catch (error) {
      toast.error("Failed on initializing data");
    } finally {
      setIsLoading(false);
      setDetailData(rowData);

      // if (data.length > 0) handleExpand(newPartys[0]);
    }
  };

  useEffect(() => {
    // console.log(rowData, "ini");

    if (!isAddDialogOpen) initializeData();
    // console.log("dimasukin ke row>", rowData);
  }, [selectedVer, isAddDialogOpen]);

  const OfferGroupToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-start item-center py-4">
      <div className="flex gap-3">
        <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="Add Group"> 
          <Button
            variant="default"
            className="h-7.5"
            onClick={() => handleShowAddDialog(true)}
          >
            Add Group
          </Button>
        </AccessWrapper>

        <DefaultTooltip title="Public Offer Group" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => handleShowPublicOfferGroup(true)}
          >
            <KeenIcon icon="plus" />
            Public Offer Group
          </Button>
        </DefaultTooltip>

        <DefaultTooltip title="Refresh Data">
          <Button
            className="h-7.5"
            variant="outline"
            onClick={() => initializeData()}
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <AddPrivateOfferGroup
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        group={selectedGroup}
        rowData={rowData}
        isPublic={false}
      />

      <PublicOfferGroup
        isOpen={isPublicOfferGroupOpen}
        onClose={() => setIsPublicOfferGroupOpen(false)}
        rowData={rowData}
        group={selectedGroup}
      />

      {/* Data Grid Offer Group */}
      <div className="">
        {isLoading && <Loading />}
        <OfferGroupToolbar />
        {/* <DataGridProvider
          key={`datagrid-${partys.length}`}
          columns={column}
          pagination={{ size: partys.length }}
          data={partys}
          toolbar={<OfferGroupToolbar />}
          // getSubRows={(row) => row.subRow ?? []}
          layout={{ card: true }}
          // sorting={[{ id: "featureName", desc: false }]}
          serverSide={false}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
        >
          <div className="border-[1px] rounded-lg ">
            <OfferGroupToolbar />
            <div className="overflow-y-auto">
              <DataGridTable />
            </div>
          </div>
        </DataGridProvider> */}
        {related.length > 0 && (
          <div>
            Related
            <PrivateOfferGroupChildContent
              rowData={rowData}
              rowParent={related}
              type="3"
              initFunct={initializeData}
            />
          </div>
        )}
        {pricePlan.length > 0 && (
          <div>
            Price Plan
            <PrivateOfferGroupChildContent
              rowData={rowData}
              rowParent={pricePlan}
              type="4"
              initFunct={initializeData}
            />
          </div>
        )}

        {goods.length > 0 && (
          <div>
            Goods Product
            <PrivateOfferGroupChildContent
              rowData={rowData}
              rowParent={goods}
              type="5"
              initFunct={initializeData}
            />
          </div>
        )}

        {defaultPlan.length > 0 && (
          <div>
            Default Pirice Plan
            <PrivateOfferGroupChildContent
              rowData={rowData}
              rowParent={defaultPlan}
              type="6"
              initFunct={initializeData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateOfferGroupContent;

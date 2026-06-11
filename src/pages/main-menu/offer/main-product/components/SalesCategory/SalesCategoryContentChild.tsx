import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import SelectOfferSalesCategoryChild from "./SelectOfferSalesCategoryChild";
import PublishOfferSalesCategoryChild from "./PublishOfferSalesCategoryChild";
import { selectedRowHigligt } from "@/styles/style";
import MoveOfferSalesCategoryChild from "./MoveOfferSalesCategoryChild";
import { SalesCategoryChildProps } from "./SalesCategoryChildInterface";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface SalesCategoryContentChildProps {
  selectedCategory?: any;
  categoryParent?: any;
  categoryChildren?: any;
  selectedOfferCategory?: any;
  selectedContentChild?: any;
  reload?: any;
  setSelectedContentChild: React.Dispatch<React.SetStateAction<any>>;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SalesCategoryContentChild = ({ selectedCategory, categoryParent, categoryChildren, selectedContentChild, setSelectedContentChild, selectedOfferCategory, reload }: SalesCategoryContentChildProps) => {
  const {menuPrivAccess} = useOfferLayout();
  const { GetData, PutData } = useCallApi();
  const [categoryContext, setCategoryContext] = useState<SalesCategoryChildProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelectOffer, setShowSelectOffer] = useState(false);
  const [showPublishOffer, setShowPublishOffer] = useState(false);
  const [showMoveOffer, setShowMoveOffer] = useState(false);
  const [sortedData, setSortedData] = useState<SalesCategoryChildProps[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<SalesCategoryChildProps[]>([]);
  const [update, setUpdate] = useState<number>(0);

  const handleShowSelectOffer = (open: boolean) => {
    setShowSelectOffer(open);
  };

  const handleShowPublishOffer = (open: boolean) => {
    setShowPublishOffer(open);
  };

  const handleShowMoveOffer = (open: boolean) => {
    setShowMoveOffer(open);
  };

  const handleSelectToEdit = (val: SalesCategoryChildProps) => {
    setSelectedContentChild(val);
  };

  const handleMoveSeq = async (currentItem: any, direction: "up" | "down") => {
    const currentIndex = sortedData.findIndex((item) => item.offerId === currentItem.offerId);

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sortedData.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetItem = sortedData[targetIndex];

    const payload = {
      offerCatgId: selectedCategory.offerCatgId,
      offerCatgMemId: currentItem.offerCatgMemId,
      offerSeqDto: {
        srcSeq: currentItem.seq,
        desSeq: targetItem.seq,
      },
    };

    try {
      setLoading(true);
      const response = await PutData(`${API_URL_OFFER}/offer/category/mod-offer-catg-mem-seq`, payload);

      if (response?.status) {
        await doGetListData(1, 10, [], []);
      } else {
        console.error("Failed to update sequence:", response?.message);
      }
    } catch (error: any) {
      console.error("Error updating sequence:", error);
    } finally {
      setLoading(false);
    }
  };

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await GetData(`${API_URL_OFFER}/offer/category/qry-offer-by-offer-catg-id`, {
          offerCatgId: selectedCategory?.offerCatgId ?? 0,
          offerType: "",
          spId: null,
        });

        // console.log(response);

        if (!response?.status) {
          throw new Error(response?.message || "Failed to fetch category data");
        }

        const list = response?.data?.list ?? response?.data ?? response ?? [];
        const categoryData = Array.isArray(list) ? list : [];

        setCategoryContext(categoryData);
        return {
          data: categoryData,
          totalCount: categoryData.length,
        };
      } catch (error: any) {
        console.error("Error fetching category data:", error);
        setError(error.message || "Unknown error");
        setCategoryContext([]);
        return { data: [], totalCount: 0 };
      } finally {
        setLoading(false);
      }
    },
    [GetData, selectedCategory?.offerCatgId, update],
  );

  const columns = useMemo<ColumnDef<SalesCategoryChildProps>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Name" column={column} />,
        cell: ({ row }) => {
          const isSelected = selectedContentChild?.offerId === row.original.offerId;
          return (
            <div onClick={() => handleSelectToEdit(row.original)} className={isSelected ? selectedRowHigligt : "cursor-pointer"}>
              {row.original.offerName}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.offerCode,
        id: "offerCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Product Code" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.offerTypeName,
        id: "offerTypeName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.operation,
        id: "operation",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operating" column={column} />,
        cell: ({ row }) => {
          const currentIndex = sortedData.findIndex((item) => item.offerId === row.original.offerId);
          const isFirst = currentIndex === 0;
          const isLast = currentIndex === sortedData.length - 1;

          return (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={isFirst} onClick={() => handleMoveSeq(row.original, "up")}>
                <KeenIcon icon="arrow-up" />
              </Button>
              <Button variant="ghost" size="sm" disabled={isLast} onClick={() => handleMoveSeq(row.original, "down")}>
                <KeenIcon icon="arrow-down" />
              </Button>
            </div>
          );
        },
        enabledSorting: true,
        enableHiding: false,
      },
    ],
    [selectedContentChild],
  );

  useEffect(() => {
    if (selectedCategory) {
      doGetListData(1, 10, [], []);
    }
  }, [selectedCategory, doGetListData]);

  useEffect(() => {
    setSelectedContentChild(categoryContext[0]);
  }, [categoryContext]);

  useEffect(() => {
    if (categoryContext.length > 0) {
      const sorted = [...categoryContext].sort((a, b) => (a.seq || 0) - (b.seq || 0));
      setSortedData(sorted);
      setSelectedContentChild(sorted[0]);
    }
  }, [categoryContext]);

  const handleSelectOffer = (item: SalesCategoryChildProps[]) => {
    setSelectedOffer(item)
  }

  useEffect(() => {
    if (categoryContext?.length > 0) {
      const updatedOffer = selectedOffer.filter((item: SalesCategoryChildProps) =>
        categoryContext.some((ctx: SalesCategoryChildProps) => ctx.offerId === item.offerId)
      );
      
      if (updatedOffer.length === 0) {
        handleSelectOffer([categoryContext[0]]);
      } else if (JSON.stringify(updatedOffer) !== JSON.stringify(selectedOffer)) {
        handleSelectOffer(updatedOffer);
      }
    } else {
      if (selectedOffer.length > 0) {
        handleSelectOffer([]);
      }
    }
  }, [categoryContext])

  return (
    <>
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
        <label className="text-gray-700 font-semibold text-lg">Offers</label>
      </div>

      <div className="pr-5 mb-2">
        <div className="flex gap-6">
          <div className="w-full flex justify-end items-center pt-5 gap-3">
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="Select Offer">
              <Button variant="default" onClick={() => handleShowSelectOffer(true)}>
                Select Offer
              </Button>
            </AccessWrapper>
            
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
              <Button variant="outline" onClick={() => handleShowPublishOffer(true)} disabled={!selectedContentChild}>
                Publish Offer
              </Button>
            </AccessWrapper>
           

            <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
              <Button variant="outline" onClick={() => handleShowMoveOffer(true)} disabled={!selectedContentChild}>
                Move Offer
              </Button>
            </AccessWrapper>
         

            <DefaultTooltip title="Refresh" placement="top">
              <Button variant="outline" className="h-10" onClick={() => reload()}>
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto max-h-[500px]">
        <div className="p-3">
          {/* {loading && <Loading />} */}
          <DataGridProvider
            columns={columns}
            data={categoryContext}
            pagination={{ size: 10 }}
            layout={{ card: false }}
            // sorting={[{ id: "offerName", desc: false }]}
            // serverSide={true}
            // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            //   return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
            // }}
          />

          <SelectOfferSalesCategoryChild isOpen={showSelectOffer} onClose={() => setShowSelectOffer(false)} selectedCategory={selectedCategory} selectedOffer={selectedOffer} setSelectedOffer={setSelectedOffer} reload={() => setUpdate(update + 1)} />
          <PublishOfferSalesCategoryChild isOpen={showPublishOffer} onClose={() => setShowPublishOffer(false)} selectedCategory={selectedCategory} categoryParent={categoryParent} categoryChildren={categoryChildren} selectedContentChild={selectedContentChild} reload={() => setUpdate(update + 1)} />
          <MoveOfferSalesCategoryChild isOpen={showMoveOffer} onClose={() => setShowMoveOffer(false)} selectedContentChild={selectedContentChild} selectedOfferCategory={selectedOfferCategory} categoriesParent={categoryParent} reload={() => setUpdate(update + 1)} />
        </div>
      </div>
    </>
  );
};

export default SalesCategoryContentChild;

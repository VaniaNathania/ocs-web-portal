import { ColumnDef } from "@tanstack/react-table";
import {
  BundleSubsPlanGrandChild,
  enrichedOfferData,
  enrichedSubsPlanData,
  FormDataOfferBundle,
  OfferBundParams,
} from "../types/BundleTypes";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useBundleOfferContext } from "../hooks/useBundleOfferContext";
import { useCallback } from "react";
import useApiBundleNew from "../UseApiBundle/UseApiBundleNew";
import { ToolBar } from "../components/Toolbar";
import AddBundleDetail from "../components/BundleMainPageComp/AddBundleDetail";
import DetailSubsBundleCatg from "../components/BundleMainPageComp/DetailSubsBundleCatg";
import DetailSubsPlanBundleCatg from "../components/BundleMainPageComp/DetailSubsPlanBundleCatg";

const BundleMainPage = () => {
  const {
    reloads,
    toggleSideBar,
    sideBarOpen,
    showDetailSideBarView,
    selectCategorySide,
    selectDetailSideBarBundle,
    loading,
    selectCategorySideId,
    parentBundOfferData,
    setSubsPlanBundle,
    setParentBundOfferData,
    setLoading,
    setSideBarOpen,
    toggleSideBarOpen,
    setShowDetailSideBarView,
    setSelectCategorySide,
    setSelectDetailSideBarBundle,
    setActivatedSubsItem,
    refreshDataGridBundleKey,
  } = useBundleOfferContext();

  const { getListFormDataOffer } = useApiBundleNew();

  const handleOpenOfferDetail = (rowData: OfferBundParams) => {
    const data: enrichedOfferData = {
      ...rowData,
      dataType: "offer",
      openSource: "sidebar",
    };

    setSelectDetailSideBarBundle(data);
    setSelectCategorySide(rowData.offerName);
    setShowDetailSideBarView(true);
    setActivatedSubsItem(rowData.offerName);
  };

  const handleOpenSubsPlanDetail = (rowData: OfferBundParams) => {
    const data = {
      ...rowData,
      dataType: "subsPlan",
      openSource: "sidebar" as const,
    };

    setSelectDetailSideBarBundle(data);
    setSelectCategorySide(rowData.offerName);
    setShowDetailSideBarView(true);
    setActivatedSubsItem(rowData.subsPlanName);
  };

  const handleBackListBundDetail = useCallback(() => {
    setShowDetailSideBarView(false);
    setSelectCategorySide(null);
    setActivatedSubsItem(null);
    setSelectDetailSideBarBundle(null);
  }, []);

  const HandleParentOfferBackList = useCallback(() => {
    if (parentBundOfferData) {
      const dataParent = {
        ...parentBundOfferData,
        dataType: "offer",
        openSource: "main" as const,
      };

      setSelectDetailSideBarBundle(dataParent);
      setSelectCategorySide(dataParent.offerName);
      setShowDetailSideBarView(true);
      setActivatedSubsItem(parentBundOfferData.offerName);
      setParentBundOfferData(null);
    } else {
      handleBackListBundDetail();
    }
  }, []);

  const updateSubsPlanSideBarBundle = useCallback(
    (updateBundPlan: BundleSubsPlanGrandChild) => {
      setSubsPlanBundle((prev) => {
        const keyFind =
          updateBundPlan.indepProdSpecId || updateBundPlan.offerId;

        if (keyFind === null) return prev;

        if (prev[keyFind]) {
          const newStateBund = {
            ...prev,
            [keyFind]: prev[keyFind].map(
              (planBund: BundleSubsPlanGrandChild) => {
                return planBund.subsPlanId === updateBundPlan.subsPlanId
                  ? { ...planBund, ...updateBundPlan }
                  : planBund;
              },
            ),
          };
          return newStateBund;
        }
        return prev;
      });
    },
    [],
  );

  const doGetListOffer = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      setLoading(true);

      try {
        const response = await getListFormDataOffer();

        if (!response) {
          throw new Error("Failed to fetch offer data");
        }

        const { data, totalCount } = response;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginationData = data.slice(startIndex, endIndex);
        //  console.log({
        //   data: paginationData,
        //   totalCount,
        //   pageCount: Math.ceil(totalCount / limit),
        //   nextPage: page * limit < totalCount,
        //   prevPage: page > 1,
        //   currentPage: page,
        // });
        return {
          data: paginationData,
          totalCount,
          pageCount: Math.ceil(totalCount / limit),
          nextPage: page * limit < totalCount,
          prevPage: page > 1,
          currentPage: page,
        };
      } catch (error) {
        //  console.log("❌ Error fetching offer data:", error);

        return {
          data: [],
          totalCount: 0,
          pageCount: 0,
          nextPage: false,
          prevPage: false,
          currentPage: 1,
        };
      } finally {
        setLoading(false);
      }
    },
    [getListFormDataOffer],
  );

  const columns: ColumnDef<OfferBundParams>[] = [
    {
      accessorFn: (row) => row.offerName,
      id: "BundleName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Bundle Name" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const data = row.original;
        return (
          <button
            className="font-medium text-left transition-all duration-200 text-red-500 hover:text-blue-800"
            onClick={() => handleOpenOfferDetail(data)}
            title="View Details"
          >
            <div className="flex items-center gap-2">
              <span>{data.offerName}</span>
            </div>
          </button>
        );
      },
    },
    {
      accessorFn: (row) => row.offerCode,
      id: "bundleCode",
      header: ({ column }) => (
        <DataGridColumnHeader title="Bundle Code" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => (row.paidFlag === "N" ? "Pre-Paid" : "Post-Paid"),
      id: "paidFlag",
      header: ({ column }) => (
        <DataGridColumnHeader title="Paid Flag" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.effType,
      id: "effType",
      header: ({ column }) => (
        <DataGridColumnHeader title="effective Type" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => row.effDate,
      id: "validPeriod",
      header: ({ column }) => (
        <DataGridColumnHeader title="Valid Period" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "Options",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Options"
          className="text-center"
          column={column}
        />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              //onClick=({}=> handleOpenEditModal(row));
              title="Edit"
            >
              <KeenIcon icon="notepad-edit" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              title="Delete"
              //onClick=({}=> handleOpenDeleteModal(true, row.offerId));
            >
              <KeenIcon icon="trash" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 px-2 h-[90vh]">
      <div className="relative shadow-md border-[1px] h-full overflow-y-auto pb-5">
        <button
          onClick={toggleSideBarOpen}
          className={`transition-all duration-300 ${toggleSideBar ? "opacity-0" : "opacity-100"} absolute -left-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md z-10 `}
        >
          {toggleSideBar ? (
            <KeenIcon icon="left-square" />
          ) : (
            <KeenIcon icon="right-square" />
          )}
        </button>

        <h2 className="text-xl font-normal text-gray-900 mb-5 mt-5 ml-10">
          Bundle List
        </h2>
        <div className="flex-1 pt-0">
          {showDetailSideBarView &&
          selectCategorySide &&
          selectDetailSideBarBundle ? (
            <>
              {selectDetailSideBarBundle?.dataType === "offer" && (
                <DetailSubsBundleCatg
                  subCategory={selectCategorySide}
                  onBack={handleBackListBundDetail}
                  rowData={selectDetailSideBarBundle as enrichedOfferData}
                  isOpen={showDetailSideBarView}
                  openSource={selectDetailSideBarBundle?.openSource}
                  onClose={handleBackListBundDetail}
                />
              )}

              {selectDetailSideBarBundle?.dataType === "subsPlan" && (
                <DetailSubsPlanBundleCatg
                  subCategory={selectCategorySide}
                  rowData={selectDetailSideBarBundle as enrichedSubsPlanData}
                  isOpen={showDetailSideBarView}
                  onClose={handleBackListBundDetail}
                  onBack={HandleParentOfferBackList}
                  onSuccess={() => {
                    refreshDataGridBundleKey();
                  }}
                  onUpdatePlanInSidebar={updateSubsPlanSideBarBundle}
                />
              )}
            </>
          ) : (
            <div></div>
          )}
        </div>

        <div className="p-7 h-[480px]">
          <AddBundleDetail />
          <DataGridProvider
            key={selectCategorySideId}
            columns={columns}
            toolbar={<ToolBar />}
            layout={{ card: true }}
            pagination={{ size: 10 }}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetListOffer(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
            serverSide={true}
          ></DataGridProvider>
        </div>
      </div>
    </div>
  );
};

export default BundleMainPage;

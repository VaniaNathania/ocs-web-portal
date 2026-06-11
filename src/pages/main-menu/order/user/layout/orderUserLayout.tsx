import { KeenIcon } from "@/components";
import { useOrder } from "../../hooks/orderContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lazy, useEffect, useState } from "react";
import SearchResultDialog from "../../block/ResultSearchDialog";
import AdvanceSearchDialog from "../../block/AdvanceSearch";
import CustDetailInfoDialog from "../../block/CustomerDetailDialog";
import AddCostomerDialog from "../../block/AddCustomerDialog";
import { verticalLineDivider } from "@/styles/style";
import { useLoaders } from "@/providers";
import { OrderSideBar } from "../../models/interfaces";
import { useOrderLayout } from "@/layouts/main-menu/order";

const AccInfoMain = lazy(
  () => import("@/pages/main-menu/order/user/menu/accInfo/AccountInformation"),
);
const AccBalanceMain = lazy(
  () => import("@/pages/main-menu/order/user/menu/accBalance/AccBalance"),
);
const ModifyHistoryMain = lazy(
  () => import("@/pages/main-menu/order/user/menu/modHistory/ModifyHistory"),
);
const SubscriberNotesMain = lazy(
  () => import("@/pages/main-menu/order/user/menu/subsNotes/SubscriberNotes"),
);
const SubscriberListPage = lazy(
  () =>
    import("@/pages/main-menu/order/user/menu/subscriber/SubscriberListPage"),
);

const OrderOrderListPage = lazy(
  () => import("@/pages/main-menu/order/user/menu/order/OrderListPage.tsx"),
);

const OrderUserLayot = () => {
  const {
    selectedSideBar,
    setSelectedSideBar,
    search,
    setSearch,
    selectedUser,
    setSelectedUser,
  } = useOrder();
  const { setActiveTab } = useOrderLayout();
  const { setScreenLoader } = useLoaders();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [activeTabUser, setActiveTabUser] = useState<string>("Subscriber");
  const [showAdvanceSearch, setShowAdvanceSearch] = useState<boolean>(false);
  const [isClose, setIsClose] = useState<boolean>(false);

  const sideBarItem: OrderSideBar[] = [
    { title: "Subscriber", icon: "element-11", path: "/" },
    { title: "Order", icon: "shop", path: "/order" },
    { title: "Account Information", icon: "user", path: "/account-info" },
    { title: "Account Balance", icon: "dollar", path: "/account-balance" },
    { title: "Modify History", icon: "watch", path: "/modify-history" },
    { title: "Subscriber Notes", icon: "note", path: "/subscriber-notes" },
  ];

  useEffect(() => {
    setSelectedSideBar(sideBarItem[0]);
    setScreenLoader(false);
    setActiveTabUser("Subscriber");
  }, [selectedUser]);

  const logOut = () => {
    setSelectedUser(undefined);
  };

  const goToShop = () => {
    setActiveTab("shop");
  };

  return (
    <div className="w-full min-h-[90vh] flex flex-row">
      <SearchResultDialog isOpen={showSearch} handleDialog={setShowSearch} />
      <AdvanceSearchDialog
        isOpen={showAdvanceSearch}
        handleDialog={setShowAdvanceSearch}
      />
      <AddCostomerDialog isOpen={showAdd} handleDialog={setShowAdd} />
      <CustDetailInfoDialog isOpen={showInfo} handleDialog={setShowInfo} />
      {/* sidebar */}
      <div
        className={`min-h-full border-r-2 relative transition-all duration-300 bg-white
        ${isClose ? "w-0 overflow-hidden" : "w-60"}`}
      >
        <div className={`h-full flex flex-col items-center `}>
          <div className="h-20 flex items-center">
            <KeenIcon
              className="text-6xl text-red-600"
              icon="shop"
              style="duotone"
            />
          </div>
          {sideBarItem.map((item, index) => {
            const isActive = selectedSideBar?.title === item.title;

            return (
              <div
                key={index}
                onClick={() => {
                  // console.log(item.path === selectedSideBar?.path, "ini");

                  if (item.path === selectedSideBar?.path) return;
                  // console.log("click", item.path);

                  // start();

                  // setScreenLoader(true);
                  setActiveTabUser(item.title);
                  setSelectedSideBar(item);
                }}
                className={`
                relative w-full flex flex-row items-center p-2 gap-2 pl-5 cursor-pointer
                transition-all duration-200 hover:bg-primary-clarity
                before:content-[''] before:absolute before:left-0 before:top-0 
                before:h-full before:transition-all before:duration-200
                ${
                  isActive
                    ? "before:w-[10px] before:rounded-r-md before:bg-primary"
                    : "before:w-0 before:bg-transparent "
                }
              `}
              >
                <KeenIcon icon={item.icon} className="m-auto" />
                <div className="flex-1 text-md">{item.title}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* content */}
      <div className="flex-1 relative flex flex-col">
        <div
          className={`absolute top-[50%] -left-5 text-sm translate-x-[50%] translate-y-[50%] transition-all duration-200 z-5
             bg-primary-active text-white rounded-md cursor-pointer flex items-center ${isClose ? "rotate-180 -left-[15px]" : "-left-5"}`}
          onClick={() => setIsClose(!isClose)}
        >
          <KeenIcon icon="left" className="p-1" />
        </div>
        <div className="h-20 bg-slate-100 flex flex-col px-2 ">
          <div className="h-1/2 flex flex-row items-center justify-between text-sm">
            <div className="flex flex-row gap-2 w-1/2">
              <Input
                size="sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Customer Name/ Service Number/ Doc Number"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search != "") {
                    e.preventDefault(); // ✅ Stop form submission / blur
                    setShowSearch(true);
                    // setSearch("");
                  }
                }}
              />

              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => setShowAdvanceSearch(true)}
              >
                <KeenIcon icon="double-down" />
              </Button>
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => setShowAdd(!showAdd)}
              >
                <KeenIcon icon="plus" />
              </Button>
            </div>
            <div className="flex flex-row h-full items-center">
              <Button variant={"ghost"} onClick={logOut}>
                <KeenIcon icon="exit-right" />
                <div>Log Out</div>
              </Button>
              <div className={verticalLineDivider} />
              <Button variant={"ghost"} onClick={goToShop}>
                <KeenIcon icon="shop" />
                <div>Go Shop</div>
              </Button>
            </div>
          </div>
          <div className="h-1/2 flex flex-row items-center gap-5">
            <div
              className="flex flex-row items-center gap-2 cursor-pointer"
              onClick={() => setShowInfo(!showInfo)}
            >
              <div>{selectedUser?.custName}</div>
              {selectedUser?.gender != "" && (
                <KeenIcon
                  icon="user"
                  className={
                    selectedUser?.gender === "M"
                      ? "text-blue-700"
                      : "text-pink-600"
                  }
                  style="solid"
                />
              )}
            </div>
            <div className={verticalLineDivider} />
            <div className="w-[15px] text-primary">
              <svg
                xmlns="http://www.w3.org/20001/svg"
                viewBox="0 0 57 47"
                className="w-full h-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9.5 19V11H1V42.5H9.5V36.5M9.5 19C10.8333 16.8333 12.5 15 17.5 15C23.1 17 32.5 24 36 26.5C37.1851 28.1591 38.4544 30.998 36.932 32.5M9.5 19V36.5M22 29L33.5 33.5C35.2337 33.5 36.3134 33.1104 36.932 32.5M9.5 36.5L27.5 44.5C29.3333 45.5 34 46.9 38 44.5C42 42.1 50.3333 37.1667 54 35C56 32 57.5 26.3 47.5 27.5C38.3 31.9782 36.6213 32.6993 36.932 32.5" />
                <circle cx="29" cy="7" r="6" />
                <path d="M33 11L36.5 14.5M40 18L36.5 14.5M36.5 14.5L39 12" />
              </svg>
            </div>
            <div className={verticalLineDivider} />
            <div>Doc Type : {selectedUser?.certTypeName}</div>
            <div className={verticalLineDivider} />
            <div>Doc Number : {selectedUser?.certNbr}</div>
          </div>
        </div>

        <div className="flex-1">
          {activeTabUser === "Subscriber" && <SubscriberListPage />}
          {activeTabUser === "Order" && <OrderOrderListPage />}
          {activeTabUser === "Account Information" && <AccInfoMain />}
          {activeTabUser === "Account Balance" && <AccBalanceMain />}
          {activeTabUser === "Modify History" && <ModifyHistoryMain />}
          {activeTabUser === "Subscriber Notes" && <SubscriberNotesMain />}
          {/* {activeTabUser === "Go Shop" && <OrderShopMain />} */}
        </div>
      </div>
    </div>
  );
};

export default OrderUserLayot;

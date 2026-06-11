import { useMenus } from "@/providers";
import { Outlet, useLocation } from "react-router";
import { Toolbar, ToolbarHeading } from "../toolbar";
import Sidebar from "../sidebar/Sidebar";
import { lazy } from "react";
import { useAccountConfigLayout } from "../AccountConfigLayoutProvider";

// account config
const AccountBalance = lazy(
  () =>
    import(
      "@/pages/main-menu/account-config/account-balanceType/AccountBalance"
    ),
);
const AccountItem = lazy(
  () => import("@/pages/main-menu/account-config/account-item/AccountItem"),
);
const AccountFeature = lazy(
  () =>
    import("@/pages/main-menu/account-config/account-feature/AccountFeature"),
);
const PaymentMethod = lazy(
  () => import("@/pages/main-menu/account-config/payment-method/PaymentMethod"),
);
const Installment = lazy(
  () => import("@/pages/main-menu/account-config/installment/Installment"),
);
const BillingCycle = lazy(
  () => import("@/pages/main-menu/account-config/billing-cycle/BillingCycle"),
);
const Bank = lazy(() => import("@/pages/main-menu/account-config/bank/Bank"));
const Deposit = lazy(
  () => import("@/pages/main-menu/account-config/deposit/Deposit"),
);

const MainMt = () => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  const { activeTab, setActiveTab } = useAccountConfigLayout();

  return (
    <div className="flex flex-1">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="grow bg-gray-100" role="content">
          <div
            key={"account-balance"}
            hidden={activeTab !== "account-balance"}
            className="flex-1"
          >
            <AccountBalance />
          </div>
          <div
            key={"account-feature"}
            hidden={activeTab !== "account-feature"}
            className="flex-1"
          >
            <AccountFeature />
          </div>
          <div
            key={"account-item"}
            hidden={activeTab !== "account-item"}
            className="flex-1"
          >
            <AccountItem />
          </div>
          <div key={"bank"} hidden={activeTab !== "bank"} className="flex-1">
            <Bank />
          </div>
          <div
            key={"billing-cycle"}
            hidden={activeTab !== "billing-cycle"}
            className="flex-1"
          >
            <BillingCycle />
          </div>
          <div
            key={"deposit"}
            hidden={activeTab !== "deposit"}
            className="flex-1"
          >
            <Deposit />
          </div>
          <div
            key={"installment"}
            hidden={activeTab !== "installment"}
            className="flex-1"
          >
            <Installment />
          </div>
          <div
            key={"payment-method"}
            hidden={activeTab !== "payment-method"}
            className="flex-1"
          >
            <PaymentMethod />
          </div>
        </main>
      </div>
    </div>
  );
};

export { MainMt };

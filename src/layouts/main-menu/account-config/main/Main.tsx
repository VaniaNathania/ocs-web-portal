import { useMenuCurrentItem } from "@/components/menu";
import { useMenus } from "@/providers";
import { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import { Toolbar, ToolbarHeading } from "../toolbar";
import {
  Bookmark,
  Building,
  Calendar,
  ChevronRight,
  CreditCard,
  DollarSign,
  Gift,
  Package,
  Settings,
  UserCheck,
} from "lucide-react";
import Sidebar from "../sidebar/Sidebar";
import { useAccountConfigLayout } from "../AccountConfigLayoutProvider";
import { Header } from "../../header";
import { Footer } from "../../footer";

const Main = () => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  const menuItem = useMenuCurrentItem(pathname, menuConfig);
  const { headerSticky } = useAccountConfigLayout();

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title || "Dashboard"}</title>
      </Helmet>

      <div className="flex grow flex-col [[data-sticky-header=on]_&]:pt-[--tw-header-height-default]">
        <Header headerSticky={headerSticky} />

        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <main className="grow bg-gray-100" role="content">
              <Toolbar>
                <ToolbarHeading />
              </Toolbar>

              <Outlet />
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };

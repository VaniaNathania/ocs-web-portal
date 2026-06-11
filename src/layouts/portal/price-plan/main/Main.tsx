import { useMenuCurrentItem } from "@/components/menu";
import { useMenus } from "@/providers";
import { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import { Footer, Header, Navbar, usePortalLayout } from "../";
import { Toolbar, ToolbarHeading } from "../toolbar";
import { shouldShowLoader } from "../utils/showLoader";
import { Loader } from "@/components/common/Loading";

const Main = () => {
  const { isLoading } = usePortalLayout();
  const { pathname, state } = useLocation();
  const { selectedOfferVerId, dataPricePlanDetail } = state || {};

  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  // console.log(dataPricePlanDetail, "main");

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>
      <div className="flex grow flex-col [[data-sticky-header=on]_&]:pt-[--tw-header-height-default]">
        {/* <Header /> */}
        <Navbar />

        <main className="grow" role="content">
          {isLoading ||
          shouldShowLoader(selectedOfferVerId, dataPricePlanDetail) ? (
            <Loader title="Loading Price Plan" />
          ) : (
            <Outlet />
          )}
        </main>

        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };

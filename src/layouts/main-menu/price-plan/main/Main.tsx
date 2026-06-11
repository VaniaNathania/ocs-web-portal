import { useMenuCurrentItem } from "@/components/menu";
import { useMenus } from "@/providers";
import { Fragment, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { Navbar, usePricePlanLayout } from "../";
import { Toolbar, ToolbarHeading } from "../toolbar";
import { Header } from "../../header";
import { Footer } from "../../footer";
import { PricePlanTabs } from "../blocks/PricePlanTabs";

const Main = () => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  const menuItem = useMenuCurrentItem(pathname, menuConfig);
  const { headerSticky } = usePricePlanLayout();

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>

      <div className="flex grow flex-col [[data-sticky-header=on]_&]:pt-[--tw-header-height-default]">
        <Header headerSticky={headerSticky} />

        <div className="grow" role="content">
          <Toolbar>
            <ToolbarHeading />
          </Toolbar>

          <div className="container-fixed">
            {/* Tab-based content instead of Outlet */}
            <PricePlanTabs />
            {/* <AddDialog /> */}
          </div>
        </div>

        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };

import { useMenuCurrentItem } from "@/components/menu";
import { useMenus } from "@/providers";
import { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import { Navbar, useDemo2Layout } from "../";
import { Toolbar, ToolbarHeading } from "../toolbar";
import { Header } from "@/layouts/main-menu/header";
import { Footer } from "@/layouts/main-menu/footer";

const Main = () => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  const menuItem = useMenuCurrentItem(pathname, menuConfig);
  const { headerSticky } = useDemo2Layout();

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>
      <div className="flex grow flex-col [[data-sticky-header=on]_&]:pt-[--tw-header-height-default]">
        <Header headerSticky={headerSticky} />

        <Navbar />

        <main className="grow" role="content">
          <Toolbar>
            <ToolbarHeading />
          </Toolbar>

          <Outlet />
        </main>
        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };

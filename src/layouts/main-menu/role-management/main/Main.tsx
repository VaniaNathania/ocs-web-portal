import { useMenuCurrentItem } from "@/components/menu";
import { useMenus } from "@/providers";
import { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import { Navbar, useRoleLayout } from "..";
import { SideBar } from "../sidebar/SideBar";
import { Header } from "../../header";
import { Footer } from "../../footer";

const Main = () => {
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const { headerSticky } = useRoleLayout();
  const menuConfig = getMenuConfig("primary");
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  return (
    <Fragment>
      <Helmet>
        <title>{menuItem?.title}</title>
      </Helmet>
      <div className="flex grow flex-col h-fit bg-gray-50">
        <Header headerSticky={headerSticky} />
        <Navbar />
        {/* <main className="grow" role="content">
          <Outlet />
          </main> */}
        <main className="grow bg-gray-100" role="content">
          <div className="flex flex-col  px-5 mb-5 space-y-5 lg:space-x-5 lg:space-y-0 lg:flex-row">
            <div className="w-full lg:w-1/3 ">
              <SideBar />
            </div>
            <div className="lg:w-2/3">
              <Outlet />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </Fragment>
  );
};

export { Main };

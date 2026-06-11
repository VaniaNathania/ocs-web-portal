import { useMenuCurrentItem } from "@/components/menu";
import { useMenus } from "@/providers";
import { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import { Navbar, usePortalLayout } from "..";
import { SideBar } from "../sidebar/SideBar";
import { Header } from "../../header";
import { Footer } from "../../footer";
import PortalManagement from "@/pages/main-menu/portal-management/outlet/component/component";

const MainMultiTab = () => {
  return (
    <div className="grow bg-gray-100">
      <Navbar />
      <div className="flex flex-col  p-5 mb-5 space-y-5 lg:space-x-5 lg:space-y-0 lg:flex-row">
        <div className="w-full lg:w-1/3 ">
          <SideBar />
        </div>
        <div className="lg:w-2/3">
          {/* <Outlet /> */}
          <PortalManagement />
          {/* <div className="h-[90vh]"></div> */}
        </div>
      </div>
    </div>
  );
};

export { MainMultiTab };

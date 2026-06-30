import { Fragment, Suspense } from "react";
import { Header } from "./header";
import useMultiTab from "../hooks/useContext";
import { ScreenLoader } from "@/components";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/layouts/main-menu/footer";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";

export const Main = () => {
  const { tabs, activeTab, setPopUpProfile, popUpProfile, openProfile } =
    useMultiTab();

  const PopUpOpenProfile = async () => {
    try {
      openProfile();
    } catch (error) {
      console.log(error);
    } finally {
      setPopUpProfile(false);
    }
  };

  return (
    <Fragment>
      <Helmet>
        <title>{activeTab}</title>
      </Helmet>
      <div className="grow relative flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <Suspense fallback={<ScreenLoader />}>
            {tabs.map((tab) => {
              const Component = tab.component;
              return (
                <div
                  key={tab.id}
                  hidden={activeTab !== tab.id}
                  className="flex-1"
                >
                  <Component />
                </div>
              );
            })}
          </Suspense>
        </div>
        <Footer />
      </div>
    </Fragment>
  );
};

export default Main;

import BundleMainPage from "./blocks/BundleMainPage";
import BundleMainSideBar from "./blocks/BundleMainSideBar";
import AddBundleDetail from "./components/BundleMainPageComp/AddBundleDetail";
import { BundleOfferContextProvider } from "./hooks/BundleOfferContext";

const BundleNewPage = () => {
  return (
    <BundleOfferContextProvider>
      <div className="flex w-full h-screen">
        <div className="border-r">
          <BundleMainSideBar />
        </div>

        <div className="flex-1 overflow-auto">
          <BundleMainPage />
        </div>
        <AddBundleDetail />
      </div>
    </BundleOfferContextProvider>
  );
};

export default BundleNewPage;

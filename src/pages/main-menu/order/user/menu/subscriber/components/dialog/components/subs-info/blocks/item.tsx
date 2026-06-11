import { Error404Page } from "@/errors";
import Detail from "../components/detail/Detail";
import { useOrderSubsDetailSubsInfo } from "../hooks/SubsDetailSubsInfoContext";
import UnderConstruction from "@/components/common/UnderConstruction";
import Service from "../components/service/Service";
import RelatedTable from "../components/relatedSubs/RelatedSubs";
import ResourceTable from "../components/resource/Resource";
import GoodsTable from "../components/goods/Goods";
import ProdStateStack from "../components/prodStateStack/ProdStateStack";
import CompanyTable from "../components/company/Company";
import ProdLifeCycleCalcTable from "../components/prodLifeCycleCalc/ProdLifeCycleCalc";

const Item = () => {
  const { selectedMenu } = useOrderSubsDetailSubsInfo();

  switch (selectedMenu) {
    case "detail":
      return <Detail />;

    case "service":
      return <Service />;

    case "related":
      return <RelatedTable />;

    case "resource":
      return <ResourceTable />;

    case "goods":
      return <GoodsTable />;

    case "tracks":
      return <ProdStateStack />;
    case "company":
      return <CompanyTable />;

    case "lifecycle":
      return <ProdLifeCycleCalcTable />;

    default:
      return <UnderConstruction />;
  }
};

export default Item;

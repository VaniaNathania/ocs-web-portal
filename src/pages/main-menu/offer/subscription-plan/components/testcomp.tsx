import { OfferGroupData } from "./DetailCategoryContent/PublicOfferGroupSubsPlan";

export const TestComp = ({
  rowData,
}: {
  rowData: OfferGroupData | undefined;
}) => {
  return <div>{rowData?.offerGroupName}</div>;
};

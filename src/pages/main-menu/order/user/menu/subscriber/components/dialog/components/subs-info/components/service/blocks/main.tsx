import FellowNumberTable from "../components/table/FellowNumber";
import HomeZoneTable from "../components/table/HomeZone";
import ServiceTable from "../components/table/Service";

const Main = () => {
  return (
    <div className="flex flex-col text-sm gap-5">
      <ServiceTable />
      <FellowNumberTable />
      <HomeZoneTable />
    </div>
  );
};

export default Main;

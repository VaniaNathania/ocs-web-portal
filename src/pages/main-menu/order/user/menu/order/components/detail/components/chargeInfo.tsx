import Detail from "./chargeInfoComp/detail";
import Table from "./chargeInfoComp/table";

const Chargeinfo = () => {
  return (
    <div className="flex flex-col gap-2">
      <Detail />
      <Table />
    </div>
  );
};

export default Chargeinfo;

import AdvanceSearchQuery from "../component/QueryField";
import SearchTable from "../component/SearchTable";
import { ParentDialogProps } from "@/pages/main-menu/role-management/generalUseComp";
import { useSearch } from "../hooks/SearchContext";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Main = ({ isOpen, handleDialog }: ParentDialogProps) => {
  // const navigate = useNavigate();
  const { selectedTemp, setSelectedRow, setQuery, query, rows } = useSearch();

  useEffect(() => {
    //  console.log(isOpen, query, rows.length);

    if (query.page != 1 || rows.length != 0)
      setQuery({
        page: 1,
        size: 5,
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
        spId: 0,
      });
  }, [isOpen]);
  return (
    <div className="flex flex-col py-5 gap-5">
      <AdvanceSearchQuery />
      <SearchTable />
      <div className="flex flex-row gap-2 w-full justify-end">
        <Button
          size={"sm"}
          onClick={() => {
            // navigate(`/payment/${selectedTemp?.acctNbr}`);
            setSelectedRow(selectedTemp);
            handleDialog(false);
          }}
        >
          OK
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => {
            handleDialog(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Main;

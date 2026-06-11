import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShareToOther } from "../hooks/context";
import { useDataGrid } from "@/components";

interface props {
  reload: () => void;
}

const ListToolBar = ({ reload }: props) => {
  const {
    setBalShare,
    setBalHistory,
    setSelectedBal,
    selectedBal,
    setIsBalShareAdding,
    setBalShareDelete,
  } = useShareToOther();
  // const { reload } = useDataGrid();
  return (
    <div className=" flex flex-wrap justify-between p-5 gap-2">
      <div className="flex flex-row gap-2">
        <div className="flex flex-row items-center gap-2">
          <Label className="whitespace-nowrap">Service Number</Label>
          <Input size={"sm"} />
        </div>
        <div className="flex flex-row gap-2">
          <Button size={"sm"}>Query</Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              reload();
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => {
            setBalShare(true);
            setSelectedBal(undefined);
            setIsBalShareAdding(true);
          }}
        >
          Add Balance Share
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => {
            setBalShare(true);
            setIsBalShareAdding(false);

            // setSelectedBal(undefined);
          }}
          disabled={!selectedBal}
        >
          Edit Balance Share
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          disabled={!selectedBal}
          onClick={() => setBalShareDelete(true)}
        >
          Delete Balance Share
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => setBalHistory(true)}
        >
          Query Balance Share History
        </Button>
      </div>
    </div>
  );
};

export default ListToolBar;

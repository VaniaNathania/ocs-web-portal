import { KeenIcon } from "@/components";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUploadSimCardContext } from "../hooks/useUploadSimCardContext";
import { HiOutlineLightBulb } from "react-icons/hi";

const Log = () => {
  const { logOpen, setLogOpen } = useUploadSimCardContext();
  const toogleLog = () => {
    setLogOpen(true);
  };

  return (
    <>
      {logOpen ? (
        <div className="flex flex-col w-[500px] bg-white border shadow-lg rounded-md h-[70vh] p-2">
          <div className="flex flex-row items-center justify-between">
            <Label>Log</Label>
            <Button variant="ghost" size="sm" onClick={() => setLogOpen(false)} className="">
              <KeenIcon icon="right" />
            </Button>
          </div>
          <div className="flex-1">
            <p className="w-full h-full flex items-center justify-center">No Record View</p>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <Button variant="outline" className="shadow-md bg-white hover:bg-gray-100" onClick={toogleLog}>
            <HiOutlineLightBulb />
          </Button>
        </div>
      )}
    </>
  );
};

export default Log;

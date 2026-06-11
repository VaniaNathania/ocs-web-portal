import { Button } from "@/components/ui/button";
import { HistoryDataList } from "./block/HistoryList";
import { useForm } from "react-hook-form";
import { HistoryQuery } from "./hook/UserGrantHistoryDataProvider";
import { useUserGrantHistoryData } from "./hook/useUserGrantHistory";

export const HistoryDataMain = () => {
  const baseData: HistoryQuery = {
    startDate: "",
    endDate: "",
    search: null,
    page: 1,
    size: 5,
    sortBy: "recId",
    sortDirection: "asc",
  };

  const { setHistoryFilter } = useUserGrantHistoryData();

  const {
    register,
    handleSubmit,
    reset, // 👈 bring reset from react-hook-form
    formState: { errors },
  } = useForm<HistoryQuery>({
    defaultValues: baseData,
  });

  const handleQuery = (data: HistoryQuery) => {
    //  console.log("Query data:", data);
    setHistoryFilter(data);
  };

  const handleReset = () => {
    reset(baseData); // 👈 reset form fields
    setHistoryFilter(baseData); // 👈 also reset filter context
  };

  return (
    <div className="m-5 flex flex-col space-y-5">
      <form onSubmit={handleSubmit(handleQuery)}>
        <div className="flex flex-row">
          <div className="flex flex-row w-3/4 space-x-5">
            <div className="flex flex-row w-1/2 items-center">
              <label className="block text-sm font-medium text-gray-700 w-1/2">
                Operation Date From
              </label>
              <input
                {...register("startDate")}
                type="date"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-blue-500 disabled:opacity-50 disabled:bg-transparent"
              />
            </div>
            <div className="flex flex-row w-1/2 items-center">
              <label className="block text-sm font-medium text-gray-700 w-1/2">
                Operation Date To
              </label>
              <input
                {...register("endDate")}
                type="date"
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[0.5px] focus:ring-blue-500 disabled:opacity-50 disabled:bg-transparent"
              />
            </div>
          </div>
          <div className="w-1/4 flex justify-end space-x-5">
            <Button type="submit" variant="default">
              Query
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </form>
      <div>
        <HistoryDataList />
      </div>
    </div>
  );
};

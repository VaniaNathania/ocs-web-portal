import { useDataGrid } from "@/components";
import { useState } from "react";

const ListToolBarFeatureOfferStatusManageDialog = () => {
  const { table, reload } = useDataGrid();
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
        {/* Left Section */}
        <div className="flex gap-3 items-center w-full">
          <div className="w-1/3">
            <label htmlFor="offerName" className="text-sm font-medium text-gray-700">
              Offer Name
            </label>
            <input
              id="offerName"
              type="text"
              placeholder="Offer Name"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="w-1/3">
            <label htmlFor="offerName" className="text-sm font-medium text-gray-700">
              Offer Status
            </label>
            <input
              id="offerName"
              type="text"
              placeholder="Offer Status"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <div className="w-1/3">
            <label htmlFor="offerName" className="text-sm font-medium text-gray-700">
              Created Date
            </label>
            <input
              id="offerName"
              type="text"
              placeholder="Created Date"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ListToolBarFeatureOfferStatusManageDialog };

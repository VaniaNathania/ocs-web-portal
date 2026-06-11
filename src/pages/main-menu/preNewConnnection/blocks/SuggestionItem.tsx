import React, { Dispatch, SetStateAction } from "react";
import { searchResultProps } from "../interface";

interface SuggestionItemProps {
  item: searchResultProps;
  handleSelectedItem: (__clientKey: string) => void;
  handleToggleExpand: (parentId: number) => void;
  setPendingScrollKey: Dispatch<SetStateAction<string | null>>;
  setShowSuggestions: Dispatch<SetStateAction<boolean>>;
  setSearch: Dispatch<SetStateAction<string>>;
  expandedRows: boolean;
}

const SuggestionItem = React.memo(({ item, handleSelectedItem, handleToggleExpand, setPendingScrollKey, setShowSuggestions, setSearch, expandedRows }: SuggestionItemProps) => {
  const handleSelect = () => {
    if (!item.__clientKey) return;
    handleSelectedItem(item.__clientKey);
    setSearch(item.name);

    if (item.parentId) {
      const exist = expandedRows;
      if (!exist) {
        handleToggleExpand(item.parentId);

        setTimeout(() => {
          setPendingScrollKey(item.__clientKey);
        }, 0);

        return;
      }
    }

    setPendingScrollKey(item.__clientKey);
    setShowSuggestions(false);
  };

  return (
    <li className="px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={handleSelect}>
      {/* <DefaultTooltip title={item.name} placement="top"> */}
      <div className="w-full truncate" title={item.name}>
        {item.name}
      </div>
      {/* </DefaultTooltip> */}
    </li>
  );
});

export default SuggestionItem;

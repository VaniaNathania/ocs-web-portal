import { KeenIcon } from "@/components";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PncStep2Dialog from "./step2dialog";
import { Button } from "@/components/ui/button";
import ProductAlias from "../blocks/fields-dropdown/ProductAlias";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EffectiveDuration from "../blocks/fields-dropdown/EffectiveDuration";
import useStep2 from "../services/useStep2";
import { usePreNew } from "../hooks/context";
import { LuReceipt } from "react-icons/lu";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import SuggestionItem from "../blocks/SuggestionItem";
import { Loading } from "../../role-management/block/loadingBlock";

const PncStep2 = () => {
  const { triggerOk, formattedPrice, form, setForm } = usePreNew();
  const {
    fetchTimeUnit,
    fetchQryVasPnFiji,
    fetchQrySubsPlanAttrFiji,
    handleCheckboxChange,
    handleToggleExpand,
    handleDuplicateOffer,
    handleProductAlias,
    handleEffectiveDuration,
    handleEffectiveType,
    handleDetail,
    getTimeUnitName,
    copyAndAlias,
    data,
    showSuggestions,
    setShowSuggestions,
    searchResult,
    wrapperRef,
    selectedItem,
    handleSelectedItem,
    rowRefs,
    setPendingScrollKey,
    search,
    setSearch,
    handleResetSearch,
    gridColsTemplate,
    handleExpandFeature,
    expandedFeature,
  } = useStep2();

  const {
    timeUnit,
    detailValue,
    effectiveDuration,
    effectiveType,
    expandedRows,
    productAlias,
    selectItems,
    showDialog,
    subsPlanAttrFijiDialog,
    subsPlanAttrFijiRow,
    isVasPnFijiLoading,
    timeUnitDatas,
    getSubsPlanName,
    clientKeyToOfferId,
  } = form;

  if (!searchResult) return;

  return (
    <div className="flex flex-col gap-5">
      {isVasPnFijiLoading && <Loading />}
      <PncStep2Dialog
        isOpen={showDialog}
        handleDialog={(open) => {
          setForm((prev) => ({
            ...prev,
            showDialog: open,
          }));
        }}
        onOk={(subsPlanId, offerId, offerName) => {
          fetchQrySubsPlanAttrFiji({
            mode: "fromDialog",
            subsPlanId: subsPlanId,
            offerId: offerId,
          });
          fetchQryVasPnFiji(subsPlanId);
          fetchTimeUnit();
          setForm((prev) => ({
            ...prev,
            getSubsPlanName: offerName,
            subsPlanId: subsPlanId,
            showDialog: false,
          }));
        }}
      />
      <div className="flex flex-row gap-2 items-center">
        <div className="w-2 h-8 bg-primary rounded-md" />
        <span>Subscription Plan Information</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 max-w-[400px]">
          <Label className="flex w-[122px]">
            <span className="text-red-500">*</span>Subscription Plan
          </Label>
          <div
            className="flex-1 input input-sm bg-white"
            onClick={() => setForm((prev) => ({ ...prev, showDialog: true }))}
          >
            <Input
              className="border-none truncate"
              value={getSubsPlanName}
              title={getSubsPlanName}
              readOnly
            />
            <Button
              size={"sm"}
              variant={"ghost"}
              className="p-0 w-[25px] h-[25px]"
            >
              <KeenIcon icon="notepad-edit" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {subsPlanAttrFijiDialog?.length > 0 && (
            <div className="flex flex-row gap-2 max-w-[400px] items-center">
              <Label className="w-[122px]">
                <span className="text-red-500">*</span>User Type
              </Label>
              <div className="flex-1 bg-white">
                <Select
                  value={subsPlanAttrFijiDialog[0]?.defaultValue}
                  onValueChange={() => {}}
                  disabled
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subsPlanAttrFijiDialog[0]?.attrValueList?.map((item) => (
                      <SelectItem key={item.attrValueId} value={item.value}>
                        {item.valueMark}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* HVC CUSTOMER */}
          <div className="flex flex-row gap-2 max-w-[400px] items-center">
            <Label className="w-[122px]">
              <span className="text-red-500">*</span>HVC Customer
            </Label>
            <div className="flex-1 bg-white">
              <Select
                value={form.hvcCustomer}
                onValueChange={(value) => {
                  if (value === "Y" || value === "N") {
                    setForm((prev) => ({ ...prev, hvcCustomer: value }));
                  }
                }}
                disabled
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DATA REGULER FLAG*/}
          <div className="flex flex-row gap-2 max-w-[400px] items-center">
            <Label className="w-[122px]">
              <span className="text-red-500">*</span>Data Reguler Flag
            </Label>
            <div className="flex-1 bg-white">
              <Select
                value={form.dataRegulerFlag}
                onValueChange={(value) => {
                  if (value === "Y" || value === "N") {
                    setForm((prev) => ({ ...prev, dataRegulerFlag: value }));
                  }
                }}
                disabled
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* <div className="grid grid-cols-2">
          <div className="flex flex-row gap-2 max-w-[400px]">
            <Label className="flex w-32">
              <span className="text-red-500">*</span>DOWNLOADLINK RATE
            </Label>
            <div className="input input-sm bg-white">
              <Input className="border-none" />
            </div>
          </div>
          <div className="flex flex-row gap-2 max-w-[400px]">
            <Label className="flex w-32">
              <span className="text-red-500">*</span>UPLINK RATE
            </Label>
            <div className="input input-sm bg-white">
              <Input className="border-none" />
            </div>
          </div>
        </div> */}
      </div>

      {/* data grid */}
      {triggerOk && (
        <>
          <div className="relative max-w-[400px]" ref={wrapperRef}>
            <div className="input input-sm bg-white ">
              <Input
                className="border-none truncate"
                placeholder="Search Service Name..."
                value={search}
                onClick={() => setShowSuggestions(true)}
                title={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
              />
              {search !== "" && (
                <Button
                  onClick={handleResetSearch}
                  variant="ghost"
                  size="sm"
                  className="h-5 w-4"
                >
                  <KeenIcon icon="cross" />
                </Button>
              )}
              <KeenIcon icon="magnifier" />
            </div>
            <div>
              {showSuggestions && (
                <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-15 max-h-40 overflow-auto">
                  {searchResult.length > 0 ? (
                    searchResult.map((item) => (
                      <SuggestionItem
                        key={item.__clientKey}
                        item={item}
                        handleSelectedItem={handleSelectedItem}
                        handleToggleExpand={handleToggleExpand}
                        setPendingScrollKey={setPendingScrollKey}
                        setShowSuggestions={setShowSuggestions}
                        setSearch={setSearch}
                        expandedRows={form.expandedRows.includes(
                          item.parentId!,
                        )}
                      />
                    ))
                  ) : (
                    <li className="px-3 py-2 text-center">No record found..</li>
                  )}
                </ul>
              )}
            </div>
          </div>
          <div>
            {data && data.length > 0 && (
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                {/* HEADER COLUMNS*/}
                <div
                  className={`grid ${gridColsTemplate} bg-gray-100 p-2 text-sm font-semibold sticky top-0 z-10`}
                >
                  <div className="text-center whitespace-nowrap min-w-0 border-r-2">
                    Offer Group Name
                  </div>
                  {copyAndAlias && (
                    <div className="text-center border-r-2"></div>
                  )}
                  <div className="text-center whitespace-nowrap border-r-2">
                    OTC
                  </div>
                  <div className="text-center border-r-2">MRC</div>
                  <div className="text-center border-r-2">Effective Type</div>
                  <div className="text-center border-r-2">Duration</div>
                  <div className="text-center">Feature</div>
                </div>

                {/* ROWS */}
                {data.map((item) => {
                  const isParent = item.__rowType === "PARENT";
                  const isChildren = item.__rowType === "CHILD";
                  const isSelected = selectItems.some(
                    (v) => v.__clientKey === item.__clientKey,
                  );
                  const indent = (item.__level || 0) * 20;

                  const alias = productAlias[item.__clientKey];
                  const label = isParent
                    ? item.offerGroupName
                    : alias
                      ? `${item.offerName}(${alias})`
                      : item.offerName;

                  const offerId = clientKeyToOfferId[item.__clientKey];
                  const attrs = subsPlanAttrFijiRow[offerId];
                  const attrsVal = attrs?.find((x) => x.attrId === 400005);
                  const hasFeature = !!attrsVal;

                  const isExpandedFeature = expandedFeature.includes(
                    item.__clientKey,
                  );

                  return (
                    <div
                      key={item.__clientKey}
                      ref={(el) => (rowRefs.current[item.__clientKey] = el)}
                      className={`grid ${gridColsTemplate} items-center border-t p-2 text-sm ${item.__clientKey === selectedItem ? selectedRowHighLight : nonSelectedRowHighLight}`}
                      onClick={() => handleSelectedItem(item.__clientKey)}
                    >
                      {/* OFFER GROUP NAME */}
                      <div
                        className="flex items-center whitespace-nowrap"
                        style={{ paddingLeft: indent }}
                        onDoubleClick={() => {
                          if (isParent && item.__hasChildren) {
                            handleToggleExpand(item.id);
                          }
                        }}
                      >
                        {isParent && item.__hasChildren && (
                          <div onClick={() => handleToggleExpand(item.id)}>
                            <KeenIcon
                              icon={
                                expandedRows.includes(item.id!)
                                  ? "down"
                                  : "right"
                              }
                            />
                          </div>
                        )}

                        {isParent && item.__hasChildren && (
                          <LuReceipt className="ml-2 text-blue-500" />
                        )}

                        {isChildren && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(item)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}

                        <span
                          className={`pl-2 ${isChildren ? "truncate" : ""}`}
                          title={label ?? ""}
                        >
                          {label}
                        </span>
                      </div>

                      {/* COPY + ALIAS */}
                      {copyAndAlias && (
                        <div className="text-center">
                          {isChildren &&
                            isSelected &&
                            item.duplicateFlag !== null && (
                              <div className="flex justify-center gap-1">
                                {item.duplicateFlag !== "Y" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDuplicateOffer(item.id)
                                    }
                                    title="Copy"
                                  >
                                    <KeenIcon icon="copy" />
                                  </Button>
                                )}

                                <ProductAlias
                                  value={productAlias[item.__clientKey]}
                                  onSubmit={(val) =>
                                    handleProductAlias(item.__clientKey, val)
                                  }
                                />
                              </div>
                            )}
                        </div>
                      )}

                      {/* OTC */}
                      <div className="text-center truncate">
                        {isChildren &&
                          formattedPrice(item.offerDto?.saleListPrice)}
                      </div>

                      {/* MRC */}
                      <div className="text-center">
                        {isChildren &&
                          formattedPrice(item.offerDto?.rentListPrice)}
                      </div>

                      {/* EFFECTIVE TYPE */}
                      <div className="flex justify-center items-center min-w-0">
                        {isChildren && isSelected && (
                          <Select
                            value={effectiveType[item.__clientKey] ?? ""}
                            onValueChange={(val) =>
                              handleEffectiveType(item.__clientKey, val)
                            }
                          >
                            <SelectTrigger className="h-8 min-w-0">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Instant</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* DURATION */}
                      <div className="flex justify-center items-center min-w-0">
                        {isChildren && (
                          <EffectiveDuration
                            valueEffectiveDuration={
                              effectiveDuration[item.__clientKey]
                            }
                            valueTimeUnit={timeUnit[item.__clientKey]}
                            onSubmit={(val) =>
                              handleEffectiveDuration(item.__clientKey, val)
                            }
                            getTimeUnitName={getTimeUnitName}
                            timeUnitDatas={timeUnitDatas}
                            isSelected={isSelected}
                          />
                        )}
                      </div>

                      {/* FEATURE */}
                      <div
                        className={`
    overflow-hidden transition-all duration-300 ease-in-out
    ${isChildren && isSelected ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
  `}
                      >
                        <div
                          className="flex justify-center items-center min-w-0 cursor-pointer"
                          onClick={() => handleExpandFeature(item.__clientKey)}
                        >
                          {/* {isChildren && isSelected && <Detail value={detailValue[item.__clientKey] ?? attrsVal} onSubmit={(val) => handleDetail(item.__clientKey, val)} hasFeature={hasFeature} attrsVal={attrsVal} />} */}
                          <Label className="mr-2 cursor-pointer">Detail</Label>
                          <KeenIcon
                            icon={`${isExpandedFeature ? "up" : "down"}`}
                          />
                        </div>
                      </div>

                      <div
                        className={`
    overflow-hidden transition-all duration-300 ease-in-out
    ${isChildren && isSelected && hasFeature && isExpandedFeature ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
  `}
                      >
                        <div
                          className="p-2 flex flex-row items-center"
                          style={{ paddingLeft: indent * 3 }}
                        >
                          Location
                          <Input
                            className="h-8 ml-1 truncate"
                            value={
                              detailValue[item.__clientKey]?.attrValues ?? ""
                            }
                            onChange={(e) => {
                              handleDetail(item.__clientKey, {
                                ...(detailValue[item.__clientKey] ?? attrsVal),
                                attrValues: e.target.value,
                              });
                            }}
                            title={
                              detailValue[item.__clientKey]?.attrValues ?? ""
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PncStep2;

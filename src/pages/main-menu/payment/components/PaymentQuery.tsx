import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "../hooks/PaymentContext";
import React, { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DefaultTooltip, KeenIcon } from "@/components";
import { useParams } from "react-router";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";

const PaymentQuery = ({
  setShowSearch,
}: {
  setShowSearch: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const { setQuery, selectedRow, setSelectedRow, menuPrivAccess } =
    usePayment();
  // const id = useParams().acctNbr;
  const [acctNbr, setAcctNbr] = useState<string>("");

  const setToQuery = (str: string) => {
    setQuery(
      (prev) =>
        (prev = {
          acctNbr: str,
          page: prev.page,
          size: prev.size,
          sortBy: prev.sortBy,
          sortDirection: prev.sortDirection,
          spId: 0,
        }),
    );
  };

  useEffect(() => {
    setAcctNbr(selectedRow?.acctNbr ?? "");
    setShowSearch(false);
  }, [selectedRow]);
  return (
    <div className="border-2 p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
      <div className="flex flex-row md:col-span-2 items-center">
        <Label className="w-1/3">Account Number</Label>
        <div className="input input-sm flex-1 flex">
          <AccessWrapper
            hasAccess={menuPrivAccess?.readStatus ?? false}
            className="flex-1"
          >
            <Input
              size={"sm"}
              className="border-none flex-1"
              value={acctNbr}
              onChange={(e) => setAcctNbr(e.target.value)}
              onKeyUpCapture={(e) => {
                // console.log(e.key);
                if (e.key === "Enter") {
                  setToQuery(e.currentTarget.value);
                }
              }}
              placeholder="Search Account Number..."
            />
          </AccessWrapper>
          <AccessWrapper
            hasAccess={menuPrivAccess?.readStatus ?? false}
            // className="flex-1"
          >
            <DefaultTooltip title="Advance Search" placement="top">
              <Button
                variant={"ghost"}
                size={"sm"}
                className="w-fit h-fit p-0"
                onClick={() => setShowSearch(true)}
              >
                <KeenIcon icon="dots-horizontal" />
              </Button>
            </DefaultTooltip>
          </AccessWrapper>
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-end ">
        <AccessWrapper hasAccess={menuPrivAccess?.readStatus ?? false}>
          <Button size={"sm"} onClick={() => setToQuery(acctNbr)}>
            Query
          </Button>
        </AccessWrapper>
        <AccessWrapper hasAccess={menuPrivAccess?.readStatus ?? false}>
          <Button
            size={"sm"}
            onClick={() => {
              setAcctNbr("");
              setSelectedRow(undefined);
            }}
            variant={"outline"}
          >
            Reset
          </Button>
        </AccessWrapper>
      </div>
    </div>
  );
};

export default PaymentQuery;

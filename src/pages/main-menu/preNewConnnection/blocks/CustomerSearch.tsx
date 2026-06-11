import { DialogFooter } from "@/components/ui/dialog";
import { DialogWrapper, ParentDialogProps } from "../../role-management/generalUseComp";
import { Button } from "@/components/ui/button";
import useCustomerSearch from "../services/useCustomerSearch";
import { useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreNew } from "../hooks/context";
import { Loading } from "../../role-management/block/loadingBlock";

export interface CustQueryCondProps {
  updateDate: string;
  certTypeName: string;
  routingId: number;
  certNbr: string;
  gender: string;
  certTypeId: number;
  certId: number;
  custName: string;
  custCode: string;
  createdDate: string;
  custId: number;
  custType: string;
  custTypeName: string;
  stateDate: string;
  state: string;
}

const CustomerSearch = ({ isOpen, handleDialog }: ParentDialogProps) => {
  const {
    certType,
    handleOk,
    datas,
    handleSelectItem,
    selectedItem,
    handleQuery,
    handleReset,
    selectedCertType,
    setSelectedCertType,
    acctNbr,
    setAcctNbr,
    docNbr,
    setDocNbr,
    contactManName,
    setContactManName,
    custName,
    setCustName,
    iccid,
    setIccid,
    isEscape,
    setIsEscape,
    qryTermination,
    setQryTermination,
    serviceNbr,
    setServiceNbr,
  } = useCustomerSearch({ handleDialog, isOpen });

  const { form } = usePreNew();

  const columns = useMemo<ColumnDef<CustQueryCondProps>[]>(
    () => [
      {
        id: "certTypeId",
        accessorFn: (row) => row.certTypeName,
        header: ({ column }) => <DataGridColumnHeader title="Doc Type" column={column} />,
      },
      {
        id: "certNbr",
        accessorFn: (row) => row.certNbr,
        header: ({ column }) => <DataGridColumnHeader title="Doc Number" column={column} />,
      },
      {
        id: "custName",
        accessorFn: (row) => row.custName,
        header: ({ column }) => <DataGridColumnHeader title="Customer Name" column={column} />,
      },
      {
        id: "createdDate",
        accessorFn: (row) => row.createdDate,
        header: ({ column }) => <DataGridColumnHeader title="Termination Date" column={column} />,
      },
    ],
    [datas],
  );

  return (
    <DialogWrapper isOpen={isOpen} handleDialog={handleDialog} title="Customer Search" size={{ width: "4xl" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleQuery();
        }}
      >
        <div className="grid grid-cols-2 gap-5 m-10">
          <div className="flex items-center">
            <Label className="text-sm w-32">Customer Name</Label>
            <Input size="sm" value={custName} onChange={(e) => setCustName(e.target.value)} />
          </div>
          <div className="">
            <div className="flex flex-row justify-center items-center gap-2">
              <Input type="checkbox" className="w-fit" size="sm" checked={isEscape} onChange={(e) => setIsEscape(e.target.checked)} />
              <Label className="text-sm">Use WildCard Character</Label>
            </div>
          </div>
          <div className="flex items-center">
            <Label className="text-sm w-32">Service Number</Label>
            <Input size="sm" value={serviceNbr} onChange={(e) => setServiceNbr(e.target.value)} />
          </div>
          <div className="">
            <div className="flex flex-row justify-center items-center gap-2">
              <Input type="checkbox" className="w-fit" size="sm" checked={qryTermination} onChange={(e) => setQryTermination(e.target.checked)} />
              <Label className="text-sm">Query Termination User</Label>
            </div>
          </div>
          <div className="flex items-center">
            <Label className="text-sm w-32">Doc Type</Label>
            <Select
              onValueChange={(val) => {
                setSelectedCertType(Number(val));
              }}
              value={String(selectedCertType ?? "")}
            >
              <SelectTrigger className=" h-8">
                <SelectValue placeholder="Select..." />
                {selectedCertType && (
                  <div className="flex flex-1 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onClick={() => {
                        setSelectedCertType(undefined);
                      }}
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {certType.length > 0 &&
                  certType.map((item) => (
                    <SelectItem key={item.certTypeId} value={String(item.certTypeId)}>
                      {item.certTypeName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <Label className="text-sm w-32">Doc Number</Label>
            <Input size="sm" value={docNbr} onChange={(e) => setDocNbr(e.target.value)} />
          </div>
          <div className="flex items-center">
            <Label className="text-sm w-32">ICCID</Label>
            <Input size="sm" value={iccid} onChange={(e) => setIccid(e.target.value)} />
          </div>
          <div className="flex items-center">
            <Label className="text-sm w-32">Account Number</Label>
            <Input size="sm" value={acctNbr} onChange={(e) => setAcctNbr(e.target.value)} />
          </div>
          <div className="flex items-center">
            <Label className="text-sm w-32">Contact Man Name</Label>
            <Input size="sm" value={contactManName} onChange={(e) => setContactManName(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-end">
          <Button size="sm" className="hover:bg-blue-700" onClick={handleQuery}>
            Query
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} type="button">
            Reset
          </Button>
        </div>

        <div className="mt-5">
          {form.isLoading && <Loading />}
          <DataGridProvider<CustQueryCondProps>
            columns={columns}
            data={datas}
            pagination={{ size: 10 }}
            layout={{ card: true }}
            serverSide={false}
            sorting={[{ id: "custId", desc: true }]}
            getRowProps={(row) => ({
              className: row.original.custId === selectedItem?.custId ? selectedRowHighLight : nonSelectedRowHighLight,
              onClick: () => handleSelectItem(row.original),
            })}
          />
        </div>
      </form>

      {/* footer */}
      <DialogFooter className="flex justify-end mt-2">
        <Button className="hover:bg-blue-700" onClick={handleOk}>
          OK
        </Button>
      </DialogFooter>
    </DialogWrapper>
  );
};

export default CustomerSearch;

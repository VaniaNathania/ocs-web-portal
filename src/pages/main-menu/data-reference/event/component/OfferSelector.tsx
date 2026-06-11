import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import ToolbarOffer, { OfferDataList } from "../blocks/ToolbarOffer";
import { useEventListContext } from "../hooks/useEventContext";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

interface OfferSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  offerData: (data: OfferDataList | null) => void;
}

const OfferSelector: React.FC<OfferSelectorProps> = ({ isOpen, onClose, offerData }) => {
  const { fetchOfferType } = useEventListContext();

  const [datas, setDatas] = useState<OfferDataList[]>([]);
  const [selectedItem, setSelectedItem] = useState<OfferDataList | null>(null);

  useEffect(() => {
    fetchOfferType();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setDatas([]);
    }
  }, [isOpen]);

  const handleOfferDatas = (data: OfferDataList[]) => {
    setDatas(data);
  };

  const handleItemClick = (item: OfferDataList) => {
    setSelectedItem(item);
  };
  const handleCancel = () => {
    onClose();
  };

  const handleAddData = () => {
    offerData(selectedItem);
    onClose();
  };

  const columns = useMemo<ColumnDef<OfferDataList>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="text-gray-800" title="Offer Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.stdCode,
        id: "stdCode",
        header: ({ column }) => <DataGridColumnHeader className="text-gray-800" title="Offer Code" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.offerTypeName,
        id: "offerTypeName",
        header: ({ column }) => <DataGridColumnHeader className="text-gray-800" title="Offer Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [datas]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Offer Selector</DialogTitle>
        </DialogHeader>

        <div>
          <ToolbarOffer datas={handleOfferDatas} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="m-3">
            <DataGridProvider
              columns={columns}
              data={datas}
              pagination={{ size: 10 }}
              layout={{ card: false }}
              sorting={[{ id: "attrName", desc: false }]}
              serverSide={false}
              getRowProps={(row) => ({
                className: row.original.prodSpecId === selectedItem?.prodSpecId ? selectedRowHighLight : nonSelectedRowHighLight,
                onClick: () => handleItemClick(row.original),
              })}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t flex justify-end items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddData} className="disabled:bg-gray-300 disabled:cursor-not-allowed">
              Add
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OfferSelector;

import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePayment } from "../hooks/PaymentContext";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";

const PaymentDetailActionOps = () => {
  const { setSelectedMenu, selectedRow, setShowRefund, menuPrivAccess, setShowInstantInvoice } = usePayment();
  return (
    <DropdownMenu>
      <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
        <DropdownMenuTrigger asChild>
          <Button size={"sm"} variant={"outline"} disabled={!selectedRow}>
            Action
            <span>
              <KeenIcon icon="down" />
            </span>
          </Button>
        </DropdownMenuTrigger>
      </AccessWrapper>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => setShowInstantInvoice(true)}>Instant Invoice</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSelectedMenu("bonus rule")}>Preview Bonus</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowRefund(true)}>Refund</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PaymentDetailActionOps;

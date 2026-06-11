import { useState } from "react";
import {
  highlighted,
  nonHighlighted,
} from "../../order/user/menu/subscriber/components/dialog/blocks/menu";
import { usePayment } from "../hooks/PaymentContext";
import { Button } from "@/components/ui/button";

interface menuItem {
  name: string;
  menu:
    | "curr bill"
    | "bill detail"
    | "history"
    | "acct balance"
    | "bonus rule"
    | "share from other"
    | "share to other"
    | "all bill"
    | "payment plan";
}

const Menu = () => {
  const { setSelectedMenu, selectedMenu, selectedRow } = usePayment();

  const menuItem: menuItem[] = [
    {
      name: "Current Bill",
      menu: "curr bill",
    },
    {
      name: "Bill Detail",
      menu: "bill detail",
    },
    {
      name: "Historical Bill",
      menu: "history",
    },
    {
      name: "Account Balance",
      menu: "acct balance",
    },
    {
      name: "Bonus Rule",
      menu: "bonus rule",
    },
    {
      name: "Share From Other",
      menu: "share from other",
    },
    {
      name: "Share To Other",
      menu: "share to other",
    },
    {
      name: "All Bill",
      menu: "all bill",
    },
    {
      name: "Payment Plan",
      menu: "payment plan",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2  w-full">
      {menuItem.map((menu, index) => {
        return (
          <Button
            className={`whitespace-nowrap py-2 ${selectedMenu === menu.menu ? highlighted : nonHighlighted} rounded-none`}
            onClick={() => setSelectedMenu(menu.menu)}
            key={index}
            variant={"ghost"}
            disabled={!selectedRow}
          >
            {menu.name}
          </Button>
        );
      })}
    </div>
  );
};

export default Menu;

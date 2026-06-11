import { Button } from "@/components/ui/button";
import { ButtonCursor } from "../../role-management/generalUseComp";

interface btnItem {
  name: string;
  func: () => void;
}

export const NavBtn = () => {
  const btn: btnItem[] = [
    {
      name: "Menu Selector",
      func: () => console.log("Directory & Menu Selector"),
    },
    // {
    //   name: "Import",
    //   func: () => setShowImport(true),
    // },
    // {
    //   name: "Export All",
    //   func: () => console.log("Export"),
    // },
  ];

  const btnBuilder = (items: btnItem[]) => {
    return items.map((item) => {
      return (
        // <Button
        //   type="button"
        //   variant="ghost"
        //   onClick={item.func}
        //   key={item.name}
        //   disabled={isMenuSelectorDisable}
        //   className=""
        // >
        //   {item.name}
        // </Button>
        <ButtonCursor variant="ghost" key={item.name} onClick={item.func}>
          {item.name}
        </ButtonCursor>
      );
    });
  };

  return <div className="bg-white px-5 py-2 ">{btn && btnBuilder(btn)}</div>;
};

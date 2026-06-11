import { Button } from "@/components/ui/button";
import { useCompList } from "../hook/useComp";
import { ButtonCursor } from "../../role-management/generalUseComp";

interface btnItem {
  name: string;
  func: () => void;
}

export const NavBtn = () => {
  const {
    setShowMenuSelector,
    setShowNewDir,
    setShowMenuManagement,
    setShowBindPortal,
    setShowImport,
    selectedRow,
  } = useCompList();

  const btn: btnItem[] = [
    {
      name: "Menu Selector",
      func: () => setShowMenuSelector(true),
    },
    {
      name: "New Directory",
      func: () => setShowNewDir(true),
    },
    {
      name: "Menu Management",
      func: () => setShowMenuManagement(true),
    },
    {
      name: "Bind Portal",
      func: () => setShowBindPortal(true),
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
      const isMenuSelector = item.name.toLowerCase().includes("menu selector");
      const isNewDir = item.name.toLowerCase().includes("new directory");
      const isBindPortal = item.name.toLowerCase().includes("bind portal");
      const isMenuSelectorDisable =
        isMenuSelector && (selectedRow?.id === 0 || selectedRow?.type === "1");
      const isNewDirDisable = isNewDir && selectedRow?.type === "1";
      const isBindPortalDisable =
        isBindPortal && (selectedRow?.id === 0 || selectedRow?.type === "1");
      const isDisable =
        isMenuSelectorDisable || isNewDirDisable || isBindPortalDisable;

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
        <ButtonCursor
          disable={isDisable}
          variant="ghost"
          key={item.name}
          onClick={item.func}
        >
          {item.name}
        </ButtonCursor>
      );
    });
  };

  return <div className="bg-white px-5 py-2 ">{btn && btnBuilder(btn)}</div>;
};

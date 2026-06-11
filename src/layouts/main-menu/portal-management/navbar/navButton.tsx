import { Button } from "@/components/ui/button";
import { usePortalLayout } from "../PortalLayoutProvider";
import { ButtonCursor } from "@/pages/main-menu/role-management/generalUseComp";

interface btnItem {
  name: string;
  func: () => void;
}

export const NavBtn = () => {
  const { setShowDirMenuSelector, selectedDir } = usePortalLayout();

  const btn: btnItem[] = [
    {
      name: "Directory & Menu Selector",
      func: () => setShowDirMenuSelector(true),
    },
  ];

  const btnBuilder = (items: btnItem[]) => {
    return items.map((item) => {
      const isMenuSelectorDisable = selectedDir?.type === "1";

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
          disable={isMenuSelectorDisable}
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

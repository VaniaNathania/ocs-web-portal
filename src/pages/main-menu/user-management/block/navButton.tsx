import { Button } from "@/components/ui/button";
import { useUserManagement } from "../hook/useUserManagemet";

interface btnItem {
  name: string;
  func: () => void;
}

export const NavBtn = () => {
  const {
    setShowGrantRole,
    setShowGrantPortal,
    setShowGrantMenu,
    setShowGrantComp,
    setShowGrantPortlet,
    setShowUserHistory,
    setShowExport,
    setShowGrantDataPrivelage,
    setShowIPLimit,
  } = useUserManagement();

  const btn: btnItem[] = [];

if (btn.length === 0) {
  return null;
}

  const btnBuilder = (items: btnItem[]) => {
    return items.map((item) => {
      return (
        <Button
          key={item.name}
          type="button"
          variant="ghost"
          onClick={item.func}
        >
          {item.name}
        </Button>
      );
    });
  };
  return (
      <div className="bg-white px-5 py-2 border-b-2">
        {btnBuilder(btn)}
      </div>
    );
};

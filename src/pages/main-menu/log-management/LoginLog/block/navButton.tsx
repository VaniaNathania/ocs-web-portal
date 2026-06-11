import { Button } from "@/components/ui/button";
import { useLogManagement } from "../hook/useLogManagement";

interface btnItem {
  name: string;
  func: () => void;
}

export const NavBtn = () => {
  const {
    setShowGrantLoginLog,
    setShowGrantSystemLog,
    setShowGrantAuditLog,
  } = useLogManagement();

  const btn: btnItem[] = [
    {
      name: "Grant Login Log",
      func: () => setShowGrantLoginLog(true),
    },
    {
      name: "Grant System Log",
      func: () => setShowGrantSystemLog(true),
    },
    {
      name: "Grant Audit Log",
      func: () => setShowGrantAuditLog(true),
    },
  ];

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

  return <div className="bg-white px-5 py-2">{btn && btnBuilder(btn)}</div>;
};

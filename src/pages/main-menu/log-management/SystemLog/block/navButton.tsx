import { Button } from "@/components/ui/button";
import { useSystemLog } from "../hook/useSystemLog";

interface btnItem {
  name: string;
  func: () => void;
}

export const NavBtn = () => {
  const { setShowGrantLoginLog, setShowGrantSystemLog, setShowGrantAuditLog } =
    useSystemLog();

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
    // {
    //   name: "Grant Component",
    //   func: () => setShowGrantComp(true),
    // },
    // {
    //   name: "Grant Portlet",
    //   func: () => setShowGrantPortlet(true),
    // },
    // {
    //   name: "Export",
    //   func: () => setShowExport(true),
    // },
    // {
    //   name: "Grant Data Privilage",
    //   func: () => setShowGrantDataPrivelage(true),
    // },
    // {
    //   name: "Export All User Info",
    //   func: () => {
    //   //  console.log("ini Export All User Info");
    //   },
    // },
    // {
    //   name: "IP Limit",
    //   func: () => setShowIPLimit(true),
    // },
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

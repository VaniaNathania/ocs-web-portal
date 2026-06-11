import { Button } from "@/components/ui/button";
import { Selector } from "./table";
import { useCompList } from "../../outlet/component/hook/useComp";
import { apiConfigRole } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePortalLayout } from "@/layouts/main-menu/portal-management";
import { toast } from "sonner";

interface footer {
  owned: Selector[];
}

const API_URL = apiConfigRole.role;

const Footer = ({ owned }: footer) => {
  const { setShowConfirm, setDesc, setOnConfirm } = useCompList();
  const { selectedRow, selectedDir, setShowDirMenuSelector } =
    usePortalLayout();
  const { PostData } = useCallApi();

  const handleSubmit = () => {
    setDesc(`Adding selected Item`);
    // //  console.log(data);
    setShowConfirm(true);
    setOnConfirm(() => () => onSubmit());
  };

  const onSubmit = async () => {
    // //  console.log(`Deleting  ${data.partyId} ${data.partyName}`);
    try {
      const paylaod = {
        portalId: selectedRow?.portalId,
        spId: 0,
        parentId: selectedDir?.partyId === 0 ? null : selectedDir?.partyId,
        partyList: owned.map((item) => ({
          partyId: item.id,
          type: item.type,
          partyName: item.name,
          parentId: item.parentId,
          url: item.url,
          addCascade: item.addCascade,
        })),
      };

      //  console.log(paylaod);

      const resp = await PostData(
        `${API_URL}/api/portals/add-dir-menu-to-portal`,
        paylaod,
      );

      if (resp?.status) {
        setShowDirMenuSelector(false);
        return toast.success(resp.message);
      }
      return toast.error(resp?.message);
    } catch (error) {
      return toast.error("Error deleting data");
    } finally {
      setShowConfirm(false);
      // initializeData();
    }
  };

  return (
    <div className="flex flex-row justify-end gap-2">
      <Button size={"sm"} onClick={handleSubmit}>
        Add
      </Button>

      <Button
        size={"sm"}
        variant={"outline"}
        onClick={() => setShowDirMenuSelector(false)}
      >
        Cancel
      </Button>
    </div>
  );
};

export default Footer;

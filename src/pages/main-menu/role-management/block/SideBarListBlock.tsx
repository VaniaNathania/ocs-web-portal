import { SideBarList } from "../component/sideBarList";
import { RoleListProvider } from "../hook/RoleListProvider";

interface barListProps {
  styleDiv: string;
}

const SideBarListBlock = ({ styleDiv }: barListProps) => {
  return <SideBarList styleDiv={styleDiv} />;
};

export default SideBarListBlock;

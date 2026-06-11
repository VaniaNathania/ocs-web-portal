import { SideBarList } from "../component/sideBarList";

interface barListProps {
  styleDiv: string;
}

const SideBarListBlock = ({ styleDiv }: barListProps) => {
  return <SideBarList styleDiv={styleDiv} />;
};

export default SideBarListBlock;

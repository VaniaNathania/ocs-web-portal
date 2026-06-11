import { OfferAndSubsPlanByOfferCatgProps } from "../interface";


export interface TreeNodeMain extends OfferAndSubsPlanByOfferCatgProps {
  children?: TreeNodeMain[];
}

export const BuildTreeMain = (data: OfferAndSubsPlanByOfferCatgProps[]): TreeNodeMain[] => {
  const map = new Map<string, TreeNodeMain>();
  const roots: TreeNodeMain[] = [];

  // init map
  data.forEach((item) => {
    if (!item.nodeId) return;
    map.set(item.nodeId, { ...item, children: [] });
  });

  // build relation
  data.forEach((item) => {
    if (!item.nodeId || !item.parentCatgId) return;
    const current = map.get(item.nodeId)!;
    const parent = map.get(item.parentCatgId);

    if (parent) {
      parent.children!.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
};

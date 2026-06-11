import { OfferCatalogAllProps } from "../interface";

export interface TreeNode extends OfferCatalogAllProps {
  children: TreeNode[];
}

export const BuildTreeSidebar = (data: OfferCatalogAllProps[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  data.forEach((item) => {
    if (!item.nodeId) return;
    map.set(item.nodeId, {
      ...item,
      children: [],
    });
  });

  data.forEach((item) => {
    if (!item.nodeId) return;
    const currentNode = map.get(item.nodeId);
    if (!currentNode) return;

    if (item.parentCatgId) {
      const parentNode = map.get(item.parentCatgId);
      if (parentNode) {
        parentNode.children.push(currentNode);
      }
    } else {
      roots.push(currentNode);
    }
  });

  return roots;
};

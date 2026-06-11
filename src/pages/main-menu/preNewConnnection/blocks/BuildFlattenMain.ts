import { TreeNodeMain } from "./BuildTreeMain";

export const BuildFlattenMain = (nodes: TreeNodeMain[], expanded: number[], level = 0): (TreeNodeMain & { __level: number })[] => {
  return nodes.flatMap((node) => {
    const rows: (TreeNodeMain & { __level: number })[] = [{ ...node, __level: level }];

    if (expanded.includes(node.id!) && node.children?.length) {
      rows.push(...BuildFlattenMain(node.children, expanded, level + 1));
    }

    return rows;
  });
};

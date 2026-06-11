export function getNewlyAddedTreeItems<T extends { children?: T[] }>(beforeList: T[], afterList: T[], key: keyof T): T | null {
  // Flatten helper
  function flatten(list: T[]): T[] {
    const res: T[] = [];
    for (const item of list) {
      res.push(item);
      if (item.children?.length) {
        res.push(...flatten(item.children));
      }
    }
    return res;
  }

  const flatBefore = flatten(beforeList);
  const flatAfter = flatten(afterList);

  const beforeMap = new Map(flatBefore.map((item) => [item[key], item]));

  // Find first item that did NOT exist previously
  for (const item of flatAfter) {
    if (!beforeMap.has(item[key])) {
      return item; // found new one!
    }
  }

  return null;
}

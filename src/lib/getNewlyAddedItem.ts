function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function getNewlyAddedItem<T extends Record<string, any>>(beforeList: T[] = [], afterList: T[] = [], key?: keyof T): T | null {
  if (!Array.isArray(beforeList) || !Array.isArray(afterList)) return null;

  return (
    afterList.find((item) => {
      return !beforeList.some((oldItem) => {
        if (key) {
          return oldItem[key] === item[key];
        }
        return deepEqual(oldItem, item);
      });
    }) || null
  );
}
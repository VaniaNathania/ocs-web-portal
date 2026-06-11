export const excludeKeys = (obj: any, keysToExclude: any) => {
  return Object.keys(obj).reduce((filteredObj: any, key) => {
    if (!keysToExclude.includes(key)) {
      filteredObj[key] = obj[key];
    }
    return filteredObj;
  }, {});
};

/**
 * Create a new object by immutably copying a value from one key to another.
 *
 * This function checks whether the source key exists on the object.
 * If it exists, a new object will be returned with the target key
 * assigned the value of the source key.
 * If the source key does not exist, the original object is returned.
 *
 * @param obj - The source object to read the value from
 * @param targetKey - The key to be added or overwritten in the returned object
 * @param sourceKey - The key whose value will be copied
 *
 * @returns A new object with the updated value if the source key exists,
 * otherwise returns the original object unchanged.
 *
 * @example
 * const original = { name: "John", location: "Jakarta" };
 *
 * const updated = changeValueImmutable(original, "city", "location");
 *
 * // Result:
 * // { name: "John", location: "Jakarta", city: "Jakarta" }
 */
export const changeValueImmutable = (
  obj: any,
  targetKey: any,
  sourceKey: any
) => {
  if (obj.hasOwnProperty(sourceKey)) {
    return { ...obj, [targetKey]: obj[sourceKey] };
  }
  return obj;
};

export const updateKeyValueInArray = (
  arr: [],
  targetKey: any,
  sourceKey: any
) => {
  return arr.map((obj: any) => {
    if (obj.hasOwnProperty(sourceKey)) {
      return { ...obj, [targetKey]: obj[sourceKey] };
    }
    return obj; // If sourceKey doesn't exist, return the object unchanged
  });
};

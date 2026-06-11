export interface operationFlagProps {
  operationFlagName: string;
  operationFlag: string;
}

export const operationFlag = [
  {
    operationFlagName: "Mod the expire date of old price plan instance to new expire date,if not find the old,will be add new(Default)",
    operationFlag: "N",
  },
  {
    operationFlagName: "Add new price plan instance",
    operationFlag: "A",
  },
  {
    operationFlagName: "Expand validity of old effective price plan instance with the effective span of new price plan",
    operationFlag: "U",
  },
  {
    operationFlagName: "Use the longest expiry date as new expiry date between old price plan instance and new price plan instance",
    operationFlag: "H",
  },
  {
    operationFlagName: "Disable the old price plan instance, then Add new price plan instance",
    operationFlag: "B",
  },
];

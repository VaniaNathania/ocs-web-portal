interface IAccountFeatureList {
  attrId: number;
  attrCode: string;
  attrName: string;
  attrType: string;
  csrVisible: "Y" | "N";
  inputType: string;
  nullable: "Y" | "N";
  comments: string | null;
  defaultValue: string | null;
  dispOrder: number;
  spId: number;
  attrValue: string | null;
  acctValuesListDto: IAttrValueOption[] | null;
}

interface IAttrValueOption {
  value: string;
  attrName: string;
  baseAttrId: number;
  attrValueId: number;
  valueMark: string | null;
}

interface IOptionFeatureList {
  attrId: number;
  attrName: string;
  attrType: string;
  attrCode: string;
}

interface ISelectedFeatureDisplay extends IOptionFeatureList {
  comments: string | null;
  nullable: string;
  inputType: string;
  attrValueOptions?: IAttrValueOption[];
}

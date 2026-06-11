import { DPOfferAttrList } from "../user/menu/subscriber/components/modifysubscriber/model/interfaces";
import { AttrCustDto, AttrOrder } from "./interfaces";

export type AttrRecState = Record<string, AttrOrder[]>;
export type DpOfferAttrRec = Record<string, DPOfferAttrList[]>;
export type UUIDRec = Record<string, string[]>;
export type AttrRec = Record<string, AttrCustDto>;

interface TableResponseTypes<T> {
  status: boolean;
  count: number;
  data: T[];
}

interface TableParamsTypes {
  limit: number;
  page: number;
}

interface ActionResponseTypes {
  status: boolean;
  message: string;
}

interface ActionMenuReponseTypes {
  status: boolean;
  message: string;
  data?: {
    // role_name: string;
    // token: string;
    menu: any;
  } | null;
}

interface RoleList {
  children?: RoleList[];
  icon: string;
  id: string;
  id_parent: string;
  link: string;
  module: string;
  name: string;
  pricePlanTypeName: string;
  order_number: number;
}
interface MappedMenu {
  title: string;
  path?: string;
  children?: MappedMenu[];
}

interface IAcctItemType {
  id: number;
  acctItemTypeName: string;
  acctResId: number;
  acctResName: string;
}
// export interface ChildrenRole {
//   icon: string;
//   id: string;
//   id_parent: string;
//   link: string;
//   module: string;
//   name: string;
//   order_number: number;
// }

interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  search?: string;
}

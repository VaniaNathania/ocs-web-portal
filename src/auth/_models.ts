import { type TLanguageCode } from "@/i18n/types";

export interface AuthModel {
  // id: string;
  access_token: string;
  user: any;
  menus: any;
  expired?: any;
  jobs: any;
  forceLogin?: any;
}

export interface UserModel {
  id: number;
  username: string;
  name: string;
  password: string | undefined;
  email: string;
  id_role: string;
  role_name: string;
  roles_list: [];
  token: AuthModel;

  first_name: string;
  last_name: string;
  fullname?: string;
  occupation?: string;
  companyName?: string;
  phone?: string;
  roles?: number[];
  pic?: string;
  language?: TLanguageCode;
}

export interface UserLoginData {
  access_token: string;
  user: User;
  menus: Menu[];
  jobs: Job[];
  forceLogin?: string;
}

export interface Job {
  userName: string;
  userCode: string;
  userId: number;
  staffId: number;
  staffName: string;
  staffCode: string;
  orgId: number;
  staffOrgId: number;
  staffJobId: number;
  orgName: string;
  areaName: string;
  areaCode: string;
  areaId: number;
}

export interface Menu {
  privId: number;
  privName: string;
  addStatus: Status | null;
  editStatus: Status | null;
  deleteStatus: Status | null;
  readStatus: Status | null;
}

export enum Status {
  Y = "Y",
}

export interface User {
  name: string;
  id: number;
  code: string;
}

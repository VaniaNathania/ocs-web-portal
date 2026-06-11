export interface UsedResExDto {
  resNbr?: string;
  resTypeName?: string;

  usedResId?: number;
  prodId?: number;

  resType?: string;
  resId?: number;

  createdDate?: string; // ISO date-time string

  state?: string;
  stateDate?: string; // ISO date-time string

  spId?: number;

  extMap?: Record<string, unknown>;
}

export interface BcMemberQueryResultDto {
  bcMemberId: number;

  bcMemberTypeId: string;
  bcMemberTypeName: string;

  acctId: string;
  acctName: string;

  billFlag: string;
  state: string;

  effDate: string; // LocalDateTime → ISO string

  subsId: number;
  accNbr: string;

  prodStateName: string;
  subsPlanName: string;

  memberCustName: string;
  memberAcctName: string;
  memberAccNbr: string;

  accNbrType: string;
}

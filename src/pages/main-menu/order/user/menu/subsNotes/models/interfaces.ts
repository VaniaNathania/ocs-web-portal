export interface SubsNotesSelect {
  active: SubsNotesAccListSelect[];
  inActive: SubsNotesAccListSelect[];
}

export interface SubsNotesAccListSelect {
  subsId: number;
  accNbr: string;
  msisdn: string;
}

export interface SubsNotesQuery {
  type: "active" | "inActive";
  selectedActiveIdx?: number;
  selectedInActiveIdx?: number;
  startDate?: string;
  endDate?: string;
}

export interface SubsNotesList {
  subsId: number;
  createdDate: string;
  seq: number;
  msisdn: string;
  operator?: string;
  notes: string;
}

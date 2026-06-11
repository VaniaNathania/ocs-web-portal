interface AccumulationType {
  accumulationTypeId: number;
  name: string;
  description?: string | null;
  code: string;
}

interface AccumulationListResponse {
  status: number;
  message: string;
  data: AccumulationType[];
  totalRows: number;
  totalPage: number;
}

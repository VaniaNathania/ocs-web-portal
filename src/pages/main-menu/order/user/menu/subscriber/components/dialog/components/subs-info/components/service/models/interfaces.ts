export interface FellowNbrOrderDto {
  extMap?: Record<string, any>;
  valid: boolean;
  fellowNbrOrderId: number;
  orderItemId: number;
  fellowNbrTypeId: number;
  fellowNbrTypeName: string;
  fellowNbr: string;
  effDate: string; // ISO date-time string
  expDate: string; // ISO date-time string
  operationType: string;
  oldFellowNbr?: string;
  spId: number;
  shortNbr?: string;
  oldShortNbr?: string;
  bidirectional?: string;
  ext1?: number;
  ext2?: string;
}

export interface HomeZoneOrderDto {
  extMap?: Record<string, any>;
  valid: boolean;
  homeZoneOrderId: number;
  orderItemId: number;
  geoHomeZoneId: number;
  oldGeoHomeZoneId?: number;
  geoHomeZoneName: string;
  operationType: string;
  spId: number;
  effDate: string; // ISO date-time string
  expDate: string; // ISO date-time string
  comments?: string;
}

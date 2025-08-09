export class VenueData {
  Id: string;
  ModifiedDateTime?: string;
  ExternalId?: string;
  VenueName?: string;
  Status?: string;
  AddressLine1?: string;
  AddressLine2?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Source?: string;
  expansionList?: string;
}

export class VenueDto {
  VenueList: VenueData[];

  TransactionId: string;
}

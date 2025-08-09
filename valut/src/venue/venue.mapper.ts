export function mapVenueInputToVault(input: any): any[] {
  return input.map((venue) => {
    const extraFields = Array.isArray(venue.extraField)
      ? Object.assign({}, ...venue.extraField)
      : venue.extraField || {};

    const flattened = {
      name__v: venue.VenueName,
      postal_code__v: venue.PostalCode,
      city__v: venue.City,
      address__v: venue.AddressLine1,
      address_line_2__v: venue.AddressLine2 || '',
      external_id__v: venue.ExternalId,
      legacy_crm_id__v: venue.ExternalId,
      status__v: venue.Status === 'Eligible' ? 'active__v' : 'inactive__v',
      state_province__v: venue.State,
      ...extraFields,
    };

    return flattened;
  });
}

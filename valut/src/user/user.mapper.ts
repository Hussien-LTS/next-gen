export function mapUserData(source) {
  const data = source.data;
  const userDataList = {
    userStatus: data?.status__v?.[0] !== 'inactive__v',
    userRole:
      data?.user_type__v?.[0] === 'sales__v' ? 'Sales Representative' : null,
    userProfile:
      data?.application_profile__v === 'VFV000000001014'
        ? 'Veeva Essentials Sales Profile'
        : null,
    userLastName: data?.last_name__sys || null,
    userIdentifierId: data?.user_identifier__v
      ? `EMP-${data.user_identifier__v}`
      : null,
    userFirstName: data?.first_name__sys || null,
    homeState: data?.state_province__v || null,
    homePostalCode: data?.postalcode__v || null,
    homeCountry: data?.country_code__v || null,
    homeAddressLine1: data?.street__v || null,
    assignmentPosition: null,
  };

  return userDataList;
}

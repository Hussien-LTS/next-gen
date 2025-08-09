import { User } from 'src/entities/user.entity';
import { UserDTO } from './DTOs/user.dto';

export function mapToUserEntity(data: UserDTO): User {
  const user = new User();
  const userData = data.data;
  user.Id = userData.id;
  user.ModifiedDateTime = userData.modified_date__v;
  user.ExternalId = userData.nni_external_id__c;
  user.UserStatus = userData.status__v?.[0] || '';
  user.Alias = userData.alias__sys;
  user.TimeZoneSidKey = userData.timezone__sys?.[0] || '';
  user.LocaleSidKey = userData.locale__sys;
  user.EmailEncodingKey = ''; // No matching field found
  user.LanguageLocaleKey = userData.language_code__v;
  user.UserName = userData.username__sys;
  user.UserEmail = userData.email__sys;
  user.HomeAddressLine1 = userData.street__v;
  user.HomeCountry = userData.country_code__v;
  user.HomeCity = userData.city__v;
  user.HomeState = userData.state__v?.[0] || userData.state_province__v;
  user.HomePostalCode = userData.postalcode__v;
  user.UserFirstName = userData.first_name__sys;
  user.UserLastName = userData.last_name__sys;
  user.AssignmentPosition = userData.application_profile__v;

  return user;
}

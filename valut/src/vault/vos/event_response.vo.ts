export interface EventByIdVO {
  responseStatus: string
  responseDetails: ResponseDetails
  data: Data
  manually_assigned_sharing_roles: ManuallyAssignedSharingRoles
}

export interface ResponseDetails {
  url: string
  object: Object
}

export interface Object {
  url: string
  label: string
  name: string
  label_plural: string
  prefix: string
}

export interface Data {
  nni_meal_consumed_count_matches_receipt__c: any
  actual_cost__v: any
  actual_meal_cost_per_person_corpv__sys: any
  external_id_on24__v: any
  nni_duration_in_minutes__c: any
  presenter_url_on24__v: any
  stage__v: any
  nni_topic_and_budget_mismatch__c: boolean
  event_display_name__v: any
  webinar_status__v: any
  meal_optin_for_qr_signin__v: any
  attendees_requesting_meals__v: number
  vendor__v: any
  committed_cost__v: any
  manager__c: any
  audience_url_on24__v: any
  estimated_attendance__v: number
  lifecycle__v: string[]
  link__sys: any
  event_time_vpro__c: string
  non_prescriber_walk_in_fields__v: any
  country__v: string
  stage__sys: any
  id: string
  start_date__v: string
  registration_url__v: any
  state_province__v: string
  approval_submitter__c: string
  user_attendee_fields__v: string
  close_out_survey_vpro__c: any
  object_type__v: string
  location__v: string
  webinar_error_datetime__v: any
  attendees_with_meals__v: number
  nni_program_sub_type__c: string[]
  sponsor__v: any
  modified_date__v: string
  invited_attendees__v: number
  venue__v: string
  content_length__v: any
  hcps_with_meals__v: number
  em_event_status__v: string[]
  nni_2hcps_not_from_spkrs_practice__c: any
  start_time__v: string
  product__v: any
  financially_closed_date_vpro__c: any
  last_sync__v: any
  engage_webinar__v: any
  vault_binder_path__v: any
  publish_event__v: boolean
  key_contact_email__v: any
  nni_speaker_location__c: any
  cvent_event_status__v: any
  nni_eventattachmentcheck__c: boolean
  stage_setting__v: any
  nni_download_to_ipad__c: boolean
  location_type_vpro__c: string[]
  estimated_cost__v: any
  walk_in_count__v: number
  parent_event__v: any
  actual_cost_corpv__sys: any
  reporting_url_on24__v: any
  nni_territory_area__c: string
  event_attendee_record_count_vpro__c: string
  attendee_reconciliation_complete__v: boolean
  approval_comment__c: any
  account__v: any
  ctrl_survey__c: any
  created_date__v: string
  mobile_id__v: string
  teleconference_phone_vpro__c: any
  mobile_created_datetime__v: any
  centris_id__c: string
  external_id__v: any
  teleconference_url_vpro__c: any
  kol_external_id__v: any
  nni_no_meal_provided__c: boolean
  product_external_id_vpro__c: string
  approval_team_member_updated__c: boolean
  key_contact_name__v: any
  registration_form__v: any
  event_format__v: string[]
  event_configuration__v: string
  ownerid__v: string
  cancellation_reason__v: any
  event_number_vpro__c: string
  topic_name_vpro__c: string
  time_zone__v: string[]
  stub_sfdc_id__v: string
  location_address__v: string
  event_material_record_count_vpro__c: string
  end_time__v: string
  contact_attendee_fields__v: any
  name__v: string
  disclaimer__v: any
  reassign_event_vpro__c: string
  catering_provider__c: any
  nni_territory_region__c: string
  override_lock__v: boolean
  em_speaker_names_print_invite_vpro__c: any
  nni_attendee_status_attended_or_signed__c: number
  nni_attnd_meal_optin_not_attended_signed__c: number
  ahm_planning_status__c: string[]
  event_speaker_record_count_vpro__c: string
  process_trigger_time_15_vpro__c: string
  cvent_meeting_request_id__v: any
  start_time_local__v: string
  failed_expense__v: boolean
  city__v: string
  cvent_request_form__v: any
  committed_cost_corpv__sys: any
  vault_external_id__v: any
  created_by__v: number
  webinar_error_message__v: any
  location_time_zone_vpro__c: any
  walk_in_fields__v: string
  local_currency__sys: any
  event_time_formatted_vpro__c: string
  minhcpsnotfromspkpracticeattended__c: any
  av_descriptions__c: any
  nni_soft_warning__c: boolean
  logistics_event_status_vpro__c: string[]
  modified_by__v: number
  em_speaker_names_print_signin_vpro__c: any
  actual_meal_cost_per_person__v: any
  event_identifier__v: string
  description__v: string
  registration_url_long__v: any
  em_speaker_names_ae_invite_vpro__c: any
  em_event_summary_vpro__c: string
  key_contact_phone__v: any
  stub_mobile_id__v: any
  share_team_vpro__c: string
  postal_code__v: string
  lock__v: boolean
  account_attendee_fields__v: string
  online_registrant_count__v: number
  cvent_meeting_request_status__v: any
  av_equipment__v: any
  global_id__sys: string
  key_contact__v: any
  event_date_vpro__c: string
  estimated_cost_corpv__sys: any
  assigned_host__v: any
  approval_process_error__v: any
  location_type__v: any
  address__v: any
  nni_meal_count_mismatch_reason__c: any
  state_stage_id__sys: any
  prescriber_walk_in_fields__v: any
  actual_attendance__v: number
  legacy_crm_id__v: string
  cvent_event_id__v: any
  sign_in_url__v: any
  end_date__v: string
  nni_no_hcp_attendees__c: boolean
  nni_escalate_event__c: boolean
  end_time_local__v: string
  event_approval_type__c: string[]
  meal_type__v: any
  flat_fee_expense__v: any
  preview_url_on24__v: any
  mobile_last_modified_datetime__v: any
  qr_sign_in_enabled__v: string[]
  program_type__v: any
  country_user__v: any
  online_registration_fields__v: any
  nni_territory__c: string
  topic__v: string
  state__v: string[]
  event_budget_record_count_vpro__c: number
  other_walk_in_fields__v: any
  catering_notes__c: any
  process_trigger_time_05_vpro__c: string
  location_address_line_2__v: any
  nni_territory_district__c: string
  status__v: string[]
  web_source__v: any
  parent_program_type_vpro__c: any
}

export interface ManuallyAssignedSharingRoles {
  owner__v: OwnerV
  viewer__v: ViewerV
  editor__v: EditorV
}

export interface OwnerV {
  groups: any
  users: number[]
}

export interface ViewerV {
  groups: any
  users: any
}

export interface EditorV {
  groups: any
  users: any
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { RabbitMQService } from 'src/shared/rabbitmq/rabbitmq.service';
import { Repository } from 'typeorm';
import { FieldMappingEngineService } from 'src/field-mapping-engine/field-mapping-engine.service';
import { ExpansionRuleService } from 'src/expansion-rule/expansion-rule.service';
import { Estimate } from 'src/entities/estimate.entity';
import { EventBudget } from 'src/entities/event_pudget.entity';
import { Participant } from 'src/entities/participant.entity';
import { User } from 'src/entities/user.entity';
import { ExpansionRule } from 'src/entities/expansion-rule.entity';
import { TransactionLogService } from 'src/transaction-log/transaction-log.service';
import { mapTransactionLogPayload } from 'src/shared/transactionLog/mapTransactionLogPayload';
import { TRANSACTION_DIRECTIONS } from 'src/shared/constants/transaction-log-dirction';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Estimate)
    private readonly estimateRepository: Repository<Estimate>,
    @InjectRepository(EventBudget)
    private readonly eventBudgetRepository: Repository<EventBudget>,
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ExpansionRule)
    private readonly expansionRuleRepository: Repository<ExpansionRule>,
    private readonly fieldMappingEngineService: FieldMappingEngineService,
    private readonly transactionLogService: TransactionLogService,
    private readonly expansion: ExpansionRuleService,
    private readonly RMQService: RabbitMQService,
  ) {}
  async eventSaveProcess(body: any) {
    try {
      if (!body) {
        throw new Error('No veevaEvent data found in payload');
      }
      const owner = await this.userRepository.findOne({
        where: { Id: body.ownerid__v },
      });
      if (!owner) {
        const newOwner = this.userRepository.create({
          Id: body.ownerid__v,
        });
        await this.userRepository.save(newOwner);
      }
      // const expansion = await this.getExpansionValues(body);
      // 1. Save Event First
      const eventData: any = {
        Id: body.centris_id__c,
        EventModifiedDateTime:
          this.formatDateTime(body.modified_date__v) || null,
        ExternalId: body.external_id__v || null,
        ParentEventId: null,
        Program_Name: body.name__v || null,
        OwnerID: body.ownerid__v || null,
        End_date: body.end_date__v || null,
        End_Time: body.end_time__v || null,
        Hosting_Region: body.country__v || null,
        Event_Category: null,
        Event_Category_Group: null,
        Event_Type: body.eventType || null,
        Location_Type: body.location__v || null,
        Master_id: body.object_type__v || null,
        Primary_Collaborator: null,
        Primary_Organization_Unit: null,
        Region: body.city__v || null,
        Start_date: body.start_date__v || null,
        Start_Time: body.start_time__v || null,
        Status: body.status__v?.[0] || null,
        Current_Status: body.ahm_planning_status__c?.[0] || null,
        Time_Zone: body.time_zone__v?.[0] || null,
        Description: body.description__v || null,
        Total_Estimated_Number_of_Participants:
          body.estimated_attendance__v?.toString() || null,
        AttachmentExists: 'false',
        EventSubType: body.eventType || null,
        expansionList: body.expansionList || [],
      };
      const createdEvent = this.eventRepository.create(eventData);
      await this.eventRepository.save(createdEvent);
      // 2. Map Estimate (expense_estimate__vr)
      const estimates =
        body.expense_estimate__vr?.data?.map((item) => ({
          Id: item.id,
          ModifiedDateTime: this.formatDateTime(body.modified_date__v) || null,
          ExternalId: item.name__v || null,
          EventId: body.centris_id__c || null,
          SpendType: 'UNKNOWN',
          Actual: body.estimated_cost__v?.toString() || null,
        })) || [];
      if (estimates.length > 0) {
        await this.estimateRepository.save(estimates);
      }
      // 3. Map EventBudget (expense_header__vr)
      const budgets =
        body.expense_header__vr?.data?.map((item) => ({
          Id: item.id?.toString() || null,
          ModifiedDateTime: this.formatDateTime(body.modified_date__v) || null,
          ExternalId: item.name__v || null,
          EventId: body.centris_id__c?.toString() || null,
          BudgetName: item.name__v || null,
          ExternalBudgetId: item.name__v || null, // assuming name__v is the external ID
        })) || [];
      if (budgets.length > 0) {
        await this.eventBudgetRepository.save(budgets);
      }
      // 5. Map Participant (event_attendees__vr)
      const attendeeList = Array.isArray(body.attendeeData)
        ? body.attendeeData.map((item) => ({
            WalkInStatus: item.walk_in_status__v || null,
            Title: item.title__v || null,
            status: item.walk_in_status__v || null,
            ProfileType: item.attendee_type__v || null,
            PostalCode: item.zip__v || null,
            Phone: item.phone__v || null,
            ModifiedDateTime:
              this.formatDateTime(item.modified_date__v) || null,
            MealOptIn: item.meal_opt_in__v || null,
            LastName: item.last_name__v || null,
            InEligibleReasonAtTimeOfSubmission:
              item.ineligible_reason_at_time_of_submission__c || null,
            InEligibleReasonAtTimeOfRSVP:
              item.ineligible_reason_at_time_of_rsvp__c || null,
            InEligibleReasonAtTimeOfCreation:
              item.ineligible_reason_at_time_of_creation__c || null,
            InEligibleReasonAtTimeOfAttendance:
              item.ineligible_reason_at_time_of_attendance__c || null,
            InEligibleAtTimeOfSubmission:
              item.ineligible_at_time_of_submission__c || null,
            InEligibleAtTimeOfRSVP: item.ineligible_at_time_of_rsvp__c || null,
            InEligibleAtTimeOfCreation:
              item.ineligible_at_time_of_creation__c || null,
            InEligibleAtTimeOfAttendance:
              item.ineligible_at_time_of_attendance__c || null,
            FirstName: item.first_name__v || null,
            externalId: item.external_id__v || null,
            expansionList: item.expansionList || [],
            EventId: item.event__v || body.id,
            Email: item.email__v || null,
            City: item.city__v || null,
            attendeeId: item.id,
            Address: item.address_line_1__v || null,
            accountExtId: item.name__v || null,
          }))
        : [];
      const speakers =
        body.em_event_speaker__vr?.data?.map((item) =>
          this.mapParticipant(item, body, 'speaker'),
        ) || [];
      const teamMembers =
        body.em_event_team_member__vr?.data?.map((item) =>
          this.mapParticipant(item, body, 'team_member'),
        ) || [];
      await this.participantRepository.save([
        // ...attendeeList,
        ...speakers,
        ...teamMembers,
      ]);
      // 7. Transform to RMQ format
      const rmqPayload = this.transformToRMQFormat(body);
      const payload = JSON.stringify(rmqPayload, null, 2);
      console.log('[DEBUG] rmqPayload:', payload);
      const centrisRes = await this.RMQService.send(
        'datasource-event-created-to-sf',
        payload,
      );
      console.log('[DEBUG] RMQ response:', centrisRes);
      if (!centrisRes) {
        throw new BadRequestException('Failed to send event data to RMQ');
      }
      // 8. Log transaction
      const transactionLogData = mapTransactionLogPayload({
        name: body.centris_id__c || body.EventId,
        success: true,
        logType: 'Event',
        direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
      });
      await this.transactionLogService.create(transactionLogData);
      return centrisRes;
    } catch (error) {
      const transactionLogData = mapTransactionLogPayload({
        name: body.centris_id__c || body.EventId,
        success: false,
        logType: 'Event',
        direction: TRANSACTION_DIRECTIONS.VAULT_INBOUND,
        errorMessage: error.message,
      });
      await this.transactionLogService.create(transactionLogData);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }
  // Helper method to extract values from expansionList
  private async getExpansionValues(body: any) {
    const targetApiId: any = 'Event';
    const direction = 'vaultToAWS';
    const fieldMapping =
      await this.expansion.getExpansionRulesByApiName(targetApiId);

    if (fieldMapping.length) {
      const expansionResults: any = [];
      const expansionMap =
        await this.fieldMappingEngineService.applyFieldMappings(
          targetApiId,
          direction,
          body.expansionList,
        );

      for (var e of body.expansionList) {
        if (!e) {
          throw new Error('No expansion found for the field');
        }

        // Check if the outBoundField exists in the database expansion rules
        const existingRule = fieldMapping.find(
          (rule) =>
            rule.centrisField === e.outBoundField ||
            rule.vaultField === e.outBoundField,
        );

        if (existingRule) {
          console.log(
            `Found existing rule for ${e.outBoundField}:`,
            existingRule,
          );
          // Process the expansion item since it exists in DB
          const processedExpansion = {
            outBoundField: e.outBoundField,
            actualValue: e.actualValue || null,
          };

          expansionResults.push(processedExpansion);
        } else {
          console.log(`No rule found for outBoundField: ${e.outBoundField}`);
        }
      }
      return expansionResults;
    }
    return [];
  }
  private transformToRMQFormat(body: any): any {
    const teamMemberList =
      body.em_event_team_member__vr?.data?.map((item) => ({
        userId: item.user_id__v || item.name__v || null,
        teamMemberId: item.id,
        role: item.role__v || 'team_member',
        ModifiedDateTime: this.formatDateTime(
          item.modified_date__v || body.modified_date__v,
        ),
        isOwner: item.id === body.ownerid__v ? 'TRUE' : null,
        ExternalId: item.name__v || null,
        expansionList: item.expansionList || [],
        EventId: body.centris_id__c,
      })) || [];

    const eventSpeakerList =
      body.em_event_speaker__vr?.data?.map((item) => ({
        status: item.status__v?.[0] || 'Invited',
        speakerId: item.speakerId || item.id,
        speakerAccId: item.speakerAccId || null,
        PreferenceOrder: item.PreferenceOrder || '1',
        Preference: item.Preference || 'Preferred',
        ModifiedDateTime: this.formatDateTime(
          item.ModifiedDateTime || body.modified_date__v,
        ),
        MealOptIn: item.MealOptIn || 'false',
        InEligibleReasonAtTimeOfSubmission:
          item.InEligibleReasonAtTimeOfSubmission ||
          'Processing Complete with ineligibilities Invalid Topic',
        InEligibleReasonAtTimeOfCreation:
          item.InEligibleReasonAtTimeOfCreation ||
          'Processing Complete with ineligibilities Invalid Topic',
        InEligibleAtTimeOfSubmission:
          item.InEligibleAtTimeOfSubmission || 'true',
        InEligibleAtTimeOfCreation: item.InEligibleAtTimeOfCreation || 'true',
        externalId: item.externalId || item.name__v || null,
        expansionList: item.expansionList || [],
        EventId: body.centris_id__c,
      })) || [];

    const estimateList =
      body.expense_estimate__vr?.data?.map((item) => ({
        ModifiedDateTime: this.formatDateTime(
          item.ModifiedDateTime || body.modified_date__v,
        ),
        IntBudId: item.IntBudId || 'a2lOy000002U6ZtIAK',
        ExternalId: null,
        ExpenseType: item.ExpenseType || 'General',
        expansionList: item.expansionList || [],
        EventId: item.centris_id__c || body.id,
        EventBudgetId: item.EventBudgetId || null,
        EstimateId: item.EstimateId || item.id,
        EstimateAmount:
          item.EstimateAmount?.toString() ||
          body.estimated_cost__v?.toString() ||
          '0.00',
      })) || [];

    const eventBudget = body.expense_header__vr?.data?.[0]
      ? {
          ModifiedDateTime: this.formatDateTime(body.modified_date__v),
          IntBudId:
            body.expense_header__vr.data[0].IntBudId || 'a2lOy000002U6ZtIAK',
          ExternalId:
            body.expense_header__vr.data[0].ExternalId ||
            body.expense_header__vr.data[0].id ||
            null,
          expansionList: body.expense_header__vr.data[0].expansionList || [],
          EventId: body.centris_id__c,
          BudgetName:
            body.expense_header__vr.data[0].BudgetName ||
            body.expense_header__vr.data[0].name__v ||
            null,
          BudExternalId: 'AHM_BUD_00190-SCBDF000',
        }
      : null;
    console.log('[DEBUG] body:', body.event_attendees__vr.data);

    const attendeeList = Array.isArray(body.attendeeData)
      ? body.attendeeData.map((item) => ({
          WalkInStatus: item.walk_in_status__v || null,
          Title: item.title__v || null,
          status: item.walk_in_status__v || null,
          ProfileType: item.attendee_type__v || null,
          PostalCode: item.zip__v || null,
          Phone: item.phone__v || null,
          ModifiedDateTime: this.formatDateTime(item.modified_date__v) || null,
          MealOptIn: item.meal_opt_in__v || null,
          LastName: item.last_name__v || null,
          InEligibleReasonAtTimeOfSubmission:
            item.ineligible_reason_at_time_of_submission__c || null,
          InEligibleReasonAtTimeOfRSVP:
            item.ineligible_reason_at_time_of_rsvp__c || null,
          InEligibleReasonAtTimeOfCreation:
            item.ineligible_reason_at_time_of_creation__c || null,
          InEligibleReasonAtTimeOfAttendance:
            item.ineligible_reason_at_time_of_attendance__c || null,
          InEligibleAtTimeOfSubmission:
            item.ineligible_at_time_of_submission__c || null,
          InEligibleAtTimeOfRSVP: item.ineligible_at_time_of_rsvp__c || null,
          InEligibleAtTimeOfCreation:
            item.ineligible_at_time_of_creation__c || null,
          InEligibleAtTimeOfAttendance:
            item.ineligible_at_time_of_attendance__c || null,
          FirstName: item.first_name__v || null,
          externalId: item.external_id__v || null,
          expansionList: item.expansionList || [],
          EventId: item.event__v || body.id,
          Email: item.email__v || null,
          City: item.city__v || null,
          attendeeId: item.id,
          Address: item.address_line_1__v || null,
          accountExtId: item.name__v || null,
        }))
      : [];
    console.log('[DEBUG] attendeeList after map:', attendeeList);
    const rmqEvent = {
      VenueState: body.state_province__v || null,
      VenuePostalCode: body.postal_code__v || null,
      VenueName: body.venue__v || null,
      VenueExternalId: body.external_id__v || 'AHM_SP10406',
      VenueCity: body.city__v || null,
      VenueAddressLine2: null,
      VenueAddress: body.address__v || '1800 North Point Drive',
      transactionId: body.centris_id__c || null,
      TopicID: body.topic__v || 'AHM_TOP_0671',
      TeamMemberList: teamMemberList || null,
      status: body.status__v?.[0] || null,
      StartTimeLocal: this.formatDateTime(body.start_time_local__v) || null,
      StartDateTime: this.formatDateTime(body.start_time__v) || null,
      StartDateLocal: body.start_date__v || null,
      ReconcilationStatus:
        body.attendee_reconciliation_complete__v?.toString() || 'false',
      PlannerApprovalNotRequired: 'false',
      ParentEventId: body.parent_event_id__v || null,
      OwnerID: body.ownerid__v || null,
      latestApprovalCommentid: null,
      latestApprovalComment: body.approval_comment__c || null,
      latestApprovalAction: null,
      IsVeevaSFDCAutoflow: 'false',
      ExternalId: body.external_id__v || null,
      ExpenseList: [], // Add if needed
      expansionList: body.expansionList || [],
      eventType: body.eventType || 'Unknown',
      EventTimeZoneLocal: this.mapTimeZone(body.time_zone__v?.[0]) || null,
      EventSubType: body.eventType || 'Unknown',
      EventSpeakerList: eventSpeakerList,
      EventOwnerTimeZone: this.mapTimeZone(body.time_zone__v?.[0]) || null,
      EventName: body.name__v || null,
      EventModifiedDateTime: this.formatDateTime(body.modified_date__v) || null,
      EventId: body.centris_id__c,
      EventBudget: eventBudget,
      EstimateList: estimateList,
      EstimatedAttendance: body.estimated_attendance__v?.toString() || '0',
      EndTimeLocal: '13:00:00.000Z',
      EndDateTime: this.formatDateTime(body.end_time__v) || null,
      EndDateLocal: body.end_date__v || null,
      Description: body.description__v || null,
      deletedAttendeeList: [],
      countryCode: 'US',
      CancellationRequestedDate: null,
      CancellationRequested: null,
      CancellationNotes: body.cancellation_reason__v || null,
      AutoApprovalNotRequired: 'false',
      attendeeList: attendeeList,
      AttachmentExists: 'false',
      AhmPlanningStatus:
        body.ahm_planning_status__c?.[0] || 'AHM Approval Required',
    };

    return {
      veevaEvent: [rmqEvent],
    };
  }

  private formatDateTime(dateString: string): string | null {
    if (!dateString || typeof dateString !== 'string') return null;
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) {
      console.warn(`[Invalid Date] formatDateTime received: "${dateString}"`);
      return null;
    }
    return parsed.toISOString().slice(0, 19).replace('T', ' ');
  }

  private mapTimeZone(timeZone: string) {
    if (!timeZone) return null;

    const timeZoneMap = {
      america_new_york__sys: 'America/New_York',
      america_los_angeles__sys: 'America/Los_Angeles',
      america_chicago__sys: 'America/Chicago',
      // Add more mappings as needed
    };
    return timeZoneMap[timeZone] || timeZone;
  }
  private mapParticipant(item: any, body: any, type: string) {
    return {
      Id: item.id?.toString() || 'a1JaZ0000009d0YUAQ',
      ModifiedDateTime: body.modified_date__v || null,
      ExternalId: item.name__v || 'a1JaZ0000009d0YUAQ',
      FirstName: item.first_name__v || null,
      LastName: item.last_name__v || null,
      Title: item.title__v || null,
      City: item.city__v || null,
      PostalCode: item.postal_code__v || null,
      Phone: item.phone__v || null,
      Email: item.email__v || null,
      Address: item.address__v || null,
      ProfileType: item.profile_type__v || null,
      EventId: body.centris_id__c?.toString() || null,
      Preference: item.preference__v || null,
      PreferenceOrder: item.preference_order__v || null,
      HCPId: item.hcp__v || null,
      EmployedId: item.employed__v || null,
      TopicId: item.topic__v || null,
      Type: type,
      Role: item.role__v || null,
      ProductId: item.product__v || null,
      Status: item.status__v?.[0] || null,
      MealConsumed: item.meal_consumed__v || null,
      RSVPStatus: item.rsvp_status__v || null,
      DidAttend: item.did_attend__v || null,
      WalkInStatus: item.walk_in_status__v || null,
    };
  }

  async centrisTodb(body: any) {
    const vaultEventPayload = this.transformToVaultFormat(body);
    return vaultEventPayload;
  }

  private transformToVaultFormat(centrisEvent: any): any {
    const event = centrisEvent?.veevaEvent?.[0];

    if (!event) return null;

    const formatDate = (val: string) =>
      val ? new Date(val).toISOString() : undefined;

    return {
      state_province__v: event.VenueState,
      postal_code__v: event.VenuePostalCode,
      venue__v: event.VenueName,
      external_id__v: event.VenueExternalId,
      city__v: event.VenueCity,
      address__v: event.VenueAddress,
      centris_id__c: event.transactionId,
      topic__v: event.TopicID,
      status__v: [event.status],
      start_time_local__v: formatDate(event.StartTimeLocal),
      start_time__v: formatDate(event.StartDateTime),
      start_date__v: event.StartDateLocal,
      attendee_reconciliation_complete__v: event.ReconcilationStatus === 'true',
      parent_event_id__v: event.ParentEventId,
      ownerid__v: event.OwnerID,
      approval_comment__c: event.latestApprovalComment,
      eventType: event.eventType,
      time_zone__v: [this.reverseMapTimeZone(event.EventTimeZoneLocal)],
      name__v: event.EventName,
      modified_date__v: formatDate(event.EventModifiedDateTime),
      estimated_attendance__v: parseInt(event.EstimatedAttendance) || 0,
      end_time__v: formatDate(event.EndDateTime),
      end_date__v: event.EndDateLocal,
      description__v: event.Description,
      cancellation_reason__v: event.CancellationNotes,
      ahm_planning_status__c: [event.AhmPlanningStatus],

      // Team Members
      em_event_team_member__vr: {
        data: event.TeamMemberList?.map((item) => ({
          user_id__v: item.userId,
          id: item.teamMemberId,
          role__v: item.role,
          modified_date__v: formatDate(item.ModifiedDateTime),
          name__v: item.ExternalId,
          expansionList: item.expansionList,
        })),
      },

      // Speakers
      em_event_speaker__vr: {
        data: event.EventSpeakerList?.map((item) => ({
          id: item.speakerId,
          speakerAccId: item.speakerAccId,
          PreferenceOrder: item.PreferenceOrder,
          Preference: item.Preference,
          ModifiedDateTime: formatDate(item.ModifiedDateTime),
          MealOptIn: item.MealOptIn,
          InEligibleReasonAtTimeOfSubmission:
            item.InEligibleReasonAtTimeOfSubmission,
          InEligibleReasonAtTimeOfCreation:
            item.InEligibleReasonAtTimeOfCreation,
          InEligibleAtTimeOfSubmission: item.InEligibleAtTimeOfSubmission,
          InEligibleAtTimeOfCreation: item.InEligibleAtTimeOfCreation,
          externalId: item.externalId,
          name__v: item.externalId,
          expansionList: item.expansionList,
        })),
      },

      // Estimates
      expense_estimate__vr: {
        data: event.EstimateList?.map((item) => ({
          id: item.EstimateId,
          EventBudgetId: item.EventBudgetId,
          centris_id__c: item.EventId,
          EstimateAmount: parseFloat(item.EstimateAmount),
          ModifiedDateTime: formatDate(item.ModifiedDateTime),
          IntBudId: item.IntBudId,
          ExpenseType: item.ExpenseType,
          expansionList: item.expansionList,
        })),
      },

      // Budget
      expense_header__vr: {
        data: event.EventBudget
          ? [
              {
                name__v: event.EventBudget.BudgetName,
                id: event.EventBudget.ExternalId,
                IntBudId: event.EventBudget.IntBudId,
                ExternalId: event.EventBudget.ExternalId,
                expansionList: event.EventBudget.expansionList,
              },
            ]
          : [],
      },

      // Attendees
      event_attendees__vr: {
        data: event.attendeeList?.map((item) => ({
          id: item.attendeeId,
          status__v: [item.status],
          name__v: item.ExternalId,
          ModifiedDateTime: formatDate(item.ModifiedDateTime),
          expansionList: item.expansionList,
        })),
      },
      expansionList: event.expansionList || [],
    };
  }
  private reverseMapTimeZone(displayZone: string): string {
    const reverseMap = {
      'America/New_York': 'america_new_york__sys',
      'America/Los_Angeles': 'america_los_angeles__sys',
      'America/Chicago': 'america_chicago__sys',
      // Add others if needed
    };
    return reverseMap[displayZone] || displayZone;
  }
  async transactionLogEvent(payload: any) {
    const transactionLogData = mapTransactionLogPayload({
      name: payload.data.id || payload.data,
      success: true,
      logType: 'Event',
      direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
    });
    await this.transactionLogService.create(transactionLogData);
  }
  async transactionLogCentrisEvent(payload: any) {
    try {
      const owner = await this.userRepository.findOne({
        where: { Id: payload.OwnerID },
      });
      if (!owner) {
        const newOwner = this.userRepository.create({
          Id: payload.OwnerID,
        });
        await this.userRepository.save(newOwner);
      }
      const eventData: any = {
        Id: payload.veevaEvent[0].EventId || null,
        EventModifiedDateTime:
          payload.veevaEvent[0].EventModifiedDateTime || null,
        ExternalId: payload.veevaEvent[0].ExternalId || null,
        ParentEventId: payload.veevaEvent[0].ParentEventId || null,
        Program_Name: payload.veevaEvent[0].EventName || null,
        OwnerID: payload.veevaEvent[0].OwnerID || null,
        End_date: payload.veevaEvent[0].EndDateLocal || null,
        End_Time: payload.veevaEvent[0].EndTimeLocal || null,
        Hosting_Region: payload.veevaEvent[0].VenueState || null,
        Event_Category: null, // Not available in payload
        Event_Category_Group: null, // Not available in payload
        Event_Type: payload.veevaEvent[0].eventType || null,
        Master_id: payload.veevaEvent[0].EventId || null,
        Primary_Collaborator: null, // Not available in payload
        Primary_Organization_Unit: null, // Not available in payload
        Region: payload.veevaEvent[0].VenueCity || null,
        Start_date: payload.veevaEvent[0].StartDateLocal || null,
        Start_Time: payload.veevaEvent[0].StartTimeLocal || null,
        Status: payload.veevaEvent[0].status || null,
        Current_Status: payload.veevaEvent[0].AhmPlanningStatus || null,
        Time_Zone: payload.veevaEvent[0].EventTimeZoneLocal || null,
        Description: payload.veevaEvent[0].Description || null,
        Total_Estimated_Number_of_Participants:
          payload.veevaEvent[0].EstimatedAttendance || null,
        AttachmentExists: 'false',
        EventSubType: payload.veevaEvent[0].EventSubType || null,
        expansionList: payload.veevaEvent[0].expansionList || [],
      };
      const createdEvent = this.eventRepository.create(eventData);
      await this.eventRepository.save(createdEvent);

      const estimates =
        payload.veevaEvent[0].EstimateList?.map((item) => ({
          Id: item.EstimateId,
          ModifiedDateTime: item.ModifiedDateTime || null,
          ExternalId: item.ExternalId || null,
          EventId: payload.veevaEvent[0].EventId || null,
          SpendType: item.ExpenseType || 'UNKNOWN',
          Actual: item.EstimateAmount?.toString() || null,
        })) || [];
      await this.estimateRepository.save(estimates);

      const budgets = payload.veevaEvent[0].EventBudget
        ? [
            {
              Id:
                payload.veevaEvent[0].EventBudget.ExternalId?.toString() ||
                null,
              ModifiedDateTime:
                payload.veevaEvent[0].EventBudget.ModifiedDateTime || null,
              ExternalId: payload.veevaEvent[0].EventBudget.ExternalId || null,
              EventId: payload.veevaEvent[0].EventId || null,
              BudgetName: payload.veevaEvent[0].EventBudget.BudgetName || null,
              ExternalBudgetId:
                payload.veevaEvent[0].EventBudget.BudExternalId || null,
            },
          ]
        : [];
      await this.eventBudgetRepository.save(budgets);

      const allParticipants = [
        ...(payload.veevaEvent[0].attendeeList?.map((item) =>
          this.mapParticipant(item, payload.veevaEvent[0], 'attendee'),
        ) || []),
        ...(payload.veevaEvent[0].EventSpeakerList?.map((item) =>
          this.mapParticipant(item, payload.veevaEvent[0], 'speaker'),
        ) || []),
        ...(payload.veevaEvent[0].TeamMemberList?.map((item) =>
          this.mapParticipant(item, payload.veevaEvent[0], 'team_member'),
        ) || []),
      ];

      for (const participant of allParticipants) {
        const exists = await this.participantRepository.findOne({
          where: { Id: participant.Id },
        });

        if (!exists) {
          const newParticipant = this.participantRepository.create(participant);
          await this.participantRepository.save(newParticipant);
        } else {
          console.log(
            `Participant with Id ${participant.Id} already exists. Skipping.`,
          );
        }
      }
      const transactionLogData = mapTransactionLogPayload({
        name: payload.veevaEvent?.[0].EventId || 'Centris I',
        success: true,
        logType: 'Event',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
      });
      mapTransactionLogPayload({
        name: payload.veevaEvent?.[0].EventId || 'Centris I',
        success: true,
        logType: 'Event',
        direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
      });
      return await this.transactionLogService.create(transactionLogData);
    } catch (error) {
      const transactionLogData = mapTransactionLogPayload({
        name: payload.veevaEvent?.[0].EventId || 'Centris I',
        success: false,
        logType: 'Event',
        direction: TRANSACTION_DIRECTIONS.CENTRIS_INBOUND,
        errorMessage: error.message,
      });
      mapTransactionLogPayload({
        name: payload.veevaEvent?.[0].EventId || 'Centris I',
        success: false,
        logType: 'Event',
        direction: TRANSACTION_DIRECTIONS.VAULT_OUTBOUND,
        errorMessage: error.message,
      });
      const res = await this.transactionLogService.create(transactionLogData);
      return {
        isError: true,
        statusCode: 400,
        message: error.message,
        Id: res.Id,
      };
    }
  }
}

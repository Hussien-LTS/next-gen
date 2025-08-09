import { Injectable, HttpException, Logger, HttpStatus } from '@nestjs/common';


import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AttachmentDto } from '../models/attachment_dto.model';
import { RabbitMQProducerService } from './rabbitmq.produce.service';
import { RabbitMQQueue } from './queue.enum';
import * as qs from 'qs';
import { ApiProperty } from '@nestjs/swagger';
import { EventByIdVO } from '../vos/event_response.vo';



export class SparkMessageDto {
    @ApiProperty({ description: 'Type of event, e.g., CREATE, UPDATE, DELETE' })
    event_type: string;

    @ApiProperty({ description: 'Name of the Vault object affected by the event' })
    object: string;

    @ApiProperty({ description: 'Unique Vault record ID of the affected object' })
    record_id: string;

    @ApiProperty({ description: 'Timestamp of the event in ISO format' })
    timestamp: string;

    @ApiProperty({ description: 'User who triggered the event' })
    user: string;

    @ApiProperty({ description: 'Object data at the time of the event' })
    data: Record<string, any>;
}


class UpdateEventDto {

    @ApiProperty({ description: 'fieldName' })
    fieldName: string;

    @ApiProperty({ description: 'value' })
    value: string;

}

const VAULT_BASE_URL = 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/query';
const VAULT_HEADERS = {
    Authorization: 'Bearer YOUR_ACCESS_TOKEN',
    'X-VaultAPI-ClientID': 'YOUR_CLIENT_ID',
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
};


@Injectable()
export class VaultService {



    private readonly logger = new Logger(VaultService.name);
    private authToken = "";
    private clientId = "";


    private readonly baseUrl = 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3';


    constructor(private readonly httpService: HttpService, private readonly rabbitMQProducerService: RabbitMQProducerService) { }


    async getDocuments(authh: string, cntId: string): Promise<any> {

        this.authToken = authh;
        this.clientId = cntId;

        const config = {
            method: 'get' as const,
            url: `${this.baseUrl}/objects/documents`,
            headers: {
                Authorization: authh,
                Accept: 'application/json',
                'X-VaultAPI-ClientID': cntId,
            },
        };

        try {
            const response = await axios.request(config);
            return response.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Failed to fetch documents',
                error.response?.status || 500,
            );
        }
    }

    // @Cron(CronExpression.EVERY_2_HOURS)
    // async scheduledVaultFetch() {
    //     this.logger.log('Running scheduled Vault data fetch...EVENT DOCUMENT');

    //     const result = await this.getDocuments(this.authToken, this.clientId);
    //     this.logger.log('Scheduled Vault fetch result:', JSON.stringify(result));
    // }


    start() {
        // do not use hardcoded values in production
        // commenting this out for now
        /*let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/metadata/objects/documents/events',
            headers: {
                'Authorization': '38F01FA1EB8D52B3AB31E48F05CF804475F99B584316027E73713975CAA0297870C16E43554AEEA98F0C9936041DFAD48E188130D638E546500B23B4253E18A7',
                'Accept': 'application/json',
                'X-VaultAPI-ClientID': '3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm'
            }
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });*/
    }

    async getDocumentEvents(authh: string, cntId: string): Promise<any> {
        const config = {
            method: 'get' as const,
            url: 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/metadata/objects/documents/events',
            headers: {
                'Authorization': authh,
                'Accept': 'application/json',
                'X-VaultAPI-ClientID': cntId
            },
            maxBodyLength: Infinity,
        };

        try {
            const response = await firstValueFrom(this.httpService.request(config));
            return response.data.data;
        } catch (error) {
            console.error('Error fetching document events:', error?.response?.data || error.message);
            throw error;
        }
    }


    async getAttachments(authh: string, transactionId: string): Promise<AttachmentDto[]> {
        //   const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/transaction_logs__c/${recordId}/attachments`;

        const config = {
            method: 'get' as const,
            url: `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/transaction_logs__c/${transactionId}/attachments`,
            headers: {
                'Authorization': authh,
                'Accept': 'application/json',
                'X-VaultAPI-ClientID': "3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm"
            },
            maxBodyLength: Infinity,
        };



        try {
            const response = await firstValueFrom(this.httpService.request(config));
            return response.data.data;
        } catch (error) {
            console.error('Error fetching document events:', error?.response?.data || error.message);
            throw error;
        }

    }


    receiveEventTransactionAttachmentAndPublishTOMQ(data: any) {

        console.log("Data from Veeva Veualt LOGS : ", data);

        this.rabbitMQProducerService.sendToQueue(data, RabbitMQQueue.VEEVA_EVENTS);
    }


    async updateEvent(eventId: string, authToken: string, requestBody: UpdateEventDto) {

        const data = qs.stringify(requestBody);
        console.log("Data : ", data);

        const record: Record<string, string> = {
            [requestBody.fieldName]: requestBody.value
        };
        const config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_event__v/${eventId}`,
            headers: {
                Authorization: authToken,
                Accept: 'application/json',
                'X-VaultAPI-ClientID':
                    '3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: record,
        };
        console.log(qs.stringify(config));
        try {
            const response = await axios.request(config);
            return response.data.data;
        } catch (error) {
            console.error(error.response?.data || error.message);
            throw new Error('Failed to update Veeva Event');
        }

    }

    async eventQyeryObject(eventId: string, authToken: string, vobjectName: string, name: string): Promise<any> {
        const query = `SELECT id, event__v , ${name} FROM ${vobjectName} WHERE event__v = '${eventId}'`;
        const data = qs.stringify({ q: query });

        const record: Record<string, string> = {
            ["q"]: query
        }
        const config = {
            method: 'post' as const,
            maxBodyLength: Infinity,
            url: 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/query',
            headers: {
                Authorization: authToken,
                Accept: 'application/json',
                'X-VaultAPI-DescribeQuery': 'true',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-VaultAPI-ClientID': '3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm',
            },
            data: data,
        };

        const response = await axios.request(config);
        return response.data.data;
    }


    async queryVault(queryVar: string, authToken: string): Promise<any> {
        const query = queryVar;
        const data = qs.stringify({ q: query });

        const record: Record<string, string> = {
            ["q"]: query
        }
        const config = {
            method: 'post' as const,
            maxBodyLength: Infinity,
            url: 'https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v25.1/query',
            headers: {
                Authorization: authToken,
                Accept: 'application/json',
                'X-VaultAPI-DescribeQuery': 'true',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-VaultAPI-ClientID': '3MVG9dG9pUXcsrJANLhayvGIEIgf3Kq5FUDwaSx.rHj.Ji2D2.F7ouMmJTTJk8H5qxLM_uQsopuv6J5nnzADm',
            },
            data: data,
        };

        const response = await axios.request(config);
        console.log("queryVault ... ", response.data)
        return response.data;
    }


    async eventById(id: string, authToken: string,) {
        const url = `https://sb-novo-migrator-na-2025-01-27v2.veevavault.com/api/v20.3/vobjects/em_event__v/${id}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: authToken,
                    Accept: 'application/json',
                    'X-VaultAPI-ClientID': 'your-client-id',
                },
            });

            console.log("DATA \n",response.data);
            const eventByIdVO: EventByIdVO = response.data as EventByIdVO;

            console.log(eventByIdVO.data);

            return eventByIdVO.data;
        } catch (error) {
            console.error('Veeva error:', error?.response?.data);
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error?.response?.data || 'Failed to fetch events from Veeva Vault',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    //  const [event, teamMembers, attendees, budgets] = await Promise.all([
    //     this.queryVault(`SELECT id, name__v, venue_name__v, venue_address__v, venue_city__v, venue_state__v, venue_postal_code__v, estimated_attendance__v, start_date__v, end_date__v, start_time_local__v, end_time_local__v, time_zone__v, owner__v, status__v, description__v FROM em_event__v WHERE id = '${eventId}'`,authToken),
    //     this.queryVault(`SELECT id, user__v, role__v, is_owner__v, modified_date__v FROM em_event_team_member__v WHERE event__v = '${eventId}'`,authToken),
    //     this.queryVault(`SELECT id, attendee__v, participation_status__v FROM em_event_attendee__v WHERE event__v = '${eventId}'`,authToken),
    //     this.queryVault(`SELECT id, budget_name__v, external_id__v, modified_date__v FROM em_event_budget__v WHERE event__v = '${eventId}'`,authToken),
    //   ]);
    async getStructuredEventPayload(eventId: string, authToken: string) {
        const [event, teamMembers, attendees, budgets] = await Promise.all([
            this.queryVault(`SELECT id, name__v,         estimated_attendance__v, start_date__v, end_date__v, start_time_local__v, end_time_local__v, time_zone__v,   status__v, description__v FROM em_event__v WHERE id = '${eventId}'`, authToken),
            this.queryVault(`SELECT id,   role__v,  modified_date__v FROM em_event_team_member__v WHERE event__v = '${eventId}'`, authToken),
            this.queryVault(`SELECT id FROM em_attendee__v WHERE event__v = '${eventId}'`, authToken),
            this.queryVault(`SELECT id, budget_name__v, external_id__v, modified_date__v FROM em_event_budget__v WHERE event__v = '${eventId}'`, authToken),
        ]);

        const e = event[0];

        return {
            VenueState: "sfdgdfgh",// e.venue_state__v,
            VenuePostalCode: "kdjd dskcf",// e.venue_postal_code__v,
            VenueName: "JJSJS JHJN",//e.venue_name__v,
            VenueExternalId: null,
            VenueCity: "AMmaman",//e.venue_city__v,
            VenueAddressLine2: null,
            VenueAddress: "HHAHSJJ lkl",//e.venue_address__v,
            transactionId: "KSKSKKSKKSK",//e.id,
            TopicID: 'AHM_TOP_0640',
            TeamMemberList: teamMembers.map(tm => ({
                userId: tm.user__v,
                teamMemberId: tm.id,
                role: tm.role__v,
                ModifiedDateTime: tm.modified_date__v,
                isOwner: tm.is_owner__v ? 'TRUE' : null,
                ExternalId: null,
                expansionList: [],
                EventId: eventId,
            })),
            status: e.status__v,
            StartTimeLocal: e.start_time_local__v,
            StartDateTime: e.start_date__v + ' ' + e.start_time_local__v,
            StartDateLocal: e.start_date__v,
            ReconcilationStatus: 'false',
            PlannerApprovalNotRequired: 'false',
            ParentEventId: null,
            ownerId: e.owner__v,
            latestApprovalCommentid: null,
            latestApprovalComment: null,
            latestApprovalAction: null,
            IsVeevaSFDCAutoflow: 'false',
            ExternalId: null,
            ExpenseList: [],
            expansionList: [
                { outBoundField: 'Event_Number_vpro__c', actualValue: e.description__v },
                { outBoundField: 'Start_Date_vod__c', actualValue: e.start_date__v },
                { outBoundField: 'Start_Time_Local_vod__c', actualValue: e.start_time_local__v },
                { outBoundField: 'Time_Zone_vod__c', actualValue: e.time_zone__v },
            ],
            eventType: 'Speaker Program',
            EventTimeZoneLocal: e.time_zone__v,
            EventSubType: 'Home Office Webcast Satellite',
            EventSpeakerList: [], // you can fill this the same way
            EventOwnerTimeZone: e.time_zone__v,
            EventName: e.name__v,
            EventModifiedDateTime: e.modified_date__v,
            EventId: e.id,
            EventBudget: budgets.length ? {
                ModifiedDateTime: budgets[0].modified_date__v,
                IntBudId: null,
                ExternalId: budgets[0].external_id__v,
                expansionList: [],
                EventId: e.id,
                BudgetName: budgets[0].budget_name__v,
                BudExternalId: budgets[0].external_id__v,
            } : null,
            EstimateList: [],
            EstimatedAttendance: e.estimated_attendance__v,
            EndTimeLocal: e.end_time_local__v,
            EndDateTime: e.end_date__v + ' ' + e.end_time_local__v,
            EndDateLocal: e.end_date__v,
            Description: e.description__v,
            deletedAttendeeList: [],
            countryCode: 'US',
            CancellationRequestedDate: null,
            CancellationRequested: null,
            CancellationNotes: null,
            AutoApprovalNotRequired: 'false',
            attendeeList: attendees.map(a => ({
                id: a.id,
                attendeeId: a.attendee__v,
                status: a.participation_status__v,
            })),
            AttachmentExists: 'false',
            AhmPlanningStatus: 'AHM Rejected',
        };
    }

    async handleSparkMessage(msg: SparkMessageDto, auth: string) {

        if (msg.event_type === "CREATE") {
            if (msg.object === "em_event__v") {
                const eventId = msg.record_id;
                console.log(" handleSparkMessage ... successful ");
                return this.eventById(eventId, auth);
            }

        }else{
            return msg ;
        }

    }
}

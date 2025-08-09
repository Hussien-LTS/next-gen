import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AttachmentService } from './attachment.service';

@Controller('attachment-sync')
export class AttachmentSyncController {
  private readonly logger = new Logger(AttachmentSyncController.name);

  constructor(private readonly attachmentService: AttachmentService) {}

} 

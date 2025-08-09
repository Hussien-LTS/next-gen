/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AttachmentDto {
  @ApiProperty({
    description: 'Base64 encoded file content',
    example: 'Base64 File Content',
  })
  @IsNotEmpty()
  Body: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'text/plain',
  })
  @IsNotEmpty()
  ContentType: string;

  @ApiProperty({
    description: 'Name of the attachment',
    example: 'Test',
  })
  @IsNotEmpty()
  Name: string;

  @ApiProperty({
    description: 'ID of the related event',
    example: 'a2v5C000000YhJ0QAK',
  })
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'Transaction ID associated with the attachment',
    example: 'a3Gf4000000TWbk',
  })
  @IsNotEmpty()
  TransactionId: string;

  @ApiProperty({
    description: 'Unique ID of the attachment',
    example: '00P5C000000VBZGUA4',
  })
  @IsNotEmpty()
  AttachmentId: string;

  @ApiProperty({
    description: 'Length of the file body including unit',
    example: '9860.0Kb',
  })
  @IsNotEmpty()
  BodyLength: string;
}

export class GetEventIdDto {
  @ApiProperty({
    type: String,
    example: 'a2v5C000000YhJ0QAK',
    description: 'ID of the event to fetch attachments for',
  })
  @IsNotEmpty()
  eventId: string;
}

export class AuthResponseDto {
  userId: string;
  access_token: string;
  expiresIn: number;
}

export class AttachmentProcessResult {
  success: boolean;
  message: string;
}


import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string | undefined;
  private readonly region: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET_NAME');
    this.region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_KEY');

    if (!this.region || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing AWS S3 configuration');
    }

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadBase64AsFile(
    fileContent: string,
    fileNamePrefix :string,
    fileExtension: string,
    contentType 
  ): Promise<string> {
    const key = `attachments/${fileNamePrefix}-${uuid()}.${fileExtension}`;

    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    };

    await this.s3.send(new PutObjectCommand(uploadParams));

    return key;
  }
}

import { AttachmentVersionDto } from "./attachment_version_dto.model";

 
export class AttachmentDto {
  id: number;
  filename__v: string;
  format__v: string;
  size__v: number;
  md5checksum__v: string;
  version__v: number;
  created_by__v: number;
  created_date__v: string;
  versions: AttachmentVersionDto[];
}
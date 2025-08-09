import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';

export class UserIdDto {
  @ApiProperty({
    name: 'userid',
    description: 'Array of user ID strings',
    type: String,
    isArray: true,
    example: ['23434231', '23454297', '23454669'],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userid: string[];
}

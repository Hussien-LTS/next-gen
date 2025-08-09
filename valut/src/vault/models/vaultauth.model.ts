import { ApiProperty } from "@nestjs/swagger";

export class VaultAuthDto {

    @ApiProperty({ description: 'Vault API authorization token' })
     authorization: string;
  
     @ApiProperty({ description: 'Vault API client ID' })
     clientId: string;
  }
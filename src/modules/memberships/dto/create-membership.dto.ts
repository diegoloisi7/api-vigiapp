import { IsNumberString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMembershipDto {
  @ApiProperty({ type: String, pattern: '^[1-9]\\d*$', example: '1' })
  @IsNumberString()
  @Matches(/^[1-9]\d*$/)
  userId!: string;
  @ApiProperty({ type: String, pattern: '^[1-9]\\d*$', example: '1' })
  @IsNumberString()
  @Matches(/^[1-9]\d*$/)
  groupId!: string;
}

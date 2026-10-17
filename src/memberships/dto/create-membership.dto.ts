import { IsEnum, IsNumberString, IsOptional, Matches } from 'class-validator';

export class CreateMembershipDto {
  @IsNumberString() @Matches(/^[1-9]\d*$/) userId!: string;
  @IsNumberString() @Matches(/^[1-9]\d*$/) groupId!: string;
  @IsOptional() @IsEnum(['GROUP_ADMIN', 'NEIGHBOR']) groupRole?:
    'GROUP_ADMIN' | 'NEIGHBOR';
}

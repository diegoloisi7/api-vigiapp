import { IsEnum } from 'class-validator';

export class UpdateMembershipDto {
  @IsEnum(['GROUP_ADMIN', 'NEIGHBOR']) groupRole!: 'GROUP_ADMIN' | 'NEIGHBOR';
}

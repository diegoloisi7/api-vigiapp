import {
  IsBooleanString,
  IsNumberString,
  IsOptional,
  Matches,
} from 'class-validator';

export class ListIncidentsDto {
  @IsOptional() @IsNumberString() @Matches(/^[1-9]\d*$/) groupId?: string;
  @IsOptional() @IsBooleanString() active?: string;
}

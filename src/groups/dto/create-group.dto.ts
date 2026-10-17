import {
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @IsOptional() @IsString() description?: string | null;
  @IsNumber({ maxDecimalPlaces: 7 }) @Min(-90) @Max(90) centerLatitude!: number;
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  centerLongitude!: number;
  @IsInt() @Min(1) radiusMeters!: number;
  @IsNumberString() @Matches(/^[1-9]\d*$/) createdByUserId!: string;
}

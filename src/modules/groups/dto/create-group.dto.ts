import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;
  @ApiProperty({ minimum: -90, maximum: 90, example: -34.603722 })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  centerLatitude!: number;
  @ApiProperty({ minimum: -180, maximum: 180, example: -58.381592 })
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  centerLongitude!: number;
  @ApiProperty({ minimum: 1, example: 500 })
  @IsInt()
  @Min(1)
  radiusMeters!: number;
}

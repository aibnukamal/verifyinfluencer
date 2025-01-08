import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class GetContentDto {
  @IsOptional()
  @IsString()
  timeRange?: string;

  @IsOptional()
  @IsString()
  influencerName?: string;

  @IsOptional()
  @IsNumber()
  claims?: number;

  @IsOptional()
  @IsNumber()
  product?: number;

  @IsOptional()
  @IsBoolean()
  revenue?: boolean;

  @IsOptional()
  @IsBoolean()
  journal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  journals?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

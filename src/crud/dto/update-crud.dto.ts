// src/crud/dto/update-crud.dto.ts
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCrudDto {
  @IsOptional() @IsString() @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsIn(['queued', 'processing', 'completed', 'failed'])
  status?: 'queued' | 'processing' | 'completed' | 'failed';

  @IsOptional()
  @IsString()
  resultSummary?: string;

  @IsOptional() @IsString() category?: string | null;
  @IsOptional() @IsString() tone?: string | null;
  @IsOptional() @IsString() priority?: string | null;
  @IsOptional() @IsString() language?: string | null;
  @IsOptional() @IsString() error?: string | null;
}

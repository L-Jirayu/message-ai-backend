// src/crud/dto/update-crud.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateCrudDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  resultSummary?: string;
}

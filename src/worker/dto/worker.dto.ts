import { IsString, IsOptional } from 'class-validator';

export class ProcessJobDto {
  @IsString()
  jobId: string;

  @IsString()
  message: string;
}

export class RetryJobDto {
  @IsString()
  jobId: string;
}

export class MockJobDto {
  @IsString()
  @IsOptional()
  message?: string;
}

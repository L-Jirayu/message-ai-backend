import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  message: string; // ข้อความต้นฉบับจากลูกค้า
}

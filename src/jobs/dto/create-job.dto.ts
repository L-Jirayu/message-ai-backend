import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  // ✅ เพิ่ม name เป็น optional (หรือใช้ @IsNotEmpty ถ้าจะบังคับ)
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;
}

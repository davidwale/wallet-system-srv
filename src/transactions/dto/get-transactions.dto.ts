import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';
import { Transform } from 'class-transformer';

export class GetTransactionsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
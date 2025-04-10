import { IsEnum, IsNumber, IsPositive, IsString, IsUUID, IsOptional } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  walletId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  recipientWalletId?: string;
}
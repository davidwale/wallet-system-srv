import { IsNumber, IsPositive, IsString, IsOptional, IsUUID } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class TransferDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  recipientWalletId: string;

  @IsString()
  @IsOptional()
  description?: string;
}
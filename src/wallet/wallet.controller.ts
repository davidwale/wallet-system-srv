import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet-operations.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@GetUser() user: User) {
    return this.walletService.getBalance(user.id);
  }

  @Post('fund')
  async deposit(@GetUser() user: User, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(user.id, depositDto);
  }

  @Post('withdraw')
  async withdraw(@GetUser() user: User, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(user.id, withdrawDto);
  }

  @Post('transfer')
  async transfer(@GetUser() user: User, @Body() transferDto: TransferDto) {
    return this.walletService.transfer(user.id, transferDto);
  }
}
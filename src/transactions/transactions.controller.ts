import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getTransactions(
    @GetUser() user: User,
    @Query() getTransactionsDto: GetTransactionsDto,
  ) {
    return this.transactionService.getTransactions(user.id, getTransactionsDto);
  }

  @Get(':id')
  async getTransactionById(
    @Param('id') id: string,
    @GetUser() user: User,
) {
    return this.transactionService.getTransactionById(id, user.id);
  }
}
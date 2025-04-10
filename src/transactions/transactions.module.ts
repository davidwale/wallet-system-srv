import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../auth/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionService } from './transactions.service';
import { TransactionController } from './transactions.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ResponseService } from 'src/common/response/response.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User, Transaction]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRY_TIME },
    }), 
  ],
  controllers: [TransactionController],
  providers: [TransactionService, JwtService, ResponseService],
  exports: [TransactionService],
})
export class TransactionsModule {}

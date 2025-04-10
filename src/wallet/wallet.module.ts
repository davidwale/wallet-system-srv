import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../auth/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TransactionService } from '../transactions/transactions.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { WalletIdService } from './wallet-id.service';
import { ResponseService } from 'src/common/response/response.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User, Transaction]),
    JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: process.env.TOKEN_EXPIRY_TIME },
        }), 
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    TransactionService, 
    JwtService, 
    WalletIdService,
    ResponseService
  ],
  exports: [WalletService, TypeOrmModule],
})
export class WalletModule {}
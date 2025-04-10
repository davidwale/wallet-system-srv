import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity'; 
import { ResponseService } from '../common/response/response.service';
import { EmailService } from '../email/email.service'; 
import { GoogleStrategy } from './google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WalletIdService } from '../wallet/wallet-id.service';
import { Repository } from 'typeorm';
import { WalletService } from '../wallet/wallet.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { TransactionService } from 'src/transactions/transactions.service';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet, Transaction]),
    JwtModule.registerAsync({
      imports: [
        ConfigModule,
        WalletModule

      ],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('TOKEN_EXPIRY_TIME', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }), 
  ],
  providers: [
    AuthService, 
    ResponseService, 
    EmailService, 
    GoogleStrategy,
    JwtAuthGuard,
    WalletIdService,
    WalletService,
    Repository,
    WalletModule,
    TransactionService
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard], 
})
export class AuthModule {}
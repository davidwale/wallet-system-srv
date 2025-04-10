import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../auth/entities/user.entity';
import { TransactionService } from '../transactions/transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet-operations.dto';
import { TransactionType } from '../transactions/entities/transaction.entity';
import { ResponseService } from 'src/common/response/response.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private transactionService: TransactionService,
    private readonly responseService: ResponseService,
  ) {}

  async getBalance(userId: string) {
    const wallet = await this.walletRepository.findOne({ where: { user: { id: userId } } });
    if (!wallet){
      return this.responseService.error('Wallet Not Found', false);
    } 
    const balance = wallet.balance;
    const walletId = wallet.walletId;
    return this.responseService.success({ balance, walletId }, 'Balance Retrieved Successfully', false);
  }

  async deposit(userId: string, depositDto: DepositDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) return this.responseService.error('Wallet Not Found', false);

      const currentBalance = parseFloat(wallet.balance.toString());
      const depositAmount = parseFloat(depositDto.amount.toString());
      wallet.balance = Number((currentBalance + depositAmount).toFixed(2));
      await queryRunner.manager.save(wallet);

      const transaction = await this.transactionService.createTransaction({
        userId,
        walletId: wallet.id,
        amount: depositDto.amount,
        type: TransactionType.DEPOSIT,
        description: depositDto.description,
      }, queryRunner);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) return this.responseService.error('Wallet Not Found!', false);
      if (wallet.balance < withdrawDto.amount) return this.responseService.error('Insufficient Funds', false);

      wallet.balance -= withdrawDto.amount;
      await queryRunner.manager.save(wallet);

      const transaction = await this.transactionService.createTransaction({
        userId,
        walletId: wallet.id,
        amount: withdrawDto.amount,
        type: TransactionType.WITHDRAWAL,
        description: withdrawDto.description,
      }, queryRunner);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(userId: string, transferDto: TransferDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get sender wallet
      const senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_write' },
      });
      if (!senderWallet) return this.responseService.error('Sender Wallet Not Found', false);
      if (senderWallet.balance < transferDto.amount) return this.responseService.error('Insufficient Funds', false);

      // Get recipient wallet
      const recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { walletId: transferDto.recipientWalletId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!recipientWallet) return this.responseService.error('Recipient Wallet Not Found', false);
      if (senderWallet.walletId === recipientWallet.walletId) return this.responseService.error('Cannot Transfer To Yourself', false);

      // Update balances
      const amount = parseFloat(transferDto.amount.toString());

      senderWallet.balance = parseFloat(senderWallet.balance.toString()) - amount;
      recipientWallet.balance = parseFloat(recipientWallet.balance.toString()) + amount;
      await queryRunner.manager.save([senderWallet, recipientWallet]);

      // Create transaction record
      const transaction = await this.transactionService.createTransaction({
        userId,
        walletId: senderWallet.id,
        amount: transferDto.amount,
        type: TransactionType.TRANSFER,
        description: transferDto.description,
        recipientWalletId: recipientWallet.walletId,
      }, queryRunner);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { ResponseService } from 'src/common/response/response.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private readonly responseService: ResponseService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    queryRunner?: DataSource | any,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      user: { id: createTransactionDto.userId },
      wallet: { id: createTransactionDto.walletId },
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      description: createTransactionDto.description,
      recipientWalletId: createTransactionDto.recipientWalletId,
    });

    if (queryRunner) {
      return queryRunner.manager.save(transaction);
    }
    return this.transactionRepository.save(transaction);
  }

  async getTransactions(
    userId: string,
    getTransactionsDto: GetTransactionsDto,
  ) {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'timestamp', 
      sortOrder = 'DESC', 
      status 
    } = getTransactionsDto;
  
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });
  
    if (status && status !== 'all') {
      query.andWhere('transaction.status = :status', { status });
    }
  
    query.orderBy(`transaction.${sortBy}`, sortOrder);
  
    query.skip((page - 1) * limit).take(limit);
  
    const [transactions, total] = await query.getManyAndCount();
  
    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(id: string, userId: string) {
    const transaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .where('transaction.id = :id', { id })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  
    if (!transaction) {
      return this.responseService.error('Transaction Not Found or Not Allowed', false);
    }
  
    return transaction;
  }
  
  
}
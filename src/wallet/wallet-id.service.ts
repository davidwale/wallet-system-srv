import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import * as crypto from 'crypto';

@Injectable()
export class WalletIdService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>, 
  ) {}

  async generateWalletId(): Promise<string> {
    let walletId: string;
    let isUnique = false;

    do {
      const randomBytes = crypto.randomBytes(5);
      let numericId = parseInt(randomBytes.toString('hex'), 16);

      // Ensure the walletId is within a reasonable range for 10-digit numbers
      numericId = numericId % 1_000_000_0000; 

      walletId = numericId.toString().padStart(10, '0');

      // Check for uniqueness in the database
      const existingWallet = await this.walletRepository.findOne({ 
        where: { walletId } 
      });
      isUnique = !existingWallet;
    } while (!isUnique);

    return walletId;
  }
}
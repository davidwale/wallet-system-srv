import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @Column({ nullable: true })
  verifyOtp: number;

  @Column({ type: 'timestamp', nullable: true })
  verifyOtpExpiry: Date;

  @Column({ default: false })
  isUserVerified: boolean;

  @Column({ nullable: true })
  resetOtp: number;

  @Column({ type: 'timestamp', nullable: true })
  resetOtpExpiry: Date;

  @Column({ nullable: true })
  googleId: string;

  @Column({ type: 'json', nullable: true })
  googleTokens: any;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
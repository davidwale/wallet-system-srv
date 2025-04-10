import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import { verificationEmailTemplate } from '../email/templates/verification.template';
import { resetPasswordEmailTemplate } from '../email/templates/reset-password.template';
import { ResponseService } from '../common/response/response.service';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletIdService } from '../wallet/wallet-id.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, 
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>, 
    private readonly walletIdService: WalletIdService,
    private readonly jwtService: JwtService, 
    private readonly responseService: ResponseService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, fullName, password } = dto;
    const existingUser = await this.userRepository.findOne({ 
      where: [{ email }] 
    });
    
    if (existingUser) return this.responseService.error('User already exists', false);

    const passwordValidationResponse = await this.validatePassword(password);

    if (!passwordValidationResponse) return this.responseService.error(
        'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        false,
      );

    const verifyOtp = this.generateOtp();
    const emailHtml = verificationEmailTemplate(verifyOtp);

    const user = this.userRepository.create({
      email,
      fullName,
      password,
      verifyOtp,
      verifyOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    await this.userRepository.save(user);

    const wallet = this.walletRepository.create({
      user, 
      balance: 0,
      currency: 'NGN',
      walletId: await this.walletIdService.generateWalletId(),
    });

    await this.walletRepository.save(wallet);

    await this.emailService.sendEmail(email, 'Verify Your Account', emailHtml);
    
    return this.responseService.success(null, 'Registration successful', true);
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return this.responseService.error('No user from Google', false);
    }

    const { email, googleId, googleTokens } = req.user;

    let user = await this.userRepository.findOne({ 
      where: [
        { email },
        { googleId }
      ]
    });

    if (!user) {
      user = this.userRepository.create({
        email,
        fullName: `${req.user.firstName} ${req.user.lastName}`,
        googleId,
        googleTokens,
        isUserVerified: true,
      });

      await this.userRepository.save(user);

      const wallet = this.walletRepository.create({
        user,
        balance: 0,
        currency: 'NGN',
        walletId: await this.walletIdService.generateWalletId(),
      });

      await this.walletRepository.save(wallet);
    } else {
      user.googleId = googleId;
      user.googleTokens = googleTokens;
      user.isUserVerified = true;
      await this.userRepository.save(user);
    }

    await this.userRepository.save(user);
    const token = this.jwtService.sign({ id: user.id });
    
    return this.responseService.success({ token }, 'Google login successful', true);
  }

  async getGoogleAuthUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!, 
      client_id: process.env.GOOGLE_CLIENT_ID!,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) return this.responseService.error('User not found', false);

    const comparePasword = await bcrypt.compare(password, user.password);
    if (!comparePasword) {
      return this.responseService.error('Invalid password', false);
    }

    // a
    // if (!user.isUserVerified) {
    //   const verifyOtp = this.generateOtp();
    //   const emailHtml = verificationEmailTemplate(verifyOtp);
      
    //   user.verifyOtp = verifyOtp;
    //   user.verifyOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
    //   await this.userRepository.save(user);
    //   await this.emailService.sendEmail(email, 'Verify Your Account', emailHtml);
      
    //   return this.responseService.error(
    //     'Account not verified. Check your email for a new verification code.', 
    //     false
    //   );
    // }

    const token = this.jwtService.sign({ id: user.id });
    return this.responseService.success({ token }, 'Logged in successfully', true);
  }

  async forgetPassword(dto: ForgetPasswordDto) {
    const { email } = dto;
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) return this.responseService.error('User not found', false);

    const resetOtp = this.generateOtp();
    const emailHtml = resetPasswordEmailTemplate(resetOtp);
    
    user.resetOtp = resetOtp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    await this.userRepository.save(user);
    await this.emailService.sendEmail(email, 'Reset Your Password', emailHtml);
    
    return this.responseService.success(null, 'Password reset OTP sent to your email', true);
  }

  async verifyOTP(dto: VerifyOTPDto) {
    const { email, otp } = dto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || user.verifyOtp !== otp || user.verifyOtpExpiry < new Date()) {
      return this.responseService.error('Invalid or expired OTP', false);
    }

    const token = this.jwtService.sign({ id: user.id });
    
    user.verifyOtp = null as any;;
    user.verifyOtpExpiry = null as any;;
    user.isUserVerified = true;
    
    await this.userRepository.save(user);

    return this.responseService.success(token, 'Account verified successfully', true);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, otp, newPassword } = dto;
    const user = await this.userRepository.findOne({ 
      where: { 
        email, 
        resetOtp: otp 
      } 
    } as any);

    if (!user || user.resetOtpExpiry < new Date()) {
      return this.responseService.error('Invalid or expired token', false);
    }

    user.password = newPassword; 
    user.resetOtp = null as any;;
    user.resetOtpExpiry = null as any;;
    
    await this.userRepository.save(user);

    return this.responseService.success(null, 'Password reset successfully', true);
  }

  async getUserDetailsById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['fullName', 'email'], 
    });

    if (!user) {
      return this.responseService.error('User not found', false);
    }

    return this.responseService.success(
      { fullName: user.fullName, email: user.email },
      'User details retrieved successfully',
      true,
    );
  }

  private generateOtp(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  private validatePassword = async (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;

    if (!passwordRegex.test(password)) {
      return false;
    }
    return true;
  };
}
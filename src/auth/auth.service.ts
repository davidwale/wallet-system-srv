import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import { verificationEmailTemplate } from '../email/templates/verification.template';
import { resetPasswordEmailTemplate } from '../email/templates/reset-password.template';
import * as dotenv from 'dotenv';
import { ResponseService } from '../common/response/response.service';
import { Op } from 'sequelize';

dotenv.config();

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User) private userModel: typeof User,
        private jwtService: JwtService,
        private responseService: ResponseService,
        private readonly emailService: EmailService,
    ) {}

    async register(dto: RegisterDto) {
        const { email, fullName, password } = dto;
        const existingUser = await this.userModel.findOne({ where: { [Op.or]: { email } } });
        if (existingUser) return this.responseService.error('User already exists', false);

        const passwordValidationResponse = await this.validatePassword(password);
        if (passwordValidationResponse !== true) {
            return passwordValidationResponse;
        }

        const hashedPassword = await this.hashPassword(password);
        const verifyOtp = this.generateOtp();
        const emailHtml = verificationEmailTemplate(verifyOtp);

        await this.userModel.create({
            email, 
            fullName, 
            password: hashedPassword, 
            verifyOtp, 
            verifyOtpExpiry: new Date(Date.now() + 10 * 60 * 1000)
        } as any);

        await this.emailService.sendEmail(email, 'Verify Your Account', emailHtml);
        return this.responseService.success(null, 'Registration successful', true);
    }

    async googleLogin(req: any) {
        if (!req.user) {
          return this.responseService.error('No user from Google', false);
        }
      
        const { email, googleId, googleTokens } = req.user;
      
        let user = await this.userModel.findOne({ 
          where: { 
            [Op.or]: [
              { email },
              { googleId }
            ]
          } 
        });
      
        if (!user) {
          user = await this.userModel.create({
            email,
            fullName: `${req.user.firstName} ${req.user.lastName}`,
            googleId,
            googleTokens,
            isUserVerified: true,
          } as any);
        } else {
          await user.update({
            googleId,
            googleTokens,
            isUserVerified: true,
          });
        }
      
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
        const user = await this.userModel.findOne({ where: { email } });

        if (!user) return this.responseService.error('User not found', false);

        if (!(await bcrypt.compare(password, user.password))) {
            return this.responseService.error('Invalid password', false);
        }

        if (!user.isUserVerified) {
            const verifyOtp = this.generateOtp();
            const emailHtml = verificationEmailTemplate(verifyOtp);
            await user.update({ verifyOtp, verifyOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) });
            await this.emailService.sendEmail(email, 'Verify Your Account', emailHtml);
            return this.responseService.error('Account not verified. Check your email for a new verification code.', false);
        }

        const token = this.jwtService.sign({ id: user.id });
        return this.responseService.success({ token }, 'Logged in successfully', true);
    }

    async forgetPassword(dto: ForgetPasswordDto) {
        const { email } = dto;
        const user = await this.userModel.findOne({ where: { email } });
        if (!user) return this.responseService.error('User not found', false);

        const resetOtp = this.generateOtp();
        const emailHtml = resetPasswordEmailTemplate(resetOtp);
        await user.update({ resetOtp, resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) });

        await this.emailService.sendEmail(email, 'Reset Your Password', emailHtml);
        return this.responseService.success(null, 'Password reset OTP sent to your email', true);
    }

    async verifyOTP(dto: VerifyOTPDto) {
        const { email, otp } = dto;
        const user = await this.userModel.findOne({ where: { email } });

        if (!user || user.verifyOtp !== otp || user.verifyOtpExpiry < new Date()) {
            return this.responseService.error('Invalid or expired OTP', false);
        }

        const token = this.jwtService.sign({ id: user.id });
        await user.update({ verifyOtp: null, verifyOtpExpiry: null, isUserVerified: true } as any);

        return this.responseService.success(token, 'Account verified successfully', true);
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { email, otp, newPassword } = dto;
        const user = await this.userModel.findOne({ where: { email, resetOtp: otp } });

        if (!user || user.resetOtpExpiry < new Date()) {
            return this.responseService.error('Invalid or expired token', false);
        }

        const hashedPassword = await this.hashPassword(newPassword);
        await user.update({ password: hashedPassword, resetOtp: null, resetOtpExpiry: null } as any);

        return this.responseService.success(null, 'Password reset successfully', true);
    }

    private generateOtp(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    private hashPassword = async (password: string) => bcrypt.hash(password, 10);

    private validatePassword = async (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;
    
        if (!passwordRegex.test(password)) {
            return this.responseService.error(
                'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
                false,
            );
        }
        return true;
    };
}

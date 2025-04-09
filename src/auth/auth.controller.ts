import { Controller, Get, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.googleLogin(req);
    if (result.status && result.data?.token) {
        const token = result.data.token;
      return res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    }
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }

  @Get('google/url')
  async getGoogleAuthUrl() {
    const url = await this.authService.getGoogleAuthUrl();
    return { url };
  }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('forget-password')
    forgetPassword(@Body() dto: ForgetPasswordDto) {
        return this.authService.forgetPassword(dto);
    }

    @Post('verify-otp')
    verifyOTP(@Body() dto: VerifyOTPDto) {
        return this.authService.verifyOTP(dto);
    }

    @Post('reset-password')
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}

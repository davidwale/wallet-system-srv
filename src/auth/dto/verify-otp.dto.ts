import { IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyOTPDto {
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    @IsNotEmpty({ message: 'OTP is required' })
    otp: number;
}

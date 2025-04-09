import { IsEmail } from 'class-validator';

export class ForgetPasswordDto {
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;
}

import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email is invalid' })
    email: string;

    @IsNotEmpty({ message: 'FullName is required' })
    fullName: string;

    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}

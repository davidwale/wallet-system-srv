import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../models/user.model';
import { ResponseService } from '../common/response/response.service';
import { EmailService } from 'src/email/email.service';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,  
      signOptions: { expiresIn: process.env.TOKEN_EXPIRY_TIME },  
    }),
  ],
  providers: [AuthService, ResponseService, EmailService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule { }

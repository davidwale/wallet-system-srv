import { Module, OnModuleInit } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './config/sequelize.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResponseService } from './common/response/response.service';
import { AuthModule } from './auth/auth.module';
import { Sequelize } from 'sequelize-typescript';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PassportModule.register({ defaultStrategy: 'google' }),
		SequelizeModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (service: ConfigService) => ({
				...sequelizeConfig(service),
			}),
		}),
		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService, ResponseService, AuthModule],
})
export class AppModule implements OnModuleInit {
	constructor(private sequelize: Sequelize) { }

	async onModuleInit() {
		try {
			await this.sequelize.authenticate();
			console.log('Database connected successfully.');
		} catch (error) {
			console.error('Database connection failed:', error);
		}
	}
}

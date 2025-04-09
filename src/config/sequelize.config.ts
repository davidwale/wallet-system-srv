import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { Token } from '../models/token.model';

export const sequelizeConfig = (config: ConfigService): SequelizeModuleOptions => ({
	dialect: 'postgres',
	host: config.get('DB_HOST'),
	port: config.get('DB_PORT'),
	username: config.get('DB_USER'),
	password: config.get('DB_PASS'),
	database: config.get('DB_NAME'),
	// dialectOptions: {
	// 	ssl: {
	// 		require: config.get('APP_ENV') === 'production',
	// 		rejectUnauthorized: false
	// 	}
	// },
	models: [User, Token],
	logging: false,
});

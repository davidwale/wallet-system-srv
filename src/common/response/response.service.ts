import { Injectable } from '@nestjs/common';
import { ResponseDto } from '../response.dto';

@Injectable()
export class ResponseService {
	success<T>(data: T, message = 'success', status = true): ResponseDto<T> {
		return new ResponseDto<T>(status, message, data);
	}

	error(message = 'failed', status = false, error?: any): ResponseDto<null> {
		return new ResponseDto<null>(status, message, error);
	}
}

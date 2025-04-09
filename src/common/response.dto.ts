export class ResponseDto<T> {
	status: boolean;
	message: string;
	data?: T | null;
	error?: any;
	success?: any;
	token?: any;

	constructor(status: boolean, message: string, data?: T | null, error?: any, success?: any, token?: any) {
		this.status = status;
		this.message = message;
		this.data = data;
		this.error = error;
		this.success = success;
		this.token = token;
	}
}

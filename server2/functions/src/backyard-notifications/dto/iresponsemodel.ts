export class IResponseModel<T> {
    IsSuccess?: boolean;
    Message?: string;
    Errors?: string[];
    Data?: T;
}
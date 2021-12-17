export interface IAuthenticationService{
    authenticate(req: any): Promise<boolean>;
}
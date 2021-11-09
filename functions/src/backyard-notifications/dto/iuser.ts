import { IDevice } from "./IDevice";

export interface IUser {
    Id: string,
    Devices: IDevice[]
    Topics: string[]
}
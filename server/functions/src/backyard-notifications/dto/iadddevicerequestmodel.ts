import { DeviceType } from "../enums";


export interface IAddDeviceRequestModel {
    UserId:string,
    DeviceId:string,
    Type:DeviceType
}
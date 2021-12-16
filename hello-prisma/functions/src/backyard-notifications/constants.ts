export class StatusCodes {
    public static Success: number = 200;
    public static BadRequest: number = 400;
    public static UnAuthorized: number = 401;
    public static ServerError: number = 500;
}

export class ResponseCode {
    public static Success: string = "SUCCESS";
}

export class SuccessMessages {
    public static MessageSent: string = "Message Sent Sucessfully";
    public static UserAdded: string = "User Added Sucessfully";
    public static DeviceRemoved: string = "Device Removed Sucessfully";
}

export class ErrorMessages {
    public static MessageNotSent: string = "Message Sent Failed";
    public static UserNotAdded: string = "Adding User Failed";
    public static UserNotFound: string = "User not found";
    public static NoDeviceFound: string = "No valid device(s) found";
    public static NoValidRecipients: string = "No valid device(s) or token(s) found";
}

export class ValidationErrors {
    public static UserIdRequired: string = "User Id is required";
    public static UserIdTopicRequired: string = "User Id/Topic is required";
    public static NotificationRequired: string = "Notification is required";
    public static NotificationTitleRequired: string = "Notification title is required";
    public static NotificationBodyRequired: string = "Notification body is required";
    public static DeviceIdRequired: string = "Device Id is required";
    public static DeviceTypeRequired: string = "Device Type is required";
    public static DeviceTypeInvalid: string = "Invalid Device Type";
    public static TopicRequired: string = "Topic is required";
}

export class FirebaseConstants {
    public static readonly ServerKey = "AAAAhSZNkQo:APA91bGjT_9DLyAHcQB7tFLUWZPk5rm7i3ePPxlZMWFvuKNsRsSCpwistAP-Pf8TvUjvjY-MxYEHCQZoV_-YrQl51AeoSCPfqUExF4XyyemcnOPylUq8kdu2qhGbHXdzurZ1z7VZzGzj";
    
}
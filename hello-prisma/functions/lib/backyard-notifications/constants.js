"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseConstants = exports.ValidationErrors = exports.ErrorMessages = exports.SuccessMessages = exports.ResponseCode = exports.StatusCodes = void 0;
class StatusCodes {
}
exports.StatusCodes = StatusCodes;
StatusCodes.Success = 200;
StatusCodes.BadRequest = 400;
StatusCodes.UnAuthorized = 401;
StatusCodes.ServerError = 500;
class ResponseCode {
}
exports.ResponseCode = ResponseCode;
ResponseCode.Success = "SUCCESS";
class SuccessMessages {
}
exports.SuccessMessages = SuccessMessages;
SuccessMessages.MessageSent = "Message Sent Sucessfully";
SuccessMessages.UserAdded = "User Added Sucessfully";
SuccessMessages.DeviceRemoved = "Device Removed Sucessfully";
class ErrorMessages {
}
exports.ErrorMessages = ErrorMessages;
ErrorMessages.MessageNotSent = "Message Sent Failed";
ErrorMessages.UserNotAdded = "Adding User Failed";
ErrorMessages.UserNotFound = "User not found";
ErrorMessages.NoDeviceFound = "No valid device(s) found";
ErrorMessages.NoValidRecipients = "No valid device(s) or token(s) found";
class ValidationErrors {
}
exports.ValidationErrors = ValidationErrors;
ValidationErrors.UserIdRequired = "User Id is required";
ValidationErrors.UserIdTopicRequired = "User Id/Topic is required";
ValidationErrors.NotificationRequired = "Notification is required";
ValidationErrors.NotificationTitleRequired = "Notification title is required";
ValidationErrors.NotificationBodyRequired = "Notification body is required";
ValidationErrors.DeviceIdRequired = "Device Id is required";
ValidationErrors.DeviceTypeRequired = "Device Type is required";
ValidationErrors.DeviceTypeInvalid = "Invalid Device Type";
ValidationErrors.TopicRequired = "Topic is required";
class FirebaseConstants {
}
exports.FirebaseConstants = FirebaseConstants;
FirebaseConstants.ServerKey = "AAAAhSZNkQo:APA91bGjT_9DLyAHcQB7tFLUWZPk5rm7i3ePPxlZMWFvuKNsRsSCpwistAP-Pf8TvUjvjY-MxYEHCQZoV_-YrQl51AeoSCPfqUExF4XyyemcnOPylUq8kdu2qhGbHXdzurZ1z7VZzGzj";
//# sourceMappingURL=constants.js.map
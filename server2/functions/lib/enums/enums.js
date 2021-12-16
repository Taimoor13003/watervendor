"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitStatus = exports.LoginSource = exports.GenderType = exports.QuestionType = exports.OptionType = exports.MediaType = void 0;
var MediaType;
(function (MediaType) {
    MediaType[MediaType["Video"] = 1] = "Video";
    MediaType[MediaType["Image"] = 2] = "Image";
    MediaType[MediaType["file"] = 3] = "file";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
var OptionType;
(function (OptionType) {
    OptionType["select"] = "select";
    OptionType["input"] = "input";
})(OptionType = exports.OptionType || (exports.OptionType = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["mcq"] = "mcq";
    QuestionType["list"] = "list";
})(QuestionType = exports.QuestionType || (exports.QuestionType = {}));
var GenderType;
(function (GenderType) {
    GenderType["male"] = "male";
    GenderType["female"] = "female";
})(GenderType = exports.GenderType || (exports.GenderType = {}));
var LoginSource;
(function (LoginSource) {
    LoginSource["facebook"] = "facebook";
    LoginSource["google"] = "google";
    LoginSource["apple"] = "apple";
    LoginSource["default"] = "default";
})(LoginSource = exports.LoginSource || (exports.LoginSource = {}));
var VisitStatus;
(function (VisitStatus) {
    VisitStatus["inProgress"] = "inProgress";
    VisitStatus["complete"] = "complete";
})(VisitStatus = exports.VisitStatus || (exports.VisitStatus = {}));
//# sourceMappingURL=enums.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Professionals = void 0;
const enums_1 = require("../../enums/enums");
class Professionals {
    constructor() {
        this.id = "";
        this.name = "";
        this.minAge = "";
        this.maxAge = "";
        this.targetedAgeGroup = {};
        this.profilePicture = "";
        this.email = "";
        this.specialisation = {};
        this.qualification = {};
        this.introduction = "";
        this.experience = "";
        this.affiliation = {};
        this.practice = "";
        this.institution = {};
        this.gender = undefined;
        this.language = {};
        this.nationality = {};
        this.price = 0;
        this.religion = {};
        this.isEmailVerified = false;
        this.loginSource = enums_1.LoginSource.default;
        this.status = true;
        this.createdOnDate = new Date().getTime();
    }
}
exports.Professionals = Professionals;
//# sourceMappingURL=professional.js.map
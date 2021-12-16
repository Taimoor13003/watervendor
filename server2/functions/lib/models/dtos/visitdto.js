"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitDTO = void 0;
const enums_1 = require("../../enums/enums");
class VisitDTO {
    constructor() {
        this.id = "";
        this.userId = "";
        this.categoryId = "";
        this.name = "";
        this.dateOfBirth = "";
        this.lastSerialNumber = 0;
        this.status = enums_1.VisitStatus.inProgress;
        this.createdOnDate = new Date().getTime();
    }
}
exports.VisitDTO = VisitDTO;
//# sourceMappingURL=visitdto.js.map
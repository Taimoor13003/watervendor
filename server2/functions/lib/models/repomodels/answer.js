"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visit = void 0;
class Visit {
    constructor() {
        this.id = "";
        this.visitId = "";
        this.categoryId = "";
        this.questionId = "";
        this.selectedOptionId = "";
        this.selectedOptionText = "";
        this.serialNo = 1;
        this.question = {};
        this.createdOnDate = new Date().getTime();
    }
}
exports.Visit = Visit;
//# sourceMappingURL=answer.js.map
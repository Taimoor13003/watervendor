"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitAnswer = void 0;
class VisitAnswer {
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
exports.VisitAnswer = VisitAnswer;
//# sourceMappingURL=visitanswer.js.map
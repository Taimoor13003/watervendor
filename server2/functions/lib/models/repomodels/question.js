"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
const enums_1 = require("../../enums/enums");
class Question {
    constructor() {
        this.id = "";
        this.categoryId = "";
        this.type = enums_1.QuestionType.mcq;
        this.text = "";
        this.options = [];
        this.nextQuestionId = "";
        this.createdOnDate = new Date().getTime();
    }
}
exports.Question = Question;
//# sourceMappingURL=question.js.map
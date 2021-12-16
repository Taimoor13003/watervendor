"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionDTO = void 0;
const enums_1 = require("../../enums/enums");
class QuestionDTO {
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
exports.QuestionDTO = QuestionDTO;
//# sourceMappingURL=questiondto.js.map
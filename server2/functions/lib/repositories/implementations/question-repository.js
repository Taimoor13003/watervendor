"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRepository = void 0;
const repository_1 = require("./repository");
class QuestionRepository extends repository_1.Repository {
    constructor() {
        super();
        this.collectionName = "questions";
    }
}
exports.QuestionRepository = QuestionRepository;
1;
//# sourceMappingURL=question-repository.js.map
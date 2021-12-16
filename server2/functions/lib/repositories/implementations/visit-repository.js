"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitRepository = void 0;
const repository_1 = require("./repository");
class VisitRepository extends repository_1.Repository {
    constructor() {
        super();
        this.collectionName = "visits";
    }
}
exports.VisitRepository = VisitRepository;
//# sourceMappingURL=visit-repository.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const repository_1 = require("./repository");
class CategoryRepository extends repository_1.Repository {
    constructor() {
        super();
        this.collectionName = "categories";
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=category-repository.js.map
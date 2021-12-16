"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionDTO = void 0;
const enums_1 = require("../../enums/enums");
class OptionDTO {
    constructor() {
        this.id = "";
        this.text = "";
        this.type = enums_1.OptionType.select;
        this.nextQuestionId = "";
    }
}
exports.OptionDTO = OptionDTO;
//# sourceMappingURL=optiondto.js.map
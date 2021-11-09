import { OptionType } from "../../enums/enums";

export class OptionDTO {
    id : string = "";
    text: string = "";
    type: OptionType = OptionType.select;
    nextQuestionId: string = "";
}
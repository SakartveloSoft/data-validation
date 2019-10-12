import {FieldFormats, FieldTypes} from "./special-types";
import {IFieldOptions} from "./validationDecorators";

export class DataField {
    name : string;
    column:string;
    lowerCase: boolean;
    valueType: FieldTypes;
    valueFormat: FieldFormats;
    hidden: boolean;
    constructor(name:string) {
        this.name = name;
    }
    applyOptions(options?:IFieldOptions) {
        if (options) {
            this.hidden = !!options.hidden;
        }
    }
}
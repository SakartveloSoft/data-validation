import {DataField} from "./dataField";
import {Class} from "./special-types";

export class DataType {
    name: string;
    flags: {[name: string]:boolean} = {};
    fields:{[name: string]:DataField} = {};
    idField: DataField = null;
    knownClasses: {[name:string]: Class } = {};
    ready : boolean;
    prepareForUse() {
        if (!this.ready) {
            this.ready = true;
            if (!this.idField) {
                this.idField = this.fields['id'];
            }
            if (!this.idField) {
                throw new Error(`Validator ${this.name} does not have id field specified`)
            }
        }
    }
    constructor(name:string) {
        this.name = name;
    }
    addKnownClass(cls: Class) {
        this.knownClasses[cls.name] = cls;
    }
    ensureForField(name): DataField {
        let field = this.fields[name];
        if (!field) {
            field = new DataField(name);
            this.fields[name] = field;
        }
        return field;
    }
}


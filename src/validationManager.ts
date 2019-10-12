import {DataType} from "./dataType";
import {Class} from "./special-types";
import {string} from "./validationDecorators";

let validatorsMap :{[name: string]: DataType} = {};

let validatorsByClass : {[className: string]: DataType} = {};

function ensureNotAnonymous(cls:Class) {
    if (!cls.constructor.name && !cls.name) {
        throw new Error('Anonymous classes not supported');
    }
}

function getClassName(cls) {
    return cls.name || cls.constructor.name;
}

export function ensureForValidator(cls:Class): DataType {
    ensureNotAnonymous(cls);
    let className = getClassName(cls);
    let type = validatorsByClass[className];
    if (!type) {
        type = new DataType(className);
        validatorsByClass[className] = type;
    }
    if (!type.knownClasses[className]) {
        validatorsByClass[className] = type;
    }
    return type;
}

export function getValidatorForClass(cls:Class):DataType {
    let type = validatorsByClass[getClassName(cls)];
    if (!type) {
        throw new Error('No validators bound to class ' + cls.name)
    }
    return type;
}

export function ensureValidatorReady(validationType: string) {
    let type = validatorsMap[validationType];
    if (!type) {
        throw new Error(`Unknown validator ${validationType}`);
    }
    type.prepareForUse();
    return type;
}

export function bindDataTypeToClass(cls:Class, dataTypeName: string) {
    let type = ensureForValidator(cls);
    if (validatorsMap[dataTypeName]) {
        throw new Error(`Data type ${dataTypeName} already was used for other class ${getClassName(cls)}`);
    }
    type.name = dataTypeName;
    validatorsMap[dataTypeName] = type;
}

export function validate() {

}
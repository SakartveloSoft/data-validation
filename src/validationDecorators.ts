import {bindDataTypeToClass, ensureForValidator, getValidatorForClass} from "./validationManager";
import {Class, FieldFormats, FieldTypes} from "./special-types";

export function knownClass(dataType?: string) {
    return function (Class) {
        bindDataTypeToClass(Class, dataType);
    }
}

export function objectKey() {
    return function (Class, name: string) {
        let dataType = ensureForValidator(Class);
        let field = dataType.ensureForField(name);
        field.valueType = FieldTypes.String;
        field.valueFormat = FieldFormats.ObjectId;
        dataType.idField = field;

    }
}

export interface IFieldOptions {
    hidden?: boolean
}

export function objectId(options?:IFieldOptions) {
    return function (Class, name, descriptor) {
        let field = getValidatorForClass(Class).ensureForField(name);
        field.valueType = FieldTypes.String;
        field.valueFormat = FieldFormats.ObjectId;
        field.applyOptions(options);
    }
}

export function string(format: FieldFormats.String|FieldFormats.Choice|FieldFormats.Email|FieldFormats.Email|FieldFormats.Password|FieldFormats.UserName = FieldFormats.String, options?:IFieldOptions) {
    return function (Class, name) {
        let field = getValidatorForClass(Class).ensureForField(name);
        field.valueType = FieldTypes.String;
        field.valueFormat = format || FieldFormats.String;
        field.applyOptions(options);
    }
}

export interface IParameterValidationError extends Error {
    className?: string;
    methodName?: string;
    parameterIndex?: number;
    parameterName?: string;
    errorCode?: string;
}

type ParamCheckFunction = (value: any, index: number) => string|null;

interface IParamValidationOptions {
    index: number,
    name: string,
    checks:ParamCheckFunction[];
}

enum ParamChecks  {
    notNullOrUndefined = "notNullOrUndefined"
}

export enum ValidationErrorCodes {
    MullOrUndefined = "nullOrUndefined"
}

let paramCheckImpl: {[name:string]: ParamCheckFunction} = {
    [ParamChecks.notNullOrUndefined.toString()](value: any, index: number):(string|null) {
        if (value === null || value === undefined) {
            return ValidationErrorCodes.MullOrUndefined;;
        } else {
            return null;
        }
    }
};

let paramValidatorsMap: {[name: string]: IParamValidationOptions[]} = {};

function ensureForKnownParam(ClassProto, methodName, paramIndex):IParamValidationOptions {
    let paramMapKey = `${ClassProto.name || ClassProto.constructor.name}::${methodName}`;
    let paramsList = paramValidatorsMap[paramMapKey];
    if (!paramsList) {
        paramsList = [];
        paramValidatorsMap[paramMapKey] = paramsList;
    }
    for(let i= 0; i <= paramIndex; i++) {
        let paramEntry = paramsList[i];
        if (paramEntry == undefined) {
            paramEntry = {
                name: null,
                index: i,
                checks: []
            };
            paramsList.push(paramEntry);
        }
    }
    return paramsList[paramIndex];
}

function setNameToParam(Class, methodName:string, paramIndex:number, name:string) {
    ensureForKnownParam(Class, methodName, paramIndex).name = name;
}


export function named(name:string) {
    return function (Class, methodName, paramIndex) {
        setNameToParam(Class, methodName, paramIndex, name);
    }
}


export function notNullOrUndefined(paramName?:string) {
    return function (Class, methodName, argIndex) {
        let paramEntry = ensureForKnownParam(Class, methodName, argIndex);
        if (paramName) {
            paramEntry.name = paramName;
        }
        if (paramEntry.checks === null || paramEntry.checks == undefined) {
            paramEntry.checks = [];
        }
        paramEntry.checks.push(paramCheckImpl[ParamChecks.notNullOrUndefined]);
    }
}

function invokeValidatorsOnFunction(className: string, memberName: string, validatorsList:IParamValidationOptions[], ...args) {
    for(let x = 0; x < validatorsList.length; x++) {
        let paramCheckOptions = validatorsList[x];
        if (paramCheckOptions) {
            const value = args[x];
            for(let y = 0; y < paramCheckOptions.checks.length; y++) {
                let checkResult = paramCheckOptions.checks[y](value, x);
                if (typeof checkResult === "string") {
                    let err:IParameterValidationError = new Error(`Invalid parameter passed to method ${memberName} of class ${className} at position ${x} (${paramCheckOptions.name || "unnamed"})`);
                    err.className = className;
                    err.methodName = memberName;
                    err.parameterIndex = x;
                    err.parameterName = paramCheckOptions.name;
                    err.errorCode = checkResult;
                    throw err;
                }
            }
        }
    }
}

export function validateCalls() {
    return function (ClassProto, memberName, descriptor) {
        let oldFunc = descriptor ? descriptor.value : null;
        if (!oldFunc) {
            oldFunc = ClassProto[memberName];
        }
        let paramsListKey = `${ClassProto.name || ClassProto.constructor.name}::${memberName}`;
        let validationList = paramValidatorsMap[paramsListKey];
        if (validationList && validationList.length > 0) {
            let activeCheckers = validationList.filter(r => r.checks && r.checks.length > 0);
            if (activeCheckers.length === 0) {
                return;
            }
            let className = ClassProto.name || ClassProto.constructor.name;
            const newFunc = function validatedCall(...args: any[]) {
                invokeValidatorsOnFunction(className, memberName, activeCheckers, ...args);
                return oldFunc.apply(this, args);
            };
            if (descriptor) {
                descriptor.value = newFunc;
            } else {
                ClassProto[memberName] = newFunc;
            }
        } else {
            return;
        }

    }
}
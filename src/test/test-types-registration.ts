import {knownClass, objectKey, string} from "../validationDecorators";
import {FieldFormats, FieldTypes} from "../special-types";
import {ensureValidatorReady} from "../validationManager";
import {expect} from 'chai';


describe('Checks a types registration with decorators', () => {
    it('register a class at validator', () => {
        @knownClass('authUser')
        class User {
            @objectKey()
            id:string;
            @string(FieldFormats.UserName)
            userName: string;
            @string(FieldFormats.Email)
            _email: string;
            @string(FieldFormats.String, {hidden: true})
            _passwordHash:string;
        }
        let data = ensureValidatorReady('authUser');
        expect(data.idField.name).equals('id');
        expect(data.fields.id.valueType ).equals(FieldTypes.String);
        expect(data.fields.id.valueFormat).equals(FieldFormats.ObjectId);
        expect(data.fields._passwordHash.name).equals('_passwordHash');
        expect(data.fields._passwordHash.hidden).equals(true);

    })
});
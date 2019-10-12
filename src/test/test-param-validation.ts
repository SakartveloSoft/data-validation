import {named, notNullOrUndefined, validateCalls} from "../validationDecorators";
import {expect} from 'chai';

class TestClass {
    name: string;
    counter: number = 0;
    @validateCalls()
    increment(@named('Difference') @notNullOrUndefined() difference: number) {
        this.counter += (difference|1);
        return this.counter;
    }
}

describe('Tests for parameters validators', () => {
    it('Test for not null decorator', (done) => {
        let counterInstance = new TestClass();
        counterInstance.increment(0);
        expect(counterInstance.counter).equals(1);
        try {
            counterInstance.increment(null);
        } catch (e) {
            expect(e.className).equals('TestClass');
            expect(e.methodName).equals('increment');
            expect(e.parameterName).equals('Difference');
            expect(e.parameterIndex).equals(0);
            expect(e.errorCode).equals('nullOrUndefined');
            done();
        }
        expect.fail('Exception was not thrown')

    })
});
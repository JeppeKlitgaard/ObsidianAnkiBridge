// We extend yup in a way that makes typings still work
import * as yup from 'yup'
import { AnyObject, Maybe } from 'yup/lib/types'

yup.addMethod<yup.StringSchema>(yup.string, 'emptyAsUndefined', function () {
    return this.transform((value) => (value === '' ? undefined : value))
})

yup.addMethod<yup.StringSchema>(yup.string, 'nullAsUndefined', function () {
    return this.transform((value) => (value === null ? undefined : value))
})

yup.addMethod<yup.NumberSchema>(yup.number, 'nullAsUndefined', function () {
    return this.transform((value) => {
        value === null ? undefined : value
    })
})

yup.addMethod<yup.NumberSchema>(yup.number, 'nanAsUndefined', function () {
    return this.transform((value) => (isNaN(value) ? undefined : value))
})

yup.addMethod<yup.BooleanSchema>(yup.boolean, 'nullAsUndefined', function () {
    return this.transform((value) => (value === null ? undefined : value))
})

declare module 'yup' {
    interface StringSchema<
        TType extends Maybe<string> = string | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType,
    > extends yup.BaseSchema<TType, TContext, TOut> {
        emptyAsUndefined(): StringSchema<TType, TContext>
    }

    interface StringSchema<
        TType extends Maybe<string> = string | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType,
    > extends yup.BaseSchema<TType, TContext, TOut> {
        nullAsUndefined(): StringSchema<TType, TContext>
    }

    interface NumberSchema<
        TType extends Maybe<number> = number | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType,
    > extends yup.BaseSchema<TType, TContext, TOut> {
        nullAsUndefined(): NumberSchema<TType, TContext>
    }

    interface NumberSchema<
        TType extends Maybe<number> = number | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType,
    > extends yup.BaseSchema<TType, TContext, TOut> {
        nanAsUndefined(): NumberSchema<TType, TContext>
    }
    interface NumberSchema<
        TType extends Maybe<number> = number | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType,
    > extends yup.BaseSchema<TType, TContext, TOut> {
        nullAsUndefined(): NumberSchema<TType, TContext>
    }

    interface BooleanSchema<
        TType extends Maybe<boolean> = boolean | undefined,
        TContext extends AnyObject = AnyObject,
        TOut extends TType = TType,
    > extends yup.BaseSchema<TType, TContext, TOut> {
        nullAsUndefined(): BooleanSchema<TType, TContext>
    }
}

export default yup

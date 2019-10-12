export type Class = {new(...args:any[])};

export enum FieldTypes {
    String = 'string',
    Text = 'text',
    Integer = 'integer',
    Double = 'double',
    Boolean = 'boolean',
    Date = 'date'
}

export enum FieldFormats {
    UserName = "userName",
    String = "string",
    ObjectId = 'objectId',
    Integer = 'integer',
    Double = 'double',
    Boolean = 'boolean',
    Date = 'date',
    Text = 'text',
    Html = 'html',
    Tags = '',
    Password = '',
    Email = 'email',
    Choice = 'choice',
    Currency = 'currency'
}
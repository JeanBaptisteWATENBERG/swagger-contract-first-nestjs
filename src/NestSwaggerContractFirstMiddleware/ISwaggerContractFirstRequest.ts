import { Request } from "express";

type Parameters = {[paramName: string]: any};

interface  ISwaggerRequestContext<T extends Parameters> {
    apiPath: string;
    path: any;
    operation: any;
    operationParameters: any[];
    operationPath: string[];
    params: {[K in keyof T]: ISwaggerParam<T[K]>};
    security: any[];
    swaggerObject: any;
}

interface ISwaggerParam<T> {
    path: any,
    schema: any,
    value: T
}

export default interface ISwaggerContractFirstRequest<T> extends Request {
    swagger: ISwaggerRequestContext<T>
}
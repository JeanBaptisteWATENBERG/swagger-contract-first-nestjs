import { Request, Response } from 'express';
import { Middleware20 } from 'swagger-tools';
import { RouterResponseController } from '@nestjs/core/router/router-response-controller';
import { NextFunction } from 'express-serve-static-core';
import * as glob from 'glob';
import * as SwaggerTools from 'swagger-tools';
import { INestApplication, Logger } from '@nestjs/common';
import ISwaggerContractFirstRequest from './ISwaggerContractFirstRequest';
import * as path from 'path';

export interface NestSwaggerContractFirstMiddlewareOptions {
    /**
     * Swagger specification object
     */
    swagger: any;
    /**
     * Controllers matching string
     * Optional, default '**\/*.controller.ts'
     */
    controllers?: string;
    /**
     * Wether to stubs API operations missing controllers
     * Optional, default false
     */
    useStubs?: boolean;
    /**
     * Wether to validate APIs request against swagger specification
     * Optional, default false
     */
    useSwaggerValidator?: boolean;
    /**
     * Wether to validate APIs response against swagger specification
     * Optional, default false, will be ignored if useSwaggerValidator is false
     */
    validateResponse?: boolean;
}

/**
 * Register Swagger middlewares
 * 
 * @param app NesJS application
 * @param options Middlewares options
 * @param onRegisterComplete Callback called once middleware registered
 */
export function registerSwaggerContractFirstMiddleware(app: INestApplication, options: NestSwaggerContractFirstMiddlewareOptions): Promise<{}> {
    if (!options.swagger) {
        throw new Error("NestJs Swagger contract first middleware requires a swagger specification in options (options.swagger)");
    }

    const promise = new Promise((resolve, reject) => {
        glob(options.controllers || '**/*.controller.ts', {}, (err: Error, controllers: string[]) => {
            if (err) reject(err);
    
            const logger = new Logger("Swagger contract first middleware");
    
            logger.log('Listing handlers...');//controllerName_method
            const handlers = controllers.flatMap(controller => {
                const controllerObject = require(path.resolve(controller));
                const controllerObjectKeys = Object.keys(controllerObject);
                const controllerName = controllerObjectKeys.find(key => key.endsWith('Controller'));
                if (!controllerName) return [];
                const controllerInstance = app.get(controllerName);
                const controllerInstanceFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(controllerInstance));
                const controllerMethods = controllerInstanceFunctions.filter(functionName => functionName !== 'constructor');
                return controllerMethods.flatMap(method => {
                    return [
                        {
                            handlerId: controllerName + '_' + method,
                            value: controllerInstance[method].bind(controllerInstance)
                        },
                        {
                            handlerId: controllerName.replace(/Controller$/, '') + '_' + method,
                            value: controllerInstance[method].bind(controllerInstance)
                        }
                    ]
                })
            }).reduce((handlers, handler) => ({ ...handlers, [handler.handlerId]: handler.value }), {});
    
            logger.log('Initializing swagger middlewares...');
            SwaggerTools.initializeMiddleware(options.swagger, (swaggerMiddleware) => {
                logger.log('Register swagger middlewares...');
                app.use(swaggerMiddleware.swaggerMetadata());
    
                const routerMiddleware = swaggerMiddleware.swaggerRouter({
                    controllers: handlers,
                    useStubs: options.useStubs
                });
    
                const httpAdapter = app.getHttpAdapter();
                const nestRouterResponseController = new RouterResponseController(httpAdapter);
    
                if (options.useSwaggerValidator) {
                    app.use(swaggerMiddleware.swaggerValidator({
                        validateResponse: options.validateResponse
                    }));
                }
    
                app.use((req: ISwaggerContractFirstRequest<any>, res: Response, next: NextFunction) => {
                    const result = routerMiddleware(req, res, next);
                    if (req.swagger) {
                        nestRouterResponseController.apply(result, res);
                    }
                })
    
                resolve();
            });
        });
    });

    return promise;
}

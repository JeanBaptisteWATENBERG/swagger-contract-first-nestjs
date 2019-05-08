import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import ISwaggerContractFirstRequest from './NestSwaggerContractFirstMiddleware/ISwaggerContractFirstRequest';

export interface IHelloParameters {
  greeting: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  getHello(req: ISwaggerContractFirstRequest<IHelloParameters>): string { 
    return this.appService.getHello(req.swagger.params.greeting.value);
  }
}

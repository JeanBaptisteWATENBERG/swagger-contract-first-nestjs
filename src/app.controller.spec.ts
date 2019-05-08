import { Test, TestingModule } from '@nestjs/testing';
import { AppController, IHelloParameters } from './app.controller';
import { AppService } from './app.service';
import ISwaggerContractFirstRequest from './NestSwaggerContractFirstMiddleware/ISwaggerContractFirstRequest';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello({swagger: {params: {greeting: {value: 'test'}}}} as ISwaggerContractFirstRequest<IHelloParameters>)).toBe('Hello test !');
    });
  });
});

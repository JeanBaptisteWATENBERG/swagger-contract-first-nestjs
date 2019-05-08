import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { registerSwaggerContractFirstMiddleware } from './NestSwaggerContractFirstMiddleware/swaggerContractFirst.middleware';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

const swagger = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './swagger/swagger.yaml'), 'utf8'));

const options = {
  swagger,
  controllers: '**/*.controller.ts',
  useStubs: true,
  useSwaggerValidator: true,
  validateResponse: true
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  SwaggerModule.setup('docs', app, swagger);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  
  await registerSwaggerContractFirstMiddleware(app, options);
  await app.listen(4000);
  const logger = new Logger("main");
  logger.log('API is listening at http://localhost:4000/');
  
}

bootstrap();
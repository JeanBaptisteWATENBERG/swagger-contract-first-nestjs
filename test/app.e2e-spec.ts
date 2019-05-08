import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { registerSwaggerContractFirstMiddleware } from './../src/NestSwaggerContractFirstMiddleware/swaggerContractFirst.middleware';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const swagger = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './../src/swagger/swagger.yaml'), 'utf8'));

    const options = {
      swagger,
      controllers: '**/*.controller.ts',
      useStubs: true,
      useSwaggerValidator: true,
      validateResponse: true
    }

    await registerSwaggerContractFirstMiddleware(app, options);
    await app.init();

  });

  it('/api/v1/hello (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/hello')
      .expect(200)
      .expect('Hello World !');
  });

  it('/api/v1/hello?greeting=jb (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/hello?greeting=jb')
      .expect(200)
      .expect('Hello jb !');
  });
});

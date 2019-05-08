import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(greeting?: string): string {
    return `Hello ${greeting || 'World'} !`;
  }
}

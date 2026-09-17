import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  async getHealth() {
    const health = await this.appService.getHealth();
    if (health.database === 'down') {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }
}

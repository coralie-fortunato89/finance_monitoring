import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthResponseDto, RootMessageDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API root ping' })
  @ApiOkResponse({ type: RootMessageDto })
  getData() {
    return this.appService.getData();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns 503 when the database is unreachable.',
  })
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiServiceUnavailableResponse({
    description: 'Database down',
    type: HealthResponseDto,
  })
  async getHealth() {
    const health = await this.appService.getHealth();
    if (health.database === 'down') {
      throw new ServiceUnavailableException(health);
    }
    return health;
  }
}

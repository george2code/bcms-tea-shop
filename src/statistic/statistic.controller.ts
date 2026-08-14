import { Controller, Get, Param } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Auth()
  @Get('main/:storeId')
  async getMainStatistics(@Param('storeId') storeId: string) {
    return this.statisticService.getMainStatistics(storeId);
  }

  @Auth()
  @Get('middle/:storeId')
  async getMiddleStatistics(@Param('storeId') storeId: string) {
    return this.statisticService.getMiddleStatistics(storeId);
  }
}

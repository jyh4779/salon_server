import { Module } from '@nestjs/common';
import { VisitLogsController } from './visit-logs.controller';
import { VisitLogsService } from './visit-logs.service';

@Module({
  controllers: [VisitLogsController],
  providers: [VisitLogsService],
  exports: [VisitLogsService]
})
export class VisitLogsModule { }

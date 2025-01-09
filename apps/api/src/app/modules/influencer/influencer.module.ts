import { Module } from '@nestjs/common';
import { InfluencerController } from './influencer.controller';
import { InfluencerService } from './influencer.service';
import { ContentAnalysisService } from '../content-analysis/content-analysis.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [InfluencerController],
  providers: [InfluencerService, ContentAnalysisService],
  exports: [InfluencerService],
})
export class InfluencerModule {}

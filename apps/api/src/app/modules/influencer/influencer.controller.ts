import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetContentDto } from './get-content.dto';
import { ContentAnalysisService } from '../content-analysis/content-analysis.service';
import { InfluencerService } from './influencer.service';

@Controller('influencer')
export class InfluencerController {
  constructor(
    private readonly contentAnalysisService: ContentAnalysisService,
    private readonly influencerService: InfluencerService
  ) {}

  @Get('/content/analysis')
  async getInfluencerContent(@Query() query: GetContentDto) {
    const {
      timeRange,
      influencerName,
      claims,
      product,
      revenue,
      journal,
      journals,
      notes,
    } = query;

    const tweets = await this.contentAnalysisService.tweetsAnalysis(
      influencerName,
      timeRange,
      (journals || '').split(',').filter((f) => f),
      notes,
      claims || 50
    );

    return tweets;
  }

  @Get('/:id')
  async getInfluencer(@Param('id') id: string) {
    return this.influencerService.getInfluencer(id);
  }

  @Get('/')
  async getLeaderboard() {
    return this.influencerService.getLeaderboard();
  }
}

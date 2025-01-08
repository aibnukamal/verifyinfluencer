import { Controller, Get, Query } from '@nestjs/common';
import { GetContentDto } from './get-content.dto';
import { ContentAnalysisService } from '../content-analysis/content-analysis.service';

@Controller('influencer')
export class InfluencerController {
  constructor(
    private readonly contentAnalysisService: ContentAnalysisService
  ) {}

  @Get('/content')
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

    const tweets = await this.contentAnalysisService.fetchTweets(
      influencerName,
      timeRange,
      journals.split(','),
      notes,
      claims || 50
    );
    return tweets;
  }
}

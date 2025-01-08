import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfluencerModule } from './modules/influencer/influencer.module';

@Module({
  imports: [InfluencerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

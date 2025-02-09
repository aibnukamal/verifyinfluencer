import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfluencerModule } from './modules/influencer/influencer.module';
import { PrismaService } from './modules/prisma/prisma.service';

@Module({
  imports: [InfluencerModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

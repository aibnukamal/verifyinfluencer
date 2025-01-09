import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InfluencerService {
  constructor(private prisma: PrismaService) {
    //
  }

  async getInfluencer(id: string) {
    try {
      const influencer = await this.prisma.influencer.findUnique({
        where: { id },
      });

      if (!influencer) {
        throw new NotFoundException(`Influencer with ID '${id}' not found`);
      }

      return influencer;
    } catch (error) {
      console.error('Error fetching influencer:', error);
      throw error;
    }
  }

  async getLeaderboard() {
    const data = await this.prisma.influencer.findMany();

    return data
      .map((m: any) => {
        const analysis = JSON.parse(m.analysis);
        const scores = analysis.map((item: any) => Number(item.trustScore));
        const total = scores.reduce((acc: any, score: any) => acc + score, 0);
        const averageScore = (total / scores.length).toFixed(2);
        const allCategories = analysis
          .map((item: any) => item.categories.split(', '))
          .flat();

        const name = analysis?.[0]?.tweet?.author ?? '';
        const profileImage = analysis?.[0]?.tweet?.profileImage ?? '';
        const followersCount = analysis?.[0]?.tweet?.followersCount ?? '';
        const verifiedClaims = analysis.length;

        return {
          id: m.id,
          trustScore: averageScore,
          categories: [...new Set(allCategories)],
          name,
          profileImage,
          followersCount,
          verifiedClaims,
        };
      })
      .sort((a, b) => parseInt(b.trustScore) - parseInt(a.trustScore));
  }
}

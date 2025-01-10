import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const influencers = await prisma.influencer.findMany();

    const leaderboard = influencers.map((influencer: any) => {
      const analysis = JSON.parse(influencer.analysis as string);
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
        id: influencer.id,
        trustScore: averageScore,
        categories: [...new Set(allCategories)],
        name,
        profileImage,
        followersCount,
        verifiedClaims,
      };
    });

    leaderboard.sort(
      (a, b) => parseFloat(b.trustScore) - parseFloat(a.trustScore)
    );

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

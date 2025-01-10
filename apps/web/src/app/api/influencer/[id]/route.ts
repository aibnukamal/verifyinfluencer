import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const influencer = await prisma.influencer.findUnique({
      where: { id },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: `Influencer with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(influencer);
  } catch (error) {
    console.error('Error fetching influencer:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

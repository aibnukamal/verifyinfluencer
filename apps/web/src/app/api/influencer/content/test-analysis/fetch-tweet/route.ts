import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TweetResponse {
  content: string;
  data: string;
  author: string;
  bio: string;
  profileImage: string;
  followersCount: string;
}

// Function to scrape tweets
async function scrapeTweets(username: string): Promise<TweetResponse[]> {
  let browser: any;

  // Save data in the database
  await prisma.influencer.upsert({
    where: { id: username },
    update: { analysis: JSON.stringify({ status: 'started' }) },
    create: {
      id: username,
      analysis: JSON.stringify({ status: 'started' }),
    },
  });

  if (process.env.NODE_ENV === 'production') {
    browser = await puppeteerCore.launch({
      headless: true, // Change to 'true' to avoid the browser popup
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
    });
  } else {
    browser = await puppeteer.launch({
      headless: true, // Change to 'true' to avoid the browser popup
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1280x1024',
      ],
    });
  }
  const page = await browser.newPage();

  // Set a realistic user agent to avoid detection
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  // Navigate to the Twitter user’s page
  await page.goto(`https://x.com/${username}`, { waitUntil: 'networkidle2' });

  // Scroll to load more tweets
  let lastHeight = await page.evaluate('document.body.scrollHeight');
  for (let i = 0; i < 10; i++) {
    // Increase loop count to load more tweets
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    // await page.waitForTimeout(3000); // Wait a bit for new tweets to load
    const newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === lastHeight) break; // Stop scrolling if no new content
    lastHeight = newHeight;
  }

  // Wait for tweets to load (ensure we have an article element)
  await page.waitForSelector('article');

  // Scrape the tweets data and user profile info
  const tweetsData = await page.evaluate(() => {
    const tweetElements = document.querySelectorAll('article');
    const tweetList: any = [];
    const profileImage =
      (document.querySelector('img[src*="profile"]') as any)?.src ||
      'No profile image'; // Profile picture URL
    const followersCount =
      document.querySelector('a[href*="followers"] span')?.textContent ||
      'No followers count';

    // Extract bio
    const bio =
      document.querySelector('div[data-testid="UserDescription"]')
        ?.textContent || 'No bio available';

    tweetElements.forEach((tweet) => {
      const content = tweet.querySelector('div[lang]')?.textContent;
      const author = tweet.querySelector('span')?.textContent;
      const date =
        tweet.querySelector('time')?.getAttribute('datetime') ||
        'No date available';

      if (content && author) {
        tweetList.push({
          date,
          content,
          author,
          bio,
          profileImage,
          followersCount,
        });
      }
    });

    return tweetList;
  });

  await browser.close();

  // Save data in the database
  await prisma.influencer.upsert({
    where: { id: username },
    update: { analysis: JSON.stringify(tweetsData) },
    create: {
      id: username,
      analysis: JSON.stringify(tweetsData),
    },
  });

  return tweetsData as TweetResponse[];
}

// Main GET handler
export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get('influencerName');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    scrapeTweets(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

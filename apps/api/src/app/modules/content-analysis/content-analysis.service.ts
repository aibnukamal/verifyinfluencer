import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { PrismaService } from '../prisma/prisma.service';

dotenv.config();

interface TweetResponse {
  content: string;
  data: string;
  author: string;
  bio: string;
  profileImage: string;
  followersCount: string;
}

@Injectable()
export class ContentAnalysisService {
  constructor(
    private readonly httpService: HttpService,
    private prisma: PrismaService
  ) {}

  // Normalize response from Gemini
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getTextFromResponse(response: any): string {
    if (
      response &&
      response.data &&
      response.data.candidates &&
      response.data.candidates.length > 0 &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts.length > 0
    ) {
      return response.data.candidates[0].content.parts[0].text.trim();
    }
    return '';
  }

  // Search and parse journals from google scholars
  async searchScholarlyArticles(
    query: string,
    journals?: string[]
  ): Promise<any> {
    // Append the journal(s) to the query if provided
    const journalQuery =
      journals?.map((journal) => `"${journal}"`).join(' OR ') || '';
    const finalQuery = `${query} ${journalQuery}`;

    // Construct URL to perform search
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(
      finalQuery
    )}`;

    // Fetch HTML content of the search result page
    const { data } = await firstValueFrom(this.httpService.get(url));

    // Parse the HTML content using Cheerio
    const $ = cheerio.load(data);
    const results = [];

    // Extract relevant information from the HTML structure
    $('div.gs_ri').each((index, element) => {
      const title = $(element).find('h3').text();
      const authors = $(element).find('.gs_a').text();
      const link = $(element).find('a').attr('href');
      const extractedJournal =
        $(element).find('.gs_a').text().split('-')[1]?.trim() || 'N/A';
      const year =
        $(element).find('.gs_a').text().split('-')[0]?.trim() || 'N/A';

      results.push({
        title,
        authors,
        journal: extractedJournal,
        year,
        link,
      });
    });

    return results;
  }

  // Get influencer tweet
  async scrapeTweets(username): Promise<TweetResponse[]> {
    const browser = await puppeteer.launch({
      headless: true, // Change to 'true' to avoid the browser popup
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280x1024',
      ],
    });

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
      const tweetList = [];
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

    return tweetsData as TweetResponse[];
  }

  // AI analysis with Gemini
  async askGeminiAI(questions: string) {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: questions,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: process.env.GEMINI_API_KEY,
          },
        }
      )
    );

    const result = this.getTextFromResponse(response);

    return result;
  }

  // Function to save tweet analysis to the database
  private async saveAnalysisToDatabase(
    username: string,
    analysis: any
  ): Promise<void> {
    try {
      await this.prisma.influencer.upsert({
        where: { id: username },
        update: { analysis: JSON.stringify(analysis) },
        create: {
          id: username,
          analysis: JSON.stringify(analysis),
        },
      });
    } catch (error) {
      console.error('Error saving analysis to database:', error);
      throw new HttpException(
        'Failed to save analysis to the database',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Fetch recent tweets by params
   */
  async tweetsAnalysis(
    username?: string,
    timeRange?: string,
    journalSources?: string[],
    notes?: string,
    maxResults = 10
  ): Promise<any> {
    try {
      const twitResponse = await this.scrapeTweets(username);
      const analizedTweet = await Promise.all(
        twitResponse.map(async (tweet) => {
          // Generate statement from tweet
          const statement = await this.askGeminiAI(
            `If it contains health aspects, conclude what the point of this tweet is please return only the essence briefly. If not, don't show anything. the tweet: "${tweet.content}"`
          );

          const checkStatement = await this.askGeminiAI(
            `check if statement is contain health topic "${tweet.content}", return "YES" if contain and return "NO" if not contain`
          );

          let journals = '';
          let statementComparedWithJournal = '';
          let categorized = '';
          let status = '';
          let trustScore = '';

          if (checkStatement === 'NO') {
            return null;
          }

          if (statement) {
            // Search related journal from the statement if any
            if (journalSources.length) {
              journals = await this.searchScholarlyArticles(
                statement,
                journalSources
              );
            }
            // Compare statement with journal or use AI analysis
            statementComparedWithJournal = await this.askGeminiAI(
              journalSources.length
                ? `compare this statement "${statement}" whether it matches the following journal (${JSON.stringify(
                    journals
                  )}), if the statement matches the journal, bring up the journal as a reference ${
                    notes ? `and ${notes}` : ''
                  }`
                : `please analize this statement "${statement}" is it valid or not ${
                    notes ? `and ${notes}` : ''
                  }`
            );
            // Categorized the result (Nutrition, Medicine, Mental Health)
            categorized = await this.askGeminiAI(
              `create a "health" category from this statement "${statement}", for example the categories Nutrition, Medicine, Mental Health, please not return only categories string, if have multiple return with comma`
            );
            // Determine the status (Verified, Questionable, Debunked)
            status = await this.askGeminiAI(
              `create a verification status (Verified, Questionable, Debunked) from this statement "${statement}" and AI conclusion "${statementComparedWithJournal}", please note only return the status`
            );
            // Determine the trust score
            trustScore = await this.askGeminiAI(
              `create a score of trusted tweet from 0 until 100 from this statement "${statement}" and AI conclusion "${statementComparedWithJournal}", please note only return the number`
            );
          }

          return {
            tweet,
            statement,
            aiAnalysis: statementComparedWithJournal,
            journals,
            categories: categorized,
            status,
            trustScore,
          };
        })
      );

      const filterAnalizedTweet = analizedTweet.filter((f) => f);

      await this.saveAnalysisToDatabase(username, filterAnalizedTweet);

      return filterAnalizedTweet;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        error.response?.data || 'Failed to fetch tweets',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

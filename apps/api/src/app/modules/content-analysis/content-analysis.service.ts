import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, firstValueFrom } from 'rxjs';
import * as dotenv from 'dotenv';
import moment from 'moment';
import * as cheerio from 'cheerio';

dotenv.config();

@Injectable()
export class ContentAnalysisService {
  private readonly twitterAPI = 'https://api.twitter.com/2';

  private healthKeywords: string[] = [
    'health',
    'mental health',
    'vaccine',
    'pandemic',
    'stress',
    'well-being',
    'mental wellness',
    'farming mental health',
    'isolation',
    'depression',
    'anxiety',
    'financial strain',
    'burnout',
    'emotional well-being',
    'mental health awareness',
    'mental health challenges',
  ];

  constructor(private readonly httpService: HttpService) {}

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

  // Date range helper
  private getDateRange(timeRange: string): { start: string; end: string } {
    const now = moment();
    let start;

    switch (timeRange) {
      case 'lastWeek':
        start = now.subtract(1, 'week').startOf('week').toISOString();
        break;
      case 'lastMonth':
        start = now.subtract(1, 'month').startOf('month').toISOString(); // Start of last month
        break;
      case 'lastYear':
        start = now.subtract(1, 'year').startOf('year').toISOString(); // Start of last year
        break;
      case 'allTime':
        start = moment('2000-01-01').toISOString(); // Arbitrary early date for "all time"
        break;
      default:
        start = now.subtract(1, 'week').startOf('week').toISOString(); // Default to "last week" if no valid range is given
        break;
    }

    // Ensure the end time is always the current moment
    const end = now.toISOString();

    return { start, end };
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

  /**
   * Fetch recent tweets by params
   */
  async fetchTweets(
    username?: string,
    timeRange?: string,
    journalSources?: string[],
    notes?: string,
    maxResults = 10
  ): Promise<any> {
    const url = `${this.twitterAPI}/tweets/search/recent`;
    const token = process.env.TWITTER_BEARER_TOKEN;

    if (!token) {
      throw new HttpException(
        'Twitter Bearer Token is missing',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      let query = '';

      // Construct the query based on the username and health-related keywords
      if (username) {
        query = `from:${username} (${this.healthKeywords
          .map((k) => `"${k}"`)
          .join(' OR ')})`;
      } else {
        query = this.healthKeywords.map((k) => `"${k}"`).join(' OR ');
      }

      // Handle time range
      const dateRange = this.getDateRange(timeRange);

      // Make the request to fetch tweets
      // const response = await lastValueFrom(
      //   this.httpService.get(url, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //     params: {
      //       query,
      //       max_results: maxResults,
      //       'tweet.fields': 'created_at,text',
      //       expansions: 'author_id',
      //       'user.fields': 'id,name,username,profile_image_url,created_at',
      //       ...(timeRange === 'allTime'
      //         ? {}
      //         : {
      //             start_time: dateRange.start,
      //             end_time: dateRange.end,
      //           }),
      //     },
      //   })
      // );

      const response = {
        data: {
          data: [
            {
              edit_history_tweet_ids: ['1876637275532283980'],
              text: 'RT @VigilantFox: 10 Shocking Stories the Media Buried Today\n\n#10 - The COVID “vaccines” damage the brain and DEVASTATE mental health, as co…',
              author_id: '795690992108179459',
              created_at: '2025-01-07T14:29:27.000Z',
              id: '1876637275532283980',
            },
          ],
          includes: {
            users: [
              {
                created_at: '2016-11-07T18:14:50.000Z',
                id: '795690992108179459',
                name: 'The GoldFish Report',
                profile_image_url:
                  'https://pbs.twimg.com/profile_images/1756358237874540544/HqsTx_BK_normal.jpg',
                username: 'ReportGoldfish',
              },
            ],
          },
          meta: {
            newest_id: '1876637294310158777',
            oldest_id: '1876637117180416481',
            result_count: 100,
            next_token: 'b26v89c19zqg8o3frr6t6igivrw5zy43yw9al01zaaf7h',
          },
        },
      };

      // Combining tweets with user details
      const tweets = response.data.data;
      const users = response.data.includes.users;

      const combinedData = tweets.map((tweet) => {
        const user = users.find((user) => user.id === tweet.author_id);
        return {
          ...tweet,
          user: user
            ? {
                name: user.name,
                username: user.username,
                profile_image_url: user.profile_image_url,
              }
            : null,
        };
      });

      const filtered = combinedData.filter((tweet) => {
        // Check if tweet contains any of the health-related keywords
        return this.healthKeywords.some((keyword) =>
          tweet.text.toLowerCase().includes(keyword)
        );
      });

      const analizedTweet = await Promise.all(
        filtered.map(async (tweet) => {
          // Generate statement from tweet
          const statement = await this.askGeminiAI(
            `If it contains health aspects, conclude what the point of this tweet is please return only the essence briefly. If not, don't show anything. the tweet: "${tweet.text}"`
          );
          let journals = '';
          let statementComparedWithJournal = '';
          let categorized = '';
          let status = '';
          let trustScore = '';

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

      // const analizedTweet = [
      //   {
      //     tweet: {
      //       edit_history_tweet_ids: ['1876637275532283980'],
      //       text: 'RT @VigilantFox: 10 Shocking Stories the Media Buried Today\n\n#10 - The COVID “vaccines” damage the brain and DEVASTATE mental health, as co…',
      //       author_id: '795690992108179459',
      //       created_at: '2025-01-07T14:29:27.000Z',
      //       id: '1876637275532283980',
      //       user: {
      //         name: 'The GoldFish Report',
      //         username: 'ReportGoldfish',
      //         profile_image_url:
      //           'https://pbs.twimg.com/profile_images/1756358237874540544/HqsTx_BK_normal.jpg',
      //       },
      //     },
      //     statement:
      //       'The tweet claims COVID vaccines cause brain damage and mental health issues.',
      //     aiAnalysis:
      //       'The provided statement ("The tweet claims COVID vaccines cause brain damage and mental health issues") does *not* directly match the content of the listed journal articles.  While several articles discuss brain damage (specifically traumatic brain injury), mental health issues, and the COVID-19 pandemic, none directly address the claim that COVID-19 vaccines *cause* brain damage or mental health problems.  The articles explore correlations and associations between various factors and mental/neurological health outcomes, but don\'t support the causal link stated in the tweet.',
      //     journals: [
      //       {
      //         title:
      //           'Science denial and COVID conspiracy theories: potential neurological mechanisms and possible responses',
      //         authors: 'BL Miller�- Jama, 2020 - jamanetwork.com',
      //         journal: 'Jama, 2020',
      //         year: 'BL Miller�',
      //         link: 'https://jamanetwork.com/journals/jama/article-abstract/2772693',
      //       },
      //       {
      //         title:
      //           'Helping the public understand adverse events associated with COVID-19 vaccinations: lessons learned from functional neurological disorder',
      //         authors:
      //           'DD Kim, CS Kung, DL Perez�- JAMA neurology, 2021 - jamanetwork.com',
      //         journal: 'JAMA neurology, 2021',
      //         year: 'DD Kim, CS Kung, DL Perez�',
      //         link: 'https://jamanetwork.com/journals/jamaneurology/article-abstract/2778192',
      //       },
      //       {
      //         title:
      //           'Widespread misinformation about infertility continues to create COVID-19 vaccine hesitancy',
      //         authors: 'J Abbasi�- Jama, 2022 - jamanetwork.com',
      //         journal: 'Jama, 2022',
      //         year: 'J Abbasi�',
      //         link: 'https://jamanetwork.com/journals/jama/article-abstract/2789477',
      //       },
      //       {
      //         title:
      //           'Association of social determinants of health and vaccinations with child mental health during the COVID-19 pandemic in the US',
      //         authors:
      //           'Y Xiao, PSF Yip, J Pathak, JJ Mann�- JAMA psychiatry, 2022 - jamanetwork.com',
      //         journal: 'JAMA psychiatry, 2022',
      //         year: 'Y Xiao, PSF Yip, J Pathak, JJ Mann�',
      //         link: 'https://jamanetwork.com/journals/jamapsychiatry/article-abstract/2791321',
      //       },
      //       {
      //         title:
      //           'Association of traumatic brain injury with the risk of developing chronic cardiovascular, endocrine, neurological, and psychiatric disorders',
      //         authors:
      //           'S Izzy, PM Chen, Z Tahir, R Grashow…�- JAMA network�…, 2022 - jamanetwork.com',
      //         journal: 'JAMA network�…, 2022',
      //         year: 'S Izzy, PM Chen, Z Tahir, R Grashow…�',
      //         link: 'https://jamanetwork.com/journals/jamanetworkopen/article-abstract/2791599',
      //       },
      //       {
      //         title:
      //           '[HTML][HTML] Cognition and memory after Covid-19 in a large community sample',
      //         authors:
      //           'A Hampshire, A Azor, C Atchison…�- …�Journal of Medicine, 2024 - Mass Medical Soc',
      //         journal: '…�Journal of Medicine, 2024',
      //         year: 'A Hampshire, A Azor, C Atchison…�',
      //         link: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2311330',
      //       },
      //       {
      //         title:
      //           'The COVID-19 pandemic and mental health concerns on Twitter in the United States',
      //         authors:
      //           'S Zhang, L Sun, D Zhang, P Li, Y Liu, A Anand…�- Health Data�…, 2022 - spj.science.org',
      //         journal: 'Health Data�…, 2022',
      //         year: 'S Zhang, L Sun, D Zhang, P Li, Y Liu, A Anand…�',
      //         link: 'https://spj.science.org/doi/pdf/10.34133/2022/9758408?adobe_mc=MCMID%3D13000405405683999525849378418609464876%7CMCORGID%3D242B6472541199F70A4C98A6%2540AdobeOrg%7CTS%3D1681430400',
      //       },
      //       {
      //         title:
      //           'Associations of military-related traumatic brain injury with new-onset mental health conditions and suicide risk',
      //         authors:
      //           'LA Brenner, JE Forster, JL Gradus…�- JAMA network�…, 2023 - jamanetwork.com',
      //         journal: 'JAMA network�…, 2023',
      //         year: 'LA Brenner, JE Forster, JL Gradus…�',
      //         link: 'https://jamanetwork.com/journals/jamanetworkopen/article-abstract/2807787',
      //       },
      //       {
      //         title:
      //           'Association of sex and age with mild traumatic brain injury–related symptoms: a TRACK-TBI study',
      //         authors:
      //           '…, E Yuh, R Zafonte, TRACK-TBI Investigators�- JAMA network�…, 2021 - jamanetwork.com',
      //         journal: 'TBI Investigators�',
      //         year: '…, E Yuh, R Zafonte, TRACK',
      //         link: 'https://jamanetwork.com/journals/jamanetworkopen/article-abstract/2778183',
      //       },
      //       {
      //         title:
      //           'Traumatic brain injury and veteran mortality after the war in Afghanistan',
      //         authors:
      //           'MA Reger, LA Brenner, A du Pont�- JAMA network open, 2022 - jamanetwork.com',
      //         journal: 'JAMA network open, 2022',
      //         year: 'MA Reger, LA Brenner, A du Pont�',
      //         link: 'https://jamanetwork.com/journals/jamanetworkopen/article-abstract/2788981',
      //       },
      //     ],
      //     categories: 'Medicine, Mental Health',
      //     status: 'Debunked',
      //     trustScore: '10',
      //   },
      // ];

      return analizedTweet;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        error.response?.data || 'Failed to fetch tweets',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

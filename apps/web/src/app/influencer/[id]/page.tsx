'use client';

import {
  Breadcrumb,
  Layout,
  theme,
  Avatar,
  Tag,
  Form,
  Input,
  Button,
  Spin,
  message,
} from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  ProductOutlined,
  CalendarOutlined,
  LinkOutlined,
  OpenAIOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

type ClaimSearchPayload = {
  claims?: string;
  categories?: string[];
  verificationStatuses?: string[];
};

type Claim = {
  status: string;
  date: string;
  claimText: string;
  trustScore: number;
  aiAnalysis: string;
  sourceLinks: string;
  journals: any;
};

const JournalList = ({ journals }: any) => {
  if (!journals) return;

  return (
    <div className="mt-6">
      <h2 className="mb-2">Journal Articles</h2>
      <ul className="list-none p-0">
        {(journals || []).map((journal: any, index: number) => (
          <li
            key={index}
            className="border border-gray-300 rounded-lg p-4 mb-3 shadow-lg"
          >
            <h3 className="m-0 mb-2 font-bold">{journal.title}</h3>
            <p className="m-0 text-gray-700">
              <strong>Authors:</strong> {journal.authors.replace('…�', '...')}
            </p>
            <p className="m-0 text-gray-700">
              <strong>Journal:</strong> {journal.journal.replace('…�', '...')}
            </p>
            <p className="m-0 text-gray-700">
              <strong>Year:</strong> {journal.year.replace('…�', '...')}
            </p>
            <a
              href={journal.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 font-bold hover:underline"
            >
              Read More
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Index({ params: { id } }: { params: { id: string } }) {
  const { Content } = Layout;
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'All',
  ]);
  const [selectedVerificationStatuses, setSelectedVerificationStatuses] =
    useState<string[]>(['All Statuses']);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [analysis, setAnalysis] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const profile = analysis[0];

  const tags = useMemo(() => {
    const allCategories = analysis
      .map((item: any) => item.categories.split(', '))
      .flat();

    return [...new Set(allCategories)];
  }, []);

  const scores = analysis.map((item: any) => Number(item.trustScore));
  const total = scores.reduce((acc: any, score: any) => acc + score, 0);
  const averageScore = (total / scores.length).toFixed(2);

  const categories = [
    'All',
    'Nutrition',
    'Fitness',
    'Medicine',
    'Mental Health',
  ];

  const verificationStatus = [
    'All Statuses',
    'Verified',
    'Questionable',
    'Debunked',
  ];

  const claimsData: Claim[] = analysis.map((m: any) => ({
    status: m.status,
    date: m.tweet.date,
    claimText: m.tweet.content,
    trustScore: m.trustScore,
    aiAnalysis: m.aiAnalysis,
    sourceLinks: '/view-source',
    journals: m.journals,
  }));

  const statistic = [
    {
      title: 'Trust Score',
      value: averageScore,
      description: `Based on ${analysis.length} verified claims`,
      icon: <RiseOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
    {
      title: 'Yearly Revenue',
      value: '-',
      description: 'Estimated earnings',
      icon: <DollarOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
    {
      title: 'Products',
      value: '-',
      description: 'Recommended products',
      icon: <ProductOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
    {
      title: 'Followers',
      value: profile?.tweet?.followersCount || 0,
      description: 'Total following',
      icon: <RiseOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
  ];

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      name === 'All'
        ? ['All'] // Reset to 'All' if 'All' is selected
        : prev.includes(name)
        ? prev.filter((category) => category !== name)
        : prev.filter((category) => category !== 'All').concat(name)
    );
  };

  const toggleVerificationStatus = (name: string) => {
    setSelectedVerificationStatuses((prev) =>
      name === 'All Statuses'
        ? ['All Statuses'] // Reset to 'All Statuses' if selected
        : prev.includes(name)
        ? prev.filter((status) => status !== name)
        : prev.filter((status) => status !== 'All Statuses').concat(name)
    );
  };

  const getInfluencerById = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/influencer/${id}`
      );
      if (!response.ok) throw new Error('Failed to fetch influencer details.');
      const data = await response.json();

      setAnalysis(JSON.parse(data.analysis));
    } catch (error: any) {
      message.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInfluencerById(id);
  }, [id]);

  if (loading) {
    return (
      <Content className="px-[48px] h-screen flex justify-center items-center">
        <Spin size="large" />
      </Content>
    );
  }

  if (!analysis.length) {
    return (
      <Content className="px-[48px] h-screen flex justify-center items-center">
        <div>No influencer found with ID: {id}</div>
      </Content>
    );
  }

  return (
    <Content className="px-[48px] h-full">
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>
          <Link href="/">Back to Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/leaderboard">Leaderboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{id}</Breadcrumb.Item>
      </Breadcrumb>
      <div
        className="p-[24px] min-h-[380px]"
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center">
          <div className="w-[100px]">
            <Avatar
              src={profile.tweet.profileImage}
              size="large"
              style={{ width: '100px', height: '100px' }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full sm:ml-5">
            <div className="font-bold text-[24px] text-center sm:text-left">
              {profile.tweet.author}
            </div>
            <div className="flex flex-wrap gap-2 sm:block">
              {tags.map((name: any) => (
                <Tag key={name} bordered={false} color="#3c82f6">
                  <span className="text-[12px]">{name}</span>
                </Tag>
              ))}
            </div>
            <div>{profile?.tweet?.bio}</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 my-5">
          {statistic.map((data, index) => (
            <div
              key={index}
              className="flex flex-row rounded-[5px] border items-center p-4 bg-blue-100 border-blue-400 w-full justify-between"
            >
              <div className="flex flex-col">
                <div className="font-bold text-[12px]">{data.title}</div>
                <div className="font-bold text-[20px] text-blue-600">
                  {data.value}
                </div>
                <div className="text-[9px]">{data.description}</div>
              </div>
              {data.icon}
            </div>
          ))}
        </div>
        {/* <div className="text-blue-600 text-bold mb-5">Claims Analysis</div>
        <div className="p-4 bg-blue-50 rounded">
          <Form
            name="basic"
            layout="vertical"
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={(values: ClaimSearchPayload) => {
              console.log({
                ...values,
                categories: selectedCategories,
                verificationStatuses: selectedVerificationStatuses,
              });
            }}
            autoComplete="off"
          >
            <div className="my-5">
              <Form.Item<ClaimSearchPayload> label="Claims" name="claims">
                <Input placeholder="Search claims..." />
              </Form.Item>
            </div>

            <div className="my-5">
              <Form.Item<ClaimSearchPayload>
                label="Categories"
                name="categories"
              >
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  {categories.map((name) => (
                    <Tag
                      key={name}
                      bordered={false}
                      color={
                        selectedCategories.includes(name)
                          ? '#3c82f6'
                          : '#dbe9fe'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleCategory(name)}
                    >
                      <span className="text-[14px]">{name}</span>
                    </Tag>
                  ))}
                </div>
              </Form.Item>
            </div>

            <div className="my-5">
              <Form.Item<ClaimSearchPayload>
                label="Verification Status"
                name="verificationStatuses"
              >
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  {verificationStatus.map((name) => (
                    <Tag
                      key={name}
                      bordered={false}
                      color={
                        selectedVerificationStatuses.includes(name)
                          ? '#3c82f6'
                          : '#dbe9fe'
                      }
                      className="cursor-pointer"
                      onClick={() => toggleVerificationStatus(name)}
                    >
                      <span className="text-[14px]">{name}</span>
                    </Tag>
                  ))}
                </div>
              </Form.Item>
            </div>

            <Form.Item label={null} style={{ marginBottom: '0px' }}>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
            </Form.Item>
          </Form>
        </div> */}
        <div className="text-blue-600 text-bold my-5">
          Showing {claimsData.length} claims
        </div>
        <div className="flex flex-col gap-4">
          {claimsData.map((claim, index) => {
            let color;
            if (claim.trustScore >= 90) {
              color = 'text-green-500';
            } else if (claim.trustScore >= 70) {
              color = 'text-orange-400';
            } else {
              color = 'text-red-600';
            }

            return (
              <div
                key={index}
                className="flex flex-col bg-neutral-100 p-4 rounded"
              >
                <div className="flex flex-row justify-between">
                  <div className="flex flex-col gap-2">
                    <div>
                      <Tag bordered={false} color="#3c82f6">
                        <span className="text-[14px]">{claim.status}</span>
                      </Tag>
                      <span>
                        <CalendarOutlined />
                        &nbsp; {claim.date}
                      </span>
                    </div>
                    <div>{claim.claimText}</div>
                    <Link href={claim.sourceLinks}>
                      <LinkOutlined /> View Source
                    </Link>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={color}>{claim.trustScore}</span>
                    <span className="text-neutral-500 text-[11px]">
                      Trust Score
                    </span>
                  </div>
                </div>
                <div className="bg-blue-100 p-4 rounded mt-3">
                  <div>
                    <OpenAIOutlined />
                    &nbsp; AI Analysis
                  </div>
                  <div>{claim.aiAnalysis}</div>
                  <Link href={claim.sourceLinks}>
                    <LinkOutlined /> View Research
                  </Link>
                  <JournalList journals={claim.journals} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Content>
  );
}

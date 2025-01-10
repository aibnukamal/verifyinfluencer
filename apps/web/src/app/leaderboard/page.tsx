'use client';

import {
  Breadcrumb,
  Layout,
  theme,
  Tag,
  Button,
  Table,
  Avatar,
  message,
} from 'antd';
import {
  UserOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  SortDescendingOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Index() {
  const { Content } = Layout;
  const [tag, setTag] = useState('All');
  const [sortDescending, setSortDescending] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const totalClaims = leaderboard
    .map((m: any) => m.verifiedClaims)
    .reduce((acc: any, claim: any) => acc + claim, 0);

  const totalTrustScore = leaderboard
    .map((m: any) => Number(m.trustScore))
    .reduce((acc: any, score: any) => acc + score, 0);
  const averageScore = (totalTrustScore / leaderboard.length).toFixed(2);
  const allCategories = leaderboard.map((item: any) => item.categories).flat();
  const categories = ['All', ...new Set(allCategories)];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const filteredData =
    tag === 'All'
      ? leaderboard
      : leaderboard.filter((item: any) => item.categories.includes(tag));

  const sortedData = sortDescending
    ? [...filteredData].sort(
        (a: any, b: any) => parseFloat(b.trustScore) - parseFloat(a.trustScore)
      )
    : filteredData;

  const columns = [
    {
      title: 'RANK',
      dataIndex: 'rank',
      key: 'rank',
      render: (_: any, __: any, index: number) => {
        ++index;
        return `#${index}`;
      },
    },
    {
      title: 'INFLUENCER',
      key: 'influencer',
      render: (_: any, record: any) => (
        <Link
          className="flex items-center flex-row gap-2"
          href={`/influencer/${record.id}`}
        >
          <Avatar src={record.profileImage} size="large" />
          <div>{record.name}</div>
        </Link>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: any) => categories.join(', '),
    },
    {
      title: 'TRUST SCORE',
      dataIndex: 'trustScore',
      key: 'trustScore',
      render: (text: string) => {
        const numericScore = parseFloat(text);

        let color;

        if (numericScore >= 90) {
          color = 'text-green-500';
        } else if (numericScore >= 70) {
          color = 'text-orange-400';
        } else {
          color = 'text-red-600';
        }

        return (
          <span style={{ fontWeight: 'bold' }} className={color}>
            {text}%
          </span>
        );
      },
    },
    {
      title: 'TREND',
      dataIndex: 'trend',
      key: 'trend',
      render: (_: any, record: any) => {
        const numericScore = parseFloat(record.trustScore);

        if (numericScore >= 70) {
          return <RiseOutlined className="text-green-500 text-[20px]" />;
        } else {
          return <FallOutlined className="text-red-500 text-[20px]" />;
        }
      },
    },
    {
      title: 'FOLLOWERS',
      dataIndex: 'followersCount',
      key: 'followersCount',
    },
    {
      title: 'VERIFIED CLAIMS',
      dataIndex: 'verifiedClaims',
      key: 'verifiedClaims',
    },
  ];

  const getLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/influencer`
      );
      if (!response.ok) throw new Error('Failed to fetch leaderboard.');
      const data = await response.json();

      setLeaderboard(data);
    } catch (error: any) {
      message.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLeaderboard();
  }, []);

  return (
    <Content className="px-[48px] h-full">
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>
          <Link href="/">Back to Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Leaderboard</Breadcrumb.Item>
      </Breadcrumb>
      <div
        className="p-[24px] min-h-[380px]"
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="font-bold text-[24px]">
          Influencer Trust Leaderboard
        </div>
        <div>
          Real-time rankings of health influencers based on scientific accuracy,
          credibility, and transparency. Updated daily using AI-powered
          analysis.
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 my-5">
          <div className="flex flex-row rounded-[5px] border items-center p-4 bg-blue-100 border-blue-400 w-full">
            <UserOutlined className="mr-3 text-[30px] text-blue-500" />
            <div className="flex flex-col">
              <div className="font-bold text-[20px]">{leaderboard.length}</div>
              <div>Active Influencers</div>
            </div>
          </div>
          <div className="flex flex-row rounded-[5px] border items-center p-4 bg-blue-100 border-blue-400 w-full">
            <CheckCircleOutlined className="mr-3 text-[30px] text-blue-500" />
            <div className="flex flex-col">
              <div className="font-bold text-[20px]">{totalClaims}</div>
              <div>Claims Verified</div>
            </div>
          </div>
          <div className="flex flex-row rounded-[5px] border items-center p-4 bg-blue-100 border-blue-400 w-full">
            <BarChartOutlined className="mr-3 text-[30px] text-blue-500" />
            <div className="flex flex-col">
              <div className="font-bold text-[20px]">{averageScore}%</div>
              <div>Average Trust Score</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 my-5 items-center">
          <div className="flex flex-wrap gap-2 sm:block">
            {categories.map((name: any) => (
              <Tag
                key={name}
                bordered={false}
                color={tag === name ? '#3c82f6' : '#dbe9fe'}
                className="cursor-pointer"
                onClick={() => setTag(name)}
              >
                <span className="font-bold text-[14px]">{name}</span>
              </Tag>
            ))}
          </div>
          <Button onClick={() => setSortDescending(!sortDescending)}>
            <SortDescendingOutlined />
            {sortDescending ? 'Reset Order' : 'Highest First'}
          </Button>
        </div>
        <div className="w-full overflow-x-auto">
          <Table dataSource={sortedData} columns={columns} loading={loading} />
        </div>
      </div>
    </Content>
  );
}

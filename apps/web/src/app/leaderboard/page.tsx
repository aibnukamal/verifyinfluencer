'use client';

import { Breadcrumb, Layout, theme, Tag, Button, Table, Avatar } from 'antd';
import {
  UserOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  SortDescendingOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import Link from 'next/link';

export default function Index() {
  const { Content } = Layout;
  const [tag, setTag] = useState('All');
  const [sortDescending, setSortDescending] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const categories = [
    'All',
    'Nutrition',
    'Fitness',
    'Medicine',
    'Mental Health',
  ];

  const dataSource = [
    {
      id: 'peterAttia',
      rank: '#1',
      influencer: 'Dr. Peter Attia',
      category: 'Medicine',
      trustScore: 94,
      trend: 'up',
      followers: '1.2M+',
      verifiedClaims: '203',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg', // Sample avatar URL
    },
    {
      id: 'rhondaPatrick',
      rank: '#2',
      influencer: 'Dr. Rhonda Patrick',
      category: 'Nutrition',
      trustScore: 91,
      trend: 'down',
      followers: '980K+',
      verifiedClaims: '156',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg', // Sample avatar URL
    },
    {
      id: 'coachGreg',
      rank: '#3',
      influencer: 'Coach Greg',
      category: 'Fitness',
      trustScore: 88,
      trend: 'up',
      followers: '700K+',
      verifiedClaims: '120',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg', // Sample avatar URL
    },
    {
      id: 'andrewHuberman',
      rank: '#4',
      influencer: 'Dr. Andrew Huberman',
      category: 'Mental Health',
      trustScore: 56,
      trend: 'up',
      followers: '1.5M+',
      verifiedClaims: '220',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg', // Sample avatar URL
    },
  ];

  const filteredData =
    tag === 'All'
      ? dataSource
      : dataSource.filter((item) => item.category === tag);

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
    },
    {
      title: 'INFLUENCER',
      key: 'influencer',
      render: (_: any, record: any) => (
        <Link
          className="flex items-center flex-row gap-2"
          href={`/influencer/${record.id}`}
        >
          <Avatar src={record.avatar} size="large" />
          <div>{record.influencer}</div>
        </Link>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'TRUST SCORE',
      dataIndex: 'trustScore',
      key: 'trustScore',
      render: (text: string) => {
        // Extract numeric value for conditional coloring
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
      render: (_: any, record: any) =>
        record.trend === 'up' ? (
          <RiseOutlined className="text-green-500 text-[20px]" />
        ) : (
          <FallOutlined className="text-red-500 text-[20px]" />
        ),
    },
    {
      title: 'FOLLOWERS',
      dataIndex: 'followers',
      key: 'followers',
    },
    {
      title: 'VERIFIED CLAIMS',
      dataIndex: 'verifiedClaims',
      key: 'verifiedClaims',
    },
  ];

  return (
    <Content className="px-[48px] h-full">
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Back to Dashboard</Breadcrumb.Item>
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
              <div className="font-bold text-[20px]">1,234</div>
              <div>Active Influencers</div>
            </div>
          </div>
          <div className="flex flex-row rounded-[5px] border items-center p-4 bg-blue-100 border-blue-400 w-full">
            <CheckCircleOutlined className="mr-3 text-[30px] text-blue-500" />
            <div className="flex flex-col">
              <div className="font-bold text-[20px]">25,431</div>
              <div>Claims Verified</div>
            </div>
          </div>
          <div className="flex flex-row rounded-[5px] border items-center p-4 bg-blue-100 border-blue-400 w-full">
            <BarChartOutlined className="mr-3 text-[30px] text-blue-500" />
            <div className="flex flex-col">
              <div className="font-bold text-[20px]">85.7%</div>
              <div>Average Trust Score</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2 my-5 items-center">
          <div className="flex flex-wrap gap-2 sm:block">
            {categories.map((name) => (
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
          <Table dataSource={sortedData} columns={columns} />
        </div>
      </div>
    </Content>
  );
}

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
} from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  ProductOutlined,
  CalendarOutlined,
  LinkOutlined,
  OpenAIOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
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

  const tags = ['All', 'Nutrition', 'Fitness', 'Medicine', 'Mental Health'];

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

  const claimsData: Claim[] = [
    {
      status: 'Verified',
      date: '10/10/2024',
      claimText:
        'Viewing sunlight within 30-60 minutes of waking enhances cortisol release',
      trustScore: 92,
      aiAnalysis:
        'Multiple studies confirm morning light exposure affects cortisol rhythms. Timing window supported by research.',
      sourceLinks: '/view-source',
    },
    {
      status: 'Questionable',
      date: '11/12/2024',
      claimText: 'Drinking 8 cups of coffee a day improves memory retention',
      trustScore: 45,
      aiAnalysis:
        'Conflicting evidence exists. While caffeine aids focus, excessive consumption may impair long-term memory.',
      sourceLinks: '/view-research',
    },
  ];

  const statistic = [
    {
      title: 'Trust Score',
      value: '89%',
      description: 'Based on 127 verified claims',
      icon: <RiseOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
    {
      title: 'Yearly Revenue',
      value: '$5.0M',
      description: 'Estimated earnings',
      icon: <DollarOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
    {
      title: 'Products',
      value: '1',
      description: 'Recommended products',
      icon: <ProductOutlined className="mb-auto text-blue-600 text-[20px]" />,
    },
    {
      title: 'Followers',
      value: '4.2M+',
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

  return (
    <Content className="px-[48px] h-full">
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Back to Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Influencer</Breadcrumb.Item>
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
              src={'https://randomuser.me/api/portraits/men/1.jpg'}
              size="large"
              style={{ width: '100px', height: '100px' }}
            />
          </div>
          <div className="flex flex-col gap-2 w-full sm:ml-5">
            <div className="font-bold text-[24px] text-center sm:text-left">
              Andrew Huberman
            </div>
            <div className="flex flex-wrap gap-2 sm:block">
              {tags.map((name) => (
                <Tag key={name} bordered={false} color="#3c82f6">
                  <span className="text-[12px]">{name}</span>
                </Tag>
              ))}
            </div>
            <div>
              Stanford Professor of Neurobiology and Ophthalmology, focusing on
              neural development, brain plasticity, and neural regeneration.
              Host of the Huberman Lab Podcast, translating neuroscience into
              practical tools for everyday life. Known for evidence-based
              approaches to performance, sleep, stress management, and brain
              optimization.
            </div>
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
        <div className="text-blue-600 text-bold mb-5">Claims Analysis</div>
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
        </div>
        {/* make this show by data */}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Content>
  );
}

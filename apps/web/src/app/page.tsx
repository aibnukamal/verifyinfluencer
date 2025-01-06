'use client';

import {
  Breadcrumb,
  Layout,
  theme,
  Form,
  Input,
  Select,
  Button,
  Radio,
  Switch,
} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';
import clsx from 'clsx';

enum ResearchType {
  spesific = 'specific',
  new = 'new',
}

enum TimeRange {
  lastWeek = 'lastWeek',
  lastMonth = 'lastMonth',
  lastYear = 'lastYear',
  allTime = 'allTime',
}

type ResearchPayload = {
  timeRange?: string;
  influencerName?: string;
  claims?: number;
  product?: number;
  revenue?: boolean;
  journal?: boolean;
  journals?: string[];
  notes?: string;
};

export default function Index() {
  const { Content } = Layout;
  const [researchType, setResearchType] = useState(ResearchType.spesific);
  const [timeRange, setTimeRange] = useState(TimeRange.lastWeek);
  const [toggleJournal, setToggleJournal] = useState(true);

  const journal = [
    {
      value: 'PubMed Central',
      label: 'PubMed Central',
    },
    {
      value: 'Science',
      label: 'Science',
    },
    {
      value: 'The Lancet',
      label: 'The Lancet',
    },
    {
      value: 'JAMA Network',
      label: 'JAMA Network',
    },
    {
      value: 'Nature',
      label: 'Nature',
    },
    {
      value: 'Cell',
      label: 'Cell',
    },
    {
      value: 'New England Journal of Medicine',
      label: 'New England Journal of Medicine',
    },
  ];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content className="px-[48px] h-full">
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Back to Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Research Task</Breadcrumb.Item>
      </Breadcrumb>
      <div
        className="p-[24px] min-h-[380px]"
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div className="mb-3 font-bold">
          <SettingOutlined className="mr-1" />
          Research Configuration
        </div>
        <div className="flex flex-col sm:flex-row w-full gap-[10px]">
          <div
            className={clsx(
              'rounded-[5px] border flex flex-col items-center w-full text-center p-4 cursor-pointer',
              researchType === ResearchType.spesific
                ? 'bg-blue-100 border-blue-400'
                : 'bg-neutral-100 border-neutral-400'
            )}
            onClick={() => setResearchType(ResearchType.spesific)}
          >
            <span className="font-bold">Specific Influencer</span>
            <span>Research a known health influencer by name</span>
          </div>
          <div
            className={clsx(
              'rounded-[5px] border flex flex-col items-center w-full text-center p-4 cursor-pointer',
              researchType === ResearchType.new
                ? 'bg-blue-100 border-blue-400'
                : 'bg-neutral-100 border-neutral-400'
            )}
            onClick={() => setResearchType(ResearchType.new)}
          >
            <span className="font-bold">Discover New</span>
            <span>Find and analyze new health influencers</span>
          </div>
        </div>
        <Form
          name="basic"
          layout="vertical"
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={() => {
            //
          }}
          onFinishFailed={() => {
            //
          }}
          autoComplete="off"
        >
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Time Range"
              name="timeRange"
              rules={[{ required: true, message: 'Please select Time Range!' }]}
            >
              <Radio.Group
                options={[
                  { label: 'Last Week', value: TimeRange.lastWeek },
                  { label: 'Last Month', value: TimeRange.lastMonth },
                  { label: 'Last Year', value: TimeRange.lastYear },
                  { label: 'All Time', value: TimeRange.allTime },
                ]}
                onChange={(e) => {
                  setTimeRange(e.target.value as any);
                }}
                defaultValue={TimeRange.lastWeek}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          </div>
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Influencer Name"
              name="influencerName"
              rules={[
                { required: true, message: 'Please input Influencer Name!' },
              ]}
            >
              <Input placeholder="Enter Influencer Name" />
            </Form.Item>
          </div>
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Claims to Analyze per Influencer"
              name="claims"
              rules={[{ required: true, message: 'Please input Claims!' }]}
              style={{ margin: 0 }}
            >
              <Input type="number" placeholder="50" />
            </Form.Item>
            <span className="text-neutral-400 text-[11px]">
              Recommended: 50-100 claims to comperhensive analysis
            </span>
          </div>
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Products to Find per Influencer"
              name="product"
              style={{ margin: 0 }}
            >
              <Input type="number" placeholder="0" />
            </Form.Item>
            <span className="text-neutral-400 text-[11px]">
              Set to 0 to skip product reserach
            </span>
          </div>
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Include Revenue Analysis"
              name="revenue"
              style={{ margin: 0 }}
            >
              <Switch defaultChecked />
            </Form.Item>
            <span className="text-neutral-400 text-[11px]">
              Analyze monetization methods and estimate earnings
            </span>
          </div>
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Verify with scientific Journals"
              name="journal"
              style={{ margin: 0 }}
            >
              <Switch
                defaultChecked
                onChange={(value) => setToggleJournal(value)}
              />
            </Form.Item>
            <span className="text-neutral-400 text-[11px]">
              Cross-reference claims with scientific literature
            </span>
          </div>
          {toggleJournal && (
            <div className="my-5">
              <Form.Item<ResearchPayload>
                label="Scientific Journals"
                name="journals"
                style={{ margin: 0 }}
              >
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Select journal"
                  onChange={() => {
                    //
                  }}
                  options={journal}
                />
              </Form.Item>
            </div>
          )}
          <div className="my-5">
            <Form.Item<ResearchPayload>
              label="Notes for Research Assistant"
              name="notes"
              style={{ margin: 0 }}
            >
              <Input.TextArea
                showCount
                maxLength={200}
                placeholder="Add any specific instructions or focus areas..."
                style={{ height: 120 }}
              />
            </Form.Item>
          </div>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              + Start Research
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Content>
  );
}

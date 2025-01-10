'use client';

import { Layout, Menu } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const { Header } = Layout;
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    {
      key: 'leaderboard',
      label: 'Leaderboard',
      route: '/leaderboard',
    },
    {
      key: 'products',
      label: 'Products',
      route: '/products',
    },
    {
      key: 'monetization',
      label: 'Monetization',
      route: '/monetization',
    },
    {
      key: 'about',
      label: 'About',
      route: '/about',
    },
    {
      key: 'contact',
      label: 'Contact',
      route: '/contact',
    },
    {
      key: 'admin',
      label: 'Admin',
      route: '/admin',
    },
    {
      key: 'signout',
      label: 'Sign Out',
      route: '/signout',
    },
  ];

  const handleMenuClick = (e: any) => {
    const selectedMenu = menu.find((item) => item.key === e.key);
    if (selectedMenu?.route) {
      router.push(selectedMenu.route);
    }
  };

  return (
    <Header
      className="flex w-full top-0 z-10 items-center sm:justify-between"
      style={{
        position: 'sticky',
      }}
    >
      <div
        className="flex flex-row bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 inline-block text-transparent bg-clip-text cursor-pointer"
        onClick={() => {
          router.push('/');
        }}
      >
        <SafetyOutlined className="text-[25px] mr-1 text-blue-400" />
        VerifyInfluencer
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[pathname]}
        onClick={handleMenuClick}
        items={menu.map(({ key, label }) => ({
          key,
          label,
        }))}
        className="w-[50px] sm:w-[unset]"
      />
    </Header>
  );
}

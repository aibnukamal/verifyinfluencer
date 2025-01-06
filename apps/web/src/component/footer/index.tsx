'use client';

import { Layout } from 'antd';

export default function Footer() {
  const { Footer } = Layout;

  return (
    <Footer style={{ textAlign: 'center' }}>
      VerifyInfluencer ©{new Date().getFullYear()}
    </Footer>
  );
}

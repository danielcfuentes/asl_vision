import React from 'react';
import { Layout, Typography } from 'antd';
import { motion } from 'framer-motion';
import ASLGame from './components/ASLGame';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-screen h-screen min-h-screen min-w-screen bg-background overflow-hidden"
    >
      <Layout className="min-h-screen min-w-screen bg-background">
        <Header className="bg-background border-b border-border px-10 flex items-center justify-between w-full shadow-card" style={{height: 70}}>
          <Title level={2} className="text-text-primary m-0 font-display tracking-wide" style={{fontWeight: 700, letterSpacing: 2}}>
            ASL Learning
          </Title>
        </Header>

        <Content className="p-8 w-full h-[calc(100vh-70px)]">
          <ASLGame />
        </Content>
      </Layout>
    </motion.div>
  );
}

export default App;
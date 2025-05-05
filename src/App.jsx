import { useState } from 'react';
import Webcam from 'react-webcam';
import { Layout, Typography, Button, Card, Progress, Space } from 'antd';
import { CameraOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ASLGame from './components/ASLGame';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showGame, setShowGame] = useState(false);

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
            LSLR
          </Title>
          <Space>
            <Button 
              type="default" 
              icon={<CameraOutlined />} 
              onClick={() => {
                setIsCameraActive(!isCameraActive);
                setShowGame(false);
              }} 
              className="border-border text-text-primary"
            >
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </Button>
            {isCameraActive && (
              <Button 
                type="primary" 
                onClick={() => setShowGame(!showGame)} 
                className="border-border"
              >
                {showGame ? 'Hide Game' : 'Play ASL Game'}
              </Button>
            )}
          </Space>
        </Header>

        <Content className="p-8 w-full h-[calc(100vh-70px)]">
          {showGame ? (
            <ASLGame />
          ) : (
            <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original content */}
              {/* Left Column - Video Feed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-full flex flex-col"
              >
                <Card className="bg-background-surface border border-border rounded-xl overflow-hidden flex-1 flex flex-col shadow-card">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden flex-1 flex items-center justify-center">
                    {isCameraActive ? (
                      <Webcam
                        audio={false}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <CameraOutlined className="text-4xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Progress percent={0} showInfo={false} strokeColor="#111111" />
                    <Text className="text-text-secondary mt-2 block">
                      Ready to detect ASL signs
                    </Text>
                  </div>
                </Card>
              </motion.div>

              {/* Right Column - Learning Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full flex flex-col"
              >
                <Card className="bg-background-surface border border-border rounded-xl flex-1 flex flex-col shadow-card">
                  <Title level={4} className="text-text-primary mb-6 font-display" style={{fontWeight: 600}}>
                    Learning Progress
                  </Title>
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrophyOutlined className="text-text-primary text-xl" />
                        <Text className="text-text-secondary">Current Streak: 0 days</Text>
                      </div>
                      <Button 
                        type="default" 
                        className="border-border text-text-primary font-semibold"
                        onClick={() => {
                          setIsCameraActive(true);
                          setShowGame(true);
                        }}
                      >
                        Start Lesson
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-background border border-border">
                        <div className="flex items-center space-x-2">
                          <BookOutlined className="text-text-primary text-xl" />
                          <div>
                            <Text className="text-text-primary block">Letters</Text>
                            <Text className="text-text-secondary text-sm">0/26 learned</Text>
                          </div>
                        </div>
                      </Card>
                      <Card className="bg-background border border-border">
                        <div className="flex items-center space-x-2">
                          <BookOutlined className="text-text-primary text-xl" />
                          <div>
                            <Text className="text-text-primary block">Numbers</Text>
                            <Text className="text-text-secondary text-sm">0/10 learned</Text>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </Content>
      </Layout>
    </motion.div>
  );
}

export default App;
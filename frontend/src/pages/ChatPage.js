import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import UserProfile from '../components/chat/UserProfile';
import { useSocket } from '../contexts/SocketContext';

const Container = styled.div`
  height: 100vh;
  display: flex;
  background: white;
  overflow: hidden;
`;

const ChatPage = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const { isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) {
      console.log('Waiting for socket connection...');
    }
  }, [isConnected]);

  return (
    <Container>
      <Sidebar 
        activeRoom={activeRoom}
        onRoomSelect={setActiveRoom}
        onShowProfile={() => setShowProfile(true)}
      />
      
      <ChatArea 
        activeRoom={activeRoom}
        onShowProfile={() => setShowProfile(true)}
      />
      
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </Container>
  );
};

export default ChatPage;

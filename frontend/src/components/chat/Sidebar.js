import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import CreateRoomModal from './CreateRoomModal';

const Container = styled.div`
  width: 300px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 0.9rem;
`;

const Status = styled.div`
  font-size: 0.75rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
`;

const SearchContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RoomsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

const RoomItem = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#374151'};
  margin-bottom: 0.25rem;
  
  &:hover {
    background: ${props => props.active ? '#667eea' : '#e2e8f0'};
  }
`;

const RoomName = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const RoomInfo = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MemberCount = styled.span``;

const LastActivity = styled.span``;

const CreateRoomButton = styled.button`
  margin: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const Sidebar = ({ activeRoom, onRoomSelect, onShowProfile }) => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (message) => {
        // Update room's last activity when new message received
        setRooms(prev => prev.map(room => 
          room._id === message.room 
            ? { ...room, lastActivity: message.createdAt }
            : room
        ));
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/chat/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
    setShowCreateModal(false);
    toast.success('Room created successfully!');
  };

  const handleLogout = () => {
    logout();
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastActivity = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = (now - activityDate) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Container>
      <Header>
        <UserInfo onClick={onShowProfile}>
          <Avatar>
            {user?.avatar || user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <UserDetails>
            <Username>{user?.username}</Username>
            <Status>Online</Status>
          </UserDetails>
        </UserInfo>
        <Actions>
          <ActionButton onClick={onShowProfile} title="Settings">
            <FiSettings size={18} />
          </ActionButton>
          <ActionButton onClick={handleLogout} title="Logout">
            <FiLogOut size={18} />
          </ActionButton>
        </Actions>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <RoomsList>
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
            Loading rooms...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
            {searchTerm ? 'No rooms found' : 'No rooms available'}
          </div>
        ) : (
          filteredRooms.map(room => (
            <RoomItem
              key={room._id}
              active={activeRoom?._id === room._id}
              onClick={() => onRoomSelect(room)}
            >
              <RoomName>{room.name}</RoomName>
              <RoomInfo>
                <MemberCount>{room.members.length} members</MemberCount>
                <LastActivity>{formatLastActivity(room.lastActivity)}</LastActivity>
              </RoomInfo>
            </RoomItem>
          ))
        )}
      </RoomsList>

      <CreateRoomButton onClick={() => setShowCreateModal(true)}>
        <FiPlus size={18} />
        Create Room
      </CreateRoomButton>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </Container>
  );
};

export default Sidebar;

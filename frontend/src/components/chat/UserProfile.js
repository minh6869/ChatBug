import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiUser, FiMail, FiEdit3, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1.5rem 1rem;
  color: white;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 2rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const EditAvatarButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #f8fafc;
  }
`;

const Username = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const Email = styled.p`
  opacity: 0.9;
  margin: 0;
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: #374151;
  font-weight: 500;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
    }
  `}
`;

const UserProfile = ({ onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      avatar: user?.avatar || ''
    });
    setEditing(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
          
          <ProfileSection>
            <AvatarContainer>
              <Avatar>
                {user?.avatar || user?.username?.[0]?.toUpperCase()}
              </Avatar>
              <EditAvatarButton>
                <FiCamera size={14} />
              </EditAvatarButton>
            </AvatarContainer>
            <Username>{user?.username}</Username>
            <Email>{user?.email}</Email>
          </ProfileSection>
        </Header>

        <Content>
          {!editing ? (
            <>
              <InfoItem>
                <InfoIcon>
                  <FiUser size={18} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Username</InfoLabel>
                  <InfoValue>{user?.username}</InfoValue>
                </InfoContent>
                <EditButton onClick={() => setEditing(true)}>
                  <FiEdit3 size={16} />
                </EditButton>
              </InfoItem>

              <InfoItem>
                <InfoIcon>
                  <FiMail size={18} />
                </InfoIcon>
                <InfoContent>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{user?.email}</InfoValue>
                </InfoContent>
              </InfoItem>

              <Actions style={{ marginTop: '1.5rem' }}>
                <Button onClick={logout}>
                  Logout
                </Button>
              </Actions>
            </>
          ) : (
            <EditForm onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Username</Label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                />
              </FormGroup>

              <FormGroup>
                <Label>Avatar URL (Optional)</Label>
                <Input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="Enter avatar URL"
                />
              </FormGroup>

              <Actions>
                <Button type="button" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Actions>
            </EditForm>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

export default UserProfile;

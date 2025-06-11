import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 60%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -6px, 0) scaleY(1.1);
  }
  80% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0) scaleY(.95);
  }
`;

const Container = styled.div`
  padding: 0.5rem 1rem;
  margin: 0 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #667eea;
`;

const Dots = styled.div`
  display: flex;
  gap: 2px;
`;

const Dot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #667eea;
  animation: ${bounce} 1.4s infinite ease-in-out both;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
`;

const TypingText = styled.span`
  font-style: italic;
`;

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const getUsersText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users.length} people are typing`;
    }
  };

  return (
    <Container>
      <Dots>
        <Dot />
        <Dot />
        <Dot />
      </Dots>
      <TypingText>{getUsersText()}...</TypingText>
    </Container>
  );
};

export default TypingIndicator;

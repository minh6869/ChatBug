import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ClipLoader } from 'react-spinners';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const Text = styled.p`
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
`;

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Container>
      <ClipLoader color="white" size={40} />
      <Text>{message}</Text>
    </Container>
  );
};

export default LoadingSpinner;

import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.hasIcon ? '2.5rem' : '1rem'};
  border: 2px solid ${props => props.error ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const Input = ({ icon, error, ...props }) => {
  return (
    <Container>
      {icon && <IconContainer>{icon}</IconContainer>}
      <StyledInput hasIcon={!!icon} error={error} {...props} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

export default Input;

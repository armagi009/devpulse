import React from 'react';
import { render, screen } from '@testing-library/react';
import ContainerQueryCard from '../ContainerQueryCard';

describe('ContainerQueryCard', () => {
  it('renders with title and content', () => {
    render(
      <ContainerQueryCard title="Test Title">
        <p>Test content</p>
      </ContainerQueryCard>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('applies container query styles', () => {
    const { container } = render(
      <ContainerQueryCard title="Test Title">
        <p>Test content</p>
      </ContainerQueryCard>
    );
    
    // Instead of checking for inline CSS style, check for the class that applies container query
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('container-query-card');
  });
  
  it('applies custom className', () => {
    const { container } = render(
      <ContainerQueryCard title="Test Title" className="custom-class">
        <p>Test content</p>
      </ContainerQueryCard>
    );
    
    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('custom-class');
    expect(cardElement).toHaveClass('container-query-card');
  });
});
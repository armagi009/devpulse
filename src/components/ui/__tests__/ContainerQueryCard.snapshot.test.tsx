import React from 'react';
import { render } from '@testing-library/react';
import ContainerQueryCard from '../ContainerQueryCard';

// Mock the responsive-layout and responsive-typography utilities
jest.mock('@/lib/styles/responsive-layout', () => ({
  containerBreakpoints: {
    small: '20rem',
    medium: '40rem',
    large: '60rem',
  },
  fluidSpacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
}));

jest.mock('@/lib/styles/responsive-typography', () => ({
  containerQueryTypography: {
    small: {
      heading: '1.25rem',
      body: '0.875rem',
    },
    medium: {
      heading: '1.5rem',
      body: '1rem',
    },
    large: {
      heading: '1.75rem',
      body: '1.125rem',
    },
  },
}));

describe('ContainerQueryCard Snapshots', () => {
  it('renders default variant correctly', () => {
    const { container } = render(
      <ContainerQueryCard title="Default Card">
        <p>This is the card content</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders compact variant correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Compact Card" 
        variant="compact"
      >
        <p>This is the compact card content</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders expanded variant correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Expanded Card" 
        variant="expanded"
      >
        <p>This is the expanded card content</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders with image correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Card with Image" 
        image="/test-image.jpg"
      >
        <p>This is a card with an image</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders with header actions correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Card with Header Actions" 
        headerActions={<button>Action</button>}
      >
        <p>This is a card with header actions</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders with footer actions correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Card with Footer Actions" 
        footerActions={<button>Submit</button>}
      >
        <p>This is a card with footer actions</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders with custom className correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Card with Custom Class" 
        className="custom-class"
      >
        <p>This is a card with a custom class</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('renders with custom containerName correctly', () => {
    const { container } = render(
      <ContainerQueryCard 
        title="Card with Container Name" 
        containerName="custom-container"
      >
        <p>This is a card with a custom container name</p>
      </ContainerQueryCard>
    );
    
    expect(container).toMatchSnapshot();
  });
});
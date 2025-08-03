import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveGrid, { ResponsiveGridItem } from '../ResponsiveGrid';

describe('ResponsiveGrid', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveGrid>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </ResponsiveGrid>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
  
  it('applies correct grid classes for number columns', () => {
    const { container } = render(
      <ResponsiveGrid columns={3}>
        <div>Child 1</div>
        <div>Child 2</div>
      </ResponsiveGrid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('sm:grid-cols-2');
    expect(gridElement).toHaveClass('md:grid-cols-3');
    expect(gridElement).toHaveClass('lg:grid-cols-3');
  });
  
  it('applies correct grid classes for column config', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
        <div>Child 1</div>
        <div>Child 2</div>
      </ResponsiveGrid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('sm:grid-cols-2');
    expect(gridElement).toHaveClass('md:grid-cols-3');
    expect(gridElement).toHaveClass('lg:grid-cols-4');
    expect(gridElement).toHaveClass('xl:grid-cols-5');
  });
  
  it('applies custom gap classes', () => {
    const { container } = render(
      <ResponsiveGrid gap={6}>
        <div>Child 1</div>
        <div>Child 2</div>
      </ResponsiveGrid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('gap-6');
  });
  
  it('applies custom className to container', () => {
    const { container } = render(
      <ResponsiveGrid className="test-class">
        <div>Child 1</div>
        <div>Child 2</div>
      </ResponsiveGrid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('test-class');
  });
  
  it('applies custom className to items', () => {
    render(
      <ResponsiveGrid itemClassName="item-class">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </ResponsiveGrid>
    );
    
    const item1Parent = screen.getByTestId('child-1').parentElement;
    const item2Parent = screen.getByTestId('child-2').parentElement;
    
    expect(item1Parent).toHaveClass('item-class');
    expect(item2Parent).toHaveClass('item-class');
  });
});

describe('ResponsiveGridItem', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveGridItem>
        <div data-testid="grid-item-child">Grid Item Child</div>
      </ResponsiveGridItem>
    );
    
    expect(screen.getByTestId('grid-item-child')).toBeInTheDocument();
  });
  
  it('applies correct column span classes for number', () => {
    const { container } = render(
      <ResponsiveGridItem colSpan={3}>
        <div>Content</div>
      </ResponsiveGridItem>
    );
    
    expect(container.firstChild).toHaveClass('col-span-3');
  });
  
  it('applies correct column span classes for config object', () => {
    const { container } = render(
      <ResponsiveGridItem colSpan={{ xs: 1, md: 2, lg: 3 }}>
        <div>Content</div>
      </ResponsiveGridItem>
    );
    
    expect(container.firstChild).toHaveClass('col-span-1');
    expect(container.firstChild).toHaveClass('md:col-span-2');
    expect(container.firstChild).toHaveClass('lg:col-span-3');
  });
  
  it('applies correct row span classes', () => {
    const { container } = render(
      <ResponsiveGridItem rowSpan={2}>
        <div>Content</div>
      </ResponsiveGridItem>
    );
    
    expect(container.firstChild).toHaveClass('row-span-2');
  });
  
  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveGridItem className="custom-class">
        <div>Content</div>
      </ResponsiveGridItem>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
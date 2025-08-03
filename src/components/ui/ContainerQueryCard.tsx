'use client';

import React from 'react';
import { containerBreakpoints, fluidSpacing } from '@/lib/styles/responsive-layout';
import { containerQueryTypography } from '@/lib/styles/responsive-typography';

interface ContainerQueryCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  containerName?: string;
  variant?: 'default' | 'compact' | 'expanded';
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  image?: string;
}

/**
 * ContainerQueryCard Component
 * 
 * A card component that adapts its layout based on its container width
 * rather than the viewport width, using container queries.
 * 
 * This component demonstrates the power of container queries for component-level
 * responsive design, allowing components to adapt based on their parent container
 * size rather than the viewport size.
 */
const ContainerQueryCard: React.FC<ContainerQueryCardProps> = ({
  title,
  children,
  className = '',
  containerName,
  variant = 'default',
  headerActions,
  footerActions,
  image,
}) => {
  return (
    <div 
      className={`container-query-card ${className} ${variant}`}
      style={{
        containerType: 'inline-size',
        containerName: containerName || '',
        width: '100%',
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        backgroundColor: 'white',
      }}
    >
      <style jsx>{`
        .card-content {
          display: flex;
          flex-direction: column;
        }
        
        .card-header {
          display: flex;
          flex-direction: column;
          margin-bottom: ${fluidSpacing.sm};
        }
        
        .card-title {
          font-size: ${containerQueryTypography.small.heading};
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .card-body {
          font-size: ${containerQueryTypography.small.body};
        }
        
        .card-footer {
          margin-top: ${fluidSpacing.sm};
          display: flex;
          flex-direction: column;
        }
        
        .card-image {
          width: 100%;
          margin-bottom: ${fluidSpacing.sm};
          border-radius: 0.25rem;
          overflow: hidden;
        }
        
        .card-image img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        /* Container query for medium-sized containers */
        @container (min-width: ${containerBreakpoints.medium}) {
          .card-content {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .card-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .card-title {
            font-size: ${containerQueryTypography.medium.heading};
            margin-bottom: 0;
            flex: 1;
          }
          
          .card-body {
            font-size: ${containerQueryTypography.medium.body};
          }
          
          .card-image {
            width: 30%;
            margin-right: ${fluidSpacing.md};
            margin-bottom: 0;
          }
          
          .card-footer {
            flex-direction: row;
            justify-content: flex-end;
          }
          
          /* Variant styles */
          .compact .card-content {
            flex-direction: column;
          }
          
          .expanded .card-content {
            flex-direction: column;
          }
          
          .expanded .card-image {
            width: 100%;
            margin-right: 0;
          }
        }
        
        /* Container query for large containers */
        @container (min-width: ${containerBreakpoints.large}) {
          .container-query-card {
            padding: 1.5rem;
          }
          
          .card-title {
            font-size: ${containerQueryTypography.large.heading};
          }
          
          .card-body {
            font-size: ${containerQueryTypography.large.body};
          }
          
          .card-image {
            width: 20%;
          }
          
          /* Variant styles */
          .expanded .card-content {
            flex-direction: row;
          }
          
          .expanded .card-image {
            width: 30%;
            margin-right: ${fluidSpacing.md};
          }
        }
      `}</style>
      
      <div className="card-content">
        {image && (
          <div className="card-image">
            <img src={image} alt={title} />
          </div>
        )}
        
        <div className="card-main">
          <div className="card-header">
            <h3 className="card-title">{title}</h3>
            {headerActions && <div className="card-actions">{headerActions}</div>}
          </div>
          
          <div className="card-body">
            {children}
          </div>
          
          {footerActions && (
            <div className="card-footer">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContainerQueryCard;
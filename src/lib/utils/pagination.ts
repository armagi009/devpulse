/**
 * Pagination Utility
 * Provides tools for implementing pagination in API responses
 */

import { NextRequest } from 'next/server';

// Pagination parameters interface
export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}

// Default pagination values
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Extract pagination parameters from request
 */
export function getPaginationParams(req: NextRequest): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const searchParams = new URL(req.url).searchParams;
  
  // Get page and pageSize from query parameters
  const pageParam = searchParams.get('page');
  const pageSizeParam = searchParams.get('pageSize');
  
  // Parse and validate page
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : DEFAULT_PAGE;
  
  // Parse and validate pageSize
  const pageSize = pageSizeParam
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSizeParam, 10)))
    : DEFAULT_PAGE_SIZE;
  
  // Calculate skip and take for database queries
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  
  return { page, pageSize, skip, take };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

/**
 * Add pagination links to response headers
 */
export function addPaginationHeaders(
  headers: Headers,
  baseUrl: string,
  pagination: PaginationParams
): void {
  const { page, pageSize, totalPages } = pagination;
  const url = new URL(baseUrl);
  
  // Create URL for each page
  const createPageUrl = (pageNum: number) => {
    const pageUrl = new URL(url.toString());
    pageUrl.searchParams.set('page', pageNum.toString());
    pageUrl.searchParams.set('pageSize', pageSize.toString());
    return pageUrl.toString();
  };
  
  // Add Link header with pagination links
  const links = [];
  
  // First page
  links.push(`<${createPageUrl(1)}>; rel="first"`);
  
  // Previous page
  if (page > 1) {
    links.push(`<${createPageUrl(page - 1)}>; rel="prev"`);
  }
  
  // Next page
  if (page < totalPages) {
    links.push(`<${createPageUrl(page + 1)}>; rel="next"`);
  }
  
  // Last page
  links.push(`<${createPageUrl(totalPages)}>; rel="last"`);
  
  // Set Link header
  headers.set('Link', links.join(', '));
  
  // Set X-Total-Count header
  headers.set('X-Total-Count', pagination.totalItems.toString());
}
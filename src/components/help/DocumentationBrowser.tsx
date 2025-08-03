import React, { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Types for documentation
export type DocCategory = {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

export type DocArticle = {
  id: string;
  title: string;
  content: React.ReactNode;
  categoryId: string;
  tags?: string[];
  relatedArticles?: string[];
  lastUpdated?: string;
};

type DocContextType = {
  categories: DocCategory[];
  articles: DocArticle[];
  currentArticle: DocArticle | null;
  currentCategory: DocCategory | null;
  searchResults: DocArticle[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewArticle: (articleId: string) => void;
  viewCategory: (categoryId: string) => void;
  isLoading: boolean;
};

const DocContext = createContext<DocContextType | undefined>(undefined);

export const useDocs = () => {
  const context = useContext(DocContext);
  if (!context) {
    throw new Error('useDocs must be used within a DocProvider');
  }
  return context;
};

type DocProviderProps = {
  children: React.ReactNode;
  initialCategories: DocCategory[];
  initialArticles: DocArticle[];
};

export const DocProvider: React.FC<DocProviderProps> = ({
  children,
  initialCategories,
  initialArticles,
}) => {
  const [categories, setCategories] = useState<DocCategory[]>(initialCategories);
  const [articles, setArticles] = useState<DocArticle[]>(initialArticles);
  const [currentArticle, setCurrentArticle] = useState<DocArticle | null>(null);
  const [currentCategory, setCurrentCategory] = useState<DocCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DocArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    
    // Simple search implementation - can be enhanced with more sophisticated search
    const results = articles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(query);
      const contentMatch = typeof article.content === 'string' && 
        article.content.toLowerCase().includes(query);
      const tagMatch = article.tags?.some(tag => 
        tag.toLowerCase().includes(query)
      );
      
      return titleMatch || contentMatch || tagMatch;
    });
    
    setSearchResults(results);
  }, [searchQuery, articles]);
  
  const viewArticle = (articleId: string) => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const article = articles.find(a => a.id === articleId);
      if (article) {
        setCurrentArticle(article);
        const category = categories.find(c => c.id === article.categoryId);
        setCurrentCategory(category || null);
      }
      setIsLoading(false);
    }, 300);
  };
  
  const viewCategory = (categoryId: string) => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const category = categories.find(c => c.id === categoryId);
      setCurrentCategory(category || null);
      setCurrentArticle(null);
      setIsLoading(false);
    }, 300);
  };
  
  return (
    <DocContext.Provider
      value={{
        categories,
        articles,
        currentArticle,
        currentCategory,
        searchResults,
        searchQuery,
        setSearchQuery,
        viewArticle,
        viewCategory,
        isLoading,
      }}
    >
      {children}
    </DocContext.Provider>
  );
};

// Documentation Browser Component
export const DocumentationBrowser: React.FC<{
  className?: string;
  showSidebar?: boolean;
}> = ({
  className = '',
  showSidebar = true,
}) => {
  const { 
    categories, 
    articles, 
    currentArticle, 
    currentCategory,
    searchResults,
    searchQuery,
    setSearchQuery,
    viewArticle,
    viewCategory,
    isLoading
  } = useDocs();
  
  // Filter articles by current category
  const categoryArticles = currentCategory
    ? articles.filter(article => article.categoryId === currentCategory.id)
    : [];
  
  return (
    <div className={`flex ${className}`}>
      {showSidebar && (
        <div className="w-64 border-r overflow-auto h-full">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            {searchQuery ? (
              <div>
                <h3 className="font-medium mb-2">Search Results</h3>
                {searchResults.length === 0 ? (
                  <p className="text-sm text-gray-500">No results found</p>
                ) : (
                  <ul className="space-y-1">
                    {searchResults.map(article => (
                      <li key={article.id}>
                        <button
                          onClick={() => viewArticle(article.id)}
                          className="text-left text-sm text-blue-600 hover:underline"
                        >
                          {article.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                <ul className="space-y-1">
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => viewCategory(category.id)}
                        className={`text-left w-full px-2 py-1 rounded ${
                          currentCategory?.id === category.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentArticle ? (
          <div className="p-6">
            <div className="mb-4">
              <button
                onClick={() => viewCategory(currentArticle.categoryId)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to {currentCategory?.title || 'Category'}
              </button>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{currentArticle.title}</h1>
            
            {currentArticle.lastUpdated && (
              <p className="text-sm text-gray-500 mb-4">
                Last updated: {currentArticle.lastUpdated}
              </p>
            )}
            
            <div className="prose max-w-none">
              {currentArticle.content}
            </div>
            
            {currentArticle.tags && currentArticle.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  {currentArticle.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {currentArticle.relatedArticles && currentArticle.relatedArticles.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Related Articles</h3>
                <ul className="space-y-1">
                  {currentArticle.relatedArticles.map(relatedId => {
                    const related = articles.find(a => a.id === relatedId);
                    if (!related) return null;
                    
                    return (
                      <li key={relatedId}>
                        <button
                          onClick={() => viewArticle(relatedId)}
                          className="text-blue-600 hover:underline"
                        >
                          {related.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : currentCategory ? (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{currentCategory.title}</h1>
            
            {currentCategory.description && (
              <p className="text-gray-600 mb-6">{currentCategory.description}</p>
            )}
            
            {categoryArticles.length === 0 ? (
              <p className="text-gray-500">No articles in this category</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryArticles.map(article => (
                  <div
                    key={article.id}
                    className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewArticle(article.id)}
                  >
                    <h3 className="font-medium mb-1">{article.title}</h3>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Documentation</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewCategory(category.id)}
                >
                  {category.icon && (
                    <div className="mb-2 text-blue-600">{category.icon}</div>
                  )}
                  <h3 className="font-medium mb-1">{category.title}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {articles.filter(a => a.categoryId === category.id).length} articles
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Contextual Documentation Link Component
export const DocLink: React.FC<{
  articleId: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'link' | 'button' | 'icon';
}> = ({
  articleId,
  children,
  className = '',
  variant = 'link'
}) => {
  const { viewArticle, articles } = useDocs();
  const router = useRouter();
  
  const handleClick = () => {
    // Check if the article exists
    const article = articles.find(a => a.id === articleId);
    if (article) {
      viewArticle(articleId);
      router.push('/documentation');
    } else {
      console.warn(`Article with id "${articleId}" not found`);
    }
  };
  
  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`}
      >
        {children}
      </button>
    );
  }
  
  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`text-blue-600 hover:text-blue-800 ${className}`}
        aria-label="View documentation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }
  
  return (
    <button
      onClick={handleClick}
      className={`text-blue-600 hover:underline ${className}`}
    >
      {children}
    </button>
  );
};
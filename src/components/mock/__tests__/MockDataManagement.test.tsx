/**
 * Mock Data Management Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MockDataSetsList from '../MockDataSetsList';
import MockDataPreview from '../MockDataPreview';
import MockDataActions from '../MockDataActions';
import MockDataGenerationOptions from '../MockDataGenerationOptions';
import MockDataImportExport from '../MockDataImportExport';
import { listMockDataSets, getMockData, resetMockData, exportMockData, importMockData } from '@/lib/mock/mock-data-store';

// Mock the next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock the mock-data-store functions
jest.mock('@/lib/mock/mock-data-store', () => ({
  listMockDataSets: jest.fn(),
  getMockData: jest.fn(),
  resetMockData: jest.fn(),
  exportMockData: jest.fn(),
  importMockData: jest.fn(),
}));

describe('MockDataSetsList', () => {
  const onSelectDataSet = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (listMockDataSets as jest.Mock).mockResolvedValue(['default', 'test']);
  });

  it('renders the list of data sets', async () => {
    render(<MockDataSetsList onSelectDataSet={onSelectDataSet} selectedDataSet="default" />);
    
    await waitFor(() => {
      expect(screen.getByText('default')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  it('calls onSelectDataSet when a data set is clicked', async () => {
    render(<MockDataSetsList onSelectDataSet={onSelectDataSet} selectedDataSet="default" />);
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('test'));
    expect(onSelectDataSet).toHaveBeenCalledWith('test');
  });

  it('shows loading state while fetching data sets', () => {
    render(<MockDataSetsList onSelectDataSet={onSelectDataSet} selectedDataSet="default" />);
    
    expect(screen.getByText('Loading data sets...')).toBeInTheDocument();
  });

  it('shows error message when fetching data sets fails', async () => {
    (listMockDataSets as jest.Mock).mockRejectedValue(new Error('Failed to load data sets'));
    
    render(<MockDataSetsList onSelectDataSet={onSelectDataSet} selectedDataSet="default" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load mock data sets')).toBeInTheDocument();
    });
  });
});

describe('MockDataPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getMockData as jest.Mock).mockResolvedValue({
      repositories: [{ id: 1, name: 'repo1', full_name: 'user/repo1', owner: { login: 'user' } }],
      commits: { 'user/repo1': [{ sha: '123abc', commit: { message: 'Test commit', author: { date: new Date().toISOString() } } }] },
      pullRequests: { 'user/repo1': [{ id: 1, number: 1, title: 'Test PR', state: 'open', user: { login: 'user' } }] },
      issues: { 'user/repo1': [{ id: 1, number: 1, title: 'Test issue', state: 'open', user: { login: 'user' } }] },
    });
  });

  it('renders the data preview for the selected data set', async () => {
    render(<MockDataPreview dataSet="default" />);
    
    await waitFor(() => {
      expect(screen.getByText('Repositories')).toBeInTheDocument();
      expect(screen.getByText('Commits')).toBeInTheDocument();
      expect(screen.getByText('Pull Requests')).toBeInTheDocument();
      expect(screen.getByText('Issues')).toBeInTheDocument();
    });
  });

  it('shows a message when no data set is selected', () => {
    render(<MockDataPreview dataSet="" />);
    
    expect(screen.getByText('Select a mock data set to preview')).toBeInTheDocument();
  });

  it('shows loading state while fetching mock data', () => {
    render(<MockDataPreview dataSet="default" />);
    
    expect(screen.getByText('Loading mock data...')).toBeInTheDocument();
  });

  it('shows error message when fetching mock data fails', async () => {
    (getMockData as jest.Mock).mockRejectedValue(new Error('Failed to load mock data'));
    
    render(<MockDataPreview dataSet="default" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load mock data')).toBeInTheDocument();
    });
  });
});

describe('MockDataActions', () => {
  const onDataSetUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (resetMockData as jest.Mock).mockResolvedValue({});
  });

  it('renders the actions for the selected data set', () => {
    render(<MockDataActions dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    expect(screen.getByText('Reset Mock Data')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('disables the reset button when no data set is selected', () => {
    render(<MockDataActions dataSet="" onDataSetUpdated={onDataSetUpdated} />);
    
    expect(screen.getByText('Reset Mock Data')).toBeDisabled();
  });

  it('calls resetMockData when the reset button is clicked', async () => {
    render(<MockDataActions dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    fireEvent.click(screen.getByText('Reset Mock Data'));
    
    await waitFor(() => {
      expect(resetMockData).toHaveBeenCalledWith('default');
      expect(onDataSetUpdated).toHaveBeenCalled();
    });
  });

  it('shows error message when resetting mock data fails', async () => {
    (resetMockData as jest.Mock).mockRejectedValue(new Error('Failed to reset mock data'));
    
    render(<MockDataActions dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    fireEvent.click(screen.getByText('Reset Mock Data'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to reset mock data: Failed to reset mock data')).toBeInTheDocument();
    });
  });
});

describe('MockDataGenerationOptions', () => {
  const onDataSetUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (resetMockData as jest.Mock).mockResolvedValue({});
  });

  it('renders the generation options form', () => {
    render(<MockDataGenerationOptions dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('Users Per Repository')).toBeInTheDocument();
    expect(screen.getByText('Time Range (Days)')).toBeInTheDocument();
    expect(screen.getByText('Activity Level')).toBeInTheDocument();
    expect(screen.getByText('Include Burnout Patterns')).toBeInTheDocument();
    expect(screen.getByText('Include Collaboration Patterns')).toBeInTheDocument();
    expect(screen.getByText('Generate Mock Data')).toBeInTheDocument();
  });

  it('disables the generate button when no data set is selected', () => {
    render(<MockDataGenerationOptions dataSet="" onDataSetUpdated={onDataSetUpdated} />);
    
    expect(screen.getByText('Generate Mock Data')).toBeDisabled();
  });

  it('calls resetMockData with options when the form is submitted', async () => {
    render(<MockDataGenerationOptions dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    fireEvent.submit(screen.getByText('Generate Mock Data').closest('form')!);
    
    await waitFor(() => {
      expect(resetMockData).toHaveBeenCalledWith('default', expect.any(Object));
      expect(onDataSetUpdated).toHaveBeenCalled();
    });
  });

  it('shows error message when generating mock data fails', async () => {
    (resetMockData as jest.Mock).mockRejectedValue(new Error('Failed to generate mock data'));
    
    render(<MockDataGenerationOptions dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    fireEvent.submit(screen.getByText('Generate Mock Data').closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to generate mock data: Failed to generate mock data')).toBeInTheDocument();
    });
  });
});

describe('MockDataImportExport', () => {
  const onDataSetUpdated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (exportMockData as jest.Mock).mockResolvedValue('{}');
    (importMockData as jest.Mock).mockResolvedValue({});
    
    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockLink;
      return document.createElement(tag);
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  it('renders the import/export options', () => {
    render(<MockDataImportExport dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    expect(screen.getByText('Export Selected Data Set')).toBeInTheDocument();
    expect(screen.getByText('New Data Set Name')).toBeInTheDocument();
    expect(screen.getByText('Import File')).toBeInTheDocument();
    expect(screen.getByText('Import Data Set')).toBeInTheDocument();
  });

  it('disables the export button when no data set is selected', () => {
    render(<MockDataImportExport dataSet="" onDataSetUpdated={onDataSetUpdated} />);
    
    expect(screen.getByText('Export Selected Data Set')).toBeDisabled();
  });

  it('calls exportMockData when the export button is clicked', async () => {
    render(<MockDataImportExport dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    fireEvent.click(screen.getByText('Export Selected Data Set'));
    
    await waitFor(() => {
      expect(exportMockData).toHaveBeenCalledWith('default');
    });
  });

  it('shows error message when exporting mock data fails', async () => {
    (exportMockData as jest.Mock).mockRejectedValue(new Error('Failed to export mock data'));
    
    render(<MockDataImportExport dataSet="default" onDataSetUpdated={onDataSetUpdated} />);
    
    fireEvent.click(screen.getByText('Export Selected Data Set'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to export mock data: Failed to export mock data')).toBeInTheDocument();
    });
  });
});
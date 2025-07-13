import { FileMetadata } from '../types';

interface PreviewPanelProps {
  file: FileMetadata | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  maxHeight?: number;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  theme?: {
    text?: string;
    background?: string;
    highlight?: string;
    comment?: string;
    keyword?: string;
    string?: string;
    number?: string;
    operator?: string;
    function?: string;
    variable?: string;
    error?: string;
  };
}

declare const PreviewPanel: React.FC<PreviewPanelProps>;

export default PreviewPanel;

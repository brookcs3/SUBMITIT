import { ValidationState } from '../types';

interface ValidationPanelProps {
  validation: ValidationState;
  onValidate?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: (isVisible: boolean) => void;
  validationRules?: Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }>;
  onToggleRule?: (ruleId: string, isEnabled: boolean) => void;
  theme?: {
    error?: string;
    warning?: string;
    info?: string;
    success?: string;
    text?: string;
    background?: string;
    border?: string;
    highlight?: string;
  };
  maxIssues?: number;
  showAllIssues?: boolean;
  onShowAllIssues?: () => void;
}

declare const ValidationPanel: React.FC<ValidationPanelProps>;

export default ValidationPanel;

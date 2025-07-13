import { FileMetadata, DirectoryStructure, ValidationState } from '../types';

export interface UseValidationReturn {
  validationState: ValidationState;
  validateFiles: (structure: DirectoryStructure) => Promise<void>;
  clearValidation: () => void;
  addValidationRule: (rule: (file: FileMetadata) => string | null) => void;
  removeValidationRule: (ruleId: string) => void;
}

declare const useValidation: () => UseValidationReturn;

export default useValidation;

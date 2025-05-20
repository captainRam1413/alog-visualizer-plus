// Basic types for visualization elements
export interface ArrayElement {
  value: number;
  status: 'normal' | 'comparing' | 'sorted' | 'pivot' | 'current' | 'left' | 'right';
}

// Enhanced data structure for tracking recursive calls
export interface RecursiveCall {
  id: string;
  parentId: string | null;
  array: number[];
  level: number;
  start: number;
  end: number;
  pivot?: number;
  pivotIndex?: number; // Added pivotIndex property
  midPoint?: number; // Added midPoint property for binary search visualization
  leftArray?: number[];
  rightArray?: number[];
  status: 'active' | 'completed' | 'waiting';
  result?: number[];
}

// Shared visualization state
export interface VisualizationState {
  array: ArrayElement[];
  currentStep: number;
  totalSteps: number;
  description: string;
  activeIndices: number[];
  pivotIndex?: number;
  leftPointer?: number;
  rightPointer?: number;
  midPoint?: number;
  callStack: RecursiveCall[];
}

// Algorithm information type
export interface AlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable: boolean;
  additionalNotes: string;
  pseudocode: string;
}

// Algorithm visualization generator interface
export interface AlgorithmVisualizer {
  generateVisualization: (array: number[]) => [VisualizationState, RecursiveCall[]];
  updateVisualizationState: (state: VisualizationState, stage: number) => void;
  generateSteps: (array: number[]) => string[];
}
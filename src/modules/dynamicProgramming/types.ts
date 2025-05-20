export type DPProblemType = 
  | 'Fibonacci Sequence'
  | 'Longest Common Subsequence'
  | 'Knapsack Problem'
  | 'Matrix Chain Multiplication'
  | 'Coin Change Problem'
  | 'Edit Distance';

export interface DPVisualizationState {
  table: any[][];
  currentCell?: [number, number];
  completedCells: [number, number][];
  steps: string[];
  currentStep: number;
  isComplete: boolean;
  auxData?: {
    treeData?: any;
    algorithm?: string;
    [key: string]: any;
  };
}

export interface DPProblemProps {
  onVisualizationChange?: (state: DPVisualizationState) => void;
  inputParams?: any;
  speed?: number;
}

export interface DPAlgorithmResult {
  result: number | string;
  visualizationState: DPVisualizationState;
}
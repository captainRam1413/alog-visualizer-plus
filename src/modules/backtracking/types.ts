// Types for backtracking algorithms
export type BacktrackingProblemType = 
  | 'nqueens' 
  | 'sudoku' 
  | 'graphcoloring' 
  | 'hamiltonian'
  | 'ratmaze'
  | 'subsetsum';

export interface BoardState {
  size: number;
  squares: (number | null)[][];
  currentRow?: number;
  currentCol?: number;
  isValid?: boolean;
  solutionNumber?: number; // Added for identifying solutions
}

export interface SudokuState {
  board: number[][];
  original: boolean[][];
  currentRow?: number;
  currentCol?: number;
  currentValue?: number;
  isValid?: boolean;
}

export interface GraphColoringState {
  nodes: number;
  edges: { from: number; to: number }[];
  colors: number[];
  currentNode?: number;
  maxColors: number;
}

export interface RatMazeState {
  maze: number[][];
  solution: number[][];
  currentRow?: number;
  currentCol?: number;
  size: number;
}

export interface SubsetSumState {
  set: number[];
  target: number;
  currentSum: number;
  currentIndex: number;
  includedIndices: number[];
  currentSubset: number[];
}

export interface AlgorithmStep {
  description: string;
  boardState?: BoardState;
  sudokuState?: SudokuState;
  graphState?: GraphColoringState;
  mazeState?: RatMazeState;
  subsetState?: SubsetSumState;
  highlightedCode?: string[];
  allSolutions?: BoardState[]; // Added for tracking all solutions found
}

export interface VisualizationState {
  steps: AlgorithmStep[];
  currentStep: number;
  isComplete: boolean;
  totalSteps: number;
  stats: {
    statesExplored: number;
    backtracks: number;
    solutionsFound: number;
    timeElapsed: number;
  };
}

export interface VisualizationProps {
  state: VisualizationState;
  onStateChange?: (state: VisualizationState) => void;
  speed?: number;
}
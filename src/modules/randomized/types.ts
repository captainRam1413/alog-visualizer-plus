// Define the types of randomized algorithms available in the application
export type RandomizedAlgorithmType = 'quicksort' | 'primality' | 'skiplist' | 'mincut' | 'montecarlo' | 'coupon';

// Step in the algorithm visualization
export interface AlgorithmStep {
  description: string;
  dataState?: any; // State of data structure being manipulated
  highlightedCode?: number[]; // Lines of code to highlight
  iteration?: number; // Current iteration for iterative algorithms
  probability?: number; // Probability for stochastic algorithms
}

// State for the whole visualization
export interface VisualizationState {
  steps: AlgorithmStep[];
  stats: {
    comparisons: number;
    swaps: number;
    randomCalls: number;
    timeElapsed: number;
    successProbability?: number;
  };
}

// For QuickSort
export interface QuickSortState {
  array: number[];
  pivotIndex: number;
  leftPointer?: number;
  rightPointer?: number;
  partitionRange?: [number, number]; // [start, end] of current partition
  isSorted?: boolean[];
}

// For Miller-Rabin Primality Test
export interface PrimalityTestState {
  number: number;
  witness: number;
  iteration: number;
  currentStep: string;
  isProbablyPrime: boolean;
}

// For Skip List
export interface SkipListState {
  levels: SkipListNode[][];
  searchPath?: SkipListNode[];
  currentNode?: SkipListNode;
  operation: 'search' | 'insert' | 'delete' | 'none';
  target?: number;
}

export interface SkipListNode {
  value: number;
  position: { x: number, y: number };
  isHighlighted?: boolean;
  isHeader?: boolean; // Added to indicate if the node is a header/sentinel node
}

// For Karger's Min Cut
export interface MinCutState {
  vertices: number;
  edges: [number, number][]; // Pairs of vertices
  contractedVertices: number[][];
  currentIteration: number;
  minCutSize: number;
}

// For Monte Carlo Integration
export interface MonteCarloState {
  points: { x: number, y: number, isInside: boolean }[];
  area: number;
  approximation: number;
  error: number;
}

// For Coupon Collector
export interface CouponCollectorState {
  coupons: boolean[];
  attempts: number;
  collectedCount: number;
  distributions: number[][];
}
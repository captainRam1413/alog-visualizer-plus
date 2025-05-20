import { DPVisualizationState } from '../types';

// Create a new empty DP visualization state
export const createInitialDPState = (rows: number, cols: number): DPVisualizationState => {
  // Create an empty 2D table
  const emptyTable = Array(rows).fill(null).map(() => 
    Array(cols).fill(undefined)
  );

  return {
    table: emptyTable,
    completedCells: [],
    steps: [],
    currentStep: 0,
    isComplete: false
  };
};

// Update the current cell in the visualization
export const updateCurrentCell = (
  state: DPVisualizationState, 
  row: number, 
  col: number, 
  value: any,
  stepDescription: string
): DPVisualizationState => {
  const newTable = [...state.table];
  newTable[row] = [...newTable[row]];
  newTable[row][col] = value;

  return {
    ...state,
    table: newTable,
    currentCell: [row, col] as [number, number],
    steps: [...state.steps, stepDescription],
    currentStep: state.currentStep + 1,
  };
};

// Mark a cell as completed in the visualization
export const markCellCompleted = (
  state: DPVisualizationState, 
  row: number, 
  col: number
): DPVisualizationState => {
  const newCompletedCells = [...state.completedCells, [row, col] as [number, number]];
  
  return {
    ...state,
    currentCell: undefined,
    completedCells: newCompletedCells,
  };
};

// Mark the entire process as complete
export const finalizeDPState = (
  state: DPVisualizationState,
  finalStepDescription: string
): DPVisualizationState => {
  return {
    ...state,
    steps: [...state.steps, finalStepDescription],
    currentStep: state.currentStep + 1,
    isComplete: true,
  };
};

// Format array elements as strings for display
export const formatArrayElements = (arr: any[]): string => {
  return arr.map(elem => elem?.toString() || '-').join(', ');
};

// Delay function for animations
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
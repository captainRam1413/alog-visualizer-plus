import { AlgorithmInfo, AlgorithmVisualizer, ArrayElement, RecursiveCall, VisualizationState } from '../types';
import { createArrayElements, calculateTotalSteps, resetArrayElementStatus } from '../utils';

export const countInversionsInfo: AlgorithmInfo = {
  name: 'Counting Inversions',
  description: 'Counts the number of pairs of indices (i,j) in an array where i < j and arr[i] > arr[j], using a modified merge sort.',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)'
  },
  spaceComplexity: 'O(n)',
  stable: true,
  additionalNotes: 'Useful for measuring how far an array is from being sorted',
  pseudocode: `function countInversions(arr):
    if length of arr <= 1:
        return 0, arr
    
    mid = length of arr / 2
    leftCount, leftArr = countInversions(arr[0...mid-1])
    rightCount, rightArr = countInversions(arr[mid...n])
    
    splitCount, mergedArr = mergeAndCount(leftArr, rightArr)
    
    return leftCount + rightCount + splitCount, mergedArr

function mergeAndCount(left, right):
    result = empty array
    inversions = 0
    i = j = 0
    
    while i < length of left and j < length of right:
        if left[i] <= right[j]:
            append left[i] to result
            i = i + 1
        else:
            append right[j] to result
            // Count inversions: all remaining elements in left are greater than right[j]
            inversions = inversions + (length of left - i)
            j = j + 1
            
    append remaining elements of left to result
    append remaining elements of right to result
    
    return inversions, result`
};

const countInversionsVisualizer: AlgorithmVisualizer = {
  generateVisualization: (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Initialize elements with normal status
    const initialElements: ArrayElement[] = createArrayElements(array);
    
    // Calculate actual inversions for validation
    let actualInversions = 0;
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] > array[j]) {
          actualInversions++;
        }
      }
    }
    
    // Create initial visualization state
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: calculateTotalSteps('countInversions', array.length),
      description: `Finding inversions in array (total inversions: ${actualInversions})`,
      activeIndices: [],
      callStack: []
    };
    
    // Generate recursion tree for counting inversions
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: [...array],
      level: 0,
      start: 0,
      end: array.length - 1,
      status: 'active'
    }];
    
    // Add recursive subdivisions for the tree visualization
    const generateInversionTree = (
      parentId: string, 
      array: number[], 
      start: number, 
      end: number, 
      level: number
    ): void => {
      if (start >= end) return;
      
      const mid = Math.floor((start + end) / 2);
      
      // Left half
      const leftId = `${parentId}-left`;
      recursionTree.push({
        id: leftId,
        parentId,
        array: array.slice(start, mid + 1),
        level: level + 1,
        start,
        end: mid,
        status: 'waiting'
      });
      
      // Right half
      const rightId = `${parentId}-right`;
      recursionTree.push({
        id: rightId,
        parentId,
        array: array.slice(mid + 1, end + 1),
        level: level + 1,
        start: mid + 1,
        end,
        status: 'waiting'
      });
      
      // Add a merge node to represent the merge and count step
      recursionTree.push({
        id: `${parentId}-merge`,
        parentId,
        array: array.slice(start, end + 1),
        level: level + 0.5, // Place between levels for better visualization
        start,
        end,
        status: 'waiting',
      });
      
      // Recursively add child nodes
      if (mid - start > 0) {
        generateInversionTree(leftId, array, start, mid, level + 1);
      }
      
      if (end - mid > 0) {
        generateInversionTree(rightId, array, mid + 1, end, level + 1);
      }
    };
    
    // Generate the tree
    generateInversionTree('root', array, 0, array.length - 1, 0);
    
    return [initialState, recursionTree];
  },
  
  updateVisualizationState: (state: VisualizationState, stage: number): void => {
    const currentStage = stage - 1;
    
    // Reset all statuses
    resetArrayElementStatus(state.array);
    
    // Calculate total inversions for reference
    const values = state.array.map(el => el.value);
    let totalInversions = 0;
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[i] > values[j]) {
          totalInversions++;
        }
      }
    }
    
    if (currentStage === 0) {
      // Initial array - highlight some inversions
      let count = 0;
      for (let i = 0; i < state.array.length && count < 3; i++) {
        for (let j = i + 1; j < state.array.length && count < 3; j++) {
          if (state.array[i].value > state.array[j].value) {
            state.array[i].status = 'comparing';
            state.array[j].status = 'comparing';
            count++;
            
            if (count === 1) {
              state.description = `Initial array: [${state.array.map(el => el.value).join(', ')}]. Example inversion: (${state.array[i].value}, ${state.array[j].value})`;
            }
          }
        }
      }
      
      if (count === 0) {
        state.description = `Initial array: [${state.array.map(el => el.value).join(', ')}]. No inversions found.`;
      }
    } else if (currentStage === 1) {
      // Divide array
      const mid = Math.floor(state.array.length / 2);
      for (let i = 0; i < mid; i++) {
        state.array[i].status = 'left';
      }
      for (let i = mid; i < state.array.length; i++) {
        state.array[i].status = 'right';
      }
      
      state.description = `Dividing array at midpoint = ${mid}`;
      state.activeIndices = [mid];
    } else if (currentStage === 2 || currentStage === 3) {
      // Recursively count inversions in left or right half
      const mid = Math.floor(state.array.length / 2);
      const side = currentStage === 2 ? 'left' : 'right';
      const start = side === 'left' ? 0 : mid;
      const end = side === 'left' ? mid : state.array.length;
      
      // Calculate inversions in this half
      let halfInversions = 0;
      for (let i = start; i < end; i++) {
        for (let j = i + 1; j < end; j++) {
          if (state.array[i].value > state.array[j].value) {
            halfInversions++;
          }
        }
      }
      
      // Mark this half
      for (let i = start; i < end; i++) {
        state.array[i].status = side === 'left' ? 'left' : 'right';
      }
      
      state.description = `Counting inversions in ${side} half: ${halfInversions} inversions found`;
      
      // Update active call in the callstack
      const activeCall = state.callStack.find(call => 
        call.level === 1 && call.id.includes(side)
      );
      if (activeCall) {
        activeCall.status = 'active';
      }
    } else if (currentStage === 4) {
      // Count split inversions
      const mid = Math.floor(state.array.length / 2);
      
      // Highlight some split inversions
      let splitInversions = 0;
      let highlighted = 0;
      
      for (let i = 0; i < mid && highlighted < 3; i++) {
        for (let j = mid; j < state.array.length && highlighted < 3; j++) {
          if (state.array[i].value > state.array[j].value) {
            state.array[i].status = 'left';
            state.array[j].status = 'right';
            splitInversions++;
            highlighted++;
            
            if (highlighted === 1) {
              state.description = `Split inversion example: (${state.array[i].value}, ${state.array[j].value})`;
            }
          }
        }
      }
      
      // Calculate total split inversions for description
      let totalSplitInversions = 0;
      for (let i = 0; i < mid; i++) {
        for (let j = mid; j < state.array.length; j++) {
          if (state.array[i].value > state.array[j].value) {
            totalSplitInversions++;
          }
        }
      }
      
      state.description = `Counting split inversions: ${totalSplitInversions} found`;
    } else if (currentStage === 5) {
      // Final result - display total number of inversions
      state.description = `Total inversions: ${totalInversions}`;
      
      // Sort the array to show the fully sorted state for reference
      const sortedArray = [...state.array].map(el => el.value).sort((a, b) => a - b);
      
      // Mark elements that are already in their sorted positions
      for (let i = 0; i < state.array.length; i++) {
        if (state.array[i].value === sortedArray[i]) {
          state.array[i].status = 'sorted';
        } else {
          state.array[i].status = 'comparing';
        }
      }
    }
  },
  
  generateSteps: (array: number[]): string[] => {
    // Calculate total inversions for the steps
    let totalInversions = 0;
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] > array[j]) {
          totalInversions++;
        }
      }
    }
    
    return [
      `Initial array: [${array.join(', ')}]`,
      `Dividing array for counting inversions`,
      `Counting inversions in left half`,
      `Counting inversions in right half`,
      `Counting split inversions`,
      `Total inversions found: ${totalInversions}`
    ];
  }
};

// Helper function to perform actual count inversions using merge sort (for reference)
export function countInversions(array: number[]): [number, number[]] {
  // Base case
  if (array.length <= 1) {
    return [0, array];
  }
  
  const mid = Math.floor(array.length / 2);
  
  // Recursively count inversions in left and right halves
  const [leftCount, leftSorted] = countInversions(array.slice(0, mid));
  const [rightCount, rightSorted] = countInversions(array.slice(mid));
  
  // Merge and count split inversions
  const [splitCount, sortedArray] = mergeAndCount(leftSorted, rightSorted);
  
  return [leftCount + rightCount + splitCount, sortedArray];
}

// Helper function to merge two sorted arrays and count split inversions
function mergeAndCount(left: number[], right: number[]): [number, number[]] {
  const merged: number[] = [];
  let inversions = 0;
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
      // Count split inversions - each remaining element in left forms an inversion with right[j]
      inversions += left.length - i;
    }
  }
  
  // Add remaining elements
  while (i < left.length) {
    merged.push(left[i]);
    i++;
  }
  
  while (j < right.length) {
    merged.push(right[j]);
    j++;
  }
  
  return [inversions, merged];
}

export default countInversionsVisualizer;
import { AlgorithmInfo, AlgorithmVisualizer, ArrayElement, RecursiveCall, VisualizationState } from '../types';
import { createArrayElements, calculateTotalSteps, resetArrayElementStatus } from '../utils';

export const mergeSortInfo: AlgorithmInfo = {
  name: 'Merge Sort',
  description: 'A stable, comparison-based sorting algorithm that divides the input array into two halves, recursively sorts them, then merges the sorted halves.',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)'
  },
  spaceComplexity: 'O(n)',
  stable: true,
  additionalNotes: 'Requires extra space for merging, but guarantees O(n log n) performance',
  pseudocode: `function mergeSort(arr):
    if length of arr ≤ 1:
        return arr
    
    mid = length of arr / 2
    left = mergeSort(arr[0...mid-1])
    right = mergeSort(arr[mid...n])
    
    return merge(left, right)

function merge(left, right):
    result = empty array
    while left is not empty and right is not empty:
        if first element of left ≤ first element of right:
            append first element of left to result
            remove first element from left
        else:
            append first element of right to result
            remove first element from right
            
    append remaining elements of left to result
    append remaining elements of right to result
    return result`
};

const mergeSortVisualizer: AlgorithmVisualizer = {
  generateVisualization: (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Initialize elements with normal status
    const initialElements: ArrayElement[] = createArrayElements(array);
    
    // Create initial visualization state
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: calculateTotalSteps('mergeSort', array.length),
      description: 'Starting merge sort algorithm',
      activeIndices: [],
      callStack: []
    };
    
    // Generate recursion tree data
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: [...array],
      level: 0,
      start: 0,
      end: array.length - 1,
      status: 'active'
    }];
    
    // Add recursive subdivisions to illustrate the divide phase
    const generateSubdivisions = (
      parentId: string, 
      array: number[], 
      start: number, 
      end: number, 
      level: number
    ): void => {
      if (start >= end) return;
      
      const mid = Math.floor((start + end) / 2);
      
      // Left child
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
      
      // Right child
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
      
      // Add merge node to represent the merge operation
      recursionTree.push({
        id: `${parentId}-merge`,
        parentId,
        array: array.slice(start, end + 1),
        level: level + 0.5, // Place between levels for better visualization
        start,
        end,
        status: 'waiting'
      });
      
      // Recursively subdivide
      generateSubdivisions(leftId, array, start, mid, level + 1);
      generateSubdivisions(rightId, array, mid + 1, end, level + 1);
    };
    
    generateSubdivisions('root', array, 0, array.length - 1, 0);
    
    return [initialState, recursionTree];
  },
  
  updateVisualizationState: (state: VisualizationState, stage: number): void => {
    const currentStage = stage - 1;
    
    // Reset all statuses
    resetArrayElementStatus(state.array);
    
    if (currentStage === 0) {
      // Initial state, nothing to highlight
      state.description = `Initial array: [${state.array.map(el => el.value).join(', ')}]`;
    } else if (currentStage === 1) {
      // Splitting phase
      const mid = Math.floor(state.array.length / 2);
      
      // Highlight the division
      for (let i = 0; i < mid; i++) {
        state.array[i].status = 'left';
      }
      for (let i = mid; i < state.array.length; i++) {
        state.array[i].status = 'right';
      }
      
      state.activeIndices = [mid];
      state.description = `Splitting array at midpoint ${mid}: [${state.array.slice(0, mid).map(el => el.value).join(', ')}] and [${state.array.slice(mid).map(el => el.value).join(', ')}]`;
    } else if (currentStage >= 2 && currentStage <= 3) {
      // Recursive sorting of left or right subarrays
      const mid = Math.floor(state.array.length / 2);
      const side = currentStage === 2 ? 'left' : 'right';
      const start = side === 'left' ? 0 : mid;
      const end = side === 'left' ? mid : state.array.length;
      
      // Mark the subarray being processed
      for (let i = start; i < end; i++) {
        state.array[i].status = side === 'left' ? 'left' : 'right';
      }
      
      state.description = `Recursively sorting the ${side} half`;
      
      // Update the active call in the callstack
      const activeCall = state.callStack.find(call => 
        call.level === currentStage - 1 && call.id.includes(side)
      );
      if (activeCall) {
        activeCall.status = 'active';
      }
    } else if (currentStage === 4) {
      // Merging phase
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].status = 'comparing';
      }
      
      state.description = 'Merging sorted subarrays';
      
      // Simulate the merge by updating some array elements
      // For a more realistic merge, we would actually implement the merge algorithm here
    } else if (currentStage === 5) {
      // Final sorted result
      const sortedValues = [...state.array].map(el => el.value).sort((a, b) => a - b);
      
      // Update array with sorted values
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].value = sortedValues[i];
        state.array[i].status = 'sorted';
      }
      
      state.description = `Final sorted array: [${sortedValues.join(', ')}]`;
    }
  },
  
  generateSteps: (array: number[]): string[] => {
    return [
      `Initial array: [${array.join(', ')}]`,
      `Splitting array into two halves: [${array.slice(0, Math.floor(array.length/2)).join(', ')}] and [${array.slice(Math.floor(array.length/2)).join(', ')}]`,
      `Recursively sorting first half...`,
      `Recursively sorting second half...`,
      `Merging sorted halves...`,
      `Final sorted array: [${[...array].sort((a, b) => a - b).join(', ')}]`
    ];
  }
};

// Helper function to perform actual merge sort (for reference)
export function performMergeSort(array: number[]): number[] {
  if (array.length <= 1) return array;
  
  const mid = Math.floor(array.length / 2);
  const left = performMergeSort(array.slice(0, mid));
  const right = performMergeSort(array.slice(mid));
  
  return merge(left, right);
}

// Helper function to merge two sorted arrays
function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }
  
  // Add remaining elements
  while (leftIndex < left.length) {
    result.push(left[leftIndex]);
    leftIndex++;
  }
  
  while (rightIndex < right.length) {
    result.push(right[rightIndex]);
    rightIndex++;
  }
  
  return result;
}

export default mergeSortVisualizer;
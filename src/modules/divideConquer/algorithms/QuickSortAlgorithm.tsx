import { AlgorithmInfo, AlgorithmVisualizer, ArrayElement, RecursiveCall, VisualizationState } from '../types';
import { createArrayElements, calculateTotalSteps, resetArrayElementStatus } from '../utils';

export const quickSortInfo: AlgorithmInfo = {
  name: 'Quick Sort',
  description: 'A divide-and-conquer algorithm that selects a pivot element and partitions the array around the pivot.',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)'
  },
  spaceComplexity: 'O(log n)',
  stable: false,
  additionalNotes: 'In-place sorting algorithm with typically good performance on average',
  pseudocode: `function quickSort(arr, low, high):
    if low < high:
        pivotIndex = partition(arr, low, high)
        quickSort(arr, low, pivotIndex - 1)
        quickSort(arr, pivotIndex + 1, high)

function partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j from low to high-1:
        if arr[j] <= pivot:
            i = i + 1
            swap arr[i] and arr[j]
            
    swap arr[i+1] and arr[high]
    return i+1`
};

const quickSortVisualizer: AlgorithmVisualizer = {
  generateVisualization: (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Initialize elements with normal status
    const initialElements: ArrayElement[] = createArrayElements(array);
    
    // Create initial visualization state
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: calculateTotalSteps('quickSort', array.length),
      description: `Starting quick sort with array [${array.join(', ')}]`,
      activeIndices: [],
      pivotIndex: array.length - 1,
      leftPointer: 0,
      rightPointer: array.length - 2,
      callStack: []
    };
    
    // Generate a complete recursion tree for quick sort with all recursive calls
    const recursionTree: RecursiveCall[] = [];
    let callId = 0; // Use incremental ID to ensure unique identifiers
    
    // Helper function to generate the complete recursion tree with all steps
    const generateRecursionTree = (
      arr: number[], 
      start: number, 
      end: number, 
      level: number, 
      parentId: string | null = null
    ): string => {
      const currentId = `call-${callId++}`;
      
      // Add this call to the recursion tree
      recursionTree.push({
        id: currentId,
        parentId,
        array: [...arr.slice(start, end + 1)],
        level,
        start,
        end,
        pivot: arr[end], // Last element as pivot
        status: parentId ? 'waiting' : 'active'
      });
      
      // Base case: array of size 1 or empty
      if (start >= end) {
        // For single element or empty arrays, add result node
        recursionTree.push({
          id: `${currentId}-result`,
          parentId: currentId,
          array: [...arr.slice(start, end + 1)],
          level: level + 1,
          start,
          end,
          result: [...arr.slice(start, end + 1)],
          status: 'waiting'
        });
        return currentId;
      }
      
      // 1. Choose pivot and partition
      const pivotIdx = end;
      const pivot = arr[pivotIdx];
      
      // 2. Create a copy of the array for partitioning
      const arrCopy = [...arr];
      const partitionIndex = simulatePartition(arrCopy, start, end);
      
      // 3. Add partitioning node to show the divide step
      const partitionId = `${currentId}-partition`;
      recursionTree.push({
        id: partitionId,
        parentId: currentId,
        array: [...arrCopy.slice(start, end + 1)],
        level: level + 1,
        start,
        end,
        pivot,
        pivotIndex: partitionIndex - start, // Relative to the subarray
        status: 'waiting'
      });
      
      // 4. Recursively sort left and right partitions
      let leftId = null;
      let rightId = null;
      
      // Only recurse if there are elements to sort
      if (start < partitionIndex - 1) {
        leftId = generateRecursionTree(arrCopy, start, partitionIndex - 1, level + 2, partitionId);
      }
      
      if (partitionIndex + 1 < end) {
        rightId = generateRecursionTree(arrCopy, partitionIndex + 1, end, level + 2, partitionId);
      }
      
      // 5. Add merge/combine node to show the result after both sides are sorted
      const sortedSubarray = [...arrCopy.slice(start, end + 1)].sort((a, b) => a - b);
      recursionTree.push({
        id: `${currentId}-merge`,
        parentId: currentId,
        array: sortedSubarray,
        level: level + 3,
        start,
        end,
        result: sortedSubarray,
        status: 'waiting'
      });
      
      return currentId;
    };
    
    // Generate the complete recursion tree starting with the full array
    generateRecursionTree(array, 0, array.length - 1, 0);
    
    // Now add backtracking connections to show how results propagate back
    recursionTree.forEach(node => {
      if (node.id.includes('merge') || node.id.includes('result')) {
        const parentNode = recursionTree.find(n => n.id === node.parentId);
        if (parentNode) {
          parentNode.result = node.result; // Propagate the result upward
        }
      }
    });
    
    return [initialState, recursionTree];
  },
  
  updateVisualizationState: (state: VisualizationState, stage: number): void => {
    const currentStage = stage - 1;
    
    // Reset all statuses
    resetArrayElementStatus(state.array);
    
    // Set the pivotIndex if available
    if (state.pivotIndex !== undefined) {
      state.array[state.pivotIndex].status = 'pivot';
    }
    
    if (currentStage === 0) {
      // Initial state - display the array with the pivot highlighted
      state.description = `Initial array: [${state.array.map(el => el.value).join(', ')}]`;
    } else if (currentStage === 1) {
      // Selecting pivot
      if (state.pivotIndex !== undefined) {
        state.array[state.pivotIndex].status = 'pivot';
        state.activeIndices = [state.pivotIndex];
        state.description = `Selected pivot: ${state.array[state.pivotIndex].value}`;
      }
    } else if (currentStage === 2) {
      // Partitioning phase
      if (state.leftPointer !== undefined && state.rightPointer !== undefined) {
        // Initialize pointers for partitioning
        state.array[state.leftPointer].status = 'left';
        if (state.rightPointer >= 0) {
          state.array[state.rightPointer].status = 'right';
        }
        
        state.activeIndices = [state.leftPointer, state.rightPointer || 0];
        state.description = 'Partitioning array around pivot';
        
        // Show partitioning in progress
        const pivotValue = state.array[state.pivotIndex || 0].value;
        let i = 0;
        for (let j = 0; j < state.array.length; j++) {
          if (j === state.pivotIndex) continue;
          
          if (state.array[j].value <= pivotValue) {
            state.array[i].status = 'comparing';
            i++;
          }
        }
      }
    } else if (currentStage === 3 || currentStage === 4) {
      // Moving elements around pivot
      const pivotValue = state.array[state.pivotIndex || 0].value;
      
      // Mark elements based on their relationship to the pivot
      state.array.forEach((el, idx) => {
        if (idx === state.pivotIndex) {
          el.status = 'pivot';
        } else if (el.value < pivotValue) {
          el.status = 'left';
        } else if (el.value > pivotValue) {
          el.status = 'right';
        } else {
          // Equal to pivot, but not the pivot itself
          el.status = 'comparing';
        }
      });
      
      state.description = currentStage === 3 
        ? `Moving elements less than ${pivotValue} to the left of the pivot`
        : `Moving elements greater than ${pivotValue} to the right of the pivot`;
    } else if (currentStage === 5 || currentStage === 6) {
      // Recursive sorting of partitions
      const pivotValue = state.array[state.pivotIndex || 0].value;
      const side = currentStage === 5 ? 'left' : 'right';
      
      // Highlight the appropriate partition
      state.array.forEach((el, idx) => {
        if (idx === state.pivotIndex) {
          el.status = 'pivot';
        } else if (side === 'left' && el.value < pivotValue) {
          el.status = 'left';
        } else if (side === 'right' && el.value > pivotValue) {
          el.status = 'right';
        }
      });
      
      state.description = `Recursively sorting ${side} partition...`;
      
      // Update the active call in the callstack
      const relevantCall = state.callStack.find(call => 
        call.level === 1 && call.id === side
      );
      if (relevantCall) {
        relevantCall.status = 'active';
      }
    } else if (currentStage === 7) {
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
    const pivot = array[array.length - 1];
    return [
      `Initial array: [${array.join(', ')}]`,
      `Selecting pivot: ${pivot}`,
      `Partitioning array around pivot...`,
      `Moving elements less than ${pivot} to the left of the pivot`,
      `Moving elements greater than ${pivot} to the right of the pivot`,
      `Recursively sorting left partition...`,
      `Recursively sorting right partition...`,
      `Final sorted array: [${[...array].sort((a, b) => a - b).join(', ')}]`
    ];
  }
};

// Helper function to simulate partitioning without modifying the original array
function simulatePartition(array: number[], low: number, high: number): number {
  const pivot = array[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (array[j] <= pivot) {
      i++;
      // Swap array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Swap array[i+1] and array[high] (pivot)
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  
  return i + 1; // Return the partition index
}

// Helper function to perform actual quick sort (for reference)
export function performQuickSort(array: number[], low = 0, high = array.length - 1): number[] {
  // Create a copy so we don't modify the original
  const result = [...array];
  
  // Base case
  if (low < high) {
    const pivotIndex = partition(result, low, high);
    
    // Recursively sort the sub-arrays
    performQuickSort(result, low, pivotIndex - 1);
    performQuickSort(result, pivotIndex + 1, high);
  }
  
  return result;
}

// Helper function for partitioning the array
function partition(array: number[], low: number, high: number): number {
  const pivot = array[high];
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (array[j] <= pivot) {
      i++;
      
      // Swap array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Swap array[i+1] and array[high] (pivot)
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  
  return i + 1;
}

export default quickSortVisualizer;
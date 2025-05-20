import { AlgorithmInfo, AlgorithmVisualizer, ArrayElement, RecursiveCall, VisualizationState } from '../types';
import { createArrayElements, calculateTotalSteps, resetArrayElementStatus } from '../utils';

export const binarySearchInfo: AlgorithmInfo = {
  name: 'Binary Search',
  description: 'Efficiently finds a target value in a sorted array by repeatedly dividing the search interval in half.',
  timeComplexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)'
  },
  spaceComplexity: 'O(1) iterative, O(log n) recursive',
  stable: true,
  additionalNotes: 'Requires the array to be sorted. Much faster than linear search for large arrays.',
  pseudocode: `function binarySearch(arr, target, low, high):
    if low > high:
        return -1
    
    mid = (low + high) / 2
    
    if arr[mid] == target:
        return mid
    else if arr[mid] > target:
        return binarySearch(arr, target, low, mid - 1)
    else:
        return binarySearch(arr, target, mid + 1, high)`
};

const binarySearchVisualizer: AlgorithmVisualizer = {
  generateVisualization: (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Ensure the array is sorted for binary search
    const sortedArray = [...array].sort((a, b) => a - b);
    
    // Choose a random target from the array
    const targetIndex = Math.floor(Math.random() * sortedArray.length);
    const target = sortedArray[targetIndex];
    
    // Initialize array elements
    const initialElements: ArrayElement[] = sortedArray.map(value => ({ 
      value, 
      status: value === target ? 'current' : 'normal' 
    }));
    
    // Create initial visualization state
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: calculateTotalSteps('binarySearch', sortedArray.length),
      description: `Searching for ${target} in the sorted array`,
      activeIndices: [],
      leftPointer: 0,
      rightPointer: sortedArray.length - 1,
      midPoint: Math.floor((0 + sortedArray.length - 1) / 2),
      callStack: []
    };
    
    // Generate detailed recursion tree for binary search
    const recursionTree: RecursiveCall[] = [];
    let callId = 0; // For generating unique IDs
    
    // Function to create a more detailed binary search recursion tree
    const createDetailedBST = (
      array: number[], 
      start: number, 
      end: number, 
      level: number, 
      target: number, 
      parentId: string | null = null
    ): string => {
      // Create ID for this call
      const currentId = `call-${callId++}`;
      
      // Add the current recursive call to the tree
      recursionTree.push({
        id: currentId,
        parentId,
        array: array.slice(start, end + 1),
        level,
        start,
        end,
        status: level === 0 ? 'active' : 'waiting'
      });
      
      // Base case: empty range or single element
      if (start > end) {
        // Not found case
        recursionTree.push({
          id: `${currentId}-not-found`,
          parentId: currentId,
          array: [],
          level: level + 1,
          start,
          end,
          result: [-1], // Convention: -1 means not found
          status: 'waiting'
        });
        return currentId;
      }
      
      // Calculate middle index
      const mid = Math.floor((start + end) / 2);
      
      // Add comparison node to show the middle comparison
      const comparisonId = `${currentId}-compare`;
      recursionTree.push({
        id: comparisonId,
        parentId: currentId,
        array: array.slice(start, end + 1),
        level: level + 1,
        start,
        end,
        midPoint: mid - start, // Relative to subarray
        status: 'waiting'
      });
      
      // Check if found
      if (array[mid] === target) {
        // Found the target
        const foundId = `${currentId}-found`;
        recursionTree.push({
          id: foundId,
          parentId: comparisonId,
          array: [array[mid]],
          level: level + 2,
          start: mid,
          end: mid,
          result: [mid], // Found at index mid
          status: 'waiting'
        });
        
        // Add a backtrace node to show the result propagating back up
        recursionTree.push({
          id: `${currentId}-result`,
          parentId: currentId,
          array: [array[mid]],
          level: level + 3,
          start: mid,
          end: mid,
          result: [mid],
          status: 'waiting'
        });
        
        return currentId;
      }
      
      // Recursive case - divide search space
      if (array[mid] > target) {
        // Search left half
        const leftId = `${currentId}-left`;
        recursionTree.push({
          id: leftId,
          parentId: comparisonId,
          array: array.slice(start, mid),
          level: level + 2,
          start,
          end: mid - 1,
          status: 'waiting'
        });
        
        // Continue recursion in left half
        const leftResultId = createDetailedBST(array, start, mid - 1, level + 3, target, leftId);
        
        // Add a result propagation node
        const leftResult = recursionTree.find(node => 
          node.parentId === leftResultId && node.id.includes('result')
        )?.result?.[0];
        
        if (leftResult !== undefined) {
          recursionTree.push({
            id: `${currentId}-result`,
            parentId: currentId,
            array: leftResult === -1 ? [] : [array[leftResult]],
            level: level + 4,
            start: leftResult === -1 ? -1 : leftResult,
            end: leftResult === -1 ? -1 : leftResult,
            result: [leftResult],
            status: 'waiting'
          });
        }
      } else {
        // Search right half
        const rightId = `${currentId}-right`;
        recursionTree.push({
          id: rightId,
          parentId: comparisonId,
          array: array.slice(mid + 1, end + 1),
          level: level + 2,
          start: mid + 1,
          end,
          status: 'waiting'
        });
        
        // Continue recursion in right half
        const rightResultId = createDetailedBST(array, mid + 1, end, level + 3, target, rightId);
        
        // Add a result propagation node
        const rightResult = recursionTree.find(node => 
          node.parentId === rightResultId && node.id.includes('result')
        )?.result?.[0];
        
        if (rightResult !== undefined) {
          recursionTree.push({
            id: `${currentId}-result`,
            parentId: currentId,
            array: rightResult === -1 ? [] : [array[rightResult]],
            level: level + 4,
            start: rightResult === -1 ? -1 : rightResult,
            end: rightResult === -1 ? -1 : rightResult,
            result: [rightResult],
            status: 'waiting'
          });
        }
      }
      
      return currentId;
    };
    
    // Create the detailed binary search tree
    createDetailedBST(sortedArray, 0, sortedArray.length - 1, 0, target);
    
    return [initialState, recursionTree];
  },
  
  updateVisualizationState: (state: VisualizationState, stage: number): void => {
    const currentStage = stage - 1;
    
    // Reset statuses
    resetArrayElementStatus(state.array);
    
    // Find the target value (the one initially marked as current)
    const targetIndex = state.array.findIndex(el => el.status === 'current');
    const target = targetIndex !== -1 ? state.array[targetIndex].value : state.array[0].value;
    
    if (currentStage === 0) {
      // Initial setup - highlight target
      if (targetIndex !== -1) {
        state.array[targetIndex].status = 'current';
        state.description = `Searching for target ${target} in sorted array`;
      }
    } else if (currentStage === 1) {
      // Initialize search boundaries
      if (state.leftPointer !== undefined && state.rightPointer !== undefined) {
        state.array[state.leftPointer].status = 'left';
        state.array[state.rightPointer].status = 'right';
        
        if (targetIndex !== -1) {
          state.array[targetIndex].status = 'current';
        }
        
        state.description = `Initial search boundaries: left = ${state.leftPointer}, right = ${state.rightPointer}`;
        state.activeIndices = [state.leftPointer, state.rightPointer];
      }
    } else if (currentStage === 2) {
      // Calculate middle element
      if (state.midPoint !== undefined && state.leftPointer !== undefined && state.rightPointer !== undefined) {
        // Mark pointers
        state.array[state.leftPointer].status = 'left';
        state.array[state.rightPointer].status = 'right';
        state.array[state.midPoint].status = 'comparing';
        
        // Keep target highlighted
        if (targetIndex !== -1 && targetIndex !== state.midPoint) {
          state.array[targetIndex].status = 'current';
        }
        
        state.description = `Middle element at index ${state.midPoint} is ${state.array[state.midPoint].value}`;
        state.activeIndices = [state.midPoint];
      }
    } else if (currentStage === 3) {
      // Compare middle with target
      if (state.midPoint !== undefined && state.leftPointer !== undefined && state.rightPointer !== undefined) {
        // Mark pointers
        state.array[state.leftPointer].status = 'left';
        state.array[state.rightPointer].status = 'right';
        state.array[state.midPoint].status = 'comparing';
        
        // Compare and choose direction
        const midValue = state.array[state.midPoint].value;
        
        if (midValue === target) {
          state.array[state.midPoint].status = 'sorted'; // Found
          state.description = `Found target ${target} at index ${state.midPoint}!`;
        } else if (midValue > target) {
          // Search left half
          for (let i = state.leftPointer; i < state.midPoint; i++) {
            state.array[i].status = 'left';
          }
          state.description = `${midValue} > ${target}, search in left half [${state.leftPointer}...${state.midPoint - 1}]`;
          
          // Update right pointer
          state.rightPointer = state.midPoint - 1;
        } else {
          // Search right half
          for (let i = state.midPoint + 1; i <= state.rightPointer; i++) {
            state.array[i].status = 'right';
          }
          state.description = `${midValue} < ${target}, search in right half [${state.midPoint + 1}...${state.rightPointer}]`;
          
          // Update left pointer
          state.leftPointer = state.midPoint + 1;
        }
        
        // Keep target highlighted if it's not the middle
        if (targetIndex !== -1 && targetIndex !== state.midPoint) {
          state.array[targetIndex].status = 'current';
        }
      }
    } else if (currentStage === 4) {
      // Recursive search or completion
      if (state.midPoint !== undefined) {
        const midValue = state.array[state.midPoint].value;
        
        if (midValue === target) {
          // Found the target
          state.array[state.midPoint].status = 'sorted';
          state.description = `Binary search complete. Found ${target} at index ${state.midPoint}`;
        } else if (state.leftPointer !== undefined && state.rightPointer !== undefined) {
          // Calculate new midpoint for next iteration
          const newMid = Math.floor((state.leftPointer + state.rightPointer) / 2);
          
          // Mark the new search area
          for (let i = state.leftPointer; i <= state.rightPointer; i++) {
            state.array[i].status = 'comparing';
          }
          
          // Update midpoint
          state.midPoint = newMid;
          state.array[newMid].status = 'pivot';
          state.description = `Continuing search with new midpoint: ${newMid}`;
        }
      }
    } else if (currentStage === 5) {
      // Final result
      if (targetIndex !== -1) {
        state.array[targetIndex].status = 'sorted';
        state.description = `Binary search complete. Target ${target} found at index ${targetIndex}`;
      } else {
        state.description = `Binary search complete. Target ${target} not found in the array`;
      }
    }
    
    // Update the mid-point if left and right pointers have changed
    if (currentStage > 3 && state.leftPointer !== undefined && state.rightPointer !== undefined) {
      state.midPoint = Math.floor((state.leftPointer + state.rightPointer) / 2);
    }
  },
  
  generateSteps: (array: number[]): string[] => {
    // Ensure array is sorted
    const sortedArray = [...array].sort((a, b) => a - b);
    const target = sortedArray[Math.floor(Math.random() * sortedArray.length)];
    
    return [
      `Searching for ${target} in [${sortedArray.join(', ')}]`,
      `Initial left = 0, right = ${sortedArray.length - 1}`,
      `Middle = ${Math.floor((0 + sortedArray.length - 1) / 2)}, middle element = ${sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)]}`,
      `Comparing middle element ${sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)]} with target ${target}`,
      `Narrowing search range based on comparison`,
      `Found target ${target} at index ${sortedArray.indexOf(target)}`
    ];
  }
};

// Helper function to perform actual binary search (for reference)
export function performBinarySearch(array: number[], target: number): number {
  // Make sure array is sorted
  const sortedArray = [...array].sort((a, b) => a - b);
  let left = 0;
  let right = sortedArray.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (sortedArray[mid] === target) {
      return mid; // Found the target
    } else if (sortedArray[mid] < target) {
      left = mid + 1; // Target is in the right half
    } else {
      right = mid - 1; // Target is in the left half
    }
  }
  
  return -1; // Target not found
}

export default binarySearchVisualizer;
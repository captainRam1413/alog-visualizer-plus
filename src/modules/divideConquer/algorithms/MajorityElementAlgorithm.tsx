import { AlgorithmInfo, AlgorithmVisualizer, ArrayElement, RecursiveCall, VisualizationState } from '../types';
import { createArrayElements, calculateTotalSteps, resetArrayElementStatus } from '../utils';

export const majorityElementInfo: AlgorithmInfo = {
  name: 'Majority Element',
  description: 'Finds the element that appears more than n/2 times in an array of size n using a divide-and-conquer approach.',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)'
  },
  spaceComplexity: 'O(log n)',
  stable: true,
  additionalNotes: 'Also solvable with Boyer-Moore Voting Algorithm in O(n) time and O(1) space',
  pseudocode: `function findMajorityElement(arr, low, high):
    if low == high:
        return arr[low]
    
    mid = (low + high) / 2
    left = findMajorityElement(arr, low, mid)
    right = findMajorityElement(arr, mid + 1, high)
    
    if left == right:
        return left
        
    leftCount = countOccurrences(arr, left, low, high)
    rightCount = countOccurrences(arr, right, low, high)
    
    if leftCount > (high - low + 1) / 2:
        return left
    else if rightCount > (high - low + 1) / 2:
        return right
    else:
        return -1 // No majority element`
};

const majorityElementVisualizer: AlgorithmVisualizer = {
  generateVisualization: (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Create an array with a guaranteed majority element for better visualization
    const enhancedArray = [...array];
    const majorityIndex = Math.floor(Math.random() * array.length);
    const majorityValue = array[majorityIndex];
    
    // Ensure the majority element appears more than n/2 times
    const requiredCount = Math.floor(array.length / 2) + 1;
    let currentCount = array.filter(val => val === majorityValue).length;
    
    while (currentCount < requiredCount) {
      const randomIndex = Math.floor(Math.random() * array.length);
      enhancedArray[randomIndex] = majorityValue;
      currentCount++;
    }
    
    // Initialize elements with normal status
    const initialElements: ArrayElement[] = createArrayElements(enhancedArray);
    
    // Create initial visualization state
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: calculateTotalSteps('majorityElement', enhancedArray.length),
      description: 'Finding majority element using divide and conquer',
      activeIndices: [],
      callStack: []
    };
    
    // Generate recursion tree for majority element algorithm
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: [...enhancedArray],
      level: 0,
      start: 0,
      end: enhancedArray.length - 1,
      status: 'active'
    }];
    
    // Generate tree nodes for recursive divisions
    const generateMajorityTreeNodes = (
      parentId: string,
      array: number[],
      start: number,
      end: number,
      level: number
    ): void => {
      if (start >= end) return;
      
      const mid = Math.floor((start + end) / 2);
      
      // Left subtree
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
      
      // Right subtree
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
      
      // Result node (for combining results)
      recursionTree.push({
        id: `${parentId}-result`,
        parentId,
        array: array.slice(start, end + 1),
        level: level + 0.5,
        start,
        end,
        status: 'waiting'
      });
      
      // Recursive call for left and right
      if (mid - start > 0) {
        generateMajorityTreeNodes(leftId, array, start, mid, level + 1);
      }
      
      if (end - mid > 0) {
        generateMajorityTreeNodes(rightId, array, mid + 1, end, level + 1);
      }
    };
    
    // Generate the tree
    generateMajorityTreeNodes('root', enhancedArray, 0, enhancedArray.length - 1, 0);
    
    return [initialState, recursionTree];
  },
  
  updateVisualizationState: (state: VisualizationState, stage: number): void => {
    const currentStage = stage - 1;
    
    // Reset all statuses
    resetArrayElementStatus(state.array);
    
    if (currentStage === 0) {
      // Initial array display
      state.description = `Initial array: [${state.array.map(el => el.value).join(', ')}]`;
    } else if (currentStage === 1) {
      // Dividing array
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
      // Processing left or right half
      const side = currentStage === 2 ? 'left' : 'right';
      const mid = Math.floor(state.array.length / 2);
      const start = side === 'left' ? 0 : mid;
      const end = side === 'left' ? mid : state.array.length;
      
      for (let i = start; i < end; i++) {
        state.array[i].status = side === 'left' ? 'left' : 'right';
      }
      
      state.description = `Finding majority element in ${side} half: [${state.array.slice(start, end).map(el => el.value).join(', ')}]`;
      
      // Update active call in the callstack
      const activeCall = state.callStack.find(call => 
        call.level === 1 && call.id.includes(side)
      );
      if (activeCall) {
        activeCall.status = 'active';
      }
    } else if (currentStage === 4) {
      // Counting candidates from both halves
      // Find the most frequent element in each half
      const mid = Math.floor(state.array.length / 2);
      const leftHalf = state.array.slice(0, mid).map(el => el.value);
      const rightHalf = state.array.slice(mid).map(el => el.value);
      
      // Count occurrences in left half
      const leftCounts: Record<number, number> = {};
      leftHalf.forEach(val => {
        leftCounts[val] = (leftCounts[val] || 0) + 1;
      });
      
      // Count occurrences in right half
      const rightCounts: Record<number, number> = {};
      rightHalf.forEach(val => {
        rightCounts[val] = (rightCounts[val] || 0) + 1;
      });
      
      // Find most frequent element in each half
      let leftCandidate = leftHalf[0];
      let rightCandidate = rightHalf[0];
      
      for (const [val, count] of Object.entries(leftCounts)) {
        if (count > (leftCounts[leftCandidate] || 0)) {
          leftCandidate = Number(val);
        }
      }
      
      for (const [val, count] of Object.entries(rightCounts)) {
        if (count > (rightCounts[rightCandidate] || 0)) {
          rightCandidate = Number(val);
        }
      }
      
      // Highlight the candidates
      for (let i = 0; i < state.array.length; i++) {
        if (state.array[i].value === leftCandidate && i < mid) {
          state.array[i].status = 'comparing';
        } else if (state.array[i].value === rightCandidate && i >= mid) {
          state.array[i].status = 'comparing';
        }
      }
      
      state.description = `Candidates: ${leftCandidate} from left half, ${rightCandidate} from right half`;
    } else if (currentStage === 5) {
      // Determining final majority element
      const counts: Record<number, number> = {};
      state.array.forEach(el => {
        counts[el.value] = (counts[el.value] || 0) + 1;
      });
      
      // Find the majority element (if it exists)
      let majorityElement: number | null = null;
      let maxCount = 0;
      
      for (const [value, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          majorityElement = parseInt(value);
        }
      }
      
      // Check if it's a true majority (> n/2)
      if (maxCount > state.array.length / 2) {
        // Mark all instances of the majority element
        for (let i = 0; i < state.array.length; i++) {
          if (state.array[i].value === majorityElement) {
            state.array[i].status = 'sorted';
          }
        }
        
        state.description = `Found majority element: ${majorityElement} (appears ${maxCount} times out of ${state.array.length})`;
      } else {
        state.description = "No majority element found";
      }
    }
  },
  
  generateSteps: (array: number[]): string[] => {
    // Ensure we have a majority element for the steps
    const enhancedArray = [...array];
    const majorityValue = array[Math.floor(Math.random() * array.length)];
    
    // Ensure the majority element appears more than n/2 times
    const requiredCount = Math.floor(array.length / 2) + 1;
    let currentCount = array.filter(val => val === majorityValue).length;
    
    while (currentCount < requiredCount) {
      const randomIndex = Math.floor(Math.random() * array.length);
      enhancedArray[randomIndex] = majorityValue;
      currentCount++;
    }
    
    return [
      `Initial array: [${enhancedArray.join(', ')}]`,
      `Dividing array into two halves for Majority Element algorithm`,
      `Finding majority element in left half...`,
      `Finding majority element in right half...`,
      `Counting occurrences of candidates from both halves...`,
      `Determining if a majority element exists...`
    ];
  }
};

// Helper function to find the majority element (for reference)
export function findMajorityElement(array: number[]): number | null {
  // Base case
  if (array.length === 1) {
    return array[0];
  }
  
  const mid = Math.floor(array.length / 2);
  const left = findMajorityElement(array.slice(0, mid));
  const right = findMajorityElement(array.slice(mid));
  
  if (left === right) {
    return left;
  }
  
  const leftCount = array.filter(item => item === left).length;
  const rightCount = array.filter(item => item === right).length;
  
  if (leftCount > array.length / 2) {
    return left;
  } else if (rightCount > array.length / 2) {
    return right;
  } else {
    return null;
  }
}

export default majorityElementVisualizer;
import { ArrayElement, VisualizationState } from './types';

/**
 * Create array elements with initial 'normal' state
 */
export function createArrayElements(array: number[]): ArrayElement[] {
  return array.map(value => ({ value, status: 'normal' }));
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Clone a visualization state to avoid mutation
 */
export function cloneVisualizationState(state: VisualizationState): VisualizationState {
  return {
    ...state,
    array: state.array.map(el => ({ ...el })),
    activeIndices: [...state.activeIndices],
    callStack: state.callStack.map(call => ({
      ...call,
      array: [...call.array],
      leftArray: call.leftArray ? [...call.leftArray] : undefined,
      rightArray: call.rightArray ? [...call.rightArray] : undefined,
      result: call.result ? [...call.result] : undefined
    }))
  };
}

/**
 * Update the status of specific indices in an array
 */
export function updateArrayElementStatus(
  array: ArrayElement[],
  indices: number[],
  status: ArrayElement['status']
): void {
  indices.forEach(index => {
    if (index >= 0 && index < array.length) {
      array[index].status = status;
    }
  });
}

/**
 * Reset all array elements to 'normal' status
 */
export function resetArrayElementStatus(array: ArrayElement[]): void {
  array.forEach(el => el.status = 'normal');
}

/**
 * Calculate approximate number of steps for common algorithms
 */
export function calculateTotalSteps(algorithm: string, arrayLength: number): number {
  switch (algorithm) {
    case 'mergeSort':
    case 'quickSort':
      // Approximation: n log n operations 
      return Math.ceil(arrayLength * Math.log2(arrayLength)) * 2;
    case 'binarySearch':
      // Log n steps + some extra for initial setup and conclusion
      return Math.ceil(Math.log2(arrayLength)) + 2;
    case 'majorityElement':
      // Divide and count operations
      return Math.ceil(Math.log2(arrayLength)) + arrayLength;
    case 'countInversions':
      // Similar to merge sort
      return Math.ceil(arrayLength * Math.log2(arrayLength)) * 2;
    case 'strassenMatrix':
      // 7 recursive multiplications per level
      return Math.ceil(Math.log2(arrayLength)) * 7 + 1;
    default:
      // Default approximation
      return arrayLength * 2;
  }
}

/**
 * Generate a random array with properties suitable for specific algorithms
 */
export function generateRandomArray(algorithm: string, size: number = 10): number[] {
  switch (algorithm) {
    case 'binarySearch':
      // Generate sorted array for binary search
      return Array.from({ length: size }, (_, i) => i * 2 + Math.floor(Math.random() * 2)).sort((a, b) => a - b);
    case 'quickSort':
      // For quick sort, more values might show partitioning better
      return Array.from({ length: Math.max(size, 8) }, () => Math.floor(Math.random() * 100));
    case 'mergeSort':
      // For merge sort, even number might demonstrate merging better
      return Array.from({ length: Math.max(size, 8) }, () => Math.floor(Math.random() * 100));
    case 'majorityElement':
      // For majority element, ensure there is a majority element
      const baseArray = Array.from({ length: size }, () => Math.floor(Math.random() * 10));
      const majorityValue = baseArray[Math.floor(Math.random() * baseArray.length)];
      const requiredCount = Math.floor(size / 2) + 1;
      let currentCount = baseArray.filter(v => v === majorityValue).length;
      
      while (currentCount < requiredCount) {
        const randomIndex = Math.floor(Math.random() * size);
        baseArray[randomIndex] = majorityValue;
        currentCount++;
      }
      
      return baseArray;
    case 'strassenMatrix':
      // For Strassen's, generate square matrices
      const matrixSize = Math.pow(2, Math.floor(Math.log2(Math.sqrt(size))));
      return Array.from({ length: matrixSize * matrixSize }, () => Math.floor(Math.random() * 10));
    default:
      return Array.from({ length: size }, () => Math.floor(Math.random() * 100));
  }
}
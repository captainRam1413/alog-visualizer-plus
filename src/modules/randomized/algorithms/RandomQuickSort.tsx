import { QuickSortState, VisualizationState } from '../types';
import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

// Run the randomized quicksort algorithm and generate visualization steps
export function runRandomQuickSort(arraySize: number): VisualizationState {
  const startTime = performance.now();
  
  // Generate a random array
  const array = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
  const steps: VisualizationState['steps'] = [];
  const stats = {
    comparisons: 0,
    swaps: 0,
    randomCalls: 0,
    timeElapsed: 0
  };
  
  // Initial state
  steps.push({
    description: "Starting with an unsorted array",
    dataState: {
      array: [...array],
      pivotIndex: -1,
    } as QuickSortState
  });
  
  // Run the algorithm and capture steps
  quickSortWithSteps(array, 0, array.length - 1, steps, stats);
  
  // Final state
  steps.push({
    description: "Array is now sorted",
    dataState: {
      array: [...array],
      pivotIndex: -1,
      isSorted: Array(array.length).fill(true)
    } as QuickSortState
  });
  
  // Calculate time taken
  stats.timeElapsed = performance.now() - startTime;
  
  return {
    steps,
    stats
  };
}

// Function to perform quicksort and capture intermediate steps
function quickSortWithSteps(
  array: number[], 
  start: number, 
  end: number, 
  steps: VisualizationState['steps'], 
  stats: VisualizationState['stats']
): void {
  if (start >= end) return;
  
  // Choose a random pivot
  const randomPivotIndex = Math.floor(Math.random() * (end - start + 1)) + start;
  stats.randomCalls++;
  
  steps.push({
    description: `Randomly selected pivot index ${randomPivotIndex} with value ${array[randomPivotIndex]}`,
    dataState: {
      array: [...array],
      pivotIndex: randomPivotIndex,
      partitionRange: [start, end]
    } as QuickSortState
  });
  
  // Swap the pivot with the end
  [array[randomPivotIndex], array[end]] = [array[end], array[randomPivotIndex]];
  stats.swaps++;
  
  steps.push({
    description: `Swapped pivot with the end of the current partition`,
    dataState: {
      array: [...array],
      pivotIndex: end,
      partitionRange: [start, end]
    } as QuickSortState
  });
  
  // Partition the array
  const pivotIndex = partition(array, start, end, steps, stats);
  
  // Recursively sort the subarrays
  quickSortWithSteps(array, start, pivotIndex - 1, steps, stats);
  quickSortWithSteps(array, pivotIndex + 1, end, steps, stats);
}

// Function to partition the array around a pivot
function partition(
  array: number[], 
  start: number, 
  end: number, 
  steps: VisualizationState['steps'], 
  stats: VisualizationState['stats']
): number {
  const pivotValue = array[end];
  let pivotIndex = start;
  
  for (let i = start; i < end; i++) {
    stats.comparisons++;
    
    steps.push({
      description: `Comparing element ${array[i]} with pivot ${pivotValue}`,
      dataState: {
        array: [...array],
        pivotIndex: end,
        leftPointer: i,
        rightPointer: pivotIndex,
        partitionRange: [start, end]
      } as QuickSortState
    });
    
    if (array[i] <= pivotValue) {
      // Swap elements
      [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
      stats.swaps++;
      
      steps.push({
        description: `Element ${array[pivotIndex]} is less than or equal to pivot, swapping with ${array[i]} and incrementing pivot index`,
        dataState: {
          array: [...array],
          pivotIndex: end,
          leftPointer: i,
          rightPointer: pivotIndex,
          partitionRange: [start, end]
        } as QuickSortState
      });
      
      pivotIndex++;
    }
  }
  
  // Move pivot to its final position
  [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
  stats.swaps++;
  
  steps.push({
    description: `Placed pivot ${pivotValue} in its correct sorted position at index ${pivotIndex}`,
    dataState: {
      array: [...array],
      pivotIndex: pivotIndex,
      partitionRange: [start, end]
    } as QuickSortState
  });
  
  return pivotIndex;
}

// Component to show algorithm description
export function RandomQuickSortDescription() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Randomized QuickSort
      </Typography>
      
      <Typography variant="body1" paragraph>
        Randomized QuickSort is a variation of the classic QuickSort algorithm that 
        selects a random pivot instead of a fixed one (like the first or last element). 
        This random selection makes the worst-case scenario extremely unlikely, effectively 
        avoiding the O(n²) performance on already-sorted or nearly-sorted arrays.
      </Typography>
      
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Algorithm Steps:
        </Typography>
        <Typography component="ol" sx={{ pl: 2 }}>
          <li>Choose a random pivot element from the array</li>
          <li>Partition the array into two subarrays: elements less than the pivot and elements greater than the pivot</li>
          <li>Recursively apply the above steps to the two subarrays</li>
        </Typography>
      </Paper>
      
      <Typography variant="subtitle1" gutterBottom>
        Time Complexity:
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Average Case: O(n log n)
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Worst Case: O(n²) but extremely unlikely due to randomization
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Space Complexity:
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • O(log n) for the recursive call stack
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Key Features:
      </Typography>
      <Typography variant="body2" paragraph>
        Randomized QuickSort is a Las Vegas algorithm - it always produces the correct result, 
        but its running time is a random variable. The randomized pivot selection provides 
        probabilistic guarantees against consistently encountering the worst-case scenario, 
        making it reliable for practical use.
      </Typography>
    </Box>
  );
}

// Export the source code for visualization
export const RandomQuickSortCode = `
function randomizedQuickSort(array, start, end) {
  if (start >= end) return;
  
  // Choose a random pivot
  const randomPivotIndex = Math.floor(Math.random() * (end - start + 1)) + start;
  
  // Swap the pivot with the end
  [array[randomPivotIndex], array[end]] = [array[end], array[randomPivotIndex]];
  
  // Partition the array and get the pivot's final position
  const pivotIndex = partition(array, start, end);
  
  // Recursively sort the subarrays
  randomizedQuickSort(array, start, pivotIndex - 1);
  randomizedQuickSort(array, pivotIndex + 1, end);
}

function partition(array, start, end) {
  const pivotValue = array[end];
  let pivotIndex = start;
  
  for (let i = start; i < end; i++) {
    if (array[i] <= pivotValue) {
      // Swap elements
      [array[i], array[pivotIndex]] = [array[pivotIndex], array[i]];
      pivotIndex++;
    }
  }
  
  // Move pivot to its final position
  [array[pivotIndex], array[end]] = [array[end], array[pivotIndex]];
  
  return pivotIndex;
}
`;
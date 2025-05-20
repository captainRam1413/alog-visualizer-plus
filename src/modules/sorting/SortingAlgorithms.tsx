import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Stack,
  SelectChangeEvent,
  Tabs,
  Tab,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

// Type definitions for sorting states
interface ArrayElement {
  value: number;
  state: 'default' | 'comparing' | 'sorted' | 'current' | 'pivot';
}

// Type for animation frames
interface AnimationFrame {
  array: ArrayElement[];
  comparisons: number;
  swaps: number;
  description: string;
  highlightedLines: number[];
  variables: Record<string, any>;
}

// Sorting algorithms code as strings to display
const algorithmCodes = {
  quickSort: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partition the array and get pivot index
    const pivotIndex = partition(arr, low, high);
    
    // Recursively sort elements before and after pivot
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  // Choose the rightmost element as pivot
  const pivot = arr[high];
  
  // Index of smaller element
  let i = low - 1;
  
  // Traverse through all elements
  // compare each element with pivot
  for (let j = low; j < high; j++) {
    // If current element is smaller than the pivot
    if (arr[j] < pivot) {
      // Increment index of smaller element
      i++;
      // Swap elements
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Swap pivot element with element at i+1
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  
  // Return the position where partition is done
  return i + 1;
}`,

  mergeSort: `function mergeSort(arr) {
  // Base case
  if (arr.length <= 1) return arr;
  
  // Split array into halves
  const mid = Math.floor(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);
  
  // Recursively sort both halves
  return merge(
    mergeSort(left),
    mergeSort(right)
  );
}

function merge(left, right) {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  // Compare elements from both arrays and merge
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }
  
  // Add remaining elements
  return result
    .concat(left.slice(leftIndex))
    .concat(right.slice(rightIndex));
}`,

  heapSort: `function heapSort(arr) {
  const n = arr.length;
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  
  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    [arr[0], arr[i]] = [arr[i], arr[0]];
    
    // Call heapify on the reduced heap
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  
  // If left child is larger than root
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }
  
  // If right child is larger than largest so far
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }
  
  // If largest is not root
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    
    // Recursively heapify the affected subtree
    heapify(arr, n, largest);
  }
}`,

  bubbleSort: `function bubbleSort(arr) {
  const n = arr.length;
  let swapped;
  
  do {
    swapped = false;
    
    // Last i elements are already in place
    for (let j = 0; j < n - 1; j++) {
      // Compare adjacent elements
      if (arr[j] > arr[j + 1]) {
        // Swap if they are in wrong order
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
  } while (swapped); // Continue until no more swaps
  
  return arr;
}`,

  insertionSort: `function insertionSort(arr) {
  const n = arr.length;
  
  // Start from the second element
  for (let i = 1; i < n; i++) {
    // Element to be compared
    let current = arr[i];
    
    // Compare with elements before current
    let j = i - 1;
    while (j >= 0 && arr[j] > current) {
      // Move elements that are greater than current
      // to one position ahead of their current position
      arr[j + 1] = arr[j];
      j--;
    }
    
    // Place current in its correct position
    arr[j + 1] = current;
  }
  
  return arr;
}`,

  selectionSort: `function selectionSort(arr) {
  const n = arr.length;
  
  // Traverse through all array elements
  for (let i = 0; i < n - 1; i++) {
    // Find the minimum element in the unsorted part
    let minIndex = i;
    
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    
    // Swap the found minimum element with the first element
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  
  return arr;
}`
};

export default function SortingAlgorithms() {
  const [algorithm, setAlgorithm] = useState('bubbleSort');
  const [arraySize, setArraySize] = useState(15); // Reduced default size for better visualization
  const [speed, setSpeed] = useState(50);
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [currentFrame, setCurrentFrame] = useState<AnimationFrame | null>(null);
  const [animationFrames, setAnimationFrames] = useState<AnimationFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  
  const animationIdRef = useRef<number | null>(null);
  
  // Generate a new random array when component mounts or array size changes
  useEffect(() => {
    generateNewArray();
  }, [arraySize]);

  // Function to generate a new random array
  const generateNewArray = () => {
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 80) + 10, // Random values between 10 and 89
        state: 'default'
      });
    }
    setArray(newArray);
    setCurrentFrame(null);
    setAnimationFrames([]);
    setCurrentFrameIndex(0);
    setComparisons(0);
    setSwaps(0);
  };

  // Function to handle algorithm change
  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setAlgorithm(event.target.value);
    resetArray(); // Reset the array when changing algorithm
  };

  // Function to handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Function to generate animation frames based on the selected algorithm
  const generateAnimationFrames = () => {
    // Convert array elements to plain numbers for sorting algorithms
    const values = array.map(item => item.value);
    const frames: AnimationFrame[] = [];
    
    // Initialize variables to track algorithm progress
    let comparisonsCount = 0;
    let swapsCount = 0;
    
    // Add initial state as first frame
    frames.push({
      array: array.map(item => ({...item})),
      comparisons: comparisonsCount,
      swaps: swapsCount,
      description: `Starting ${algorithm} with array of ${arraySize} elements`,
      highlightedLines: [],
      variables: {}
    });
    
    if (algorithm === 'bubbleSort') {
      // Bubble Sort Algorithm with animation frames
      const n = values.length;
      let swapped;
      
      do {
        swapped = false;
        for (let j = 0; j < n - 1; j++) {
          // Create a frame showing comparison
          const comparisonFrame = array.map((item, idx) => ({
            value: item.value,
            state: idx === j || idx === j + 1 ? 'comparing' : 
                  idx >= n - frames.length / (n - 1) ? 'sorted' : 'default'
          } as ArrayElement));
          frames.push({
            array: comparisonFrame,
            comparisons: ++comparisonsCount,
            swaps: swapsCount,
            description: `Comparing values at positions ${j} (${values[j]}) and ${j+1} (${values[j+1]})`,
            highlightedLines: [9, 10],
            variables: { j, "arr[j]": values[j], "arr[j+1]": values[j+1] }
          });
          
          if (values[j] > values[j + 1]) {
            // Create a frame showing swap
            [values[j], values[j + 1]] = [values[j + 1], values[j]];
            swapped = true;
            
            const swapFrame = array.map((item, idx) => ({
              value: idx === j ? values[j] : idx === j + 1 ? values[j + 1] : item.value,
              state: idx === j || idx === j + 1 ? 'current' : 
                    idx >= n - frames.length / (n - 1) ? 'sorted' : 'default'
            } as ArrayElement));
            frames.push({
              array: swapFrame,
              comparisons: comparisonsCount,
              swaps: ++swapsCount,
              description: `Swapping ${values[j+1]} and ${values[j]} as they are in wrong order`,
              highlightedLines: [12, 13, 14],
              variables: { j, swapped: true, "arr[j]": values[j], "arr[j+1]": values[j+1] }
            });
          }
        }
        
        // Mark the last element in this pass as sorted
        const passFrame = array.map((item, idx) => ({
          value: values[idx],
          state: idx >= n - frames.length / (n + 2) ? 'sorted' : 'default'
        } as ArrayElement));
        frames.push({
          array: passFrame,
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Pass completed, largest element moved to end`,
          highlightedLines: [17],
          variables: { swapped }
        });
        
      } while (swapped);
    } 
    else if (algorithm === 'selectionSort') {
      // Selection Sort Algorithm with animation frames
      const n = values.length;
      
      for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        // Frame showing current minimum
        frames.push({
          array: array.map((item, idx) => ({
            value: values[idx],
            state: idx < i ? 'sorted' : idx === minIndex ? 'current' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Starting pass ${i+1}. Current minimum at position ${minIndex} with value ${values[minIndex]}`,
          highlightedLines: [6, 7],
          variables: { i, minIndex, "arr[minIndex]": values[minIndex] }
        });
        
        for (let j = i + 1; j < n; j++) {
          // Frame showing comparison
          frames.push({
            array: array.map((item, idx) => ({
              value: values[idx],
              state: idx < i ? 'sorted' : idx === j ? 'comparing' : idx === minIndex ? 'current' : 'default'
            } as ArrayElement)),
            comparisons: ++comparisonsCount,
            swaps: swapsCount,
            description: `Comparing current minimum (${values[minIndex]}) with value at position ${j} (${values[j]})`,
            highlightedLines: [9, 10, 11],
            variables: { i, j, minIndex, "arr[j]": values[j], "arr[minIndex]": values[minIndex] }
          });
          
          if (values[j] < values[minIndex]) {
            minIndex = j;
            // Frame showing new minimum
            frames.push({
              array: array.map((item, idx) => ({
                value: values[idx],
                state: idx < i ? 'sorted' : idx === minIndex ? 'current' : 'default'
              } as ArrayElement)),
              comparisons: comparisonsCount,
              swaps: swapsCount,
              description: `New minimum found at position ${minIndex} with value ${values[minIndex]}`,
              highlightedLines: [10, 11],
              variables: { i, j, minIndex, "arr[minIndex]": values[minIndex] }
            });
          }
        }
        
        // Frame showing swap if needed
        if (minIndex !== i) {
          [values[i], values[minIndex]] = [values[minIndex], values[i]];
          frames.push({
            array: array.map((item, idx) => ({
              value: values[idx],
              state: idx === i || idx === minIndex ? 'current' : idx < i ? 'sorted' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: ++swapsCount,
            description: `Swapping elements at positions ${i} and ${minIndex}`,
            highlightedLines: [17, 18],
            variables: { i, minIndex, "arr[i]": values[i], "arr[minIndex]": values[minIndex] }
          });
        }
        
        // Frame showing sorted element
        frames.push({
          array: array.map((item, idx) => ({
            value: values[idx],
            state: idx <= i ? 'sorted' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Element at position ${i} is now sorted`,
          highlightedLines: [20],
          variables: { i }
        });
      }
      
      // Mark all elements as sorted in the final frame
      frames.push({
        array: array.map((item, idx) => ({
          value: values[idx],
          state: 'sorted'
        } as ArrayElement)),
        comparisons: comparisonsCount,
        swaps: swapsCount,
        description: `Sorting completed`,
        highlightedLines: [24],
        variables: {}
      });
    }
    else if (algorithm === 'insertionSort') {
      // Insertion Sort Algorithm with animation frames
      const n = values.length;
      
      // Mark the first element as sorted
      frames.push({
        array: array.map((item, idx) => ({
          value: values[idx],
          state: idx === 0 ? 'sorted' : 'default'
        } as ArrayElement)),
        comparisons: comparisonsCount,
        swaps: swapsCount,
        description: `Starting with first element (${values[0]}) as sorted`,
        highlightedLines: [4],
        variables: { "First element": values[0] }
      });
      
      for (let i = 1; i < n; i++) {
        let current = values[i];
        
        // Frame showing current element to be inserted
        frames.push({
          array: array.map((item, idx) => ({
            value: values[idx],
            state: idx < i ? 'sorted' : idx === i ? 'current' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Inserting element ${current} at position ${i} into sorted array`,
          highlightedLines: [7],
          variables: { i, current }
        });
        
        let j = i - 1;
        while (j >= 0 && values[j] > current) {
          // Frame showing comparison
          frames.push({
            array: array.map((item, idx) => ({
              value: values[idx],
              state: idx === j ? 'comparing' : idx < i && idx !== j ? 'sorted' : idx === i ? 'current' : 'default'
            } as ArrayElement)),
            comparisons: ++comparisonsCount,
            swaps: swapsCount,
            description: `Comparing ${current} with ${values[j]} at position ${j}`,
            highlightedLines: [11, 12],
            variables: { i, j, current, "arr[j]": values[j] }
          });
          
          // Shift element to the right
          values[j + 1] = values[j];
          
          // Frame showing shift
          frames.push({
            array: array.map((item, idx) => ({
              value: idx === j + 1 ? values[j] : values[idx],
              state: idx === j + 1 ? 'current' : idx < j ? 'sorted' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: ++swapsCount,
            description: `Shifting ${values[j]} one position to the right`,
            highlightedLines: [14, 15],
            variables: { i, j, current, "arr[j+1]": values[j] }
          });
          j--;
        }
        
        // Place current element in its correct position
        values[j + 1] = current;
        
        // Frame showing insertion
        frames.push({
          array: array.map((item, idx) => ({
            value: values[idx],
            state: idx <= i ? 'sorted' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Placed ${current} at position ${j + 1}`,
          highlightedLines: [19],
          variables: { i, j: j+1, current, "arr[j+1]": current }
        });
      }
      
      // Final frame
      frames.push({
        array: array.map((item, idx) => ({
          value: values[idx],
          state: 'sorted'
        } as ArrayElement)),
        comparisons: comparisonsCount,
        swaps: swapsCount,
        description: `Sorting completed`,
        highlightedLines: [23],
        variables: {}
      });
    }
    else if (algorithm === 'mergeSort') {
      // Merge Sort implementation with animation frames
      const auxiliaryArray = [...values];
      const tempFrames: AnimationFrame[] = [];
      
      const mergeSortHelper = (
        mainArray: number[], 
        auxArray: number[], 
        startIdx: number, 
        endIdx: number,
        depth: number = 0
      ) => {
        if (startIdx === endIdx) return;
        
        const middleIdx = Math.floor((startIdx + endIdx) / 2);
        
        // Show array division
        tempFrames.push({
          array: array.map((item, idx) => ({
            value: mainArray[idx],
            state: idx >= startIdx && idx <= middleIdx ? 'current' : 
                  idx > middleIdx && idx <= endIdx ? 'comparing' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Dividing array from index ${startIdx} to ${endIdx} into left(${startIdx}-${middleIdx}) and right(${middleIdx+1}-${endIdx})`,
          highlightedLines: [8, 9],
          variables: { startIdx, middleIdx, endIdx }
        });
        
        // Sort left half
        mergeSortHelper(auxArray, mainArray, startIdx, middleIdx, depth + 1);
        
        // Sort right half
        mergeSortHelper(auxArray, mainArray, middleIdx + 1, endIdx, depth + 1);
        
        // Merge the two halves
        let k = startIdx;
        let i = startIdx;
        let j = middleIdx + 1;
        
        // Show merging starts
        tempFrames.push({
          array: array.map((item, idx) => ({
            value: mainArray[idx],
            state: idx >= startIdx && idx <= endIdx ? 'comparing' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Merging subarrays from index ${startIdx} to ${middleIdx} and ${middleIdx+1} to ${endIdx}`,
          highlightedLines: [19, 20, 21],
          variables: { startIdx, middleIdx, endIdx, k, i, j }
        });
        
        while (i <= middleIdx && j <= endIdx) {
          // Compare elements from left and right subarrays
          comparisonsCount++;
          
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: mainArray[idx],
              state: idx === i ? 'current' : 
                    idx === j ? 'pivot' : 
                    idx >= startIdx && idx <= endIdx ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Comparing elements: ${auxArray[i]} at index ${i} and ${auxArray[j]} at index ${j}`,
            highlightedLines: [24, 25, 26],
            variables: { i, j, "auxArray[i]": auxArray[i], "auxArray[j]": auxArray[j] }
          });
          
          if (auxArray[i] <= auxArray[j]) {
            // If element from left subarray is smaller
            mainArray[k] = auxArray[i];
            
            tempFrames.push({
              array: array.map((item, idx) => ({
                value: idx === k ? auxArray[i] : mainArray[idx],
                state: idx === k ? 'current' : 
                      idx === i ? 'comparing' : 
                      idx >= startIdx && idx <= endIdx ? 'default' : 'default'
              } as ArrayElement)),
              comparisons: comparisonsCount,
              swaps: ++swapsCount,
              description: `Taking element ${auxArray[i]} from left subarray and placing at index ${k}`,
              highlightedLines: [27, 28],
              variables: { i, j, k, "auxArray[i]": auxArray[i], "mainArray[k]": auxArray[i] }
            });
            
            i++;
          } else {
            // If element from right subarray is smaller
            mainArray[k] = auxArray[j];
            
            tempFrames.push({
              array: array.map((item, idx) => ({
                value: idx === k ? auxArray[j] : mainArray[idx],
                state: idx === k ? 'current' : 
                      idx === j ? 'comparing' : 
                      idx >= startIdx && idx <= endIdx ? 'default' : 'default'
              } as ArrayElement)),
              comparisons: comparisonsCount,
              swaps: ++swapsCount,
              description: `Taking element ${auxArray[j]} from right subarray and placing at index ${k}`,
              highlightedLines: [31, 32],
              variables: { i, j, k, "auxArray[j]": auxArray[j], "mainArray[k]": auxArray[j] }
            });
            
            j++;
          }
          k++;
        }
        
        // Copy remaining elements from left subarray if any
        while (i <= middleIdx) {
          mainArray[k] = auxArray[i];
          
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: idx === k ? auxArray[i] : mainArray[idx],
              state: idx === k ? 'current' : 
                    idx === i ? 'comparing' : 
                    idx >= startIdx && idx <= endIdx ? 'default' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: ++swapsCount,
            description: `Copying remaining element ${auxArray[i]} from left subarray to index ${k}`,
            highlightedLines: [39, 40],
            variables: { i, k, "auxArray[i]": auxArray[i], "mainArray[k]": auxArray[i] }
          });
          
          i++;
          k++;
        }
        
        // Copy remaining elements from right subarray if any
        while (j <= endIdx) {
          mainArray[k] = auxArray[j];
          
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: idx === k ? auxArray[j] : mainArray[idx],
              state: idx === k ? 'current' : 
                    idx === j ? 'comparing' : 
                    idx >= startIdx && idx <= endIdx ? 'default' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: ++swapsCount,
            description: `Copying remaining element ${auxArray[j]} from right subarray to index ${k}`,
            highlightedLines: [43, 44],
            variables: { j, k, "auxArray[j]": auxArray[j], "mainArray[k]": auxArray[j] }
          });
          
          j++;
          k++;
        }
        
        // Show the merged subarray as sorted
        if (depth === 0) { // Only mark as sorted for the final merge
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: mainArray[idx],
              state: 'sorted'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Merge sort completed`,
            highlightedLines: [47],
            variables: {}
          });
        } else {
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: mainArray[idx],
              state: idx >= startIdx && idx <= endIdx ? 'current' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Merged subarray from ${startIdx} to ${endIdx}`,
            highlightedLines: [47],
            variables: { startIdx, endIdx }
          });
        }
      };
      
      // Initialize the mergeSort process
      mergeSortHelper(values, auxiliaryArray, 0, values.length - 1);
      
      // Add all generated frames to the main frames array
      frames.push(...tempFrames);
    }
    else if (algorithm === 'quickSort') {
      // Quick Sort implementation with animation frames
      const tempFrames: AnimationFrame[] = [];
      
      const quickSortHelper = (arr: number[], low: number, high: number) => {
        if (low < high) {
          // Show current subarray to be sorted
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx >= low && idx <= high ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Sorting subarray from index ${low} to ${high}`,
            highlightedLines: [1, 2],
            variables: { low, high }
          });
          
          // Choose pivot
          const pivotValue = arr[high];
          
          // Show pivot selection
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx === high ? 'pivot' : 
                    idx >= low && idx < high ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Selected pivot ${pivotValue} at index ${high}`,
            highlightedLines: [5, 6],
            variables: { low, high, pivot: pivotValue }
          });
          
          // Partition the array
          let i = low - 1;
          
          for (let j = low; j < high; j++) {
            // Show current element being compared
            tempFrames.push({
              array: array.map((item, idx) => ({
                value: arr[idx],
                state: idx === j ? 'current' : 
                      idx === high ? 'pivot' :
                      idx >= low && idx <= high ? 'comparing' : 'default'
              } as ArrayElement)),
              comparisons: ++comparisonsCount,
              swaps: swapsCount,
              description: `Comparing element ${arr[j]} at index ${j} with pivot ${pivotValue}`,
              highlightedLines: [11, 12, 13],
              variables: { i, j, pivot: pivotValue, "arr[j]": arr[j] }
            });
            
            if (arr[j] < pivotValue) {
              i++;
              
              // Show swapping elements if needed
              if (i !== j) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                
                tempFrames.push({
                  array: array.map((item, idx) => ({
                    value: arr[idx],
                    state: idx === i || idx === j ? 'current' : 
                          idx === high ? 'pivot' :
                          idx >= low && idx <= high ? 'comparing' : 'default'
                  } as ArrayElement)),
                  comparisons: comparisonsCount,
                  swaps: ++swapsCount,
                  description: `Swapping elements: ${arr[i]} at index ${i} and ${arr[j]} at index ${j}`,
                  highlightedLines: [15, 16],
                  variables: { i, j, pivot: pivotValue, "arr[i]": arr[i], "arr[j]": arr[j] }
                });
              } else {
                // Even if no swap is needed, we still move i
                tempFrames.push({
                  array: array.map((item, idx) => ({
                    value: arr[idx],
                    state: idx === i ? 'current' : 
                          idx === high ? 'pivot' :
                          idx >= low && idx <= high ? 'comparing' : 'default'
                  } as ArrayElement)),
                  comparisons: comparisonsCount,
                  swaps: swapsCount,
                  description: `Element ${arr[i]} at index ${i} is already in correct position relative to pivot`,
                  highlightedLines: [15],
                  variables: { i, j, pivot: pivotValue, "arr[i]": arr[i] }
                });
              }
            }
          }
          
          // Place pivot in its correct position
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx === i + 1 ? 'pivot' : 
                    idx === high ? 'current' :
                    idx >= low && idx <= high ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: ++swapsCount,
            description: `Placing pivot ${pivotValue} at its correct position (index ${i + 1})`,
            highlightedLines: [17, 18],
            variables: { i, pivotIndex: i + 1, high, "arr[pivotIndex]": arr[i + 1] }
          });
          
          const pivotIndex = i + 1;
          
          // Mark pivot as correctly positioned
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx === pivotIndex ? 'sorted' : 
                    idx >= low && idx <= high ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Pivot ${arr[pivotIndex]} is now in its final sorted position at index ${pivotIndex}`,
            highlightedLines: [20, 21],
            variables: { low, high, pivotIndex, "arr[pivotIndex]": arr[pivotIndex] }
          });
          
          // Recursively sort elements before and after pivot
          quickSortHelper(arr, low, pivotIndex - 1);
          quickSortHelper(arr, pivotIndex + 1, high);
        }
        
        // When this subarray is sorted
        if (low === 0 && high === arr.length - 1) {
          // Final sorted array
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: 'sorted'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: swapsCount,
            description: `Quick sort completed`,
            highlightedLines: [23],
            variables: {}
          });
        }
      };
      
      // Clone the array for sorting
      const arrCopy = [...values];
      
      // Start the quick sort process
      quickSortHelper(arrCopy, 0, arrCopy.length - 1);
      
      // Add all frames to the main frames array
      frames.push(...tempFrames);
    }
    else if (algorithm === 'heapSort') {
      // Heap Sort implementation with animation frames
      const tempFrames: AnimationFrame[] = [];
      const arrCopy = [...values];
      
      // Build max heap
      const heapify = (arr: number[], n: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        // Show the current node and its children
        tempFrames.push({
          array: array.map((item, idx) => ({
            value: arr[idx],
            state: idx === i ? 'current' : 
                  (left < n && idx === left) || (right < n && idx === right) ? 'comparing' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Heapifying at index ${i} with value ${arr[i]}`,
          highlightedLines: [7, 8, 9],
          variables: { i, left, right, largest, "arr[i]": arr[i] }
        });
        
        // If left child is larger than root
        if (left < n) {
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx === i ? 'current' : 
                    idx === left ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: ++comparisonsCount,
            swaps: swapsCount,
            description: left < n && arr[left] > arr[largest] ? 
                         `Left child ${arr[left]} at index ${left} is larger than ${arr[largest]} at index ${largest}` : 
                         `Left child ${arr[left]} at index ${left} is not larger than ${arr[largest]} at index ${largest}`,
            highlightedLines: [12, 13, 14],
            variables: { i, left, largest, "arr[left]": left < n ? arr[left] : "N/A", "arr[largest]": arr[largest] }
          });
          
          if (arr[left] > arr[largest]) {
            largest = left;
          }
        }
        
        // If right child is larger than largest so far
        if (right < n) {
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx === largest ? 'current' : 
                    idx === right ? 'comparing' : 'default'
            } as ArrayElement)),
            comparisons: ++comparisonsCount,
            swaps: swapsCount,
            description: right < n && arr[right] > arr[largest] ? 
                         `Right child ${arr[right]} at index ${right} is larger than ${arr[largest]} at index ${largest}` : 
                         `Right child ${arr[right]} at index ${right} is not larger than ${arr[largest]} at index ${largest}`,
            highlightedLines: [17, 18, 19],
            variables: { i, right, largest, "arr[right]": right < n ? arr[right] : "N/A", "arr[largest]": arr[largest] }
          });
          
          if (arr[right] > arr[largest]) {
            largest = right;
          }
        }
        
        // If largest is not root
        if (largest !== i) {
          [arr[i], arr[largest]] = [arr[largest], arr[i]];
          
          tempFrames.push({
            array: array.map((item, idx) => ({
              value: arr[idx],
              state: idx === i || idx === largest ? 'current' : 'default'
            } as ArrayElement)),
            comparisons: comparisonsCount,
            swaps: ++swapsCount,
            description: `Swapping ${arr[i]} at index ${i} and ${arr[largest]} at index ${largest}`,
            highlightedLines: [22, 23],
            variables: { i, largest, "arr[i]": arr[i], "arr[largest]": arr[largest] }
          });
          
          // Recursively heapify the affected sub-tree
          heapify(arr, n, largest);
        }
      };
      
      // Build heap (rearrange array)
      for (let i = Math.floor(arrCopy.length / 2) - 1; i >= 0; i--) {
        tempFrames.push({
          array: array.map((item, idx) => ({
            value: arrCopy[idx],
            state: idx === i ? 'current' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Building max heap: processing parent node at index ${i}`,
          highlightedLines: [3, 4],
          variables: { i, n: arrCopy.length }
        });
        
        heapify(arrCopy, arrCopy.length, i);
      }
      
      // Show max heap created
      tempFrames.push({
        array: array.map((item, idx) => ({
          value: arrCopy[idx],
          state: idx === 0 ? 'current' : 'default'
        } as ArrayElement)),
        comparisons: comparisonsCount,
        swaps: swapsCount,
        description: `Max heap built with ${arrCopy[0]} as root`,
        highlightedLines: [5, 6],
        variables: { "root": arrCopy[0] }
      });
      
      // One by one extract elements from heap
      for (let i = arrCopy.length - 1; i > 0; i--) {
        // Move current root to end
        [arrCopy[0], arrCopy[i]] = [arrCopy[i], arrCopy[0]];
        
        tempFrames.push({
          array: array.map((item, idx) => ({
            value: arrCopy[idx],
            state: idx === 0 || idx === i ? 'current' : 
                  idx > i ? 'sorted' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: ++swapsCount,
          description: `Swapping root ${arrCopy[0]} with last unsorted element ${arrCopy[i]}`,
          highlightedLines: [10, 11],
          variables: { i, "arr[0]": arrCopy[0], "arr[i]": arrCopy[i] }
        });
        
        // Mark the element as sorted
        tempFrames.push({
          array: array.map((item, idx) => ({
            value: arrCopy[idx],
            state: idx === 0 ? 'current' : 
                  idx >= i ? 'sorted' : 'default'
          } as ArrayElement)),
          comparisons: comparisonsCount,
          swaps: swapsCount,
          description: `Element ${arrCopy[i]} is now in its final sorted position at index ${i}`,
          highlightedLines: [12, 13],
          variables: { i, "arr[i]": arrCopy[i] }
        });
        
        // Call heapify on the reduced heap
        heapify(arrCopy, i, 0);
      }
      
      // Final sorted array
      tempFrames.push({
        array: array.map((item, idx) => ({
          value: arrCopy[idx],
          state: 'sorted'
        } as ArrayElement)),
        comparisons: comparisonsCount,
        swaps: swapsCount,
        description: `Heap sort completed`,
        highlightedLines: [24],
        variables: {}
      });
      
      // Add all frames to the main frames array
      frames.push(...tempFrames);
    }
    
    // For other algorithms, we'll add implementations later
    // For now, add a dummy sorted frame for other algorithms
    if (['quickSort', 'mergeSort', 'heapSort'].includes(algorithm)) {
      frames.push({
        array: array.map((item) => ({
          value: item.value,
          state: 'sorted'
        } as ArrayElement)),
        comparisons: 0,
        swaps: 0,
        description: `${algorithm} animation will be implemented soon`,
        highlightedLines: [],
        variables: {}
      });
    }
    
    return frames;
  };
  
  // Function to start the sorting animation
  const startSorting = () => {
    if (isSorting || array.length === 0) return;
    
    setIsSorting(true);
    setIsPaused(false);
    setCurrentFrameIndex(0);
    
    // Generate animation frames
    const frames = generateAnimationFrames();
    setAnimationFrames(frames);
    
    // Animation function
    const animate = () => {
      setCurrentFrameIndex(prevIndex => {
        if (prevIndex >= frames.length - 1) {
          setIsSorting(false);
          return prevIndex;
        }
        
        const nextIndex = prevIndex + 1;
        
        // Update UI with current frame
        setCurrentFrame(frames[nextIndex]);
        setArray(frames[nextIndex].array);
        setComparisons(frames[nextIndex].comparisons);
        setSwaps(frames[nextIndex].swaps);
        
        return nextIndex;
      });
    };
    
    // Start animation loop
    let interval = 1000 - (speed * 10); // Convert speed (1-100) to ms (1000-0)
    if (interval < 50) interval = 50; // Min 50ms delay
    
    const intervalId = setInterval(animate, interval);
    animationIdRef.current = intervalId as unknown as number;
  };
  
  // Function to pause/resume the animation
  const togglePause = () => {
    if (!isSorting) return;
    
    setIsPaused(prevIsPaused => {
      if (!prevIsPaused) {
        // Pause
        if (animationIdRef.current !== null) {
          clearInterval(animationIdRef.current);
          animationIdRef.current = null;
        }
        return true;
      } else {
        // Resume
        let interval = 1000 - (speed * 10);
        if (interval < 50) interval = 50;
        
        const animate = () => {
          setCurrentFrameIndex(prevIndex => {
            if (prevIndex >= animationFrames.length - 1) {
              setIsSorting(false);
              return prevIndex;
            }
            
            const nextIndex = prevIndex + 1;
            
            // Update UI with current frame
            setCurrentFrame(animationFrames[nextIndex]);
            setArray(animationFrames[nextIndex].array);
            setComparisons(animationFrames[nextIndex].comparisons);
            setSwaps(animationFrames[nextIndex].swaps);
            
            return nextIndex;
          });
        };
        
        const intervalId = setInterval(animate, interval);
        animationIdRef.current = intervalId as unknown as number;
        return false;
      }
    });
  };
  
  // Function to reset the array
  const resetArray = () => {
    if (animationIdRef.current !== null) {
      clearInterval(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsSorting(false);
    setIsPaused(false);
    generateNewArray();
  };

  // Cleanup the interval when component unmounts
  useEffect(() => {
    return () => {
      if (animationIdRef.current !== null) {
        clearInterval(animationIdRef.current);
      }
    };
  }, []);

  const handleArraySizeChange = (event: Event, newValue: number | number[]) => {
    if (!isSorting) {
      setArraySize(newValue as number);
    }
  };

  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    setSpeed(newValue as number);
    
    // Update animation speed if currently animating
    if (isSorting && !isPaused && animationIdRef.current !== null) {
      clearInterval(animationIdRef.current);
      
      let interval = 1000 - ((newValue as number) * 10);
      if (interval < 50) interval = 50;
      
      const animate = () => {
        setCurrentFrameIndex(prevIndex => {
          if (prevIndex >= animationFrames.length - 1) {
            setIsSorting(false);
            return prevIndex;
          }
          
          const nextIndex = prevIndex + 1;
          
          // Update UI with current frame
          setCurrentFrame(animationFrames[nextIndex]);
          setArray(animationFrames[nextIndex].array);
          setComparisons(animationFrames[nextIndex].comparisons);
          setSwaps(animationFrames[nextIndex].swaps);
          
          return nextIndex;
        });
      };
      
      const intervalId = setInterval(animate, interval);
      animationIdRef.current = intervalId as unknown as number;
    }
  };

  // Function to get color based on element state
  const getElementColor = (state: string) => {
    switch (state) {
      case 'comparing':
        return 'orange';
      case 'sorted':
        return 'green';
      case 'current':
        return 'red';
      case 'pivot':
        return 'purple';
      default:
        return 'primary.main';
    }
  };

  return (
    <Container>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sorting & Searching Arena
        </Typography>
        <Typography variant="body1" paragraph>
          Implement, visualize, and compare different sorting and searching algorithms.
          Observe how different algorithms perform on various input data sets.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid sx={{ width: { xs: '100%', md: '25%' }, p: 1.5 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Controls</Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
              <Select
                labelId="algorithm-select-label"
                id="algorithm-select"
                value={algorithm}
                label="Algorithm"
                onChange={handleAlgorithmChange}
                disabled={isSorting}
              >
                <MenuItem value="bubbleSort">Bubble Sort</MenuItem>
                <MenuItem value="selectionSort">Selection Sort</MenuItem>
                <MenuItem value="insertionSort">Insertion Sort</MenuItem>
                <MenuItem value="quickSort">Quick Sort</MenuItem>
                <MenuItem value="mergeSort">Merge Sort</MenuItem>
                <MenuItem value="heapSort">Heap Sort</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Array Size</Typography>
              <Slider
                value={arraySize}
                onChange={handleArraySizeChange}
                aria-labelledby="array-size-slider"
                min={5}
                max={50}
                valueLabelDisplay="auto"
                disabled={isSorting}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Animation Speed</Typography>
              <Slider
                value={speed}
                onChange={handleSpeedChange}
                aria-labelledby="speed-slider"
                min={1}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>

            <Stack spacing={2} sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={generateNewArray}
                disabled={isSorting}
              >
                Generate New Array
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth
                onClick={isSorting ? togglePause : startSorting}
              >
                {isPaused ? 'Resume' : isSorting ? 'Pause' : 'Start Sorting'}
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={resetArray}
              >
                Reset
              </Button>
            </Stack>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Statistics:</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                <Chip label={`Comparisons: ${comparisons}`} size="small" />
                <Chip label={`Swaps: ${swaps}`} size="small" />
              </Stack>
              {currentFrame?.description && (
                <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: 'background.default' }}>
                  <Typography variant="body2">{currentFrame.description}</Typography>
                </Paper>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '75%' }, p: 1.5 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Visualization" />
              <Tab label="Code View" />
              <Tab label="Variables" />
            </Tabs>
          </Box>
          
          {/* Visualization Tab */}
          {tabValue === 0 && (
            <Paper sx={{ p: 2, height: '60vh', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Array Visualization</Typography>
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  p: 2
                }}
              >
                {array.length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', width: '100%' }}>
                    {array.map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: `${100 / arraySize}%`,
                          height: `${item.value}%`,
                          backgroundColor: getElementColor(item.state),
                          mx: 0.5,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                          transition: 'height 0.3s ease, background-color 0.3s ease',
                          position: 'relative',
                        }}
                      >
                        {arraySize <= 20 && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: -20, 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              fontSize: '0.7rem' 
                            }}
                          >
                            {item.value}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No array to visualize. Click "Generate New Array"
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
          
          {/* Code View Tab */}
          {tabValue === 1 && (
            <Paper sx={{ p: 2, height: '60vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>Algorithm Code</Typography>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {algorithmCodes[algorithm as keyof typeof algorithmCodes].split('\n').map((line, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      display: 'flex',
                      bgcolor: currentFrame?.highlightedLines.includes(idx) ? 'rgba(255, 255, 0, 0.2)' : 'transparent',
                      pl: 1,
                      borderLeft: currentFrame?.highlightedLines.includes(idx) ? '3px solid orange' : '3px solid transparent'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mr: 2, 
                        color: 'text.secondary', 
                        width: '30px',
                        userSelect: 'none'
                      }}
                    >
                      {idx + 1}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {line}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
          
          {/* Variables Tab */}
          {tabValue === 2 && (
            <Paper sx={{ p: 2, height: '60vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>Current Variables</Typography>
              {currentFrame?.variables && Object.keys(currentFrame.variables).length > 0 ? (
                <List>
                  {Object.entries(currentFrame.variables).map(([key, value], idx) => (
                    <React.Fragment key={idx}>
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Typography variant="body2">
                              <strong>{key}:</strong> {JSON.stringify(value)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < Object.keys(currentFrame.variables).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                  No variables to display. Start the algorithm to see variables.
                </Typography>
              )}
            </Paper>
          )}
          
          {/* Algorithm Details Panel */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Algorithm Details</Typography>
            <Grid container spacing={2}>
              <Grid sx={{ width: '50%', p: 1.5 }}>
                <Typography variant="body2"><strong>Time Complexity:</strong></Typography>
                {algorithm === 'quickSort' && (
                  <>
                    <Typography variant="body2">Best: O(n log n)</Typography>
                    <Typography variant="body2">Average: O(n log n)</Typography>
                    <Typography variant="body2">Worst: O(n²)</Typography>
                  </>
                )}
                {algorithm === 'mergeSort' && (
                  <>
                    <Typography variant="body2">Best: O(n log n)</Typography>
                    <Typography variant="body2">Average: O(n log n)</Typography>
                    <Typography variant="body2">Worst: O(n log n)</Typography>
                  </>
                )}
                {algorithm === 'heapSort' && (
                  <>
                    <Typography variant="body2">Best: O(n log n)</Typography>
                    <Typography variant="body2">Average: O(n log n)</Typography>
                    <Typography variant="body2">Worst: O(n log n)</Typography>
                  </>
                )}
                {algorithm === 'bubbleSort' && (
                  <>
                    <Typography variant="body2">Best: O(n)</Typography>
                    <Typography variant="body2">Average: O(n²)</Typography>
                    <Typography variant="body2">Worst: O(n²)</Typography>
                  </>
                )}
                {algorithm === 'insertionSort' && (
                  <>
                    <Typography variant="body2">Best: O(n)</Typography>
                    <Typography variant="body2">Average: O(n²)</Typography>
                    <Typography variant="body2">Worst: O(n²)</Typography>
                  </>
                )}
                {algorithm === 'selectionSort' && (
                  <>
                    <Typography variant="body2">Best: O(n²)</Typography>
                    <Typography variant="body2">Average: O(n²)</Typography>
                    <Typography variant="body2">Worst: O(n²)</Typography>
                  </>
                )}
              </Grid>
              <Grid sx={{ width: '50%', p: 1.5 }}>
                {algorithm === 'quickSort' && (
                  <>
                    <Typography variant="body2"><strong>Space Complexity:</strong> O(log n)</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> No</Typography>
                    <Typography variant="body2"><strong>In Place:</strong> Yes</Typography>
                  </>
                )}
                {algorithm === 'mergeSort' && (
                  <>
                    <Typography variant="body2"><strong>Space Complexity:</strong> O(n)</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> Yes</Typography>
                    <Typography variant="body2"><strong>In Place:</strong> No</Typography>
                  </>
                )}
                {algorithm === 'heapSort' && (
                  <>
                    <Typography variant="body2"><strong>Space Complexity:</strong> O(1)</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> No</Typography>
                    <Typography variant="body2"><strong>In Place:</strong> Yes</Typography>
                  </>
                )}
                {algorithm === 'bubbleSort' && (
                  <>
                    <Typography variant="body2"><strong>Space Complexity:</strong> O(1)</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> Yes</Typography>
                    <Typography variant="body2"><strong>In Place:</strong> Yes</Typography>
                  </>
                )}
                {algorithm === 'insertionSort' && (
                  <>
                    <Typography variant="body2"><strong>Space Complexity:</strong> O(1)</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> Yes</Typography>
                    <Typography variant="body2"><strong>In Place:</strong> Yes</Typography>
                  </>
                )}
                {algorithm === 'selectionSort' && (
                  <>
                    <Typography variant="body2"><strong>Space Complexity:</strong> O(1)</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> No</Typography>
                    <Typography variant="body2"><strong>In Place:</strong> Yes</Typography>
                  </>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
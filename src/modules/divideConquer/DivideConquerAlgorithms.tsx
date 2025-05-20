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
  Button,
  Tabs,
  Tab,
  SelectChangeEvent,
  TextField,
  Divider,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  useTheme,
  Slider,
  Tooltip,
  LinearProgress
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SchemaIcon from '@mui/icons-material/Schema';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';

// Add this interface for detailed visualization states
interface ArrayElement {
  value: number;
  status: 'normal' | 'comparing' | 'sorted' | 'pivot' | 'current' | 'left' | 'right';
}

// Enhanced data structure for tracking recursive calls
interface RecursiveCall {
  id: string;
  parentId: string | null;
  array: number[];
  level: number;
  start: number;
  end: number;
  pivot?: number;
  leftArray?: number[];
  rightArray?: number[];
  status: 'active' | 'completed' | 'waiting';
  result?: number[];
}

// Add this type for more complex array manipulation states
type VisualizationState = {
  array: ArrayElement[];
  currentStep: number;
  totalSteps: number;
  description: string;
  activeIndices: number[];
  pivotIndex?: number;
  leftPointer?: number;
  rightPointer?: number;
  midPoint?: number;
  callStack: RecursiveCall[];
};

// Algorithm descriptions for the Divide and Conquer algorithms
const algorithmDescriptions = {
  mergeSort: {
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
  },
  quickSort: {
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
  },
  binarySearch: {
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
  },
  majorityElement: {
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
  },
  countInversions: {
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
  },
  orderStatistics: {
    name: 'Order Statistics (Quick Select)',
    description: 'Finds the kth smallest element in an unsorted array using a modified quicksort partitioning strategy.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n²)'
    },
    spaceComplexity: 'O(log n)',
    stable: false,
    additionalNotes: 'Average case O(n) time complexity makes it faster than sorting the entire array',
    pseudocode: `function quickSelect(arr, low, high, k):
    if low == high:
        return arr[low]
    
    pivotIndex = partition(arr, low, high)
    
    if k == pivotIndex:
        return arr[k]
    else if k < pivotIndex:
        return quickSelect(arr, low, pivotIndex - 1, k)
    else:
        return quickSelect(arr, pivotIndex + 1, high, k)`
  },
  strassenMatrix: {
    name: "Strassen's Matrix Multiplication",
    description: 'Multiplies two matrices more efficiently than the standard O(n³) algorithm by using a recursive divide-and-conquer approach.',
    timeComplexity: {
      best: 'O(n^2.8074)',
      average: 'O(n^2.8074)',
      worst: 'O(n^2.8074)'
    },
    spaceComplexity: 'O(n²)',
    stable: true,
    additionalNotes: 'More efficient for large matrices, but has higher constant factors than standard matrix multiplication',
    pseudocode: `function strassen(A, B):
    n = size of matrix A
    
    if n == 1:
        return A[0][0] * B[0][0]
    
    // Divide matrices into quadrants
    a11, a12, a21, a22 = divide(A)
    b11, b12, b21, b22 = divide(B)
    
    // 7 recursive multiplications instead of 8
    p1 = strassen(a11 + a22, b11 + b22)
    p2 = strassen(a21 + a22, b11)
    p3 = strassen(a11, b12 - b22)
    p4 = strassen(a22, b21 - b11)
    p5 = strassen(a11 + a12, b22)
    p6 = strassen(a21 - a11, b11 + b12)
    p7 = strassen(a12 - a22, b21 + b22)
    
    // Compute result quadrants
    c11 = p1 + p4 - p5 + p7
    c12 = p3 + p5
    c21 = p2 + p4
    c22 = p1 - p2 + p3 + p6
    
    return combine(c11, c12, c21, c22)`
  }
};

export default function DivideConquerAlgorithms() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [algorithm, setAlgorithm] = useState('mergeSort');
  const [inputArray, setInputArray] = useState('');
  const [currentSteps, setCurrentSteps] = useState<string[]>([]);
  const [visualizationStage, setVisualizationStage] = useState<number>(0);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recursionTreeData, setRecursionTreeData] = useState<RecursiveCall[]>([]);
  const [visualSpeed, setVisualSpeed] = useState<number>(50);
  const [visualizationState, setVisualizationState] = useState<VisualizationState | null>(null);
  
  // Refs for animation frames
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Get the current algorithm's details
  const currentAlgo = algorithmDescriptions[algorithm as keyof typeof algorithmDescriptions];

  // Generate random array input with enhanced options
  const generateRandomInput = () => {
    let newArray: number[];
    let size = 10; // Default size
    
    switch (algorithm) {
      case 'binarySearch':
        // Generate sorted array for binary search
        newArray = Array.from({ length: size }, (_, i) => i * 2 + Math.floor(Math.random() * 2));
        break;
      case 'quickSort':
        // For quick sort, more values might show partitioning better
        size = 12;
        newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
        break;
      case 'mergeSort':
        // For merge sort, even number might demonstrate merging better
        size = 8;
        newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
        break;
      case 'strassenMatrix':
        // For Strassen's algorithm, generate matrix dimensions that are powers of 2
        size = 2;
        newArray = Array.from({ length: size*size }, () => Math.floor(Math.random() * 10));
        break;
      default:
        newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
    }
    
    setInputArray(newArray.join(', '));
  };

  // Reset visualization with enhanced state cleanup
  const resetVisualization = () => {
    // Cancel any ongoing animation
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    setCurrentSteps([]);
    setVisualizationStage(0);
    setIsVisualizing(false);
    setIsPaused(false);
    setRecursionTreeData([]);
    setVisualizationState(null);
    previousTimeRef.current = null;
  };

  // Enhanced merge sort visualization
  const generateMergeSortVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    const initialElements: ArrayElement[] = array.map(value => ({ value, status: 'normal' }));
    
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: Math.ceil(array.length * Math.log2(array.length)) * 2, // Approximate steps
      description: 'Starting merge sort algorithm',
      activeIndices: [],
      callStack: []
    };
    
    // Generate recursion tree data for this algorithm
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
      
      // Recursively subdivide
      if (mid - start > 0) {
        generateSubdivisions(leftId, array, start, mid, level + 1);
      }
      
      if (end - mid > 0) {
        generateSubdivisions(rightId, array, mid + 1, end, level + 1);
      }
    };
    
    generateSubdivisions('root', array, 0, array.length - 1, 0);
    
    return [initialState, recursionTree];
  };

  // Enhanced quick sort visualization
  const generateQuickSortVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    const initialElements: ArrayElement[] = array.map(value => ({ value, status: 'normal' }));
    const pivot = array[array.length - 1];
    
    // Mark the pivot
    initialElements[array.length - 1].status = 'pivot';
    
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: array.length * 2, // Approximation
      description: `Starting quick sort with pivot ${pivot}`,
      activeIndices: [array.length - 1],
      pivotIndex: array.length - 1,
      leftPointer: 0,
      rightPointer: array.length - 2,
      callStack: []
    };
    
    // Generate recursion tree for quick sort
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: [...array],
      level: 0,
      start: 0,
      end: array.length - 1,
      pivot: pivot,
      status: 'active'
    }];
    
    // Add partitioning information for better visualization
    const lessElements = array.filter(element => element < pivot);
    const greaterElements = array.filter((element, index) => element > pivot && index !== array.length - 1);
    
    recursionTree.push({
      id: 'left',
      parentId: 'root',
      array: lessElements,
      level: 1,
      start: 0,
      end: lessElements.length - 1,
      status: 'waiting'
    });
    
    recursionTree.push({
      id: 'right',
      parentId: 'root',
      array: greaterElements,
      level: 1,
      start: lessElements.length + 1,
      end: array.length - 1,
      status: 'waiting'
    });
    
    return [initialState, recursionTree];
  };

  // Enhanced binary search visualization
  const generateBinarySearchVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Sort the array for binary search
    const sortedArray = [...array].sort((a, b) => a - b);
    const target = sortedArray[Math.floor(Math.random() * sortedArray.length)];
    
    const initialElements: ArrayElement[] = sortedArray.map(value => ({ 
      value, 
      status: value === target ? 'current' : 'normal' 
    }));
    
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: Math.ceil(Math.log2(sortedArray.length)) + 1,
      description: `Searching for ${target} in the sorted array`,
      activeIndices: [],
      leftPointer: 0,
      rightPointer: sortedArray.length - 1,
      midPoint: Math.floor((0 + sortedArray.length - 1) / 2),
      callStack: []
    };
    
    // Generate recursion tree for binary search
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: [...sortedArray],
      level: 0,
      start: 0,
      end: sortedArray.length - 1,
      status: 'active'
    }];
    
    return [initialState, recursionTree];
  };

  // Majority Element visualization 
  const generateMajorityElementVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // Create initial visualization state with array elements
    const initialElements: ArrayElement[] = array.map(value => ({ value, status: 'normal' }));
    
    // We'll enhance the array with some duplicates to ensure a majority element exists
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
    
    // Update the visualization elements
    const enhancedElements: ArrayElement[] = enhancedArray.map(value => ({ 
      value, 
      status: value === majorityValue ? 'normal' : 'normal' // Initially all normal
    }));
    
    const initialState: VisualizationState = {
      array: enhancedElements,
      currentStep: 0,
      totalSteps: Math.ceil(Math.log2(array.length)) + array.length, // Approximation
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
    ) => {
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
  };
  
  // Order Statistics (QuickSelect) visualization
  const generateOrderStatisticsVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    const initialElements: ArrayElement[] = array.map(value => ({ value, status: 'normal' }));
    
    // Select a random k value (kth smallest element to find)
    const k = Math.floor(Math.random() * array.length);
    const sortedArray = [...array].sort((a, b) => a - b);
    const targetValue = sortedArray[k]; // The value we're looking for
    
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: array.length * 2, // Approximation
      description: `Finding the ${k+1}${getOrdinalSuffix(k+1)} smallest element (QuickSelect)`,
      activeIndices: [],
      pivotIndex: array.length - 1, // Start with last element as pivot
      callStack: []
    };
    
    // Generate recursion tree for QuickSelect
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: [...array],
      level: 0,
      start: 0,
      end: array.length - 1,
      pivot: array[array.length - 1],
      status: 'active'
    }];
    
    // Add initial partition information
    const pivot = array[array.length - 1];
    const lessElements = array.filter((element) => element < pivot);
    const greaterElements = array.filter((element) => element > pivot);
    
    // QuickSelect nodes
    recursionTree.push({
      id: 'partition',
      parentId: 'root',
      array: [...array],
      level: 1,
      start: 0,
      end: array.length - 1,
      pivot: pivot,
      status: 'waiting'
    });
    
    return [initialState, recursionTree];
  };

  // Helper function for adding ordinal suffix to numbers
  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };
  
  // Counting Inversions visualization
  const generateCountingInversionsVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    const initialElements: ArrayElement[] = array.map(value => ({ value, status: 'normal' }));
    
    // Calculate actual inversions for validation
    let actualInversions = 0;
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] > array[j]) {
          actualInversions++;
        }
      }
    }
    
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: Math.ceil(array.length * Math.log2(array.length)) * 2,
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
      
      // Recursively add child nodes
      generateInversionTree(leftId, array, start, mid, level + 1);
      generateInversionTree(rightId, array, mid + 1, end, level + 1);
      
      // Add a merge node to represent the merge and count step
      recursionTree.push({
        id: `${parentId}-merge`,
        parentId,
        array: array.slice(start, end + 1),
        level: level + 0.5, // Place between levels
        start,
        end,
        status: 'waiting',
      });
    };
    
    // Generate the tree
    generateInversionTree('root', array, 0, array.length - 1, 0);
    
    return [initialState, recursionTree];
  };
  
  // Strassen's Matrix Multiplication visualization
  const generateStrassenMatrixVisualization = (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // For Strassen's, we need square matrices with dimensions that are powers of 2
    const size = Math.max(2, Math.pow(2, Math.floor(Math.log2(Math.sqrt(array.length)))));
    
    // Create two matrices from the input array
    const matrixA: number[][] = [];
    const matrixB: number[][] = [];
    
    // Fill matrix A with input array values
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        row.push(index < array.length ? array[index] : Math.floor(Math.random() * 10));
      }
      matrixA.push(row);
    }
    
    // Create matrix B with random values
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.floor(Math.random() * 10));
      }
      matrixB.push(row);
    }
    
    // Flatten matrices for visualization
    const flattenedMatrixA = matrixA.flat();
    const flattenedMatrixB = matrixB.flat();
    
    // For visualization, we'll show both matrices side by side
    const combinedArray = [...flattenedMatrixA, ...flattenedMatrixB];
    
    const initialElements: ArrayElement[] = combinedArray.map(value => ({ 
      value, 
      status: 'normal' 
    }));
    
    // Mark elements from different matrices
    for (let i = 0; i < flattenedMatrixA.length; i++) {
      initialElements[i].status = 'left'; // Matrix A
    }
    
    for (let i = flattenedMatrixA.length; i < combinedArray.length; i++) {
      initialElements[i].status = 'right'; // Matrix B
    }
    
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: Math.ceil(Math.log2(size)) * 7 + 1, // 7 recursive calls per level
      description: `Strassen's Matrix Multiplication for ${size}×${size} matrices`,
      activeIndices: [],
      callStack: []
    };
    
    // Generate recursion tree for Strassen's algorithm
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: combinedArray,
      level: 0,
      start: 0,
      end: combinedArray.length - 1,
      status: 'active'
    }];
    
    // For 2x2 matrices, add the 7 recursive multiplications
    if (size === 2) {
      const operations = [
        "P1 = (A11 + A22)(B11 + B22)",
        "P2 = (A21 + A22)B11",
        "P3 = A11(B12 - B22)",
        "P4 = A22(B21 - B11)",
        "P5 = (A11 + A12)B22",
        "P6 = (A21 - A11)(B11 + B12)",
        "P7 = (A12 - A22)(B21 + B22)"
      ];
      
      operations.forEach((operation, index) => {
        recursionTree.push({
          id: `operation-${index + 1}`,
          parentId: 'root',
          array: [],
          level: 1,
          start: 0,
          end: 0,
          status: 'waiting'
        });
      });
    } else {
      // For larger matrices, show the recursive division into quadrants
      recursionTree.push({
        id: 'quadrants',
        parentId: 'root',
        array: [],
        level: 1,
        start: 0,
        end: 0,
        status: 'waiting'
      });
    }
    
    return [initialState, recursionTree];
  };

  // Update visualization state for Majority Element
  const updateMajorityElementState = (state: VisualizationState) => {
    const currentStage = visualizationStage - 1;
    
    // Reset all statuses
    state.array.forEach(el => el.status = 'normal');
    
    if (currentStage === 0) {
      // Initial array display
      // Nothing to highlight yet
    } else if (currentStage === 1) {
      // Dividing array
      const mid = Math.floor(state.array.length / 2);
      for (let i = 0; i < mid; i++) {
        state.array[i].status = 'left';
      }
      for (let i = mid; i < state.array.length; i++) {
        state.array[i].status = 'right';
      }
    } else if (currentStage === 2 || currentStage === 3) {
      // Processing left or right half
      const side = currentStage === 2 ? 'left' : 'right';
      const mid = Math.floor(state.array.length / 2);
      const start = side === 'left' ? 0 : mid;
      const end = side === 'left' ? mid : state.array.length;
      
      for (let i = start; i < end; i++) {
        state.array[i].status = side === 'left' ? 'left' : 'right';
      }
    } else if (currentStage === 4) {
      // Counting candidates
      // Find the most frequent element
      const counts: Record<number, number> = {};
      let maxCount = 0;
      let majorityElement: number | null = state.array[0].value;
      
      state.array.forEach(el => {
        counts[el.value] = (counts[el.value] || 0) + 1;
        if (counts[el.value] > maxCount) {
          maxCount = counts[el.value];
          majorityElement = el.value;
        }
      });
      
      // Highlight all occurrences of the candidate
      state.array.forEach(el => {
        if (el.value === majorityElement) {
          el.status = 'current';
        }
      });
    } else if (currentStage === 5) {
      // Final result - majority element
      const counts: Record<number, number> = {};
      state.array.forEach(el => {
        counts[el.value] = (counts[el.value] || 0) + 1;
      });
      
      // Find the majority element (if it exists)
      let majorityElement: number | null = null;
      for (const [value, count] of Object.entries(counts)) {
        if (count > state.array.length / 2) {
          majorityElement = parseInt(value);
          break;
        }
      }
      
      if (majorityElement !== null) {
        // Mark the majority element
        state.array.forEach(el => {
          if (el.value === majorityElement) {
            el.status = 'sorted'; // Use 'sorted' to highlight the final result
          }
        });
        
        state.description = `Found majority element: ${majorityElement} (appears ${counts[majorityElement]} times)`;
      } else {
        state.description = "No majority element found";
      }
    }
  };

  // Start visualization with enhanced algorithm-specific visualizations
  const startVisualization = () => {
    resetVisualization();
    
    // Parse input array
    const array = inputArray.split(',').map(item => parseInt(item.trim()));
    
    // Generate visualization data based on selected algorithm
    let visualState: VisualizationState | null = null;
    let treeData: RecursiveCall[] = [];
    const steps: string[] = [];
    
    switch(algorithm) {
      case 'mergeSort':
        [visualState, treeData] = generateMergeSortVisualization(array);
        steps.push(`Initial array: [${array.join(', ')}]`);
        steps.push(`Splitting array into two halves: [${array.slice(0, Math.floor(array.length/2)).join(', ')}] and [${array.slice(Math.floor(array.length/2)).join(', ')}]`);
        steps.push(`Recursively sorting first half...`);
        steps.push(`Recursively sorting second half...`);
        steps.push(`Merging sorted halves...`);
        steps.push(`Final sorted array: [${[...array].sort((a, b) => a - b).join(', ')}]`);
        break;
        
      case 'quickSort':
        [visualState, treeData] = generateQuickSortVisualization(array);
        const pivot = array[array.length - 1];
        steps.push(`Initial array: [${array.join(', ')}]`);
        steps.push(`Selecting pivot: ${pivot}`);
        steps.push(`Partitioning array around pivot...`);
        steps.push(`Moving elements less than ${pivot} to the left of the pivot`);
        steps.push(`Moving elements greater than ${pivot} to the right of the pivot`);
        steps.push(`Recursively sorting left partition...`);
        steps.push(`Recursively sorting right partition...`);
        steps.push(`Final sorted array: [${[...array].sort((a, b) => a - b).join(', ')}]`);
        break;
        
      case 'binarySearch':
        [visualState, treeData] = generateBinarySearchVisualization(array);
        const sortedArray = [...array].sort((a, b) => a - b);
        const target = sortedArray[Math.floor(Math.random() * sortedArray.length)];
        steps.push(`Searching for ${target} in [${sortedArray.join(', ')}]`);
        steps.push(`Initial left = 0, right = ${sortedArray.length - 1}`);
        steps.push(`Middle = ${Math.floor((0 + sortedArray.length - 1) / 2)}, middle element = ${sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)]}`);
        
        if (sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)] < target) {
          steps.push(`Middle element ${sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)]} is less than ${target}, search in right half`);
        } else if (sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)] > target) {
          steps.push(`Middle element ${sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)]} is greater than ${target}, search in left half`);
        } else {
          steps.push(`Middle element ${sortedArray[Math.floor((0 + sortedArray.length - 1) / 2)]} equals ${target}, found target!`);
        }
        
        steps.push(`Found target ${target} at index ${sortedArray.indexOf(target)}`);
        break;
        
      // Newly implemented algorithms
      case 'majorityElement':
        [visualState, treeData] = generateMajorityElementVisualization(array);
        steps.push(`Initial array: [${array.join(', ')}]`);
        steps.push(`Dividing array into two halves for Majority Element algorithm`);
        steps.push(`Finding majority element in left half...`);
        steps.push(`Finding majority element in right half...`);
        steps.push(`Counting occurrences of candidates from both halves...`);
        steps.push(`Determining if a majority element exists...`);
        break;
        
      case 'orderStatistics':
        [visualState, treeData] = generateOrderStatisticsVisualization(array);
        steps.push(`Initial array: [${array.join(', ')}]`);
        steps.push(`Selecting a pivot element for partitioning`);
        steps.push(`Partitioning array around pivot`);
        steps.push(`Comparing pivot position with k`);
        steps.push(`Finding the kth smallest element`);
        break;
        
      case 'countInversions':
        [visualState, treeData] = generateCountingInversionsVisualization(array);
        steps.push(`Initial array: [${array.join(', ')}]`);
        steps.push(`Dividing array for counting inversions`);
        steps.push(`Counting inversions in left half`);
        steps.push(`Counting inversions in right half`);
        steps.push(`Counting split inversions`);
        steps.push(`Combining all inversions: left + right + split`);
        break;
        
      case 'strassenMatrix':
        [visualState, treeData] = generateStrassenMatrixVisualization(array);
        steps.push(`Initial matrices A and B`);
        steps.push(`Dividing matrices into quadrants`);
        steps.push(`Computing P1 = (A11 + A22)(B11 + B22)`);
        steps.push(`Computing P2 = (A21 + A22)B11`);
        steps.push(`Computing P3 = A11(B12 - B22)`);
        steps.push(`Computing P4 = A22(B21 - B11)`);
        steps.push(`Computing P5 = (A11 + A12)B22`);
        steps.push(`Computing P6 = (A21 - A11)(B11 + B12)`);
        steps.push(`Computing P7 = (A12 - A22)(B21 + B22)`);
        steps.push(`Combining results to form the result matrix`);
        break;
        
      default:
        steps.push('Algorithm visualization not implemented yet');
    }
    
    setCurrentSteps(steps);
    setRecursionTreeData(treeData);
    setVisualizationState(visualState);
    setIsVisualizing(true);
    setVisualizationStage(1);
  };

  // Animation frame handler for smooth visualizations
  const animate = (time: number) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - previousTimeRef.current;
    const stepInterval = 3000 - (visualSpeed * 25); // Convert slider value to ms (slower to faster)
    
    if (deltaTime > stepInterval && !isPaused && visualizationStage < currentSteps.length) {
      previousTimeRef.current = time;
      setVisualizationStage(prev => Math.min(currentSteps.length, prev + 1));
      
      // Update visualization state based on the algorithm and current stage
      if (visualizationState) {
        updateVisualizationState();
      }
    }
    
    if (visualizationStage < currentSteps.length && isVisualizing && !isPaused) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  // Update the visualization state based on the current stage
  const updateVisualizationState = () => {
    if (!visualizationState) return;
    
    // Clone the current state to avoid direct mutations
    const newState = { ...visualizationState };
    
    // Update based on algorithm type and stage
    switch(algorithm) {
      case 'mergeSort':
        updateMergeSortState(newState);
        break;
      case 'quickSort':
        updateQuickSortState(newState);
        break;
      case 'binarySearch':
        updateBinarySearchState(newState);
        break;
      case 'majorityElement':
        updateMajorityElementState(newState);
        break;
      case 'orderStatistics':
        updateOrderStatisticsState(newState);
        break;
      case 'countInversions':
        updateCountingInversionsState(newState);
        break;
      case 'strassenMatrix':
        updateStrassenMatrixState(newState);
        break;
    }
    
    // Increment the current step
    newState.currentStep += 1;
    
    // Update description based on the current step in currentSteps
    if (currentSteps[visualizationStage - 1]) {
      newState.description = currentSteps[visualizationStage - 1];
    }
    
    setVisualizationState(newState);
  };

  // Algorithm-specific state updates for merge sort
  const updateMergeSortState = (state: VisualizationState) => {
    // This would contain the logic to update the state for each step of merge sort
    // Example: update array elements, active indices, etc.
    
    // For demonstration, we'll simplify and just mark different sections
    const currentStage = visualizationStage - 1;
    
    // Reset all statuses
    state.array.forEach(el => el.status = 'normal');
    
    if (currentStage === 1) { // Splitting
      const mid = Math.floor(state.array.length / 2);
      for (let i = 0; i < mid; i++) {
        state.array[i].status = 'left';
      }
      for (let i = mid; i < state.array.length; i++) {
        state.array[i].status = 'right';
      }
      state.activeIndices = [mid];
    } else if (currentStage >= 2 && currentStage <= 3) { // Recursively sorting
      // Simulate recursion by updating the call stack
      const relevantCall = state.callStack.find(call => call.level === currentStage - 1);
      if (relevantCall) {
        relevantCall.status = 'active';
      }
    } else if (currentStage === 4) { // Merging
      // Simulate merging by marking elements as being compared
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].status = 'comparing';
      }
    } else if (currentStage === 5) { // Final
      // Mark all elements as sorted
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].status = 'sorted';
      }
      
      // Create sorted array
      const sortedArray = [...state.array]
        .map(el => el.value)
        .sort((a, b) => a - b);
      
      // Update the array with sorted values
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].value = sortedArray[i];
        state.array[i].status = 'sorted';
      }
    }
  };

  // Algorithm-specific state updates for quick sort
  const updateQuickSortState = (state: VisualizationState) => {
    const currentStage = visualizationStage - 1;
    
    // Reset statuses
    state.array.forEach(el => el.status = 'normal');
    
    if (state.pivotIndex !== undefined) {
      state.array[state.pivotIndex].status = 'pivot';
    }
    
    if (currentStage === 1) { // Selecting pivot
      if (state.pivotIndex !== undefined) {
        state.array[state.pivotIndex].status = 'pivot';
        state.activeIndices = [state.pivotIndex];
      }
    } else if (currentStage === 2) { // Partitioning
      if (state.leftPointer !== undefined && state.rightPointer !== undefined) {
        state.array[state.leftPointer].status = 'left';
        state.array[state.rightPointer].status = 'right';
        state.activeIndices = [state.leftPointer, state.rightPointer];
      }
    } else if (currentStage === 3 || currentStage === 4) { // Moving elements
      const pivotValue = state.array[state.pivotIndex || 0].value;
      
      // Mark elements based on their relationship to the pivot
      state.array.forEach((el, idx) => {
        if (idx === state.pivotIndex) {
          el.status = 'pivot';
        } else if (el.value < pivotValue) {
          el.status = 'left';
        } else if (el.value > pivotValue) {
          el.status = 'right';
        }
      });
    } else if (currentStage === 5 || currentStage === 6) { // Recursive sorting
      // Update recursion visualization
      const relevantCall = state.callStack.find(call => 
        call.level === 1 && call.id === (currentStage === 5 ? 'left' : 'right')
      );
      if (relevantCall) {
        relevantCall.status = 'active';
      }
    } else if (currentStage === 7) { // Final
      // Create sorted array
      const sortedArray = [...state.array]
        .map(el => el.value)
        .sort((a, b) => a - b);
      
      // Update the array with sorted values
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].value = sortedArray[i];
        state.array[i].status = 'sorted';
      }
    }
  };

  // Algorithm-specific state updates for binary search
  const updateBinarySearchState = (state: VisualizationState) => {
    const currentStage = visualizationStage - 1;
    
    // Reset statuses
    state.array.forEach(el => el.status = 'normal');
    
    if (currentStage === 0) { // Initial setup
      // Mark the target element
      const targetIndex = state.array.findIndex(el => el.status === 'current');
      if (targetIndex !== -1) {
        state.array[targetIndex].status = 'current';
      }
    } else if (currentStage === 1) { // Initializing pointers
      if (state.leftPointer !== undefined && state.rightPointer !== undefined) {
        state.array[state.leftPointer].status = 'left';
        state.array[state.rightPointer].status = 'right';
        state.activeIndices = [state.leftPointer, state.rightPointer];
      }
    } else if (currentStage === 2) { // Finding middle
      if (state.midPoint !== undefined) {
        state.array[state.midPoint].status = 'comparing';
        state.activeIndices = [state.midPoint];
      }
    } else if (currentStage >= 3 && currentStage <= 4) { // Comparison and recursion
      if (state.midPoint !== undefined) {
        state.array[state.midPoint].status = 'comparing';
        
        // Find target element
        const targetIndex = state.array.findIndex(el => el.status === 'current' || el.status === 'normal');
        
        // Update pointer based on comparison
        const targetValue = state.array[targetIndex].value;
        const midValue = state.array[state.midPoint].value;
        
        if (midValue === targetValue) {
          state.array[state.midPoint].status = 'current';
          state.description = `Found target at index ${state.midPoint}!`;
        } else if (midValue < targetValue) {
          // Search right half
          if (state.leftPointer !== undefined && state.midPoint !== undefined) {
            state.leftPointer = state.midPoint + 1;
            
            // Mark the new search range
            for (let i = state.leftPointer; i <= (state.rightPointer || 0); i++) {
              state.array[i].status = i === state.leftPointer ? 'left' : 
                                     i === state.rightPointer ? 'right' : 'comparing';
            }
          }
        } else {
          // Search left half
          if (state.rightPointer !== undefined && state.midPoint !== undefined) {
            state.rightPointer = state.midPoint - 1;
            
            // Mark the new search range
            for (let i = (state.leftPointer || 0); i <= state.rightPointer; i++) {
              state.array[i].status = i === state.leftPointer ? 'left' : 
                                     i === state.rightPointer ? 'right' : 'comparing';
            }
          }
        }
      }
    } else if (currentStage === 5) { // Found
      // Find and mark the target element
      const targetIndex = state.array.findIndex(el => el.status === 'current' || el.status === 'normal');
      if (targetIndex !== -1) {
        state.array[targetIndex].status = 'current';
      }
    }
  };

  // Update visualization state for Majority Element
  

  // Update visualization state for Order Statistics
  const updateOrderStatisticsState = (state: VisualizationState) => {
    const currentStage = visualizationStage - 1;
    
    // Reset statuses
    state.array.forEach(el => el.status = 'normal');
    
    if (currentStage === 0) {
      // Initial array
      // Nothing to highlight
    } else if (currentStage === 1) {
      // Select pivot
      const pivotIndex = Math.floor(Math.random() * state.array.length);
      state.array[pivotIndex].status = 'pivot';
      state.description = `Selected pivot: ${state.array[pivotIndex].value}`;
    } else if (currentStage === 2) {
      // Partition around pivot
      const pivotIndex = Math.floor(Math.random() * state.array.length);
      const pivotValue = state.array[pivotIndex].value;
      
      state.array.forEach(el => {
        if (el.value < pivotValue) {
          el.status = 'left';
        } else if (el.value > pivotValue) {
          el.status = 'right';
        } else {
          el.status = 'pivot';
        }
      });
      
      state.description = `Partitioning around pivot: ${pivotValue}`;
    } else if (currentStage === 3) {
      // Recursive call on the appropriate partition
      const pivotIndex = Math.floor(Math.random() * state.array.length);
      const pivotValue = state.array[pivotIndex].value;
      
      // Simulate k (let's assume we're looking for the 3rd smallest element)
      const k = 3;
      const leftSize = state.array.filter(el => el.value < pivotValue).length;
      
      if (k <= leftSize) {
        // Recur on left partition
        state.array.forEach(el => {
          if (el.value < pivotValue) {
            el.status = 'current';
          }
        });
        state.description = `Looking for the ${k}th smallest element in the left partition`;
      } else if (k > leftSize + 1) {
        // Recur on right partition
        state.array.forEach(el => {
          if (el.value > pivotValue) {
            el.status = 'current';
          }
        });
        state.description = `Looking for the ${k - leftSize - 1}th smallest element in the right partition`;
      } else {
        // Pivot is the answer
        state.array.forEach(el => {
          if (el.value === pivotValue) {
            el.status = 'sorted';
          }
        });
        state.description = `Found the ${k}th smallest element: ${pivotValue}`;
      }
    } else if (currentStage === 4) {
      // Final result
      // For demonstration, let's mark the 3rd smallest element
      const sortedValues = [...state.array].map(el => el.value).sort((a, b) => a - b);
      const k = 3;
      const kthSmallest = sortedValues[k - 1];
      
      state.array.forEach(el => {
        if (el.value === kthSmallest) {
          el.status = 'sorted';
        }
      });
      
      state.description = `The ${k}th smallest element is: ${kthSmallest}`;
    }
  };

  // Update visualization state for Counting Inversions
  const updateCountingInversionsState = (state: VisualizationState) => {
    const currentStage = visualizationStage - 1;
    
    // Reset all statuses
    state.array.forEach(el => el.status = 'normal');
    
    // Calculate actual inversions for reference
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
      // Initial array
      // Find some example inversions to highlight
      let count = 0;
      for (let i = 0; i < state.array.length && count < 3; i++) {
        for (let j = i + 1; j < state.array.length && count < 3; j++) {
          if (state.array[i].value > state.array[j].value) {
            state.array[i].status = 'comparing';
            state.array[j].status = 'comparing';
            count++;
          }
        }
      }
      
      state.description = `Finding inversions in array. Example: (${state.array[0].value}, ${state.array[1].value}) is${state.array[0].value > state.array[1].value ? '' : ' not'} an inversion.`;
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
      
      for (let i = start; i < end; i++) {
        state.array[i].status = side === 'left' ? 'left' : 'right';
      }
      
      state.description = `Counting inversions in ${side} half: ${halfInversions} inversions found`;
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
      // Final result
      // Display total number of inversions
      state.description = `Total inversions: ${totalInversions}`;
      
      // Sort the array to show the fully sorted state for reference
      const sortedArray = [...state.array].map(el => el.value).sort((a, b) => a - b);
      
      // Create a map to track which elements have been placed in the sorted position
      const elementStatus = new Map<number, string>();
      
      // Compare original vs sorted positions
      for (let i = 0; i < state.array.length; i++) {
        const originalValue = state.array[i].value;
        const sortedIndex = sortedArray.indexOf(originalValue);
        
        if (i === sortedIndex) {
          state.array[i].status = 'sorted';
        } else {
          state.array[i].status = 'comparing';
        }
      }
    }
  };

  // Update visualization state for Strassen's Matrix Multiplication
  const updateStrassenMatrixState = (state: VisualizationState) => {
    const currentStage = visualizationStage - 1;
    
    // Reset all statuses
    state.array.forEach(el => el.status = 'normal');
    
    // Determine matrix size (assume square matrix)
    const totalElements = state.array.length;
    const matrixSize = Math.sqrt(totalElements / 2); // Divide by 2 because we have 2 matrices
    const elementsPerMatrix = Math.floor(totalElements / 2);
    
    if (currentStage === 0) {
      // Initial display - highlight the two matrices
      for (let i = 0; i < elementsPerMatrix; i++) {
        state.array[i].status = 'left'; // Matrix A
      }
      
      for (let i = elementsPerMatrix; i < totalElements; i++) {
        state.array[i].status = 'right'; // Matrix B
      }
      
      state.description = `Matrix A (${matrixSize}×${matrixSize}) and Matrix B (${matrixSize}×${matrixSize})`;
    } else if (currentStage === 1) {
      // Divide matrices into quadrants
      const quadrantSize = Math.floor(matrixSize / 2);
      
      // Helper to get element index in flattened matrix
      const getIndex = (matrix: 'A' | 'B', row: number, col: number) => {
        const baseOffset = matrix === 'B' ? elementsPerMatrix : 0;
        return baseOffset + row * matrixSize + col;
      };
      
      // Highlight quadrants with different statuses
      // A11
      for (let i = 0; i < quadrantSize; i++) {
        for (let j = 0; j < quadrantSize; j++) {
          state.array[getIndex('A', i, j)].status = 'left';
        }
      }
      
      // A12
      for (let i = 0; i < quadrantSize; i++) {
        for (let j = quadrantSize; j < matrixSize; j++) {
          state.array[getIndex('A', i, j)].status = 'right';
        }
      }
      
      // A21
      for (let i = quadrantSize; i < matrixSize; i++) {
        for (let j = 0; j < quadrantSize; j++) {
          state.array[getIndex('A', i, j)].status = 'comparing';
        }
      }
      
      // A22
      for (let i = quadrantSize; i < matrixSize; i++) {
        for (let j = quadrantSize; j < matrixSize; j++) {
          state.array[getIndex('A', i, j)].status = 'pivot';
        }
      }
      
      // Do similar for Matrix B
      // Just mark all of B as normal for now to avoid too many colors
      
      state.description = `Divide each matrix into 4 quadrants: A11, A12, A21, A22 and B11, B12, B21, B22`;
    } else if (currentStage >= 2 && currentStage <= 8) {
      // Seven recursive multiplications (P1 through P7)
      const stepIndex = currentStage - 2;
      const operations = [
        "P1 = (A11 + A22)(B11 + B22)",
        "P2 = (A21 + A22)B11",
        "P3 = A11(B12 - B22)",
        "P4 = A22(B21 - B11)",
        "P5 = (A11 + A12)B22",
        "P6 = (A21 - A11)(B11 + B12)",
        "P7 = (A12 - A22)(B21 + B22)"
      ];
      
      const quadrantSize = Math.floor(matrixSize / 2);
      const getIndex = (matrix: 'A' | 'B', row: number, col: number) => {
        const baseOffset = matrix === 'B' ? elementsPerMatrix : 0;
        return baseOffset + row * matrixSize + col;
      };
      
      // Highlight different parts of the matrices based on the current operation
      if (stepIndex === 0) { // P1
        // Highlight A11 + A22
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B11 + B22
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      } else if (stepIndex === 1) { // P2
        // Highlight A21 + A22
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B11
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      }
      // Similar patterns for other operations
      
      state.description = `Computing ${operations[stepIndex]}`;
    } else if (currentStage === 9) {
      // Combining the results
      state.description = `Combining results to form the final matrix:
      C11 = P1 + P4 - P5 + P7
      C12 = P3 + P5
      C21 = P2 + P4
      C22 = P1 - P2 + P3 + P6`;
      
      // Highlight the result matrix area
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].status = 'sorted';
      }
    }
  };

  // Handle pause/play
  const togglePause = () => {
    setIsPaused(prev => {
      const newState = !prev;
      
      if (newState === false && isVisualizing && visualizationStage < currentSteps.length) {
        // Resume animation
        previousTimeRef.current = null;
        requestRef.current = requestAnimationFrame(animate);
      }
      
      return newState;
    });
  };

  // Handle speed change
  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    setVisualSpeed(newValue as number);
  };

  // Update complexity info when algorithm changes
  useEffect(() => {
    resetVisualization();
  }, [algorithm]);

  // Set up animation frame for auto-advancing visualization
  useEffect(() => {
    if (isVisualizing && !isPaused && visualizationStage < currentSteps.length) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isVisualizing, isPaused, visualizationStage, currentSteps.length, visualSpeed]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setAlgorithm(event.target.value);
  };

  // Render array element with appropriate styling
  const renderArrayElement = (element: ArrayElement, index: number) => {
    let backgroundColor = theme.palette.background.paper;
    let color = theme.palette.text.primary;
    let borderColor = theme.palette.divider;
    
    switch (element.status) {
      case 'comparing':
        backgroundColor = theme.palette.warning.light;
        color = theme.palette.warning.contrastText;
        break;
      case 'sorted':
        backgroundColor = theme.palette.success.light;
        color = theme.palette.success.contrastText;
        break;
      case 'pivot':
        backgroundColor = theme.palette.error.light;
        color = theme.palette.error.contrastText;
        break;
      case 'current':
        backgroundColor = theme.palette.info.light;
        color = theme.palette.info.contrastText;
        break;
      case 'left':
        backgroundColor = theme.palette.primary.light;
        color = theme.palette.primary.contrastText;
        break;
      case 'right':
        backgroundColor = theme.palette.secondary.light;
        color = theme.palette.secondary.contrastText;
        break;
    }
    
    return (
      <Box
        key={index}
        sx={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          color,
          border: `2px solid ${borderColor}`,
          borderRadius: '4px',
          fontWeight: 'bold',
          margin: '4px',
          transition: 'all 0.3s ease'
        }}
      >
        {element.value}
      </Box>
    );
  };

  // Enhanced visualization of the array
  const renderArrayVisualization = () => {
    if (!visualizationState) return null;
    
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Current Array State
        </Typography>
        
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 2
        }}>
          {visualizationState.array.map((element, index) => renderArrayElement(element, index))}
        </Box>
        
        <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
          {visualizationState.description}
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={(visualizationState.currentStep / visualizationState.totalSteps) * 100}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={togglePause}
          >
            {isPaused ? 'Play' : 'Pause'}
          </Button>
          
          <Box sx={{ width: '200px', ml: 2 }}>
            <Stack spacing={2} direction="row" sx={{ mb: 1, mx: 1 }} alignItems="center">
              <SpeedIcon fontSize="small" />
              <Slider
                aria-label="Visualization Speed"
                value={visualSpeed}
                onChange={handleSpeedChange}
                min={10}
                max={90}
              />
              <SpeedIcon />
            </Stack>
          </Box>
          
          <Typography variant="body2" sx={{ ml: 1 }}>
            Speed: {visualSpeed}%
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined"
            disabled={visualizationStage <= 1}
            onClick={() => setVisualizationStage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Typography>
            {visualizationStage} / {currentSteps.length}
          </Typography>
          <Button 
            variant="contained"
            disabled={visualizationStage >= currentSteps.length}
            onClick={() => setVisualizationStage(prev => Math.min(currentSteps.length, prev + 1))}
          >
            Next
          </Button>
        </Box>
      </Box>
    );
  };

  // Enhanced tree visualization with nesting and active state indicators
  const renderRecursionTree = () => {
    if (!recursionTreeData.length) return null;
    
    const maxLevel = Math.max(...recursionTreeData.map(node => node.level));
    
    // Group nodes by level for better rendering
    const nodesByLevel = recursionTreeData.reduce((acc, node) => {
      if (!acc[node.level]) acc[node.level] = [];
      acc[node.level].push(node);
      return acc;
    }, {} as Record<number, RecursiveCall[]>);
    
    return (
      <Box sx={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        {(Object.entries(nodesByLevel) as [string, RecursiveCall[]][]).map(([level, nodes], levelIndex) => (
          <Box
            key={level}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 2,
              gap: 2,
              flexWrap: 'nowrap'
            }}
          >
            {nodes.map((node, nodeIndex) => {
              // Determine card color based on node status
              let bgcolor = 'background.paper';
              let color = 'text.primary';
              
              if (node.status === 'active') {
                bgcolor = 'primary.light';
                color = 'primary.contrastText';
              } else if (node.status === 'completed') {
                bgcolor = 'success.light';
                color = 'success.contrastText';
              }
              
              return (
                <Box key={node.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Connect to parent with a line */}
                  {node.parentId && (
                    <Box sx={{ 
                      height: '20px', 
                      width: '2px', 
                      backgroundColor: theme.palette.divider,
                      mb: '4px'
                    }} />
                  )}
                  
                  <Card 
                    sx={{ 
                      minWidth: '140px', 
                      maxWidth: '180px',
                      bgcolor,
                      color,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {algorithm === 'mergeSort' ? 'MergeSort' : 
                         algorithm === 'quickSort' ? 'QuickSort' :
                         algorithm === 'binarySearch' ? 'BinarySearch' : 'Divide'}
                      </Typography>
                      
                      {node.array && (
                        <Typography variant="caption" component="div" sx={{ 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          [{node.array.join(', ')}]
                        </Typography>
                      )}
                      
                      {node.pivot !== undefined && (
                        <Typography variant="caption" component="div">
                          Pivot: {node.pivot}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Container>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Divide and Conquer Zone
        </Typography>
        <Typography variant="body1" paragraph>
          Explore algorithms that break down problems into smaller subproblems, solve them recursively, 
          and combine solutions to solve the original problem. Visualize recursive tree structures and 
          understand the power of divide and conquer strategies.
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Divide and Conquer Principle:</strong> Break a problem into subproblems, solve the subproblems recursively, 
            and then combine their solutions to solve the original problem.
          </Typography>
        </Alert>
      </Paper>

      <Grid container spacing={3}>
        <Grid sx={{ width: { xs: '100%', md: '25%' }, p: 1.5 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Algorithm Selection</Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="algorithm-select-label">Algorithm</InputLabel>
              <Select
                labelId="algorithm-select-label"
                id="algorithm-select"
                value={algorithm}
                label="Algorithm"
                onChange={handleAlgorithmChange}
              >
                <MenuItem value="mergeSort">Merge Sort</MenuItem>
                <MenuItem value="quickSort">Quick Sort</MenuItem>
                <MenuItem value="binarySearch">Binary Search</MenuItem>
                <MenuItem value="majorityElement">Majority Element</MenuItem>
                <MenuItem value="countInversions">Counting Inversions</MenuItem>
                <MenuItem value="orderStatistics">Order Statistics (QuickSelect)</MenuItem>
                <MenuItem value="strassenMatrix">Strassen's Matrix Multiplication</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Input Array"
              placeholder="e.g. 5, 2, 9, 1, 7, 6, 3"
              value={inputArray}
              onChange={(e) => setInputArray(e.target.value)}
              fullWidth
              margin="normal"
              helperText="Enter comma-separated numbers"
            />

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={generateRandomInput}
              >
                Generate Input
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={startVisualization}
                disabled={!inputArray.trim()}
              >
                Start Visualization
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={resetVisualization}
                disabled={!isVisualizing}
              >
                Reset
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Current Algorithm</Typography>
            <Typography variant="body2">
              <strong>{currentAlgo?.name || 'Select an algorithm'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {currentAlgo?.description || 'No description available'}
            </Typography>
            
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<TimelineIcon />} 
                size="small" 
                label="Divide & Conquer" 
                color="primary" 
                variant="outlined" 
              />
            </Stack>
          </Paper>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '75%' }, p: 1.5 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="divide and conquer tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<AnalyticsIcon />} label="Visualization" iconPosition="start" />
              <Tab icon={<SchemaIcon />} label="Recursion Tree" iconPosition="start" />
              <Tab icon={<TimelineIcon />} label="Algorithm Steps" iconPosition="start" />
              <Tab icon={<CodeIcon />} label="Pseudocode" iconPosition="start" />
              <Tab label="Complexity Analysis" />
            </Tabs>
          </Box>
          
          <Paper sx={{ p: 2, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
            {tabValue === 0 && (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {currentAlgo?.name || 'Algorithm'} Visualization
                </Typography>
                
                {isVisualizing ? (
                  <Box sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1, 
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Enhanced visualization */}
                    {renderArrayVisualization()}
                  </Box>
                ) : (
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      Enter an input array and click "Start Visualization" to see the algorithm in action
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={generateRandomInput}
                    >
                      Generate Random Input
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Recursion Tree
                </Typography>
                
                {isVisualizing && recursionTreeData.length > 0 ? (
                  <Box sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1, 
                    minHeight: '300px',
                    overflowX: 'auto'
                  }}>
                    {/* Enhanced recursive tree visualization */}
                    {renderRecursionTree()}
                    
                    <Box sx={{ mt: 3 }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Chip 
                          size="small" 
                          label="Active Call" 
                          sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                        />
                        <Chip 
                          size="small" 
                          label="Completed Call" 
                          sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
                        />
                        <Chip 
                          size="small" 
                          label="Waiting Call" 
                          sx={{ bgcolor: 'background.paper' }}
                        />
                      </Stack>
                      
                      <Alert severity="info" icon={<InfoIcon />}>
                        The recursion tree shows how the divide-and-conquer algorithm breaks down the problem
                        into smaller subproblems. Each node represents a recursive function call with its own
                        input array. The tree grows as the problem is divided and then solutions are combined.
                      </Alert>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      Start the visualization to see the recursion tree
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                <Typography variant="h6" gutterBottom>Step-by-step Algorithm Execution</Typography>
                
                {isVisualizing && currentSteps.length > 0 ? (
                  <Stack spacing={1}>
                    {currentSteps.map((step, index) => (
                      <Alert 
                        key={index} 
                        severity={index < visualizationStage ? "success" : "info"}
                        sx={{ 
                          opacity: index < visualizationStage ? 1 : 0.7,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Step {index + 1}:</strong> {step}
                        </Typography>
                      </Alert>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '300px'
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      Start the visualization to see the algorithm steps
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {tabValue === 3 && (
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                <Typography variant="h6" gutterBottom>Pseudocode</Typography>
                
                {currentAlgo?.pseudocode ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      bgcolor: 'background.default',
                      p: 2,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {currentAlgo.pseudocode}
                  </Paper>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Pseudocode not available for this algorithm
                  </Typography>
                )}
              </Box>
            )}
            
            {tabValue === 4 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Complexity Analysis</Typography>
                <Grid container spacing={2}>
                  <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                    <Typography variant="body2"><strong>Time Complexity:</strong></Typography>
                    <Typography variant="body2">Best: {currentAlgo?.timeComplexity?.best || 'N/A'}</Typography>
                    <Typography variant="body2">Average: {currentAlgo?.timeComplexity?.average || 'N/A'}</Typography>
                    <Typography variant="body2">Worst: {currentAlgo?.timeComplexity?.worst || 'N/A'}</Typography>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                    <Typography variant="body2"><strong>Space Complexity:</strong> {currentAlgo?.spaceComplexity || 'N/A'}</Typography>
                    <Typography variant="body2"><strong>Stable:</strong> {currentAlgo?.stable ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2"><strong>Additional Notes:</strong> {currentAlgo?.additionalNotes || 'None'}</Typography>
                  </Grid>
                </Grid>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {currentAlgo?.name || 'This algorithm'} is a classic example of the divide-and-conquer paradigm. 
                  {currentAlgo?.description || ''}
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 3 }}>Key Characteristics of Divide and Conquer</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1">Advantages</Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          <li><Typography variant="body2">Efficient for large data sets</Typography></li>
                          <li><Typography variant="body2">Naturally suited for parallel computing</Typography></li>
                          <li><Typography variant="body2">Often leads to optimal solutions</Typography></li>
                          <li><Typography variant="body2">Suitable for problems with optimal substructure</Typography></li>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle1">Limitations</Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          <li><Typography variant="body2">Recursion overhead can be significant</Typography></li>
                          <li><Typography variant="body2">May require additional space for recursive stack</Typography></li>
                          <li><Typography variant="body2">Might be complex to implement correctly</Typography></li>
                          <li><Typography variant="body2">Not all problems can be efficiently divided</Typography></li>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
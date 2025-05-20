import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Slider,
  Button,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import MemoryIcon from '@mui/icons-material/Memory';

// Interface for algorithm data
interface AlgorithmData {
  name: string;
  displayName: string;
  category: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
    explanation: string;
  };
  spaceComplexity: {
    value: string;
    explanation: string;
  };
  keyPoints: string[];
  useCases: string[];
  limitations: string[];
  code?: string;
}

// Interface for complexity data points
interface ComplexityPoint {
  n: number;
  constant: number;
  logarithmic: number;
  linear: number;
  linearithmic: number;
  quadratic: number;
  cubic: number;
  exponential: number;
}

const algorithms: { [key: string]: AlgorithmData } = {
  quicksort: {
    name: 'quicksort',
    displayName: 'Quick Sort',
    category: 'Sorting',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      explanation: 'Quick Sort divides the array into smaller subarrays and recursively sorts them. Best and average cases occur with balanced partitioning, while worst case occurs with already sorted arrays or when the pivot selection consistently results in unbalanced partitions.'
    },
    spaceComplexity: {
      value: 'O(log n)',
      explanation: 'Quick Sort requires extra space for the recursive call stack, which is proportional to the height of the recursion tree. In the average case, this is O(log n).'
    },
    keyPoints: [
      'Divide and conquer algorithm',
      'In-place sorting (doesn\'t require extra array)',
      'Unstable sort (relative order of equal elements may change)',
      'Pivot selection affects performance significantly'
    ],
    useCases: [
      'General purpose sorting where average case performance matters',
      'Systems with limited memory where in-place sorting is beneficial',
      'When stability of sort is not required'
    ],
    limitations: [
      'Worst-case performance is poor (O(n²))',
      'Not stable - may change the relative order of equal elements',
      'Performance degrades on already sorted or nearly sorted data'
    ],
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
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
  
  // Traverse through all elements, compare with pivot
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      // Swap elements
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Swap pivot element with the element at i+1
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  
  return i + 1;
}`
  },
  mergesort: {
    name: 'mergesort',
    displayName: 'Merge Sort',
    category: 'Sorting',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      explanation: 'Merge Sort consistently divides the array into halves and merges them back in sorted order. This recursive division and merging process results in O(n log n) time complexity in all cases, making it very predictable.'
    },
    spaceComplexity: {
      value: 'O(n)',
      explanation: 'Merge Sort requires additional space proportional to the input size for the temporary arrays used during the merging process.'
    },
    keyPoints: [
      'Divide and conquer algorithm',
      'Stable sort (preserves relative order of equal elements)',
      'Consistent performance regardless of input data',
      'Not in-place (requires additional memory)'
    ],
    useCases: [
      'External sorting (for large data that doesn\'t fit in memory)',
      'When stable sorting is required',
      'When predictable performance is important regardless of input data'
    ],
    limitations: [
      'Requires O(n) extra space',
      'Generally slower than Quick Sort for in-memory sorting',
      'Excessive recursive calls can cause stack overflow for very large datasets'
    ],
    code: `function mergeSort(arr) {
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
}`
  },
  bubblesort: {
    name: 'bubblesort',
    displayName: 'Bubble Sort',
    category: 'Sorting',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      explanation: 'Bubble Sort compares adjacent elements and swaps them if they are in the wrong order. Best case occurs when the array is already sorted, requiring only one pass (O(n)). Average and worst cases require comparing and potentially swapping each element multiple times, resulting in O(n²) operations.'
    },
    spaceComplexity: {
      value: 'O(1)',
      explanation: 'Bubble Sort only requires a constant amount of additional memory regardless of input size, as it swaps elements in place.'
    },
    keyPoints: [
      'Simple implementation',
      'Stable sort (preserves relative order of equal elements)',
      'In-place algorithm (minimal space usage)',
      'Inefficient for large datasets'
    ],
    useCases: [
      'Educational purposes to understand basic sorting concepts',
      'Very small datasets where simplicity is more important than efficiency',
      'Situations where memory usage is extremely constrained'
    ],
    limitations: [
      'Very inefficient for large datasets',
      'Poor performance compared to other sorting algorithms',
      'No practical use for serious applications with significant data'
    ],
    code: `function bubbleSort(arr) {
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
}`
  },
  dijkstra: {
    name: 'dijkstra',
    displayName: 'Dijkstra\'s Algorithm',
    category: 'Graph',
    timeComplexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
      explanation: 'Dijkstra\'s algorithm finds the shortest path in a weighted graph. The time complexity depends on the data structure used for the priority queue. With a binary heap priority queue, it takes O((V + E) log V) time, where V is the number of vertices and E is the number of edges.'
    },
    spaceComplexity: {
      value: 'O(V)',
      explanation: 'Dijkstra\'s algorithm requires space to store the distance values, visited status, and priority queue for all vertices in the graph.'
    },
    keyPoints: [
      'Greedy algorithm for finding shortest paths',
      'Works for graphs with non-negative edge weights',
      'Produces shortest path tree from source to all vertices',
      'Efficiently implemented using priority queues'
    ],
    useCases: [
      'Network routing protocols (finding shortest network paths)',
      'Road navigation systems (finding fastest/shortest routes)',
      'Solving minimum cost problems in networks',
      'Resource allocation problems'
    ],
    limitations: [
      'Cannot handle negative edge weights',
      'Becomes inefficient for dense graphs',
      'May not be suitable for extremely large graphs due to memory requirements',
      'Doesn\'t work if the graph contains negative cycles'
    ],
    code: `function dijkstra(graph, startNode) {
  const distances = {};
  const visited = {};
  const previous = {};
  const priorityQueue = new PriorityQueue();
  
  // Initialize distances
  for (let vertex in graph) {
    distances[vertex] = vertex === startNode ? 0 : Infinity;
    previous[vertex] = null;
    priorityQueue.enqueue(vertex, distances[vertex]);
  }
  
  while (!priorityQueue.isEmpty()) {
    const current = priorityQueue.dequeue();
    
    if (visited[current]) continue;
    visited[current] = true;
    
    for (let neighbor in graph[current]) {
      const distance = distances[current] + graph[current][neighbor];
      
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previous[neighbor] = current;
        priorityQueue.enqueue(neighbor, distance);
      }
    }
  }
  
  return { distances, previous };
}`
  },
  astar: {
    name: 'astar',
    displayName: 'A* Search',
    category: 'Graph',
    timeComplexity: {
      best: 'O(E)',
      average: 'O(b^d)',
      worst: 'O(b^d)',
      explanation: 'A* Search is a best-first search algorithm that uses heuristics to guide the search. Time complexity is O(b^d) where b is the branching factor and d is the depth of the solution. The best case is O(E) where E is the number of edges, when the heuristic perfectly guides the search straight to the goal.'
    },
    spaceComplexity: {
      value: 'O(b^d)',
      explanation: 'A* Search maintains a priority queue of nodes to be explored. In worst case, this could be all nodes at the solution depth d, with b being the branching factor.'
    },
    keyPoints: [
      'Informed search algorithm using heuristics',
      'Combines Dijkstra\'s algorithm and greedy best-first search',
      'Complete (always finds a solution if one exists)',
      'Optimal (always finds the optimal solution if the heuristic is admissible)'
    ],
    useCases: [
      'Pathfinding in video games',
      'Robot navigation',
      'Puzzle solving (like 8-puzzle, 15-puzzle)',
      'Route planning in maps and navigation systems'
    ],
    limitations: [
      'Memory usage can be prohibitive for large problem spaces',
      'Performance depends heavily on the quality of the heuristic function',
      'May be overkill for simple pathfinding problems',
      'Not suitable when memory is severely constrained'
    ],
    code: `function aStarSearch(start, goal, graph) {
  const openSet = new PriorityQueue();
  const closedSet = new Set();
  const cameFrom = {};
  
  const gScore = {}; // Cost from start to current node
  const fScore = {}; // Estimated cost from start to goal through current node
  
  gScore[start] = 0;
  fScore[start] = heuristic(start, goal);
  
  openSet.enqueue(start, fScore[start]);
  
  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    
    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }
    
    closedSet.add(current);
    
    for (let neighbor of graph.getNeighbors(current)) {
      if (closedSet.has(neighbor)) continue;
      
      const tentativeGScore = gScore[current] + graph.distance(current, neighbor);
      
      if (!openSet.contains(neighbor) || tentativeGScore < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, goal);
        
        if (!openSet.contains(neighbor)) {
          openSet.enqueue(neighbor, fScore[neighbor]);
        }
      }
    }
  }
  
  return null; // No path found
  
  function heuristic(a, b) {
    // Manhattan distance, Euclidean distance, or other heuristic
    return manhattanDistance(a, b);
  }
  
  function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[current]) {
      current = cameFrom[current];
      path.unshift(current);
    }
    return path;
  }
}`
  },
  bfs: {
    name: 'bfs',
    displayName: 'Breadth-First Search',
    category: 'Graph',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      explanation: 'BFS explores all vertices at the current depth before moving to vertices at the next depth level. It visits each vertex and edge once, resulting in O(V + E) time complexity, where V is the number of vertices and E is the number of edges.'
    },
    spaceComplexity: {
      value: 'O(V)',
      explanation: 'BFS uses a queue to keep track of vertices to visit next. In worst case, the queue could contain all vertices at a particular level, which can be up to O(V) in a graph.'
    },
    keyPoints: [
      'Traverses breadth-wise, level by level',
      'Uses a queue data structure',
      'Complete (finds a solution if one exists at the shallowest level)',
      'Optimal for unweighted graphs (finds shortest path in terms of number of edges)'
    ],
    useCases: [
      'Shortest path in unweighted graphs',
      'Connected components in undirected graphs',
      'Level order traversal of trees',
      'Finding all nodes within a connected component'
    ],
    limitations: [
      'Not suitable for weighted graphs when finding shortest paths',
      'Memory usage can be high for graphs with high branching factor',
      'Not efficient for very deep searches'
    ],
    code: `function breadthFirstSearch(graph, startNode) {
  const queue = [startNode];
  const visited = new Set();
  visited.add(startNode);
  const result = [];
  
  while (queue.length > 0) {
    const currentNode = queue.shift();
    result.push(currentNode);
    
    for (let neighbor of graph.getNeighbors(currentNode)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return result;
}`
  },
  dfs: {
    name: 'dfs',
    displayName: 'Depth-First Search',
    category: 'Graph',
    timeComplexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      explanation: 'DFS explores as far as possible along each branch before backtracking. It visits each vertex and edge once, resulting in O(V + E) time complexity, where V is the number of vertices and E is the number of edges.'
    },
    spaceComplexity: {
      value: 'O(H)',
      explanation: 'DFS uses a stack (either explicit or the call stack for recursion) to keep track of vertices. The space complexity is O(H) where H is the maximum height of the recursion tree, which can be up to O(V) in the worst case.'
    },
    keyPoints: [
      'Traverses depth-wise, going as deep as possible before backtracking',
      'Can be implemented recursively or using a stack',
      'Not optimal for finding shortest paths',
      'Better space complexity than BFS for deep graphs'
    ],
    useCases: [
      'Topological sorting',
      'Finding connected components',
      'Detecting cycles in graphs',
      'Solving puzzles like mazes'
    ],
    limitations: [
      'Can get trapped in infinite loops if cycle detection is not implemented',
      'Not optimal for finding shortest paths',
      'Can require a lot of stack space for deeply nested structures'
    ],
    code: `function depthFirstSearch(graph, startNode) {
  const visited = new Set();
  const result = [];
  
  function dfs(node) {
    visited.add(node);
    result.push(node);
    
    for (let neighbor of graph.getNeighbors(node)) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }
  
  dfs(startNode);
  return result;
}`
  },
  heapsort: {
    name: 'heapsort',
    displayName: 'Heap Sort',
    category: 'Sorting',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      explanation: 'Heap Sort works by building a heap from the input data and then repeatedly extracting the maximum element. Building the heap takes O(n) time, and each of the n extractions takes O(log n) time, resulting in a consistent O(n log n) time complexity in all cases.'
    },
    spaceComplexity: {
      value: 'O(1)',
      explanation: 'Heap Sort sorts the array in-place, requiring only a constant amount of additional space regardless of input size.'
    },
    keyPoints: [
      'In-place sorting algorithm',
      'Consistent performance regardless of input data',
      'Unstable sort (doesn\'t preserve relative order of equal elements)',
      'Uses a binary heap data structure'
    ],
    useCases: [
      'Systems with limited memory where in-place sorting is beneficial',
      'Applications requiring guaranteed time complexity in all cases',
      'When stability of sort is not required'
    ],
    limitations: [
      'Generally slower than Quick Sort in practice despite similar asymptotic complexity',
      'Not stable - may change the relative order of equal elements',
      'Not adaptive - doesn\'t take advantage of partially sorted inputs'
    ],
    code: `function heapSort(arr) {
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
}`
  },
  dp: {
    name: 'dp',
    displayName: 'Dynamic Programming',
    category: 'Paradigm',
    timeComplexity: {
      best: 'Varies by problem',
      average: 'Varies by problem',
      worst: 'Varies by problem',
      explanation: 'Dynamic Programming complexity varies widely depending on the specific problem. It typically reduces exponential time complexity to polynomial time by storing and reusing solutions to subproblems, avoiding redundant calculations.'
    },
    spaceComplexity: {
      value: 'Varies by problem',
      explanation: 'Space complexity in Dynamic Programming depends on how solutions to subproblems are stored. It often involves a trade-off between time and space.'
    },
    keyPoints: [
      'Solves complex problems by breaking them into simpler subproblems',
      'Stores results of subproblems to avoid redundant computation',
      'Applicable when problems have overlapping subproblems and optimal substructure',
      'Can be implemented using memoization (top-down) or tabulation (bottom-up)'
    ],
    useCases: [
      'Optimization problems (e.g., knapsack problem)',
      'Shortest path algorithms',
      'String algorithms (e.g., longest common subsequence)',
      'Resource allocation problems'
    ],
    limitations: [
      'Can be difficult to identify subproblems and formulate recurrence relations',
      'May require significant memory for storing subproblem solutions',
      'Not applicable to problems lacking optimal substructure',
      'Overhead of storing solutions may outweigh benefits for simple problems'
    ],
    code: `// Example: Fibonacci using Dynamic Programming (memoization)
function fibonacci(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

// Example: Fibonacci using Dynamic Programming (tabulation)
function fibonacciTabulation(n) {
  if (n <= 1) return n;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}`
  }
};

const ComplexityAnalysis = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('quicksort');
  const [tabValue, setTabValue] = useState(0);
  const [dataSize, setDataSize] = useState(10);
  const [complexityData, setComplexityData] = useState<ComplexityPoint[]>([]);
  const [executionTimeData, setExecutionTimeData] = useState<any[]>([]);
  const [comparisonCategory, setComparisonCategory] = useState('sorting');

  // Calculation for graph data points
  useEffect(() => {
    const generateComplexityData = () => {
      const data: ComplexityPoint[] = [];
      
      // Generate data points for different complexity functions
      for (let i = 1; i <= dataSize; i++) {
        const point: ComplexityPoint = {
          n: i,
          constant: 1,
          logarithmic: Math.max(Math.log2(i), 0.1),
          linear: i,
          linearithmic: i * Math.max(Math.log2(i), 0.1),
          quadratic: i * i,
          cubic: i * i * i,
          exponential: Math.pow(2, Math.min(i, 20)) // Limit exponential growth for visualization
        };
        data.push(point);
      }
      
      setComplexityData(data);
    };
    
    generateComplexityData();
  }, [dataSize]);

  // Generate simulated execution time data
  useEffect(() => {
    const generateExecutionTimeData = () => {
      const data = [];
      
      // Different input sizes - use more data points for smoother curves
      const inputSizes = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
      
      // Generate execution time for different algorithms
      for (const size of inputSizes) {
        const entry: any = { 
          size,
          // Sorting algorithms
          // Quick Sort: n log n
          quicksort: size * Math.log2(size) * 0.01,
          // Merge Sort: n log n (slightly slower than quicksort)
          mergesort: size * Math.log2(size) * 0.015,
          // Heap Sort: n log n (slightly slower than merge sort)
          heapsort: size * Math.log2(size) * 0.02,
          // Bubble Sort: n^2
          bubblesort: Math.min(size * size * 0.001, 10000), // Cap at 10000ms for visualization
          
          // Graph algorithms
          // Dijkstra: O(E + V log V)
          dijkstra: size * Math.log2(size) * 0.025,
          // A*: Similar to Dijkstra but with heuristic
          astar: size * Math.log2(size) * 0.018,
          // BFS: O(V + E)
          bfs: size * 0.05,
          // DFS: O(V + E)
          dfs: size * 0.045,
          
          // Dynamic Programming: Varies, using O(n) for simplicity
          dp: size * 0.03 + 1
        };
        
        // Add some random variation but ensure the patterns are still clear
        for (const key of Object.keys(entry)) {
          if (key !== 'size') {
            // Less random variation to show clearer patterns
            entry[key] *= 0.95 + Math.random() * 0.1;
          }
        }
        
        data.push(entry);
      }
      
      setExecutionTimeData(data);
    };
    
    generateExecutionTimeData();
  }, []);

  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setSelectedAlgorithm(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDataSizeChange = (event: Event, newValue: number | number[]) => {
    setDataSize(newValue as number);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setComparisonCategory(event.target.value);
  };

  // Big-O color mapping
  const complexityColors = {
    constant: '#4CAF50',     // Green
    logarithmic: '#2196F3',  // Blue
    linear: '#03A9F4',       // Light Blue
    linearithmic: '#FF9800', // Orange
    quadratic: '#F44336',    // Red
    cubic: '#9C27B0',        // Purple
    exponential: '#E91E63'   // Pink
  };

  const categoryFilters = {
    sorting: ['quicksort', 'mergesort', 'heapsort', 'bubblesort'],
    graph: ['dijkstra', 'astar', 'bfs', 'dfs'],
    all: Object.keys(algorithms)
  };

  // Function to check if we should show a specific data point
  // Limits very large values for better visualization
  const shouldShowDataPoint = (value: number, index: number) => {
    if (value > 1000000) return false;
    if (index > dataSize / 2 && value > 10000) return false;
    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Algorithm Complexity Analysis
      </Typography>
      <Typography variant="body1" paragraph>
        Visualize and compare the time and space complexity of various algorithms.
        Understand how different algorithms scale with increasing input size.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Algorithm</InputLabel>
            <Select
              value={selectedAlgorithm}
              onChange={handleAlgorithmChange}
              label="Select Algorithm"
            >
              {Object.entries(algorithms).map(([key, algorithm]) => (
                <MenuItem key={key} value={key}>{algorithm.displayName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {algorithms[selectedAlgorithm] && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {algorithms[selectedAlgorithm].displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {algorithms[selectedAlgorithm].category}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Time Complexity
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Best Case:</TableCell>
                        <TableCell>{algorithms[selectedAlgorithm].timeComplexity.best}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Average Case:</TableCell>
                        <TableCell>{algorithms[selectedAlgorithm].timeComplexity.average}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Worst Case:</TableCell>
                        <TableCell>{algorithms[selectedAlgorithm].timeComplexity.worst}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {algorithms[selectedAlgorithm].timeComplexity.explanation}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Space Complexity
                </Typography>
                <Typography variant="body1">
                  <strong>{algorithms[selectedAlgorithm].spaceComplexity.value}</strong>
                </Typography>
                <Typography variant="body2">
                  {algorithms[selectedAlgorithm].spaceComplexity.explanation}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Key Characteristics
                </Typography>
                <List dense>
                  {algorithms[selectedAlgorithm].keyPoints.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          )}
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Complexity Visualization" />
              <Tab label="Performance Comparison" />
              <Tab label="Implementation" />
            </Tabs>
          </Box>
          
          {tabValue === 0 && (
            <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>Big-O Complexity Visualization</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>Input Size (n): {dataSize}</Typography>
                <Slider
                  value={dataSize}
                  onChange={handleDataSizeChange}
                  min={5}
                  max={50}
                  valueLabelDisplay="auto"
                />
              </Box>
              
              <Box sx={{ flexGrow: 1, width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={complexityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="n" 
                      label={{ value: 'Input Size (n)', position: 'insideBottomRight', offset: -10 }} 
                    />
                    <YAxis 
                      label={{ value: 'Operations', angle: -90, position: 'insideLeft' }} 
                      scale="log"
                      domain={[0.1, 'auto']}
                    />
                    <RechartsTooltip formatter={(value, name) => [Number(value).toFixed(2), name]} />
                    <Legend />
                    <Line 
                      name="O(1) - Constant" 
                      type="monotone" 
                      dataKey="constant" 
                      stroke={complexityColors.constant} 
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      name="O(log n) - Logarithmic" 
                      type="monotone" 
                      dataKey="logarithmic" 
                      stroke={complexityColors.logarithmic} 
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      name="O(n) - Linear" 
                      type="monotone" 
                      dataKey="linear" 
                      stroke={complexityColors.linear} 
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      name="O(n log n) - Linearithmic" 
                      type="monotone" 
                      dataKey="linearithmic" 
                      stroke={complexityColors.linearithmic} 
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      name="O(n²) - Quadratic" 
                      type="monotone" 
                      dataKey="quadratic" 
                      stroke={complexityColors.quadratic} 
                      dot={false}
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    {complexityData.some(d => shouldShowDataPoint(d.cubic, complexityData.indexOf(d))) && (
                      <Line 
                        name="O(n³) - Cubic" 
                        type="monotone" 
                        dataKey="cubic" 
                        stroke={complexityColors.cubic} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {complexityData.some(d => shouldShowDataPoint(d.exponential, complexityData.indexOf(d))) && (
                      <Line 
                        name="O(2ⁿ) - Exponential" 
                        type="monotone" 
                        dataKey="exponential" 
                        stroke={complexityColors.exponential} 
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This graph shows how different complexity classes scale with input size. Note the logarithmic scale on the Y-axis.
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mt: 2 }}>
                  <Tooltip title="Execution time doesn't change with input size">
                    <Chip 
                      label="O(1) - Constant" 
                      sx={{ bgcolor: complexityColors.constant, color: 'white', m: 0.5 }}
                      icon={<InfoIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Grows very slowly, e.g., binary search">
                    <Chip 
                      label="O(log n) - Logarithmic" 
                      sx={{ bgcolor: complexityColors.logarithmic, color: 'white', m: 0.5 }}
                      icon={<InfoIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Grows linearly with input size, e.g., array traversal">
                    <Chip 
                      label="O(n) - Linear" 
                      sx={{ bgcolor: complexityColors.linear, color: 'white', m: 0.5 }}
                      icon={<InfoIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Common in efficient sorting algorithms, e.g., merge sort">
                    <Chip 
                      label="O(n log n) - Linearithmic" 
                      sx={{ bgcolor: complexityColors.linearithmic, color: 'white', m: 0.5 }}
                      icon={<InfoIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Common in nested loops, e.g., simple sorting algorithms">
                    <Chip 
                      label="O(n²) - Quadratic" 
                      sx={{ bgcolor: complexityColors.quadratic, color: 'white', m: 0.5 }}
                      icon={<InfoIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Three nested loops, rapidly becomes inefficient">
                    <Chip 
                      label="O(n³) - Cubic" 
                      sx={{ bgcolor: complexityColors.cubic, color: 'white', m: 0.5 }}
                      icon={<InfoIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                  <Tooltip title="Grows extremely rapidly, often impractical for large inputs">
                    <Chip 
                      label="O(2ⁿ) - Exponential" 
                      sx={{ bgcolor: complexityColors.exponential, color: 'white', m: 0.5 }}
                      icon={<WarningIcon sx={{ color: 'white !important' }} />}
                      size="small"
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          )}
          
          {tabValue === 1 && (
            <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Algorithm Performance Comparison</Typography>
                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={comparisonCategory}
                    onChange={handleCategoryChange}
                    label="Category"
                  >
                    <MenuItem value="sorting">Sorting</MenuItem>
                    <MenuItem value="graph">Graph</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flexGrow: 1, width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={executionTimeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="size" 
                      label={{ value: 'Input Size (n)', position: 'insideBottomRight', offset: -10 }} 
                      scale="log"
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      label={{ value: 'Execution Time (ms)', angle: -90, position: 'insideLeft' }} 
                      scale="log"
                      domain={[0.1, 'auto']}
                    />
                    <RechartsTooltip formatter={(value, name) => [`${Number(value).toFixed(2)} ms`, name]} />
                    <Legend verticalAlign="top" height={36}/>
                    {comparisonCategory === 'sorting' && (
                      <>
                        <Line 
                          name="Quick Sort" 
                          type="monotone" 
                          dataKey="quicksort" 
                          stroke="#2196F3" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="Merge Sort" 
                          type="monotone" 
                          dataKey="mergesort" 
                          stroke="#4CAF50" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="Heap Sort" 
                          type="monotone" 
                          dataKey="heapsort" 
                          stroke="#9C27B0" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="Bubble Sort" 
                          type="monotone" 
                          dataKey="bubblesort" 
                          stroke="#F44336" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                      </>
                    )}
                    {comparisonCategory === 'graph' && (
                      <>
                        <Line 
                          name="Dijkstra's Algorithm" 
                          type="monotone" 
                          dataKey="dijkstra"
                          stroke="#FF9800" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="A* Search" 
                          type="monotone" 
                          dataKey="astar"
                          stroke="#9C27B0" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="BFS" 
                          type="monotone" 
                          dataKey="bfs"
                          stroke="#2196F3" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="DFS" 
                          type="monotone" 
                          dataKey="dfs"
                          stroke="#4CAF50" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                      </>
                    )}
                    {comparisonCategory === 'all' && (
                      <>
                        <Line 
                          name="Quick Sort (n log n)" 
                          type="monotone" 
                          dataKey="quicksort"
                          stroke="#2196F3" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="Bubble Sort (n²)" 
                          type="monotone" 
                          dataKey="bubblesort"
                          stroke="#F44336" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="BFS (n+e)" 
                          type="monotone" 
                          dataKey="bfs"
                          stroke="#4CAF50" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                        <Line 
                          name="Dynamic Programming" 
                          type="monotone" 
                          dataKey="dp"
                          stroke="#FF9800" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          isAnimationActive={true}
                        />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                This graph compares the actual performance of different algorithms as input size increases.
                Note that both axes use logarithmic scale to better show the differences.
              </Typography>
            </Paper>
          )}
          
          {tabValue === 2 && algorithms[selectedAlgorithm]?.code && (
            <Paper sx={{ p: 2, height: '500px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Implementation</Typography>
              <Box sx={{ 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#000000', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {algorithms[selectedAlgorithm].code}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      <Grid container spacing={3}>
        <Grid sx={{ width: '100%', p: 1.5 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Understanding Big-O Notation</Typography>
            <Typography variant="body1" paragraph>
              Big-O notation is used to classify algorithms based on how their runtime or space requirements grow as the input size increases.
            </Typography>
            
            <TableContainer sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Notation</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Example</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>O(1)</strong></TableCell>
                    <TableCell>Constant</TableCell>
                    <TableCell>Execution time remains constant regardless of input size</TableCell>
                    <TableCell>Array access, hash table lookup</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(log n)</strong></TableCell>
                    <TableCell>Logarithmic</TableCell>
                    <TableCell>Growth rate decreases as input size increases</TableCell>
                    <TableCell>Binary search, balanced binary tree operations</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(n)</strong></TableCell>
                    <TableCell>Linear</TableCell>
                    <TableCell>Growth rate is directly proportional to input size</TableCell>
                    <TableCell>Linear search, array traversal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(n log n)</strong></TableCell>
                    <TableCell>Linearithmic</TableCell>
                    <TableCell>Slightly faster than quadratic growth</TableCell>
                    <TableCell>Efficient sorting algorithms (merge sort, quick sort)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(n²)</strong></TableCell>
                    <TableCell>Quadratic</TableCell>
                    <TableCell>Growth rate is proportional to the square of input size</TableCell>
                    <TableCell>Simple sorting algorithms (bubble sort, insertion sort)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(n³)</strong></TableCell>
                    <TableCell>Cubic</TableCell>
                    <TableCell>Growth rate is proportional to the cube of input size</TableCell>
                    <TableCell>Some matrix operations, simple 3D algorithms</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(2ⁿ)</strong></TableCell>
                    <TableCell>Exponential</TableCell>
                    <TableCell>Growth rate doubles with each addition to input size</TableCell>
                    <TableCell>Recursive fibonacci, generating all subsets</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>O(n!)</strong></TableCell>
                    <TableCell>Factorial</TableCell>
                    <TableCell>Growth rate is the factorial of input size</TableCell>
                    <TableCell>Brute force traveling salesman problem, generating all permutations</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box>
              <Typography variant="h6" gutterBottom>Important Considerations</Typography>
              <Grid container spacing={2}>
                <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Big-O Represents Upper Bound" 
                        secondary="Big-O notation gives the upper bound on the growth rate, representing worst-case scenario." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Constants Are Dropped" 
                        secondary="O(2n) is simplified to O(n), as constants become insignificant for large inputs." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimerIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Lower Order Terms Are Ignored" 
                        secondary="O(n² + n) simplifies to O(n²), as n² dominates for large values of n." 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid sx={{ width: { xs: '100%', md: '50%' }, p: 1.5 }}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <MemoryIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Space Complexity Matters" 
                        secondary="Time isn't the only resource - memory usage is also important, especially for large datasets." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MemoryIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Average vs. Worst Case" 
                        secondary="Some algorithms have different average and worst-case complexities (e.g., Quick Sort)." 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <MemoryIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Practical Considerations" 
                        secondary="Constants matter for small inputs, and real-world performance depends on hardware and implementation details." 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid sx={{ width: '100%', p: 1.5 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Common Algorithmic Trade-offs</Typography>
            <Typography variant="body1" paragraph>
              Understanding when to use different algorithms often comes down to recognizing trade-offs between time, space, and implementation complexity.
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Trade-off</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Example</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Time vs. Space</strong></TableCell>
                    <TableCell>Algorithms that use more memory often run faster, and vice versa</TableCell>
                    <TableCell>Dynamic programming uses extra memory to avoid redundant calculations</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Preprocessing</strong></TableCell>
                    <TableCell>Investing time upfront for faster queries later</TableCell>
                    <TableCell>Building a search index or hash table</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Average vs. Worst Case</strong></TableCell>
                    <TableCell>Some algorithms perform well most of the time but have edge cases</TableCell>
                    <TableCell>Quick Sort is O(n log n) on average but O(n²) in worst case</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Exactness vs. Approximation</strong></TableCell>
                    <TableCell>Approximate algorithms can be much faster for certain problems</TableCell>
                    <TableCell>Heuristic algorithms for NP-hard problems</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Generality vs. Specialization</strong></TableCell>
                    <TableCell>General-purpose algorithms vs. algorithms optimized for specific cases</TableCell>
                    <TableCell>Radix sort is faster than comparison sorts for specific input types</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ComplexityAnalysis;
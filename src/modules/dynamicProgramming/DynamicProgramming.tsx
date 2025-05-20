import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  SelectChangeEvent
} from '@mui/material';
import FibonacciAlgorithm from './algorithms/FibonacciAlgorithm';
import LCSAlgorithm from './algorithms/LCSAlgorithm';
import KnapsackAlgorithm from './algorithms/KnapsackAlgorithm';
import DPTableVisualizer from './components/DPTableVisualizer';
import RecursiveTreeVisualizer from './components/RecursiveTreeVisualizer';
import { DPVisualizationState, DPProblemType } from './types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dp-tabpanel-${index}`}
      aria-labelledby={`dp-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
};

const dpProblems: DPProblemType[] = [
  'Fibonacci Sequence',
  'Longest Common Subsequence',
  'Knapsack Problem',
  'Matrix Chain Multiplication',
  'Coin Change Problem',
  'Edit Distance'
];

const DynamicProgramming = () => {
  const [selectedProblem, setSelectedProblem] = useState<DPProblemType | ''>('');
  const [tabValue, setTabValue] = useState(0);
  const [visualizationState, setVisualizationState] = useState<DPVisualizationState | null>(null);
  const [treeData, setTreeData] = useState<any>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  
  const handleProblemChange = (event: SelectChangeEvent) => {
    setSelectedProblem(event.target.value as DPProblemType);
    setVisualizationState(null);
    setTabValue(0);
    setTreeData(null);
    setCurrentNodeId('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVisualizationChange = (state: DPVisualizationState) => {
    setVisualizationState(state);
    
    // Handle tree data from algorithm components
    if (state.auxData?.treeData) {
      setTreeData(state.auxData.treeData);
      
      // Set current node ID if there's a current cell
      if (state.currentCell) {
        if (selectedProblem === 'Fibonacci Sequence') {
          const cellN = state.currentCell[1];
          setCurrentNodeId(`fib-${cellN}`);
        } else if (selectedProblem === 'Longest Common Subsequence' && state.currentCell) {
          const [i, j] = state.currentCell;
          setCurrentNodeId(`lcs-${i}-${j}`);
        } else if (selectedProblem === 'Knapsack Problem' && state.currentCell) {
          const [i, j] = state.currentCell;
          setCurrentNodeId(`knapsack-${i}-${j}`);
        }
      } else {
        setCurrentNodeId('');
      }
    } else if (selectedProblem === 'Fibonacci Sequence' && state.currentStep > 0) {
      // For backwards compatibility with Fibonacci visualization
      buildFibonacciTree(state);
    }
  };
  
  // Build a simple recursive call tree for Fibonacci (for demonstration purposes)
  const buildFibonacciTree = (state: DPVisualizationState) => {
    if (!state.table || state.table.length === 0) return;
    
    const maxN = state.table[0].length - 1;
    if (maxN <= 1) return;
    
    // Only build tree if we're at certain steps to avoid too many updates
    if (state.currentStep % 2 !== 0) return;
    
    const buildSubtree = (n: number, depth: number): any => {
      if (depth > 3) return { id: `fib-${n}`, label: `fib(${n})`, children: [] };
      if (n <= 1) return { id: `fib-${n}`, label: `fib(${n}) = ${n}`, children: [], isProcessed: true };
      
      return {
        id: `fib-${n}`,
        label: `fib(${n})${state.table[0][n] !== undefined ? ` = ${state.table[0][n]}` : ''}`,
        isProcessed: state.completedCells.some(cell => cell[0] === 0 && cell[1] === n),
        isCurrent: state.currentCell && state.currentCell[0] === 0 && state.currentCell[1] === n,
        children: [
          buildSubtree(n - 1, depth + 1),
          buildSubtree(n - 2, depth + 1)
        ]
      };
    };
    
    const tree = buildSubtree(maxN, 0);
    setTreeData(tree);
    
    // Set current node based on current cell in table
    if (state.currentCell) {
      const cellN = state.currentCell[1];
      setCurrentNodeId(`fib-${cellN}`);
    } else {
      setCurrentNodeId('');
    }
  };

  // Get problem description
  const getProblemDescription = (problem: DPProblemType): string => {
    switch (problem) {
      case 'Fibonacci Sequence':
        return 'Calculate the nth Fibonacci number using dynamic programming to avoid redundant calculations.';
      case 'Longest Common Subsequence':
        return 'Find the longest subsequence common to two strings. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.';
      case 'Knapsack Problem':
        return 'Given weights and values of items, find the maximum value that can be obtained with a given weight capacity.';
      case 'Matrix Chain Multiplication':
        return 'Given a sequence of matrices, find the most efficient way to multiply them together to minimize the number of operations.';
      case 'Coin Change Problem':
        return 'Given a set of coin denominations and a target amount, find the minimum number of coins needed to make the amount.';
      case 'Edit Distance':
        return 'Calculate the minimum number of operations required to transform one string into another.';
      default:
        return 'Select a problem to see its description.';
    }
  };
  
  // Generate code explanation for the selected algorithm
  const getCodeExplanation = (problem: DPProblemType): React.ReactNode => {
    switch (problem) {
      case 'Fibonacci Sequence':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Fibonacci Sequence - Code Explanation</Typography>
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#000000' }}>
              <pre style={{ overflow: 'auto', fontSize: '0.9rem' }}>
{`// Dynamic Programming implementation of Fibonacci
function fibonacciDP(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  // Create array to store results
  const dp = new Array(n + 1);
  
  // Base cases
  dp[0] = 0;
  dp[1] = 1;
  
  // Fill dp array bottom-up
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  
  return dp[n];
}`}
              </pre>
            </Paper>
            <Typography variant="body1" paragraph>
              The dynamic programming approach to the Fibonacci sequence solves the exponential time complexity of the 
              naive recursive approach. By storing previously calculated values in an array, we avoid redundant calculations.
            </Typography>
            <Typography variant="body1" paragraph>
              The time complexity is O(n) and space complexity is O(n). We can further optimize to O(1) space by only storing 
              the last two values, since we only need those for the next calculation.
            </Typography>
          </Box>
        );
      case 'Longest Common Subsequence':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Longest Common Subsequence - Code Explanation</Typography>
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#000000' }}>
              <pre style={{ overflow: 'auto', fontSize: '0.9rem' }}>
{`// Dynamic Programming implementation of LCS
function lcsDP(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  
  // Create 2D DP table
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Reconstruct the LCS
  let lcs = "";
  let i = m, j = n;
  
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      lcs = text1[i - 1] + lcs;
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
}`}
              </pre>
            </Paper>
            <Typography variant="body1" paragraph>
              The LCS algorithm builds a table where dp[i][j] represents the length of LCS for text1[0...i-1] and text2[0...j-1].
              If the current characters match, we add 1 to the LCS of the strings without these characters.
              If they don't match, we take the maximum of the LCS when excluding one character from either string.
            </Typography>
            <Typography variant="body1">
              Time complexity: O(m*n) where m and n are the lengths of the input strings.
              Space complexity: O(m*n) for the DP table.
            </Typography>
          </Box>
        );
      case 'Knapsack Problem':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>0/1 Knapsack Problem - Code Explanation</Typography>
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#000000' }}>
              <pre style={{ overflow: 'auto', fontSize: '0.9rem' }}>
{`// Dynamic Programming implementation of 0/1 Knapsack
function knapsackDP(items, capacity) {
  const n = items.length;
  
  // Create 2D DP table
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const currentItem = items[i - 1];
      
      if (currentItem.weight <= w) {
        // Can include this item - take max of including or excluding
        dp[i][w] = Math.max(
          currentItem.value + dp[i - 1][w - currentItem.weight],
          dp[i - 1][w]
        );
      } else {
        // Item is too heavy, can't include it
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity]; // Maximum value
}`}
              </pre>
            </Paper>
            <Typography variant="body1" paragraph>
              The 0/1 Knapsack algorithm uses a DP table where dp[i][w] represents the maximum value that 
              can be obtained using the first i items with a knapsack capacity of w.
            </Typography>
            <Typography variant="body1" paragraph>
              For each item, we have two choices: include it or exclude it. If we include it, we add its value 
              to the maximum value that can be obtained using the remaining capacity. If we exclude it, we take 
              the maximum value from the previous set of items with the same capacity.
            </Typography>
            <Typography variant="body1">
              Time complexity: O(n*W) where n is the number of items and W is the knapsack capacity.
              Space complexity: O(n*W) for the DP table.
            </Typography>
          </Box>
        );
      default:
        return (
          <Typography variant="body1">
            Select a problem to see its code explanation.
          </Typography>
        );
    }
  };
  
  // Render the algorithm component based on selection
  const renderAlgorithmComponent = () => {
    switch (selectedProblem) {
      case 'Fibonacci Sequence':
        return <FibonacciAlgorithm onVisualizationChange={handleVisualizationChange} />;
      case 'Longest Common Subsequence':
        return <LCSAlgorithm onVisualizationChange={handleVisualizationChange} />;
      case 'Knapsack Problem':
        return <KnapsackAlgorithm onVisualizationChange={handleVisualizationChange} />;
      default:
        return (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              This algorithm is coming soon! Please select another algorithm.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dynamic Programming Visualizer
      </Typography>
      <Typography variant="body1" paragraph>
        Visualize how dynamic programming algorithms build solutions by breaking down problems into 
        simpler subproblems and combining their results.
      </Typography>

      <Grid container spacing={3}>
        <Grid sx={{ width: { xs: '100%', md: '25%' }, p: 1.5 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Problem Selection</Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Problem</InputLabel>
              <Select
                value={selectedProblem}
                onChange={handleProblemChange}
                label="Select Problem"
              >
                {dpProblems.map((problem) => (
                  <MenuItem key={problem} value={problem}>
                    {problem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Problem Description:</Typography>
              {selectedProblem ? (
                <Typography variant="body2">
                  {getProblemDescription(selectedProblem)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a problem to see its description.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid sx={{ width: { xs: '100%', md: '75%' }, p: 1.5 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="dynamic programming tabs">
              <Tab label="Algorithm Input & Controls" />
              <Tab label="DP Table Visualization" />
              <Tab label="Recursive Call Tree" />
              <Tab label="Code Explanation" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {selectedProblem ? (
              renderAlgorithmComponent()
            ) : (
              <Paper elevation={2} sx={{ p: 3, minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a problem to start visualization
                </Typography>
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper elevation={2} sx={{ p: 3, minHeight: '400px' }}>
              {visualizationState ? (
                <DPTableVisualizer 
                  visualizationState={visualizationState} 
                  rowLabels={selectedProblem === 'Longest Common Subsequence' ? ['', ...(selectedProblem ? 'X'.repeat(10).split('') : [])] : []}
                  colLabels={selectedProblem === 'Longest Common Subsequence' ? ['', ...(selectedProblem ? 'Y'.repeat(10).split('') : [])] : []}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <Typography variant="h6" color="text.secondary">
                    {selectedProblem ? 'Run the algorithm to see the DP table' : 'Select a problem first'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Paper elevation={2} sx={{ p: 3, minHeight: '400px' }}>
              <RecursiveTreeVisualizer 
                treeData={treeData}
                currentNodeId={currentNodeId}
              />
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Paper elevation={2} sx={{ p: 3, minHeight: '400px', overflow: 'auto' }}>
              {selectedProblem ? (
                getCodeExplanation(selectedProblem)
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <Typography variant="h6" color="text.secondary">
                    Select a problem to see the code explanation
                  </Typography>
                </Box>
              )}
            </Paper>
          </TabPanel>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DynamicProgramming;
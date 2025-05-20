import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  useTheme,
  SelectChangeEvent,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Divider
} from '@mui/material';
import FunctionsTwoToneIcon from '@mui/icons-material/FunctionsTwoTone';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface SubsetItem {
  value: number;
  inSolution: boolean;
  isExploring: boolean;
}

interface SubsetSumVisualizerProps {
  width?: number;
  height?: number;
}

const SubsetSumVisualizer: React.FC<SubsetSumVisualizerProps> = ({
  width = 800,
  height = 600
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State variables
  const [set, setSet] = useState<SubsetItem[]>([]);
  const [targetSum, setTargetSum] = useState<number>(0);
  const [setSize, setSetSize] = useState<number>(8);
  const [maxValue, setMaxValue] = useState<number>(30);
  const [algorithm, setAlgorithm] = useState<'dp' | 'recursive' | 'exhaustive'>('dp');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [statesExplored, setStatesExplored] = useState<number>(0);
  const [solutions, setSolutions] = useState<number[][]>([]);
  const [currentSum, setCurrentSum] = useState<number>(0);
  const [timeComplexity, setTimeComplexity] = useState<string>('');
  const [spaceComplexity, setSpaceComplexity] = useState<string>('');
  const [dpTable, setDpTable] = useState<boolean[][]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  
  // Animation control
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Generate a new random set and target sum
  const generateRandomSet = useCallback(() => {
    // Clear previous state
    setCurrentStep(0);
    setStatesExplored(0);
    setSolutions([]);
    setCurrentSum(0);
    setExecutionTime(0);
    setDpTable([]);
    
    // Generate random set
    const newSet: SubsetItem[] = [];
    let sumOfAllElements = 0;
    
    for (let i = 0; i < setSize; i++) {
      const value = Math.floor(Math.random() * maxValue) + 1;
      newSet.push({ 
        value: value, 
        inSolution: false, 
        isExploring: false
      });
      sumOfAllElements += value;
    }
    
    // Generate target sum (30-60% of total sum to ensure meaningful problems)
    const newTargetSum = Math.floor(sumOfAllElements * (0.3 + Math.random() * 0.3));
    
    // Update state
    setSet(newSet);
    setTargetSum(newTargetSum);
    
    // Set complexity analysis based on algorithm
    updateComplexityAnalysis(algorithm, newSet.length);
    
  }, [setSize, maxValue, algorithm]);
  
  // Update complexity analysis text
  const updateComplexityAnalysis = (algo: string, n: number) => {
    switch (algo) {
      case 'dp':
        setTimeComplexity(`O(n * target) = O(${n} * ${targetSum}) = O(${n * targetSum})`);
        setSpaceComplexity(`O(n * target) = O(${n} * ${targetSum}) = O(${n * targetSum})`);
        break;
      case 'recursive':
        setTimeComplexity(`O(2^n) = O(2^${n}) = O(${Math.pow(2, n)})`);
        setSpaceComplexity(`O(n) = O(${n})`);
        break;
      case 'exhaustive':
        setTimeComplexity(`O(2^n) = O(2^${n}) = O(${Math.pow(2, n)})`);
        setSpaceComplexity(`O(n) = O(${n})`);
        break;
      default:
        setTimeComplexity('');
        setSpaceComplexity('');
    }
  };
  
  // Dynamic Programming approach implementation
  const solveDynamicProgramming = () => {
    const startTime = performance.now();
    const n = set.length;
    
    // Initialize DP table: dp[i][j] is true if sum j can be achieved with first i elements
    const dp: boolean[][] = Array(n + 1).fill(0).map(() => Array(targetSum + 1).fill(false));
    
    // Base case: sum of 0 can be achieved with any subset by taking no elements
    for (let i = 0; i <= n; i++) {
      dp[i][0] = true;
    }
    
    // Track solutions for visualization
    const steps: { 
      table: boolean[][],
      exploring: [number, number],
      statesExplored: number
    }[] = [];
    
    let explored = 0;
    
    // Fill the dp table
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= targetSum; j++) {
        // Current element value
        const val = set[i - 1].value;
        
        // Can we achieve sum j without using current element?
        dp[i][j] = dp[i - 1][j];
        
        // Can we achieve sum j using current element?
        if (j >= val) {
          dp[i][j] = dp[i][j] || dp[i - 1][j - val];
        }
        
        // Track this step for visualization
        steps.push({
          table: JSON.parse(JSON.stringify(dp)), // Deep copy
          exploring: [i, j],
          statesExplored: ++explored
        });
      }
    }
    
    // Find solutions by backtracking through the dp table
    const solutions: number[][] = [];
    if (dp[n][targetSum]) {
      // At least one solution exists
      const reconstructSolution = (i: number, j: number, solution: number[]) => {
        if (i === 0) {
          if (j === 0) {
            solutions.push([...solution]);
          }
          return;
        }
        
        // Try excluding current element
        if (dp[i - 1][j]) {
          reconstructSolution(i - 1, j, solution);
        }
        
        // Try including current element
        const val = set[i - 1].value;
        if (j >= val && dp[i - 1][j - val]) {
          solution.push(i - 1); // Store index
          reconstructSolution(i - 1, j - val, solution);
          solution.pop(); // Backtrack
        }
      };
      
      reconstructSolution(n, targetSum, []);
    }
    
    const endTime = performance.now();
    setExecutionTime(endTime - startTime);
    
    // Set final state
    setDpTable(dp);
    setTotalSteps(steps.length);
    setSolutions(solutions);
    
    // Start visualization
    setIsRunning(true);
    let step = 0;
    
    // Animation function for stepping through the DP table
    const animate = () => {
      if (step < steps.length) {
        const currentStep = steps[step];
        
        // Update dp table visualization
        setDpTable(currentStep.table);
        
        // Update set visualization (what's being explored)
        const [i, j] = currentStep.exploring;
        const newSet = [...set];
        
        // Reset all exploration flags
        newSet.forEach(item => {
          item.isExploring = false;
        });
        
        // Set exploring flag for current element (if we're exploring an element)
        if (i > 0 && i <= newSet.length) {
          newSet[i - 1].isExploring = true;
        }
        
        setSet(newSet);
        setCurrentStep(step + 1);
        setStatesExplored(currentStep.statesExplored);
        
        step++;
      } else {
        // Animation complete
        clearInterval(animationInterval!);
        setAnimationInterval(null);
        
        // Mark solution in the set
        if (solutions.length > 0) {
          const solutionIndices = solutions[0]; // Use first solution if multiple exist
          const newSet = [...set];
          
          newSet.forEach((item, idx) => {
            item.inSolution = solutionIndices.includes(idx);
            item.isExploring = false;
          });
          
          setSet(newSet);
        }
      }
    };
    
    // Start animation interval
    const interval = setInterval(animate, 1000 / speed);
    setAnimationInterval(interval);
  };
  
  // Recursive approach implementation (simplified for visualization)
  const solveRecursive = () => {
    const startTime = performance.now();
    const n = set.length;
    
    // Initialize visualization steps
    const steps: {
      subset: number[],
      currentSum: number,
      depth: number,
      statesExplored: number
    }[] = [];
    
    let explored = 0;
    let solutionFound = false;
    const solutions: number[][] = [];
    
    // Recursive function to solve subset sum
    const subsetSumRecursive = (index: number, currentSum: number, subset: number[]): boolean => {
      // Base case: we achieved the target sum
      if (currentSum === targetSum) {
        solutions.push([...subset]);
        solutionFound = true;
        return true;
      }
      
      // Base case: we've considered all elements or exceeded target
      if (index >= n || currentSum > targetSum) {
        return false;
      }
      
      // Track this step for visualization
      steps.push({
        subset: [...subset],
        currentSum,
        depth: index,
        statesExplored: ++explored
      });
      
      // Include current element
      subset.push(index);
      const includeResult: boolean = subsetSumRecursive(
        index + 1, 
        currentSum + set[index].value, 
        subset
      );
      
      // Backtrack
      subset.pop();
      
      // If we found a solution by including, we can return
      if (includeResult) return true;
      
      // Exclude current element
      const excludeResult: boolean = subsetSumRecursive(
        index + 1,
        currentSum,
        subset
      );
      
      return includeResult || excludeResult;
    };
    
    // Start recursion
    subsetSumRecursive(0, 0, []);
    
    const endTime = performance.now();
    setExecutionTime(endTime - startTime);
    
    // Set final state
    setTotalSteps(steps.length);
    setSolutions(solutions);
    
    // Start visualization
    setIsRunning(true);
    let step = 0;
    
    // Animation function for stepping through the recursive calls
    const animate = () => {
      if (step < steps.length) {
        const currentStep = steps[step];
        
        // Update set visualization
        const newSet = [...set];
        
        // Reset all flags
        newSet.forEach(item => {
          item.isExploring = false;
          item.inSolution = false;
        });
        
        // Mark current exploration
        if (currentStep.depth < newSet.length) {
          newSet[currentStep.depth].isExploring = true;
        }
        
        // Mark current subset
        currentStep.subset.forEach(idx => {
          newSet[idx].inSolution = true;
        });
        
        setSet(newSet);
        setCurrentStep(step + 1);
        setCurrentSum(currentStep.currentSum);
        setStatesExplored(currentStep.statesExplored);
        
        step++;
      } else {
        // Animation complete
        clearInterval(animationInterval!);
        setAnimationInterval(null);
        
        // Mark final solution
        if (solutions.length > 0) {
          const solutionIndices = solutions[0]; // Use first solution
          const newSet = [...set];
          
          newSet.forEach((item, idx) => {
            item.inSolution = solutionIndices.includes(idx);
            item.isExploring = false;
          });
          
          setSet(newSet);
        }
      }
    };
    
    // Start animation interval
    const interval = setInterval(animate, 1000 / speed);
    setAnimationInterval(interval);
  };
  
  // Exhaustive approach implementation (check all 2^n subsets)
  const solveExhaustive = () => {
    const startTime = performance.now();
    const n = set.length;
    
    // Initialize visualization steps
    const steps: {
      subset: number[],
      currentSum: number,
      binaryRepresentation: string,
      statesExplored: number
    }[] = [];
    
    let explored = 0;
    const solutions: number[][] = [];
    
    // Check all 2^n possible subsets
    const totalSubsets = Math.pow(2, n);
    
    for (let i = 0; i < totalSubsets; i++) {
      const subset: number[] = [];
      let sum = 0;
      const binary = i.toString(2).padStart(n, '0');
      
      // Create subset based on binary representation
      for (let j = 0; j < n; j++) {
        if (binary[j] === '1') {
          subset.push(j);
          sum += set[j].value;
        }
      }
      
      // Track this step
      steps.push({
        subset,
        currentSum: sum,
        binaryRepresentation: binary,
        statesExplored: ++explored
      });
      
      // Check if this subset sums to target
      if (sum === targetSum) {
        solutions.push([...subset]);
      }
    }
    
    const endTime = performance.now();
    setExecutionTime(endTime - startTime);
    
    // Set final state
    setTotalSteps(steps.length);
    setSolutions(solutions);
    
    // Start visualization
    setIsRunning(true);
    let step = 0;
    
    // Animation function
    const animate = () => {
      if (step < steps.length) {
        const currentStep = steps[step];
        
        // Update set visualization
        const newSet = [...set];
        
        // Reset all flags
        newSet.forEach(item => {
          item.isExploring = false;
          item.inSolution = false;
        });
        
        // Mark current subset
        currentStep.subset.forEach(idx => {
          newSet[idx].inSolution = true;
        });
        
        setSet(newSet);
        setCurrentStep(step + 1);
        setCurrentSum(currentStep.currentSum);
        setStatesExplored(currentStep.statesExplored);
        
        step++;
      } else {
        // Animation complete
        clearInterval(animationInterval!);
        setAnimationInterval(null);
        
        // Mark final solution if any
        if (solutions.length > 0) {
          const solutionIndices = solutions[0]; // Use first solution
          const newSet = [...set];
          
          newSet.forEach((item, idx) => {
            item.inSolution = solutionIndices.includes(idx);
            item.isExploring = false;
          });
          
          setSet(newSet);
        }
      }
    };
    
    // Start animation interval
    const interval = setInterval(animate, 1000 / speed);
    setAnimationInterval(interval);
  };
  
  // Start selected algorithm
  const runAlgorithm = () => {
    // Clear previous state
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    
    setIsRunning(true);
    setIsPaused(false);
    
    switch (algorithm) {
      case 'dp':
        solveDynamicProgramming();
        break;
      case 'recursive':
        solveRecursive();
        break;
      case 'exhaustive':
        solveExhaustive();
        break;
      default:
        break;
    }
  };
  
  // Stop/pause current algorithm
  const stopAlgorithm = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    setIsPaused(true);
  };
  
  // Resume paused algorithm
  const resumeAlgorithm = () => {
    setIsPaused(false);
    
    // Restart animation from current step
    let step = currentStep;
    
    const animate = () => {
      // Animation logic depends on algorithm...
      // This is simplified - you'd need to resume from the correct state
      step++;
      setCurrentStep(step);
      
      if (step >= totalSteps) {
        clearInterval(animationInterval!);
        setAnimationInterval(null);
      }
    };
    
    const interval = setInterval(animate, 1000 / speed);
    setAnimationInterval(interval);
  };
  
  // Reset visualization
  const resetVisualization = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setStatesExplored(0);
    setSolutions([]);
    setCurrentSum(0);
    setExecutionTime(0);
    setDpTable([]);
    
    // Reset set items
    const newSet = [...set];
    newSet.forEach(item => {
      item.inSolution = false;
      item.isExploring = false;
    });
    setSet(newSet);
  };
  
  // Handle algorithm selection change
  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    const newAlgorithm = event.target.value as 'dp' | 'recursive' | 'exhaustive';
    setAlgorithm(newAlgorithm);
    updateComplexityAnalysis(newAlgorithm, set.length);
    resetVisualization();
  };
  
  // Handle set size change
  const handleSetSizeChange = (event: Event, newValue: number | number[]) => {
    setSetSize(newValue as number);
  };
  
  // Handle max value change
  const handleMaxValueChange = (event: Event, newValue: number | number[]) => {
    setMaxValue(newValue as number);
  };
  
  // Handle speed change
  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    const newSpeed = newValue as number;
    setSpeed(newSpeed);
    
    // Update animation interval if running
    if (animationInterval) {
      clearInterval(animationInterval);
      
      // Restart with new speed
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < totalSteps) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setAnimationInterval(null);
            return prev;
          }
        });
      }, 1000 / newSpeed);
      
      setAnimationInterval(interval);
    }
  };
  
  // Generate random set on component mount
  useEffect(() => {
    generateRandomSet();
    
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [generateRandomSet]);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FunctionsTwoToneIcon /> Subset Sum Problem
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Given a set of integers, determine if there exists a subset whose sum equals exactly the target value.
            This is an NP-complete problem with applications in resource allocation and decision making.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid sx={{ width: '50%' }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Algorithm</InputLabel>
                <Select
                  value={algorithm}
                  onChange={handleAlgorithmChange}
                  label="Algorithm"
                  disabled={isRunning && !isPaused}
                >
                  <MenuItem value="dp">Dynamic Programming</MenuItem>
                  <MenuItem value="recursive">Recursive Backtracking</MenuItem>
                  <MenuItem value="exhaustive">Exhaustive Search (2^n)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid sx={{ width: '50%' }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={generateRandomSet}
                disabled={isRunning && !isPaused}
                sx={{ height: '40px' }}
              >
                Generate New Set
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ px: 1, mb: 2 }}>
            <Typography variant="body2" id="set-size-slider" gutterBottom>
              Set Size: {setSize}
            </Typography>
            <Slider
              value={setSize}
              onChange={handleSetSizeChange}
              onChangeCommitted={() => generateRandomSet()}
              aria-labelledby="set-size-slider"
              valueLabelDisplay="auto"
              min={4}
              max={algorithm === 'exhaustive' ? 16 : 20}
              disabled={isRunning && !isPaused}
            />
          </Box>
          
          <Box sx={{ px: 1, mb: 2 }}>
            <Typography variant="body2" id="max-value-slider" gutterBottom>
              Max Element Value: {maxValue}
            </Typography>
            <Slider
              value={maxValue}
              onChange={handleMaxValueChange}
              onChangeCommitted={() => generateRandomSet()}
              aria-labelledby="max-value-slider"
              valueLabelDisplay="auto"
              min={10}
              max={50}
              disabled={isRunning && !isPaused}
            />
          </Box>
          
          <Box sx={{ px: 1, mb: 2 }}>
            <Typography variant="body2" id="speed-slider" gutterBottom>
              Animation Speed
            </Typography>
            <Slider
              value={speed}
              onChange={handleSpeedChange}
              aria-labelledby="speed-slider"
              min={0.5}
              max={5}
              step={0.5}
              marks={[
                { value: 0.5, label: 'Slow' },
                { value: 5, label: 'Fast' }
              ]}
            />
          </Box>
          
          <Stack direction="row" spacing={1}>
            {!isRunning || isPaused ? (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={isRunning && isPaused ? resumeAlgorithm : runAlgorithm}
                startIcon={<PlayArrowIcon />}
                disabled={set.length === 0}
              >
                {isRunning && isPaused ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={stopAlgorithm}
                startIcon={<StopIcon />}
              >
                Pause
              </Button>
            )}
            
            <Button
              variant="outlined"
              fullWidth
              onClick={resetVisualization}
              startIcon={<RestartAltIcon />}
              disabled={!isRunning}
            >
              Reset
            </Button>
          </Stack>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 0.5 }}>
          <Typography variant="h6" gutterBottom>Statistics</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <LinearProgress 
              variant="determinate" 
              value={totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}
              sx={{ height: 10, borderRadius: 5, my: 1 }} 
            />
            <Typography variant="caption" color="text.secondary">
              Step {currentStep} of {totalSteps}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Target Sum</Typography>
            <Typography variant="h6" gutterBottom>{targetSum}</Typography>
            
            <Typography variant="body2" color="text.secondary">Current Sum</Typography>
            <Typography variant="h6" gutterBottom>{currentSum}</Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">States Explored</Typography>
            <Typography variant="h6" gutterBottom>{statesExplored.toLocaleString()}</Typography>
            
            <Typography variant="body2" color="text.secondary">Solutions Found</Typography>
            <Typography variant="h6" gutterBottom>{solutions.length}</Typography>
            
            <Typography variant="body2" color="text.secondary">Execution Time</Typography>
            <Typography variant="h6" gutterBottom>{executionTime.toFixed(2)} ms</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>Complexity Analysis</Typography>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Time Complexity</Typography>
            <Typography variant="body1">{timeComplexity}</Typography>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Space Complexity</Typography>
            <Typography variant="body1">{spaceComplexity}</Typography>
          </Box>
        </Paper>
      </Box>
      
      <Paper sx={{ p: 3, width: '100%', bgcolor: isDarkMode ? 'background.paper' : '#f8f8f8' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Problem Instance: Find a subset that sums to {targetSum}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {set.map((item, index) => (
              <Tooltip key={index} title={`Value: ${item.value}`}>
                <Card
                  sx={{ 
                    width: 60, 
                    height: 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: item.inSolution 
                      ? theme.palette.success.main 
                      : item.isExploring 
                        ? theme.palette.warning.light
                        : isDarkMode ? 'background.default' : 'background.paper',
                    color: item.inSolution || item.isExploring 
                      ? '#fff' 
                      : theme.palette.text.primary,
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderColor: item.isExploring 
                      ? theme.palette.warning.main 
                      : item.inSolution 
                        ? theme.palette.success.dark
                        : theme.palette.divider,
                    transform: item.isExploring ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <Typography variant="h6">{item.value}</Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute',
                      top: 2,
                      right: 4,
                      fontWeight: 'normal',
                      opacity: 0.7
                    }}
                  >
                    {index}
                  </Typography>
                </Card>
              </Tooltip>
            ))}
          </Box>
        </Box>
        
        {/* Solution Results Section */}
        {isRunning && currentStep >= totalSteps && (
          <Box sx={{ mb: 3, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, 
                     bgcolor: solutions.length > 0 ? 
                            (isDarkMode ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.05)') : 
                            (isDarkMode ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)') }}>
            <Typography variant="h6" sx={{ 
              color: solutions.length > 0 ? theme.palette.success.main : theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1
            }}>
              {solutions.length > 0 ? 
                <>
                  <CheckCircleIcon color="success" /> 
                  Solution Found!
                </> : 
                <>
                  <CancelIcon color="error" /> 
                  No Solution Exists
                </>
              }
            </Typography>
            
            {solutions.length > 0 && (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  A subset with sum {targetSum} exists:
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {solutions[0].map((idx) => (
                    <Chip 
                      key={`solution-${idx}`}
                      label={set[idx].value}
                      color="success"
                      sx={{ fontWeight: 'bold' }}
                    />
                  ))}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    = {targetSum}
                  </Typography>
                </Stack>
              </>
            )}
            
            {solutions.length === 0 && (
              <Typography variant="body1">
                There is no subset of the given set that sums to exactly {targetSum}.
              </Typography>
            )}
          </Box>
        )}
        
        {algorithm === 'dp' && dpTable.length > 0 && (
          <Box sx={{ mb: 3, overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>Dynamic Programming Table</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Each cell [i,j] represents: "Can we make sum j using the first i elements?"
            </Typography>
            
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: `auto repeat(${targetSum + 1}, 36px)`,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                maxWidth: '100%',
                overflow: 'auto'
              }}
            >
              {/* Table header row with sum values */}
              <Box sx={{ 
                p: 1, 
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                fontWeight: 'bold',
                borderRight: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
                i / sum
              </Box>
              
              {Array.from({ length: targetSum + 1 }, (_, j) => (
                <Box 
                  key={`header-${j}`}
                  sx={{ 
                    p: 1, 
                    textAlign: 'center',
                    borderRight: j < targetSum ? '1px solid' : 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: j === targetSum 
                      ? theme.palette.secondary.light 
                      : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    fontWeight: j === targetSum ? 'bold' : 'normal',
                  }}
                >
                  {j}
                </Box>
              ))}
              
              {/* Table rows with dp values */}
              {dpTable.map((row, i) => (
                <React.Fragment key={`row-${i}`}>
                  <Box sx={{ 
                    p: 1, 
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    fontWeight: 'bold',
                    borderRight: '1px solid',
                    borderBottom: i < dpTable.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}>
                    {i === 0 ? '0' : set[i-1].value}
                  </Box>
                  
                  {row.map((cell, j) => (
                    <Box 
                      key={`cell-${i}-${j}`}
                      sx={{ 
                        p: 1, 
                        textAlign: 'center',
                        borderRight: j < targetSum ? '1px solid' : 'none',
                        borderBottom: i < dpTable.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        bgcolor: (i === dpTable.length - 1 && j === targetSum)
                          ? (cell ? theme.palette.success.light : theme.palette.error.light) 
                          : cell
                            ? isDarkMode ? 'rgba(76,175,80,0.3)' : 'rgba(76,175,80,0.1)'
                            : 'transparent',
                        fontWeight: (i === dpTable.length - 1 && j === targetSum) ? 'bold' : 'normal'
                      }}
                    >
                      {cell ? '✓' : ''}
                    </Box>
                  ))}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}
        
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" gutterBottom>Algorithm Description</Typography>
          
          {algorithm === 'dp' && (
            <Typography variant="body2">
              The dynamic programming approach builds a table where each cell dp[i][j] indicates whether 
              a sum j can be achieved using the first i elements of the set. This gives us an O(n*target) 
              solution that avoids the exponential growth of the recursive approach.
            </Typography>
          )}
          
          {algorithm === 'recursive' && (
            <Typography variant="body2">
              The recursive approach uses backtracking to explore all possible combinations of including 
              or excluding each element. While this leads to a worst-case O(2^n) solution, the algorithm 
              can terminate early when a valid subset is found.
            </Typography>
          )}
          
          {algorithm === 'exhaustive' && (
            <Typography variant="body2">
              The exhaustive search approach checks all 2^n possible subsets by generating each combination 
              and calculating its sum. This brute force approach guarantees finding all solutions but becomes 
              impractical for large sets due to exponential growth.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SubsetSumVisualizer;
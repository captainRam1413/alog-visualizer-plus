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
  Slider,
  Stack,
  Tabs,
  Tab,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Types
import { 
  BacktrackingProblemType, 
  AlgorithmStep, 
  VisualizationState,
  BoardState
} from './types';

// Algorithm implementations
import { runNQueensAlgorithm, NQueensDescription } from './algorithms/NQueensAlgorithm';
import { runGraphColoringAlgorithm, GraphColoringDescription } from './algorithms/GraphColoringAlgorithm';
import { runSubsetSumAlgorithm, SubsetSumDescription } from './algorithms/SubsetSumAlgorithm';
// Import other algorithm implementations when ready

// Visualizer components
import ChessboardVisualizer from './components/ChessboardVisualizer';
import CodeVisualizer from './components/CodeVisualizer';
import StatsVisualizer from './components/StatsVisualizer';
import GraphVisualizer from './components/GraphVisualizer';
import SubsetSumVisualizer from './components/SubsetSumVisualizer';

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
      id={`backtracking-tabpanel-${index}`}
      aria-labelledby={`backtracking-tab-${index}`}
      {...other }
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default function BacktrackingAlgorithms() {
  // State for problem selection and configuration
  const [problem, setProblem] = useState<BacktrackingProblemType>('nqueens');
  const [boardSize, setBoardSize] = useState(4);
  const [speed, setSpeed] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  
  // Visualization state
  const [visualizationState, setVisualizationState] = useState<VisualizationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Get current step data - moved up so it's defined before being used in the useEffect
  const currentStepData = visualizationState && visualizationState.steps[currentStep];
  
  // Store all solutions found so far (will persist across steps)
  const [persistentSolutions, setPersistentSolutions] = useState<BoardState[]>([]);
  
  // Auto-play interval - update the ref type to NodeJS.Timeout
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle problem change
  const handleProblemChange = (event: SelectChangeEvent) => {
    setProblem(event.target.value as BacktrackingProblemType);
    resetVisualization();
  };
  
  // Handle board size change
  const handleBoardSizeChange = (event: Event, newValue: number | number[]) => {
    setBoardSize(newValue as number);
    resetVisualization();
  };
  
  // Handle speed change
  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    setSpeed(newValue as number);
    
    // Update auto-play interval if currently running
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      startAutoPlay();
    }
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Start the visualization
  const startVisualization = () => {
    // Clear any existing animation first
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    
    let state: VisualizationState | null = null;
    
    switch (problem) {
      case 'nqueens':
        state = runNQueensAlgorithm(boardSize);
        break;
      case 'graphcoloring':
        // Create a graph with boardSize nodes
        // Generate random edges (about 30-50% of possible edges)
        const nodes = boardSize;
        const edges = [];
        const maxPossibleEdges = (nodes * (nodes - 1)) / 2;
        const edgeCount = Math.floor(maxPossibleEdges * (0.3 + Math.random() * 0.2));
        
        // Generate unique random edges
        const edgeSet = new Set();
        while (edges.length < edgeCount) {
          const u = Math.floor(Math.random() * nodes);
          const v = Math.floor(Math.random() * nodes);
          if (u !== v) {
            const edgeKey = u < v ? `${u}-${v}` : `${v}-${u}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({ from: u, to: v });  // Changed from [u, v] to {from: u, to: v}
            }
          }
        }
        
        // Use a reasonable number of colors (usually 3-5 is sufficient for most graphs)
        const maxColors = Math.min(4, nodes);
        
        state = runGraphColoringAlgorithm(nodes, edges, maxColors);
        break;
      case 'subsetsum':
        // Generate a random array of numbers
        const numArray = Array.from({ length: boardSize }, () => 
          Math.floor(Math.random() * 20) + 1 // Random numbers between 1-20
        );
        
        // Generate a reasonable target sum (around 30-50% of the total sum)
        const arraySum = numArray.reduce((sum, num) => sum + num, 0);
        const targetSum = Math.floor(arraySum * (0.3 + Math.random() * 0.2));
        
        state = runSubsetSumAlgorithm(numArray, targetSum);
        break;
      // Add other algorithm cases as implemented
      default:
        state = null;
    }
    
    if (state) {
      // Set initial state
      setVisualizationState(state);
      setCurrentStep(0);
      setIsRunning(true);
      setIsPaused(false);
      setPersistentSolutions([]); // Reset persistent solutions when starting new visualization
      
      // Use useEffect to start animation after state updates are complete
      // This is handled by a separate useEffect below
    }
  };
  
  // Reset the visualization
  const resetVisualization = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    
    setVisualizationState(null);
    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
    setPersistentSolutions([]); // Reset persistent solutions when visualization is reset
  };
  
  // Start auto-play
  const startAutoPlay = () => {
    // Clear any existing interval
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }
    
    // Calculate interval time based on speed
    const intervalTime = 1000 / speed;
    
    // Set up new interval
    const intervalId = setInterval(() => {
      setCurrentStep((prev) => {
        if (visualizationState && prev < visualizationState.steps.length - 1) {
          return prev + 1;
        } else {
          // Stop auto-play when reaching the end
          clearInterval(intervalId);
          autoPlayIntervalRef.current = null;
          return prev;
        }
      });
    }, intervalTime);
    
    // Store the interval ID
    autoPlayIntervalRef.current = intervalId;
  };
  
  // Toggle pause/play
  const togglePause = () => {
    if (isPaused) {
      // Resume
      startAutoPlay();
      setIsPaused(false);
    } else {
      // Pause
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setIsPaused(true);
    }
  };
  
  // Go to next step
  const nextStep = () => {
    if (visualizationState && currentStep < visualizationState.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);
  
  // Effect to start auto-play when visualization state is set
  useEffect(() => {
    if (isRunning && !isPaused && visualizationState) {
      startAutoPlay();
    }
  }, [isRunning, isPaused, visualizationState]);

  // Effect to update persistent solutions whenever a new solution is found
  useEffect(() => {
    if (currentStepData && currentStepData.allSolutions && currentStepData.allSolutions.length > 0) {
      // Instead of simply overwriting solutions, merge them properly to avoid duplicates
      setPersistentSolutions(prev => {
        // Create a new array that contains all unique solutions
        const allSolutions = [...prev];
        
        // Add new solutions that aren't already in the array
        currentStepData.allSolutions?.forEach(newSolution => {
          // Check if this solution already exists in our persistent solutions
          const solutionExists = allSolutions.some(existingSolution => 
            // Compare based on the board configuration
            JSON.stringify(existingSolution.squares) === JSON.stringify(newSolution.squares)
          );
          
          if (!solutionExists) {
            allSolutions.push(newSolution);
          }
        });
        
        return allSolutions;
      });
    }
  }, [currentStepData?.allSolutions]);
  
  // Render current algorithm description
  const renderAlgorithmDescription = () => {
    switch (problem) {
      case 'nqueens':
        return <NQueensDescription />;
      case 'graphcoloring':
        return <GraphColoringDescription />;
      case 'subsetsum':
        return <SubsetSumDescription />;
      // Add other algorithm description cases as implemented
      default:
        return (
          <Typography variant="body1">
            Select an algorithm to see its description.
          </Typography>
        );
    }
  };
  
  // Statistics from the current visualization
  const stats = visualizationState?.stats || {
    statesExplored: 0,
    backtracks: 0,
    solutionsFound: 0,
    timeElapsed: 0
  };

  // Fixed boolean for disabled prop
  const isLastStep = visualizationState ? (currentStep === visualizationState.steps.length - 1) : false;

  return (
    <Container>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Backtracking Playground
        </Typography>
        <Typography variant="body1" paragraph>
          Explore algorithms that solve combinatorial problems through systematic search by 
          building candidates incrementally and abandoning a candidate as soon as it determines 
          the candidate cannot possibly be completed to a valid solution.
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Backtracking Principle:</strong> Build solutions incrementally, abandoning a 
            path as soon as it's determined that it cannot possibly lead to a valid solution.
          </Typography>
        </Alert>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid  sx={{ width: { xs: '100%', md: '25%' } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Problem Selection</Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="problem-select-label">Problem</InputLabel>
              <Select
                labelId="problem-select-label"
                id="problem-select"
                value={problem}
                label="Problem"
                onChange={handleProblemChange}
              >
                <MenuItem value="nqueens">N-Queens Problem</MenuItem>
                <MenuItem value="sudoku" disabled>Sudoku Solver (Coming Soon)</MenuItem>
                <MenuItem value="graphcoloring">Graph Coloring</MenuItem>
                <MenuItem value="hamiltonian" disabled>Hamiltonian Path (Coming Soon)</MenuItem>
                <MenuItem value="ratmaze" disabled>Rat in a Maze (Coming Soon)</MenuItem>
                <MenuItem value="subsetsum">Subset Sum Problem</MenuItem>
              </Select>
            </FormControl>
            
            {problem === 'nqueens' && (
              <Box sx={{ mt: 3 }}>
                <Typography gutterBottom>Board Size (N)</Typography>
                <Slider
                  value={boardSize}
                  onChange={handleBoardSizeChange}
                  aria-labelledby="board-size-slider"
                  min={4}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  disabled={isRunning}
                />
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography gutterBottom>Animation Speed</Typography>
              <Slider
                value={speed}
                onChange={handleSpeedChange}
                aria-labelledby="speed-slider"
                min={0.25}
                max={4}
                step={0.25}
                marks={[
                  { value: 0.25, label: '¼x' },
                  { value: 1, label: '1x' },
                  { value: 2, label: '2x' },
                  { value: 4, label: '4x' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={startVisualization}
                disabled={isRunning}
              >
                Start Visualization
              </Button>
              
              {isRunning && (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                  startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                  onClick={togglePause}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={resetVisualization}
                disabled={!isRunning}
              >
                Reset
              </Button>
            </Stack>
            
            {isRunning && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  sx={{ mx: 1 }}
                >
                  <SkipPreviousIcon />
                </Button>
                
                <Button 
                  onClick={nextStep}
                  disabled={isLastStep}
                  sx={{ mx: 1 }}
                >
                  <SkipNextIcon />
                </Button>
              </Box>
            )}
          </Paper>
          
          {isRunning && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <StatsVisualizer
                statesExplored={stats.statesExplored}
                backtracks={stats.backtracks}
                solutionsFound={stats.solutionsFound}
                timeElapsed={stats.timeElapsed}
                currentStep={currentStep}
                totalSteps={visualizationState?.steps.length || 1}
              />
            </Paper>
          )}
        </Grid>
        
        <Grid  sx={{ width: { xs: '100%', md: '75%' } }}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="backtracking visualization tabs"
              >
                <Tab label="Visualization" />
                <Tab label="Code" />
                <Tab label="Description" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {isRunning && currentStepData ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Step {currentStep + 1} of {visualizationState?.steps.length}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {currentStepData.description}
                  </Typography>
                  
                  {problem === 'nqueens' && currentStepData.boardState && (
                    <ChessboardVisualizer 
                      boardState={currentStepData.boardState} 
                      allSolutions={persistentSolutions.length > 0 ? persistentSolutions : currentStepData.allSolutions}
                    />
                  )}
                  
                  {problem === 'graphcoloring' && currentStepData.graphState && (
                    <GraphVisualizer
                      graphState={currentStepData.graphState}
                    />
                  )}
                  
                  {problem === 'subsetsum' && currentStepData.subsetState && (
                    <SubsetSumVisualizer
                      subsetState={currentStepData.subsetState}
                    />
                  )}
                  
                  {/* Add other visualization components when implemented */}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                  <Typography variant="body1" color="text.secondary">
                    {problem === 'nqueens' 
                      ? `Configure the N-Queens problem and click "Start Visualization" to begin.`
                      : 'Select a problem and start the visualization to see it in action.'}
                  </Typography>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <CodeVisualizer
                highlightedLines={currentStepData?.highlightedCode}
                algorithm={problem}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Paper elevation={0} sx={{ p: 2 }}>
                {renderAlgorithmDescription()}
              </Paper>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
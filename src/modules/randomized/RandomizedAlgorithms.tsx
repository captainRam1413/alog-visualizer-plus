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
  RandomizedAlgorithmType, 
  AlgorithmStep, 
  VisualizationState,
  QuickSortState,
  SkipListState
} from './types';

// Algorithm implementations
import { runRandomQuickSort, RandomQuickSortDescription } from './algorithms/RandomQuickSort';
import { runSkipList, SkipListDescription } from './algorithms/SkipListAlgorithm';

// Visualizer components
import ArrayVisualizer from './components/ArrayVisualizer';
import CodeVisualizer from './components/CodeVisualizer';
import StatsVisualizer from './components/StatsVisualizer';
import SkipListVisualizer from './components/SkipListVisualizer';

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
      id={`randomized-tabpanel-${index}`}
      aria-labelledby={`randomized-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default function RandomizedAlgorithms() {
  // State for algorithm selection and configuration
  const [algorithm, setAlgorithm] = useState<RandomizedAlgorithmType>('quicksort');
  const [arraySize, setArraySize] = useState(30);
  const [iterations, setIterations] = useState(10);
  const [speed, setSpeed] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  
  // Visualization state
  const [visualizationState, setVisualizationState] = useState<VisualizationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Auto-play interval
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle algorithm change
  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setAlgorithm(event.target.value as RandomizedAlgorithmType);
    resetVisualization();
  };
  
  // Handle array size change
  const handleArraySizeChange = (event: Event, newValue: number | number[]) => {
    setArraySize(newValue as number);
    resetVisualization();
  };
  
  // Handle iterations change
  const handleIterationsChange = (event: Event, newValue: number | number[]) => {
    setIterations(newValue as number);
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
    
    switch (algorithm) {
      case 'quicksort':
        state = runRandomQuickSort(arraySize);
        break;
      case 'skiplist':
        state = runSkipList();
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
  
  // Render current algorithm description
  const renderAlgorithmDescription = () => {
    switch (algorithm) {
      case 'quicksort':
        return <RandomQuickSortDescription />;
      case 'skiplist':
        return <SkipListDescription />;
      // Add other algorithm description cases as implemented
      default:
        return (
          <Typography variant="body1">
            Select an algorithm to see its description.
          </Typography>
        );
    }
  };

  // Get current step data
  const currentStepData = visualizationState && visualizationState.steps[currentStep];
  
  // Statistics from the current visualization
  const stats = visualizationState?.stats || {
    comparisons: 0,
    swaps: 0,
    randomCalls: 0,
    timeElapsed: 0,
    successProbability: undefined
  };

  // Fixed boolean for disabled prop
  const isLastStep = visualizationState ? (currentStep === visualizationState.steps.length - 1) : false;

  return (
    <Container>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Randomized Algorithms
        </Typography>
        <Typography variant="body1" paragraph>
          Explore algorithms that use randomness to solve problems efficiently, 
          either by making random choices during execution or by leveraging probabilistic techniques.
          Understand how randomization can lead to simpler and faster algorithms.
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Randomization Principle:</strong> By introducing randomness into algorithm design,
            we can often avoid worst-case scenarios and achieve better expected performance 
            than deterministic approaches.
          </Typography>
        </Alert>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="randomized algorithm tabs">
          <Tab label="Algorithm Simulator" />
          <Tab label="Performance Analysis" />
          <Tab label="Theory" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid sx={{ width: { xs: '100%', md: '25%' } }}>
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
                  <MenuItem value="quicksort">Randomized QuickSort</MenuItem>
                  <MenuItem value="skiplist">Skip List</MenuItem>
                  <MenuItem value="primality" disabled>Miller-Rabin Primality Test (Coming Soon)</MenuItem>
                  <MenuItem value="mincut" disabled>Karger's Min Cut (Coming Soon)</MenuItem>
                  <MenuItem value="montecarlo" disabled>Monte Carlo Integration (Coming Soon)</MenuItem>
                  <MenuItem value="coupon" disabled>Coupon Collector Simulation (Coming Soon)</MenuItem>
                </Select>
              </FormControl>
              
              {algorithm === 'quicksort' && (
                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>Array Size</Typography>
                  <Slider
                    value={arraySize}
                    onChange={handleArraySizeChange}
                    aria-labelledby="array-size-slider"
                    min={10}
                    max={100}
                    step={5}
                    marks={[
                      { value: 10, label: '10' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
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
                  startIcon={<RestartAltIcon />}
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
                  comparisons={stats.comparisons}
                  swaps={stats.swaps}
                  randomCalls={stats.randomCalls}
                  timeElapsed={stats.timeElapsed}
                  currentStep={currentStep}
                  totalSteps={visualizationState?.steps.length || 1}
                  successProbability={stats.successProbability}
                />
              </Paper>
            )}
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', md: '75%' } }}>
            <Paper sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue === 0 ? 0 : 1} 
                  onChange={(e, v) => {}}
                  aria-label="visualization tabs"
                >
                  <Tab label="Visualization" />
                  <Tab label="Code" />
                </Tabs>
              </Box>
              
              <Box sx={{ p: 2 }}>
                {isRunning && currentStepData ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Step {currentStep + 1} of {visualizationState?.steps.length}
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      {currentStepData.description}
                    </Typography>
                    
                    {algorithm === 'quicksort' && currentStepData.dataState && (
                      <>
                        <ArrayVisualizer dataState={currentStepData.dataState as QuickSortState} />
                        <CodeVisualizer 
                          algorithm={algorithm} 
                          highlightedLines={currentStepData.highlightedCode} 
                        />
                      </>
                    )}
                    
                    {algorithm === 'skiplist' && currentStepData.dataState && (
                      <>
                        <SkipListVisualizer dataState={currentStepData.dataState as SkipListState} />
                        <CodeVisualizer 
                          algorithm={algorithm} 
                          highlightedLines={currentStepData.highlightedCode} 
                        />
                      </>
                    )}
                    
                    {/* Add other algorithm-specific visualizers when implemented */}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography variant="body1" color="text.secondary">
                      {algorithm === 'quicksort' 
                        ? `Configure the Randomized QuickSort and click "Start Visualization" to begin.`
                        : 'Select an algorithm and start the visualization to see it in action.'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 3, height: '50vh' }}>
              <Typography variant="h6" gutterBottom>
                Performance Analysis
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                <Typography variant="body1" color="text.secondary">
                  Performance comparison charts will be added in a future update
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid sx={{ width: '50%', mt: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Time Complexity Analysis</Typography>
              <Typography variant="body2" paragraph>
                <strong>Randomized QuickSort:</strong>
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Expected Time Complexity: O(n log n)
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Worst Case Time Complexity: O(n²) (rare with randomization)
              </Typography>
              <Typography variant="body2" paragraph>
                Unlike deterministic QuickSort, the randomized version selects a random pivot,
                which makes the worst-case scenario extremely unlikely. This helps avoid the O(n²)
                behavior on already-sorted or reverse-sorted inputs.
              </Typography>
              
              {algorithm === 'skiplist' && (
                <>
                  <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                    <strong>Skip List:</strong>
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                    • Expected Time Complexity for Search/Insert/Delete: O(log n)
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                    • Space Complexity: O(n)
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Skip Lists are probabilistic data structures that use randomization to achieve
                    balanced performance without requiring complex rebalancing operations like
                    self-balancing trees. The random level assignment ensures logarithmic operations
                    with high probability.
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          <Grid sx={{ width: '50%', mt: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Probability of Success</Typography>
              <Typography variant="body2" paragraph>
                <strong>Monte Carlo vs. Las Vegas Algorithms:</strong>
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Monte Carlo algorithms may give incorrect results with some probability.
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Las Vegas algorithms always give correct results, but their running time is random.
              </Typography>
              <Typography variant="body2">
                Randomized QuickSort is a Las Vegas algorithm - it always correctly sorts
                the input, but its exact running time varies due to random pivot selection.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Theoretical Foundations</Typography>
              
              <Typography variant="subtitle1" gutterBottom>Randomization in Algorithm Design:</Typography>
              <Typography variant="body2" paragraph>
                Randomization is a powerful technique in algorithm design that uses random choices
                to improve performance or simplify implementation. There are two main types of randomized algorithms:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid sx={{ width: '50%' }}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" gutterBottom>Monte Carlo Algorithms</Typography>
                    <Typography variant="body2">
                      Always run in bounded time but may produce incorrect results with some probability.
                      Examples include Miller-Rabin primality testing and Monte Carlo integration.
                      The error probability can typically be reduced by running the algorithm multiple times.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid sx={{ width: '50%' }}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" gutterBottom>Las Vegas Algorithms</Typography>
                    <Typography variant="body2">
                      Always produce the correct result, but their running time is a random variable.
                      Examples include randomized QuickSort and randomized binary search trees.
                      The expected running time is often much better than the worst-case deterministic time.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>Applications:</Typography>
              <Typography variant="body2" paragraph>
                Randomized algorithms are particularly useful in:
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Avoiding worst-case scenarios (e.g., randomized QuickSort)
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Solving problems where deterministic solutions are inefficient (e.g., approximate counting)
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Breaking symmetry in distributed systems (e.g., leader election protocols)
              </Typography>
              <Typography variant="body2" paragraph sx={{ pl: 2 }}>
                • Cryptographic protocols where unpredictability is essential
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}
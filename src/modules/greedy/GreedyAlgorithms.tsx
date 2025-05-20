import React, { useState, useEffect } from 'react';
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
  TextField,
  Slider,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Algorithm implementations
import { runPrimMST, PrimMSTDescription } from './algorithms/PrimMST';
import { runKruskalMST, KruskalMSTDescription } from './algorithms/KruskalMST';
import { runActivitySelection, ActivitySelectionDescription } from './algorithms/ActivitySelection';
import { runFractionalKnapsack, FractionalKnapsackDescription } from './algorithms/FractionalKnapsack';
import { runHuffmanCoding, HuffmanCodingDescription } from './algorithms/HuffmanCoding';
import { runDijkstraAlgorithm, DijkstraAlgorithmDescription } from './algorithms/DijkstraAlgorithm';

// Visualization components
import GraphVisualizer from './components/GraphVisualizer';
import ActivityVisualizer from './components/ActivityVisualizer';
import KnapsackVisualizer from './components/KnapsackVisualizer';
import HuffmanVisualizer from './components/HuffmanVisualizer';
import CodeVisualizer from './components/CodeVisualizer';

// Types
import { Edge, Graph, ActivityItem, KnapsackItem, AlgorithmStep } from './types';

// Sample data for each algorithm
const sampleGraph: Graph = {
  vertices: 6,
  edges: [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 3 },
    { from: 1, to: 2, weight: 1 },
    { from: 1, to: 3, weight: 2 },
    { from: 2, to: 3, weight: 4 },
    { from: 2, to: 4, weight: 3 },
    { from: 3, to: 4, weight: 2 },
    { from: 3, to: 5, weight: 1 },
    { from: 4, to: 5, weight: 5 }
  ]
};

const sampleActivities: ActivityItem[] = [
  { id: 1, start: 1, finish: 4 },
  { id: 2, start: 3, finish: 5 },
  { id: 3, start: 0, finish: 6 },
  { id: 4, start: 5, finish: 7 },
  { id: 5, start: 3, finish: 9 },
  { id: 6, start: 5, finish: 9 },
  { id: 7, start: 6, finish: 10 },
  { id: 8, start: 8, finish: 11 },
  { id: 9, start: 8, finish: 12 },
  { id: 10, start: 2, finish: 14 }
];

const sampleKnapsackItems: KnapsackItem[] = [
  { id: 1, value: 60, weight: 10 },
  { id: 2, value: 100, weight: 20 },
  { id: 3, value: 120, weight: 30 },
  { id: 4, value: 80, weight: 40 },
  { id: 5, value: 30, weight: 10 }
];

const sampleText = "This is a sample text for Huffman coding. It has various characters with different frequencies.";

export default function GreedyAlgorithms() {
  const [tabValue, setTabValue] = useState(0);
  const [algorithm, setAlgorithm] = useState('prim');
  const [source, setSource] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(50);
  const [text, setText] = useState<string>(sampleText);
  
  // Visualization state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [autoPlayIntervalId, setAutoPlayIntervalId] = useState<number | null>(null);
  
  // Algorithm input data
  const [graph, setGraph] = useState<Graph>(sampleGraph);
  const [activities, setActivities] = useState<ActivityItem[]>(sampleActivities);
  const [knapsackItems, setKnapsackItems] = useState<KnapsackItem[]>(sampleKnapsackItems);

  // Update steps when algorithm changes
  useEffect(() => {
    resetVisualization();
  }, [algorithm]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle algorithm selection change
  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setAlgorithm(event.target.value);
    resetVisualization();
  };
  
  // Generate visualization for the selected algorithm
  const generateVisualization = () => {
    let newSteps: AlgorithmStep[] = [];
    
    switch (algorithm) {
      case 'prim':
        newSteps = runPrimMST(graph);
        break;
      case 'kruskal':
        newSteps = runKruskalMST(graph);
        break;
      case 'activity':
        newSteps = runActivitySelection(activities);
        break;
      case 'knapsack':
        newSteps = runFractionalKnapsack(knapsackItems, capacity);
        break;
      case 'huffman':
        newSteps = runHuffmanCoding(text);
        break;
      case 'dijkstra':
        newSteps = runDijkstraAlgorithm(graph, source);
        break;
      default:
        break;
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    setIsRunning(true);
  };
  
  // Reset visualization state
  const resetVisualization = () => {
    if (autoPlayIntervalId) {
      clearInterval(autoPlayIntervalId);
      setAutoPlayIntervalId(null);
    }
    setSteps([]);
    setCurrentStep(0);
    setIsRunning(false);
  };
  
  // Auto-play controls
  const toggleAutoPlay = () => {
    if (autoPlayIntervalId) {
      clearInterval(autoPlayIntervalId);
      setAutoPlayIntervalId(null);
    } else {
      const intervalTime = 2000 / speed;
      const id = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(id);
            setAutoPlayIntervalId(null);
            return prev;
          }
        });
      }, intervalTime);
      setAutoPlayIntervalId(id as unknown as number);
    }
  };
  
  // Step controls
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    const newSpeed = newValue as number;
    setSpeed(newSpeed);
    
    // Update interval if auto-playing
    if (autoPlayIntervalId) {
      clearInterval(autoPlayIntervalId);
      const intervalTime = 2000 / newSpeed;
      const id = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(id);
            setAutoPlayIntervalId(null);
            return prev;
          }
        });
      }, intervalTime);
      setAutoPlayIntervalId(id as unknown as number);
    }
  };
  
  // Render algorithm description based on selection
  const renderAlgorithmDescription = () => {
    switch (algorithm) {
      case 'prim':
        return <PrimMSTDescription />;
      case 'kruskal':
        return <KruskalMSTDescription />;
      case 'activity':
        return <ActivitySelectionDescription />;
      case 'knapsack':
        return <FractionalKnapsackDescription />;
      case 'huffman':
        return <HuffmanCodingDescription />;
      case 'dijkstra':
        return <DijkstraAlgorithmDescription />;
      default:
        return (
          <Typography variant="body1">
            Select an algorithm to see its description
          </Typography>
        );
    }
  };
  
  // Render algorithm-specific controls
  const renderAlgorithmControls = () => {
    switch (algorithm) {
      case 'dijkstra':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id="source-vertex-label">Source Vertex</InputLabel>
            <Select
              labelId="source-vertex-label"
              value={source.toString()}
              label="Source Vertex"
              onChange={(e) => setSource(Number(e.target.value))}
            >
              {[...Array(graph.vertices)].map((_, i) => (
                <MenuItem key={i} value={i}>{i}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'knapsack':
        return (
          <Box sx={{ mb: 2 }}>
            <Typography id="capacity-slider" gutterBottom>
              Knapsack Capacity: {capacity}
            </Typography>
            <Slider
              value={capacity}
              onChange={(e, newValue) => setCapacity(newValue as number)}
              aria-labelledby="capacity-slider"
              min={10}
              max={100}
              step={5}
            />
          </Box>
        );
      case 'huffman':
        return (
          <TextField
            fullWidth
            label="Input Text"
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            margin="normal"
            variant="outlined"
            helperText="Enter text to encode using Huffman coding"
          />
        );
      default:
        return null;
    }
  };
  
  // Render appropriate visualizer based on algorithm
  const renderVisualizer = () => {
    if (steps.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Typography variant="body1" color="text.secondary">
            Click "Start Visualization" to begin
          </Typography>
        </Box>
      );
    }
    
    const currentStepData = steps[currentStep];
    
    switch (algorithm) {
      case 'prim':
      case 'kruskal':
      case 'dijkstra':
        return (
          <GraphVisualizer 
            graphData={currentStepData.graphState!} 
            description={currentStepData.description} 
          />
        );
      case 'activity':
        return (
          <ActivityVisualizer 
            activities={currentStepData.activities!} 
            description={currentStepData.description} 
          />
        );
      case 'knapsack':
        return (
          <KnapsackVisualizer 
            items={currentStepData.knapsackState!} 
            capacity={capacity}
            description={currentStepData.description} 
          />
        );
      case 'huffman':
        return (
          <HuffmanVisualizer 
            huffmanTree={currentStepData.huffmanTree} 
            description={currentStepData.description} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Greedy Algorithms
        </Typography>
        <Typography variant="body1" paragraph>
          Explore algorithms that solve problems by making locally optimal choices at each step with the hope of finding a global optimum. 
          Visualize classic greedy algorithms like Minimum Spanning Tree, Huffman Coding, Activity Selection, and more.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid sx={{ gridColumn: 'span 3' }}>
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
                <MenuItem value="prim">Minimum Spanning Tree (Prim's)</MenuItem>
                <MenuItem value="kruskal">Minimum Spanning Tree (Kruskal's)</MenuItem>
                <MenuItem value="huffman">Huffman Coding</MenuItem>
                <MenuItem value="activity">Activity Selection</MenuItem>
                <MenuItem value="knapsack">Fractional Knapsack</MenuItem>
                <MenuItem value="dijkstra">Dijkstra's Algorithm</MenuItem>
              </Select>
            </FormControl>
            
            {renderAlgorithmControls()}

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={generateVisualization}
                disabled={isRunning && steps.length > 0}
              >
                Start Visualization
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                fullWidth 
                sx={{ mt: 2 }}
                onClick={resetVisualization}
              >
                Reset
              </Button>
            </Box>
            
            {/* Visualization controls (only show when visualization is active) */}
            {isRunning && steps.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Playback Controls
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={goToPrevStep}
                    disabled={currentStep === 0}
                  >
                    <SkipPreviousIcon />
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={toggleAutoPlay}
                  >
                    {autoPlayIntervalId ? <PauseIcon /> : <PlayArrowIcon />}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={goToNextStep}
                    disabled={currentStep === steps.length - 1}
                  >
                    <SkipNextIcon />
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => setCurrentStep(0)}
                  >
                    <RestartAltIcon />
                  </Button>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" gutterBottom>
                    Speed: {speed}x
                  </Typography>
                  <Slider
                    value={speed}
                    onChange={handleSpeedChange}
                    min={0.5}
                    max={3}
                    step={0.5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption">
                    Step {currentStep + 1} of {steps.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((currentStep / (steps.length - 1)) * 100)}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
          
          {/* Algorithm description panel */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Algorithm Details
            </Typography>
            {renderAlgorithmDescription()}
          </Paper>
        </Grid>
        
        <Grid sx={{ gridColumn: 'span 9' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="greedy algorithm tabs">
              <Tab label="Visualization" />
              <Tab label="Code Execution" />
              <Tab label="Step Description" />
            </Tabs>
          </Box>
          
          <Paper sx={{ p: 2, minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            {tabValue === 0 && (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {renderVisualizer()}
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ flexGrow: 1 }}>
                <CodeVisualizer 
                  highlightedLines={steps.length > 0 ? steps[currentStep].highlightedCode : undefined}
                  algorithmName={algorithm} 
                />
              </Box>
            )}
            
            {tabValue === 2 && steps.length > 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Step Description</Typography>
                <Typography variant="body1" paragraph>
                  {steps[currentStep].description}
                </Typography>
                {currentStep < steps.length - 1 && (
                  <Typography variant="body2" color="text.secondary">
                    Next step: {steps[currentStep + 1].description}
                  </Typography>
                )}
              </Box>
            )}
            
            {tabValue === 2 && steps.length === 0 && (
              <Box sx={{ 
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body1" color="text.secondary">
                  Start the visualization to see step-by-step descriptions
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
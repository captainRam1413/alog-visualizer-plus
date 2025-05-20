import React, { useState, useEffect, useRef } from 'react';
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
  Grid
} from '@mui/material';
import RoutePlannerIcon from '@mui/icons-material/Route';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface City {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface Route {
  path: number[];
  distance: number;
}

interface TravelingSalesmanVisualizerProps {
  width?: number;
  height?: number;
}

// List of city names to use for generated cities
const CITY_NAMES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston', 'Nashville',
  'Detroit', 'Portland', 'Memphis', 'Oklahoma City', 'Las Vegas', 'Louisville'
];

const TravelingSalesmanVisualizer: React.FC<TravelingSalesmanVisualizerProps> = ({
  width = 800,
  height = 600,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State variables
  const [cities, setCities] = useState<City[]>([]);
  const [numCities, setNumCities] = useState<number>(6);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [bestRoute, setBestRoute] = useState<Route | null>(null);
  const [algorithm, setAlgorithm] = useState<'bruteforce' | 'nearestneighbor' | 'genetic'>('bruteforce');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [iterations, setIterations] = useState<number>(0);
  const [routesEvaluated, setRoutesEvaluated] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  
  // Animation control
  const animationRef = useRef<number | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  
  // Generate a set of random cities
  const generateRandomCities = () => {
    const padding = 50;  // Padding from the edge of the canvas
    const newCities: City[] = [];
    
    // Clear previous state
    setBestRoute(null);
    setCurrentRoute(null);
    setRoutesEvaluated(0);
    setIterations(0);
    setProgress(0);
    
    // Generate random cities
    const usedNames = new Set<string>();
    for (let i = 0; i < numCities; i++) {
      // Find a name that hasn't been used yet
      let name;
      do {
        name = CITY_NAMES[Math.floor(Math.random() * CITY_NAMES.length)];
      } while (usedNames.has(name));
      usedNames.add(name);
      
      newCities.push({
        id: i,
        name,
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding)
      });
    }
    
    setCities(newCities);
  };
  
  // Calculate distance between two cities
  const calculateDistance = (city1: City, city2: City): number => {
    const dx = city2.x - city1.x;
    const dy = city2.y - city1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Calculate total distance of a route
  const calculateRouteDistance = (route: number[]): number => {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      distance += calculateDistance(cities[route[i]], cities[route[i + 1]]);
    }
    // Add distance back to starting city to complete the tour
    if (route.length > 0) {
      distance += calculateDistance(cities[route[route.length - 1]], cities[route[0]]);
    }
    return distance;
  };
  
  // Brute force algorithm (try all permutations)
  const bruteForceAlgorithm = () => {
    if (cities.length === 0) return;
    
    // Start with indices of cities
    const indices = cities.map((_, i) => i);
    let bestDistance = Infinity;
    let bestPath: number[] = [];
    let totalPermutations = factorial(cities.length);
    let count = 0;
    
    // Generate all permutations recursively
    const generatePermutations = (arr: number[], start: number) => {
      if (start === arr.length) {
        // Calculate distance for this permutation
        const distance = calculateRouteDistance(arr);
        count++;
        
        // Update progress approximately
        setRoutesEvaluated(count);
        setProgress((count / totalPermutations) * 100);
        
        // Update current route being evaluated
        setCurrentRoute({ path: [...arr], distance });
        
        // Check if this is the best route so far
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPath = [...arr];
          setBestRoute({ path: bestPath, distance: bestDistance });
        }
        return;
      }
      
      for (let i = start; i < arr.length; i++) {
        // Swap elements at indices start and i
        [arr[start], arr[i]] = [arr[i], arr[start]];
        
        // Recursively generate permutations for the rest of the array
        generatePermutations([...arr], start + 1);
        
        // Swap back to restore the original order (backtrack)
        [arr[start], arr[i]] = [arr[i], arr[start]];
      }
    };
    
    setIsRunning(true);
    setTimeout(() => {
      generatePermutations([...indices], 0);
      setIsRunning(false);
    }, 100);
  };
  
  // Nearest neighbor algorithm (greedy approach)
  const nearestNeighborAlgorithm = () => {
    if (cities.length === 0) return;
    
    const path: number[] = [0];  // Start with the first city
    const unvisited = new Set(cities.map((_, i) => i).slice(1));  // All cities except the first one
    let currentCity = 0;
    let totalDistance = 0;
    let step = 0;
    
    setIsRunning(true);
    setProgress(0);
    setRoutesEvaluated(0);
    
    const runStep = () => {
      if (unvisited.size === 0) {
        // Complete the tour by returning to the starting city
        setCurrentRoute({
          path: [...path],
          distance: totalDistance + calculateDistance(cities[currentCity], cities[0])
        });
        
        setBestRoute({
          path: [...path],
          distance: totalDistance + calculateDistance(cities[currentCity], cities[0])
        });
        
        setIsRunning(false);
        setProgress(100);
        return;
      }
      
      // Find the nearest unvisited city
      let nearestCity = -1;
      let minDistance = Infinity;
      
      unvisited.forEach(cityId => {
        const dist = calculateDistance(cities[currentCity], cities[cityId]);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCity = cityId;
        }
      });
      
      // Add nearest city to path
      path.push(nearestCity);
      unvisited.delete(nearestCity);
      totalDistance += minDistance;
      currentCity = nearestCity;
      
      // Update state
      setCurrentRoute({
        path: [...path],
        distance: totalDistance
      });
      
      setRoutesEvaluated(step + 1);
      setProgress(((cities.length - unvisited.size) / cities.length) * 100);
      step++;
      
      // Continue algorithm in next animation frame
      if (unvisited.size > 0) {
        setTimeout(runStep, 500 / animationSpeed);
      } else {
        // Add return to start
        setTimeout(runStep, 500 / animationSpeed);
      }
    };
    
    runStep();
  };
  
  // Genetic algorithm implementation
  const geneticAlgorithm = () => {
    if (cities.length === 0) return;
    
    const POPULATION_SIZE = 50;
    const MAX_GENERATIONS = 100;
    const MUTATION_RATE = 0.1;
    let generation = 0;
    
    // Generate initial population
    let population: number[][] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      // Fix the Array.keys() issue by manually creating the array of indices
      const indices: number[] = [];
      for (let j = 0; j < cities.length; j++) {
        indices.push(j);
      }
      population.push(shuffle(indices));
    }
    
    setIsRunning(true);
    setProgress(0);
    setRoutesEvaluated(0);
    
    const evolvePopulation = () => {
      if (generation >= MAX_GENERATIONS) {
        setIsRunning(false);
        setProgress(100);
        return;
      }
      
      // Evaluate fitness of each route
      const fitness = population.map(route => ({
        route,
        fitness: 1 / calculateRouteDistance(route)
      }));
      
      // Sort by fitness (higher is better)
      fitness.sort((a, b) => b.fitness - a.fitness);
      
      // Update best route found so far
      const bestRoute = fitness[0].route;
      const bestDistance = calculateRouteDistance(bestRoute);
      
      setBestRoute({
        path: bestRoute,
        distance: bestDistance
      });
      
      // Select parents for next generation
      const nextGeneration: number[][] = [];
      
      // Elitism: keep the best routes
      const eliteCount = Math.max(1, Math.floor(POPULATION_SIZE * 0.1));
      for (let i = 0; i < eliteCount; i++) {
        nextGeneration.push(fitness[i].route);
      }
      
      // Crossover for the rest
      while (nextGeneration.length < POPULATION_SIZE) {
        // Tournament selection
        const parent1 = tournamentSelect(fitness);
        const parent2 = tournamentSelect(fitness);
        
        // Order crossover
        const child = orderCrossover(parent1, parent2);
        
        // Mutation
        if (Math.random() < MUTATION_RATE) {
          mutate(child);
        }
        
        nextGeneration.push(child);
      }
      
      // Update state
      population = nextGeneration;
      setCurrentRoute({
        path: bestRoute,
        distance: bestDistance
      });
      
      setRoutesEvaluated(generation * POPULATION_SIZE);
      setProgress((generation / MAX_GENERATIONS) * 100);
      generation++;
      
      // Continue to next generation
      setTimeout(evolvePopulation, 100 / animationSpeed);
    };
    
    evolvePopulation();
  };
  
  // Helper functions for genetic algorithm
  const tournamentSelect = (fitness: {route: number[], fitness: number}[], tournamentSize = 5) => {
    let best = null;
    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * fitness.length);
      if (best === null || fitness[idx].fitness > fitness[best].fitness) {
        best = idx;
      }
    }
    return fitness[best!].route;
  };
  
  const orderCrossover = (parent1: number[], parent2: number[]) => {
    const size = parent1.length;
    const child = Array(size).fill(-1);
    
    // Select a random subsequence from parent1
    const start = Math.floor(Math.random() * size);
    const end = start + Math.floor(Math.random() * (size - start));
    
    // Copy the subsequence from parent1 to child
    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }
    
    // Fill the remaining positions with values from parent2 in order
    let j = 0;
    for (let i = 0; i < size; i++) {
      if (child.includes(parent2[i])) continue;
      
      // Find the next unfilled position
      while (j < size && child[j] !== -1) j++;
      
      // If all positions are filled, break
      if (j >= size) break;
      
      child[j] = parent2[i];
    }
    
    return child;
  };
  
  const mutate = (route: number[]) => {
    // Swap two random positions
    const idx1 = Math.floor(Math.random() * route.length);
    const idx2 = Math.floor(Math.random() * route.length);
    [route[idx1], route[idx2]] = [route[idx2], route[idx1]];
    return route;
  };
  
  // Helper function for shuffling an array
  const shuffle = (array: number[]) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  
  // Calculate factorial for brute force total permuations
  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };
  
  // Start selected algorithm
  const runAlgorithm = () => {
    switch (algorithm) {
      case 'bruteforce':
        bruteForceAlgorithm();
        break;
      case 'nearestneighbor':
        nearestNeighborAlgorithm();
        break;
      case 'genetic':
        geneticAlgorithm();
        break;
      default:
        break;
    }
  };
  
  // Handle algorithm selection change
  const handleAlgorithmChange = (event: SelectChangeEvent) => {
    setAlgorithm(event.target.value as 'bruteforce' | 'nearestneighbor' | 'genetic');
  };
  
  // Handle number of cities change
  const handleNumCitiesChange = (event: Event, newValue: number | number[]) => {
    setNumCities(newValue as number);
  };
  
  // Handle animation speed change
  const handleSpeedChange = (event: Event, newValue: number | number[]) => {
    setAnimationSpeed(newValue as number);
  };
  
  // Effect to draw the TSP visualization on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDarkMode ? '#1e1e1e' : '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines for visual reference
    ctx.strokeStyle = isDarkMode ? '#333333' : '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw current route if available
    if (currentRoute && currentRoute.path.length > 0) {
      ctx.strokeStyle = isDarkMode ? 'rgba(144, 202, 249, 0.6)' : 'rgba(25, 118, 210, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Move to the first city
      ctx.moveTo(cities[currentRoute.path[0]].x, cities[currentRoute.path[0]].y);
      
      // Draw lines to each subsequent city
      for (let i = 1; i < currentRoute.path.length; i++) {
        ctx.lineTo(cities[currentRoute.path[i]].x, cities[currentRoute.path[i]].y);
      }
      
      // Complete the tour by returning to the first city
      if (currentRoute.path.length > 1) {
        ctx.lineTo(cities[currentRoute.path[0]].x, cities[currentRoute.path[0]].y);
      }
      
      ctx.stroke();
    }
    
    // Draw best route if different from current route
    if (bestRoute && bestRoute.path.length > 0 && 
        (currentRoute === null || JSON.stringify(bestRoute.path) !== JSON.stringify(currentRoute.path))) {
      ctx.strokeStyle = isDarkMode ? 'rgba(102, 187, 106, 0.8)' : 'rgba(46, 125, 50, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      // Move to the first city
      ctx.moveTo(cities[bestRoute.path[0]].x, cities[bestRoute.path[0]].y);
      
      // Draw lines to each subsequent city
      for (let i = 1; i < bestRoute.path.length; i++) {
        ctx.lineTo(cities[bestRoute.path[i]].x, cities[bestRoute.path[i]].y);
      }
      
      // Complete the tour by returning to the first city
      if (bestRoute.path.length > 1) {
        ctx.lineTo(cities[bestRoute.path[0]].x, cities[bestRoute.path[0]].y);
      }
      
      ctx.stroke();
    }
    
    // Draw cities
    cities.forEach((city, index) => {
      // Draw city point
      ctx.beginPath();
      ctx.arc(city.x, city.y, 10, 0, Math.PI * 2);
      
      // Use different colors for cities in the route
      if (bestRoute && bestRoute.path.includes(index)) {
        ctx.fillStyle = isDarkMode ? '#66bb6a' : '#2e7d32';
      } else {
        ctx.fillStyle = isDarkMode ? '#90caf9' : '#1976d2';
      }
      
      ctx.fill();
      ctx.strokeStyle = isDarkMode ? '#ffffff' : '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw city name
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
      ctx.fillText(city.name, city.x, city.y - 15);
      
      // Draw city index
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.fillText(index.toString(), city.x, city.y + 3);
    });
    
  }, [cities, currentRoute, bestRoute, width, height, isDarkMode]);
  
  // Generate cities on initial render
  useEffect(() => {
    generateRandomCities();
  }, [numCities]);
  
  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RoutePlannerIcon /> Traveling Salesman Problem
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Find the shortest possible route that visits each city exactly once and returns to the origin.
            This is a classic NP-hard problem with applications in logistics, planning, and manufacturing.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid sx={{ width: '50%' }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Algorithm</InputLabel>
                <Select
                  value={algorithm}
                  onChange={handleAlgorithmChange}
                  label="Algorithm"
                  disabled={isRunning}
                >
                  <MenuItem value="bruteforce">Brute Force (Exact)</MenuItem>
                  <MenuItem value="nearestneighbor">Nearest Neighbor (Greedy)</MenuItem>
                  <MenuItem value="genetic">Genetic Algorithm (Approximate)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid sx={{ width: '50%' }}>
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" id="cities-slider" gutterBottom>
                  Number of Cities: {numCities}
                </Typography>
                <Slider
                  value={numCities}
                  onChange={handleNumCitiesChange}
                  aria-labelledby="cities-slider"
                  valueLabelDisplay="auto"
                  min={3}
                  max={algorithm === 'bruteforce' ? 10 : 15}
                  disabled={isRunning}
                />
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ px: 1, mb: 2 }}>
            <Typography variant="body2" id="speed-slider" gutterBottom>
              Animation Speed
            </Typography>
            <Slider
              value={animationSpeed}
              onChange={handleSpeedChange}
              aria-labelledby="speed-slider"
              min={0.5}
              max={3}
              step={0.5}
              marks={[
                { value: 0.5, label: 'Slow' },
                { value: 1, label: 'Normal' },
                { value: 3, label: 'Fast' }
              ]}
            />
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={generateRandomCities}
              disabled={isRunning}
            >
              Generate Cities
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={runAlgorithm}
              disabled={isRunning || cities.length === 0}
              startIcon={<LocalShippingIcon />}
            >
              {isRunning ? 'Running...' : 'Find Route'}
            </Button>
          </Stack>
        </Paper>
        
        <Paper sx={{ p: 2, flex: 0.5 }}>
          <Typography variant="h6" gutterBottom>Statistics</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Progress</Typography>
            <Box sx={{ 
              height: 10, 
              bgcolor: 'background.paper',
              borderRadius: 5,
              mb: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  width: `${progress}%`, 
                  bgcolor: isRunning ? 'primary.main' : 'success.main', 
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {isRunning ? 'Processing...' : progress >= 100 ? 'Complete' : 'Ready'}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">Routes Evaluated</Typography>
          <Typography variant="h6" gutterBottom>{routesEvaluated.toLocaleString()}</Typography>
          
          <Typography variant="body2" color="text.secondary">Best Route Distance</Typography>
          <Typography variant="h6" gutterBottom>
            {bestRoute ? Math.round(bestRoute.distance).toLocaleString() : '-'}
          </Typography>
          
          {bestRoute && (
            <>
              <Typography variant="body2" color="text.secondary">Best Route</Typography>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {bestRoute.path.map((cityId, index) => (
                  <Chip 
                    key={index} 
                    size="small" 
                    label={cities[cityId].name} 
                    color="primary" 
                    variant="outlined"
                  />
                ))}
                <Chip 
                  size="small" 
                  label={cities[bestRoute.path[0]].name} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </>
          )}
          
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2">
              <strong>Time Complexity:</strong>
              {algorithm === 'bruteforce' && ' O(n!): Factorial - Tries all permutations'}
              {algorithm === 'nearestneighbor' && ' O(n²): Polynomial - Greedy approximation'}
              {algorithm === 'genetic' && ' O(n² * g): Heuristic - Evolutionary approach'}
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      <Paper sx={{ width: '100%', height: height, bgcolor: isDarkMode ? '#1e1e1e' : '#f5f5f5', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
      </Paper>
    </Box>
  );
};

export default TravelingSalesmanVisualizer;
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Stack } from '@mui/material';
import { DPVisualizationState, DPProblemProps } from '../types';
import { createInitialDPState, updateCurrentCell, markCellCompleted, finalizeDPState, delay } from './utils';

interface FibonacciProps extends DPProblemProps {
  n?: number;
}

export const FibonacciAlgorithm: React.FC<FibonacciProps> = ({
  n = 10,
  speed = 500,
  onVisualizationChange
}) => {
  const [input, setInput] = useState<number>(n);
  const [visualizationState, setVisualizationState] = useState<DPVisualizationState | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Calculate Fibonacci with visualization
  const calculateFibonacci = async (n: number) => {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // Initialize DP table
    let state = createInitialDPState(1, n + 1);
    
    // Base cases
    state = updateCurrentCell(state, 0, 0, 0, "Base case: fib(0) = 0");
    updateVisualization(state);
    await delay(speed);
    
    state = markCellCompleted(state, 0, 0);
    updateVisualization(state);
    
    state = updateCurrentCell(state, 0, 1, 1, "Base case: fib(1) = 1");
    updateVisualization(state);
    await delay(speed);
    
    state = markCellCompleted(state, 0, 1);
    updateVisualization(state);
    
    // Calculate each Fibonacci number
    for (let i = 2; i <= n; i++) {
      state = updateCurrentCell(
        state, 
        0, 
        i, 
        state.table[0][i-1] + state.table[0][i-2],
        `Computing fib(${i}) = fib(${i-1}) + fib(${i-2}) = ${state.table[0][i-1]} + ${state.table[0][i-2]} = ${state.table[0][i-1] + state.table[0][i-2]}`
      );
      updateVisualization(state);
      await delay(speed);
      
      state = markCellCompleted(state, 0, i);
      updateVisualization(state);
    }
    
    // Finalize visualization
    state = finalizeDPState(
      state,
      `Fibonacci(${n}) = ${state.table[0][n]}`
    );
    updateVisualization(state);
    
    return state.table[0][n];
  };
  
  // Update visualization state and notify parent component
  const updateVisualization = (state: DPVisualizationState) => {
    setVisualizationState(state);
    if (onVisualizationChange) {
      onVisualizationChange(state);
    }
  };
  
  // Handle start button click
  const handleCalculate = async () => {
    setIsRunning(true);
    await calculateFibonacci(input);
    setIsRunning(false);
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Fibonacci Sequence
      </Typography>
      <Typography variant="body2" paragraph>
        The Fibonacci sequence is defined as: F(n) = F(n-1) + F(n-2) with base cases F(0) = 0 and F(1) = 1.
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="Input n"
          type="number"
          value={input}
          onChange={(e) => setInput(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
          inputProps={{ min: 0, max: 20 }}
          size="small"
          sx={{ width: 120 }}
          disabled={isRunning}
        />
        <Button 
          variant="contained" 
          onClick={handleCalculate}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Visualize'}
        </Button>
      </Stack>
      
      {visualizationState && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Result: {visualizationState.isComplete ? 
              visualizationState.table[0][input] : 'Calculating...'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Step: {visualizationState.currentStep} of {visualizationState.steps.length}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {visualizationState.steps[visualizationState.currentStep - 1] || 'Initializing...'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// A function to solve Fibonacci without animation for code explanation
export const fibonacciDP = (n: number): number => {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  
  return dp[n];
};

export default FibonacciAlgorithm;
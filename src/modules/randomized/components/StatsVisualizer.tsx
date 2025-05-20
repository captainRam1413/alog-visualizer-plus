import React from 'react';
import { Box, Typography, LinearProgress, Paper, Divider, Grid } from '@mui/material';

interface StatsVisualizerProps {
  comparisons: number;
  swaps: number;
  randomCalls: number;
  timeElapsed: number;
  currentStep: number;
  totalSteps: number;
  successProbability?: number; // For probabilistic algorithms
}

const StatsVisualizer: React.FC<StatsVisualizerProps> = ({
  comparisons,
  swaps,
  randomCalls,
  timeElapsed,
  currentStep,
  totalSteps,
  successProbability
}) => {
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
  
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Algorithm Statistics
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Progress: Step {currentStep + 1} of {totalSteps}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage} 
          sx={{ height: 8, borderRadius: 1 }} 
        />
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Grid container>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" color="text.secondary">
              Comparisons:
            </Typography>
          </Grid>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" fontWeight="bold">
              {comparisons}
            </Typography>
          </Grid>
        </Grid>
        
        <Grid container>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" color="text.secondary">
              Swaps:
            </Typography>
          </Grid>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" fontWeight="bold">
              {swaps}
            </Typography>
          </Grid>
        </Grid>
        
        <Grid container>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" color="text.secondary">
              Random Calls:
            </Typography>
          </Grid>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" fontWeight="bold">
              {randomCalls}
            </Typography>
          </Grid>
        </Grid>
        
        <Grid container>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" color="text.secondary">
              Time Elapsed:
            </Typography>
          </Grid>
          <Grid sx={{ width: '50%' }}>
            <Typography variant="body2" fontWeight="bold">
              {timeElapsed.toFixed(2)} ms
            </Typography>
          </Grid>
        </Grid>
        
        {successProbability !== undefined && (
          <Grid container>
            <Grid sx={{ width: '50%' }}>
              <Typography variant="body2" color="text.secondary">
                Success Probability:
              </Typography>
            </Grid>
            <Grid sx={{ width: '50%' }}>
              <Typography variant="body2" fontWeight="bold">
                {(successProbability * 100).toFixed(2)}%
              </Typography>
            </Grid>
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default StatsVisualizer;
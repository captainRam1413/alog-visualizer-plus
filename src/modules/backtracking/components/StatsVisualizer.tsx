import React from 'react';
import { Box, Paper, Typography, Grid, LinearProgress } from '@mui/material';

interface StatsVisualizerProps {
  statesExplored: number;
  backtracks: number;
  solutionsFound: number;
  timeElapsed: number;
  currentStep: number;
  totalSteps: number;
}

const StatsVisualizer: React.FC<StatsVisualizerProps> = ({
  statesExplored,
  backtracks,
  solutionsFound,
  timeElapsed,
  currentStep,
  totalSteps
}) => {
  // Calculate progress percentage
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Algorithm Statistics
      </Typography>
      
      <Grid container spacing={2}>
        <Grid  sx={{ width: { xs: '100%', sm: '50%' } }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              States Explored
            </Typography>
            <Typography variant="h5">
              {statesExplored.toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Backtracks
            </Typography>
            <Typography variant="h5">
              {backtracks.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        
        <Grid  sx={{ width: { xs: '100%', sm: '50%' } }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Solutions Found
            </Typography>
            <Typography variant="h5">
              {solutionsFound.toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Time Elapsed
            </Typography>
            <Typography variant="h5">
              {timeElapsed.toFixed(3)} seconds
            </Typography>
          </Box>
        </Grid>
        
        <Grid  sx={{ width: '100%' }}>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Progress</span>
              <span>{Math.round(progress)}% ({currentStep}/{totalSteps})</span>
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                mt: 1, 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: progress === 100 ? '#4caf50' : '#2196f3'
                }
              }}
            />
          </Box>
        </Grid>
        
        <Grid  sx={{ width: '100%' }}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Space Complexity:</strong> O(N²) for board representation, O(N) for call stack
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Time Complexity:</strong> O(N!), where N is the board size
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StatsVisualizer;
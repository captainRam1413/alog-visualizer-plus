import React from 'react';
import { Box, Typography, Paper, Grid, LinearProgress } from '@mui/material';
import { KnapsackItem } from '../types';

interface KnapsackVisualizerProps {
  items: KnapsackItem[];
  capacity: number;
  description: string;
}

/**
 * A component that visualizes the Fractional Knapsack greedy algorithm
 */
const KnapsackVisualizer: React.FC<KnapsackVisualizerProps> = ({ items, capacity, description }) => {
  // Calculate total value and weight
  const totalValue = items.reduce((sum, item) => sum + (item.value * (item.fraction || 0)), 0);
  const totalWeight = items.reduce((sum, item) => sum + (item.weight * (item.fraction || 0)), 0);
  const capacityUsedPercent = (totalWeight / capacity) * 100;
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {description}
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          height: 'calc(100% - 60px)',
          backgroundColor: '#f5f5f5', 
          overflow: 'auto'
        }}
      >
        {/* Knapsack capacity visualization */}
        <Box sx={{ mb: 3 }}>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2">
              Capacity Used: {totalWeight.toFixed(2)} / {capacity} ({(capacityUsedPercent).toFixed(1)}%)
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              Total Value: {totalValue.toFixed(2)}
            </Typography>
          </Grid>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(capacityUsedPercent, 100)}
            sx={{ height: 10, borderRadius: 1 }}
          />
        </Box>
        
        {/* Items */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid sx={{ gridColumn: 'span 1' }}>
            <Typography variant="body2" fontWeight="bold">#</Typography>
          </Grid>
          <Grid sx={{ gridColumn: 'span 2' }}>
            <Typography variant="body2" fontWeight="bold">Value</Typography>
          </Grid>
          <Grid sx={{ gridColumn: 'span 2' }}>
            <Typography variant="body2" fontWeight="bold">Weight</Typography>
          </Grid>
          <Grid sx={{ gridColumn: 'span 2' }}>
            <Typography variant="body2" fontWeight="bold">Ratio</Typography>
          </Grid>
          <Grid sx={{ gridColumn: 'span 2' }}>
            <Typography variant="body2" fontWeight="bold">Fraction</Typography>
          </Grid>
          <Grid sx={{ gridColumn: 'span 3' }}>
            <Typography variant="body2" fontWeight="bold">Amount Taken</Typography>
          </Grid>
        </Grid>
        
        {items.map((item) => {
          const fraction = item.fraction || 0;
          const fractionPercentage = fraction * 100;
          const takenValue = item.value * fraction;
          const takenWeight = item.weight * fraction;
          
          return (
            <Paper
              key={item.id}
              elevation={1}
              sx={{
                p: 1.5,
                mb: 2,
                border: '1px solid',
                borderColor: fraction > 0 ? 'success.light' : 'divider',
                bgcolor: fraction > 0 ? 'success.light' : 'background.paper',
                opacity: fraction > 0 ? 1 : 0.7,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid sx={{ gridColumn: 'span 1' }}>
                  <Typography variant="body1" fontWeight="bold">{item.id}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="body1">{item.value}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="body1">{item.weight}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="body1">{(item.value / item.weight).toFixed(2)}</Typography>
                </Grid>
                <Grid sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="body1">{fraction.toFixed(2)} ({fractionPercentage.toFixed(0)}%)</Typography>
                </Grid>
                <Grid sx={{ gridColumn: 'span 3' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                      Value: {takenValue.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Weight: {takenWeight.toFixed(2)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={fractionPercentage}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
        
        {/* Legend */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 14, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mr: 0.5 }} />
            <Typography variant="caption">Not Selected</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 14, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.light', mr: 0.5 }} />
            <Typography variant="caption">Selected (partially or fully)</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default KnapsackVisualizer;
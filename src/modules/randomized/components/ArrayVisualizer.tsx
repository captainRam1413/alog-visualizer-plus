import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { QuickSortState } from '../types';

interface ArrayVisualizerProps {
  dataState: QuickSortState;
}

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ dataState }) => {
  const { array, pivotIndex, leftPointer, rightPointer, partitionRange, isSorted } = dataState;
  const maxValue = Math.max(...array);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Array Visualization
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        mt: 2, 
        height: '300px',
        overflowX: 'auto',
        gap: '2px'
      }}>
        {array.map((value, index) => {
          // Determine bar color based on state
          let backgroundColor = '#9e9e9e'; // Default gray
          
          if (isSorted && isSorted[index]) {
            backgroundColor = '#4caf50'; // Green for sorted elements
          } else if (index === pivotIndex) {
            backgroundColor = '#f44336'; // Red for pivot
          } else if (index === leftPointer) {
            backgroundColor = '#2196f3'; // Blue for left pointer
          } else if (index === rightPointer) {
            backgroundColor = '#ff9800'; // Orange for right pointer
          } else if (partitionRange && index >= partitionRange[0] && index <= partitionRange[1]) {
            backgroundColor = '#ce93d8'; // Light purple for current partition
          }
          
          return (
            <Box 
              key={index}
              sx={{
                height: `${(value / maxValue) * 100}%`,
                width: `${array.length > 50 ? 8 : array.length > 30 ? 12 : 20}px`,
                backgroundColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
                border: index === pivotIndex ? '2px solid #000' : 'none',
                transition: 'height 0.3s ease'
              }}
            >
              {array.length <= 30 && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    top: '-20px',
                    fontSize: array.length > 20 ? '0.7rem' : '0.8rem'
                  }}
                >
                  {value}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', mr: 1 }} />
          <Typography variant="caption">Pivot</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', mr: 1 }} />
          <Typography variant="caption">Left Pointer</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#ff9800', mr: 1 }} />
          <Typography variant="caption">Right Pointer</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#ce93d8', mr: 1 }} />
          <Typography variant="caption">Current Partition</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', mr: 1 }} />
          <Typography variant="caption">Sorted</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ArrayVisualizer;
import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { DPVisualizationState } from '../types';

interface DPTableVisualizerProps {
  visualizationState: DPVisualizationState;
  rowLabels?: string[];
  colLabels?: string[];
  title?: string;
}

const DPTableVisualizer: React.FC<DPTableVisualizerProps> = ({
  visualizationState,
  rowLabels = [],
  colLabels = [],
  title = 'DP Table Visualization'
}) => {
  const { table, currentCell, completedCells } = visualizationState;

  // If table is empty, show loading state
  if (!table || table.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6">Initializing table...</Typography>
      </Box>
    );
  }

  const isCellCurrent = (row: number, col: number) => 
    currentCell && currentCell[0] === row && currentCell[1] === col;
  
  const isCellCompleted = (row: number, col: number) => 
    completedCells.some(cell => cell[0] === row && cell[1] === col);

  const getCellStyle = (row: number, col: number) => {
    if (isCellCurrent(row, col)) {
      return {
        bgcolor: 'primary.main',
        color: 'white',
        fontWeight: 'bold',
      };
    } else if (isCellCompleted(row, col)) {
      return {
        bgcolor: 'success.light',
        color: 'text.primary',
      };
    }
    return {
      bgcolor: 'background.paper',
      color: 'text.secondary',
    };
  };

  return (
    <Paper sx={{ p: 2, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Grid sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Header row with column labels if provided */}
          {colLabels.length > 0 && (
            <Grid sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
              <Grid sx={{ width: '8.33%' }}></Grid>
              {colLabels.map((label, idx) => (
                <Grid sx={{ width: '8.33%' }} key={`col-label-${idx}`}>
                  <Box sx={{ 
                    p: 1, 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    bgcolor: 'grey.200'
                  }}>
                    {label}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Table rows */}
          {table.map((row, rowIdx) => (
            <Grid sx={{ display: 'flex', flexDirection: 'row', width: '100%' }} key={`row-${rowIdx}`}>
              {/* Row label if provided */}
              {rowLabels.length > 0 && (
                <Grid sx={{ width: '8.33%' }}>
                  <Box sx={{ 
                    p: 1, 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    bgcolor: 'grey.200'
                  }}>
                    {rowLabels[rowIdx] || rowIdx}
                  </Box>
                </Grid>
              )}

              {/* Row cells */}
              {row.map((cell, colIdx) => (
                <Grid sx={{ width: '8.33%' }} key={`cell-${rowIdx}-${colIdx}`}>
                  <Box sx={{
                    p: 1,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    ...getCellStyle(rowIdx, colIdx),
                    transition: 'all 0.3s',
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {cell !== undefined ? cell : ''}
                  </Box>
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default DPTableVisualizer;
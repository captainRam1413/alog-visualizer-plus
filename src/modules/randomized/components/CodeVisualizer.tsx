import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { RandomizedAlgorithmType } from '../types';
import { RandomQuickSortCode } from '../algorithms/RandomQuickSort';

interface CodeVisualizerProps {
  algorithm: RandomizedAlgorithmType;
  highlightedLines?: number[];
}

const CodeVisualizer: React.FC<CodeVisualizerProps> = ({ algorithm, highlightedLines = [] }) => {
  // Get the appropriate code based on the selected algorithm
  const getAlgorithmCode = (): string => {
    switch (algorithm) {
      case 'quicksort':
        return RandomQuickSortCode;
      // Add more algorithms as they are implemented
      default:
        return 'Algorithm code not available.';
    }
  };

  const code = getAlgorithmCode();
  const codeLines = code.split('\n');
  
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Algorithm Code
      </Typography>
      
      <Box
        sx={{
          backgroundColor: '#272822', // Dark background for code
          color: '#f8f8f2',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          overflow: 'auto',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          position: 'relative',
          maxHeight: '70vh',
        }}
      >
        <pre style={{ margin: 0 }}>
          {codeLines.map((line, index) => (
            <div
              key={index}
              style={{
                backgroundColor: highlightedLines?.includes(index) ? 'rgba(255, 255, 0, 0.1)' : 'transparent',
                display: 'block',
                padding: '1px 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              <span style={{ color: '#75715e', marginRight: '10px', userSelect: 'none' }}>
                {index + 1}
              </span>
              {line}
            </div>
          ))}
        </pre>
      </Box>
    </Paper>
  );
};

export default CodeVisualizer;
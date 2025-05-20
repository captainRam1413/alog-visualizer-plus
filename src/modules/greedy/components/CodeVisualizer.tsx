import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface CodeVisualizerProps {
  highlightedLines?: string[];
  algorithmName: string;
}

/**
 * A component that visualizes the algorithm code with highlighted steps
 */
const CodeVisualizer: React.FC<CodeVisualizerProps> = ({ highlightedLines = [], algorithmName }) => {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        Code Execution
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          height: 'calc(100% - 40px)',
          backgroundColor: '#263238', 
          color: '#eeffff',
          fontFamily: '"Roboto Mono", monospace',
          overflow: 'auto'
        }}
      >
        {highlightedLines && highlightedLines.length > 0 ? (
          <Box component="pre" sx={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
            {highlightedLines.map((line, index) => (
              <Box 
                key={index} 
                sx={{
                  pl: 2,
                  backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: '3px solid',
                  borderColor: 'primary.main',
                  mb: 0.5
                }}
              >
                {line}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography color="text.secondary">
              {algorithmName} code will be shown here during execution
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CodeVisualizer;
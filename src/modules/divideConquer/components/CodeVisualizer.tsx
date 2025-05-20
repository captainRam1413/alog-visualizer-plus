import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeVisualizerProps {
  code: string;
  currentStep: number;
  highlightLines?: number[][];
  title?: string;
  isDarkMode?: boolean;
}

const CodeVisualizer: React.FC<CodeVisualizerProps> = ({
  code,
  currentStep,
  highlightLines = [],
  title = 'Algorithm Pseudocode',
  isDarkMode = false
}) => {
  const theme = useTheme();
  
  // Get lines that should be highlighted for the current step
  const getCurrentHighlightLines = (): number[] => {
    if (currentStep < 0 || currentStep >= highlightLines.length) {
      return [];
    }
    return highlightLines[currentStep];
  };
  
  // Custom styles for syntax highlighting
  const customStyle = {
    fontSize: '14px',
    padding: '16px',
    borderRadius: '4px',
    margin: 0,
    maxHeight: '500px',
    overflowY: 'auto' as const
  };

  // Line props to highlight specific lines
  const lineProps = (lineNumber: number) => {
    const shouldHighlight = getCurrentHighlightLines().includes(lineNumber);
    return {
      style: shouldHighlight
        ? { 
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(88, 175, 223, 0.3)' 
              : 'rgba(255, 235, 59, 0.3)',
            display: 'block',
            width: '100%',
            paddingLeft: '10px',
            borderLeft: `3px solid ${theme.palette.primary.main}`
          }
        : {}
    };
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: '4px',
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <SyntaxHighlighter
          language="pseudocode"
          style={isDarkMode ? vs2015 : docco}
          customStyle={customStyle}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={lineProps}
        >
          {code}
        </SyntaxHighlighter>
      </Paper>
      
      {currentStep >= 0 && highlightLines.length > currentStep && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Executing step {currentStep + 1} of {highlightLines.length}
        </Typography>
      )}
    </Box>
  );
};

export default CodeVisualizer;
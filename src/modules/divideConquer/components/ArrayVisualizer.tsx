import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { ArrayElement } from '../types';

interface ArrayVisualizerProps {
  elements: ArrayElement[];
  description: string;
  pointerLabels?: {
    index: number;
    label: string;
  }[];
  highlightIndices?: number[];
  showIndices?: boolean;
  customStyles?: React.CSSProperties;
}

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({
  elements,
  description,
  pointerLabels = [],
  highlightIndices = [],
  showIndices = true,
  customStyles = {}
}) => {
  const theme = useTheme();

  const getElementBackgroundColor = (element: ArrayElement): string => {
    switch (element.status) {
      case 'comparing':
        return theme.palette.warning.light;
      case 'sorted':
        return theme.palette.success.light;
      case 'pivot':
        return theme.palette.error.light;
      case 'current':
        return theme.palette.info.light;
      case 'left':
        return theme.palette.primary.light;
      case 'right':
        return theme.palette.secondary.light;
      default:
        return theme.palette.background.paper;
    }
  };

  const getElementTextColor = (element: ArrayElement): string => {
    switch (element.status) {
      case 'comparing':
        return theme.palette.warning.contrastText;
      case 'sorted':
        return theme.palette.success.contrastText;
      case 'pivot':
        return theme.palette.error.contrastText;
      case 'current':
        return theme.palette.info.contrastText;
      case 'left':
        return theme.palette.primary.contrastText;
      case 'right':
        return theme.palette.secondary.contrastText;
      default:
        return theme.palette.text.primary;
    }
  };
  
  return (
    <Box sx={{ width: '100%', ...customStyles }}>
      <Typography variant="subtitle1" gutterBottom align="center">
        {description}
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        alignItems: 'flex-end', // Align elements at the bottom for pointers
        position: 'relative',
        minHeight: '100px',
        mb: 3
      }}>
        {elements.map((element, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 0.5 }}>
            <Box 
              sx={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: getElementBackgroundColor(element),
                color: getElementTextColor(element),
                border: `2px solid ${
                  highlightIndices.includes(index) 
                    ? theme.palette.error.main 
                    : theme.palette.divider
                }`,
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: highlightIndices.includes(index) ? '0 0 8px rgba(255, 0, 0, 0.6)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {element.value}
            </Box>
            
            {showIndices && (
              <Typography variant="caption" sx={{ mt: 0.5 }}>
                {index}
              </Typography>
            )}
            
            {/* Pointer labels */}
            {pointerLabels
              .filter(pointer => pointer.index === index)
              .map((pointer, i) => (
                <Box 
                  key={i}
                  sx={{
                    position: 'absolute',
                    top: '-24px',
                    transform: 'translateX(4px)',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    px: 1,
                    py: 0.25,
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  {pointer.label}
                </Box>
              ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ArrayVisualizer;
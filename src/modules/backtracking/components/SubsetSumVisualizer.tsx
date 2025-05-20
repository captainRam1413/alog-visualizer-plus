import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  Grid, 
  Tooltip, 
  Grow, 
  Chip,
  Stack, 
  LinearProgress,
  Divider,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { SubsetSumState } from '../types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface SubsetSumVisualizerProps {
  subsetState: SubsetSumState;
  width?: number;
  height?: number;
}

/**
 * Component for visualizing the Subset Sum algorithm with attractive animations and visuals
 */
const SubsetSumVisualizer: React.FC<SubsetSumVisualizerProps> = ({
  subsetState,
  width = 700,
  height = 500,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { set, target, currentSubset, currentSum, currentIndex } = subsetState;
  
  // Animation states
  const [animateSum, setAnimateSum] = useState(false);
  const [animateSet, setAnimateSet] = useState<number[]>([]);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (currentSum / target) * 100);
  const isExceeded = currentSum > target;
  const isSuccess = currentSum === target;
  
  // Set animation when currentSum or currentSubset changes
  useEffect(() => {
    setAnimateSum(true);
    const timer = setTimeout(() => setAnimateSum(false), 800);
    return () => clearTimeout(timer);
  }, [currentSum, currentSubset]);

  // Track elements that were just added or removed
  useEffect(() => {
    if (currentIndex !== undefined && currentIndex < set.length) {
      setAnimateSet([currentIndex]);
      const timer = setTimeout(() => setAnimateSet([]), 800);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentSubset]);

  // Helper function to determine if an element is in the current subset
  const isInCurrentSubset = (value: number): boolean => {
    return currentSubset.includes(value);
  };
  
  // Get corresponding index for value in the current subset
  const getSubsetIndex = (value: number): number => {
    return currentSubset.indexOf(value);
  };

  // Visual styling for elements based on their state
  const getElementStyle = (index: number, value: number) => {
    const isIncluded = isInCurrentSubset(value);
    const isAnimating = animateSet.includes(index);
    
    return {
      bgcolor: isIncluded 
        ? (isAnimating ? theme.palette.success.light : theme.palette.success.main)
        : (isAnimating ? theme.palette.grey[300] : theme.palette.background.paper),
      color: isIncluded
        ? theme.palette.success.contrastText
        : theme.palette.text.primary,
      border: `2px solid ${
        isIncluded 
          ? theme.palette.success.dark
          : index === currentIndex 
            ? theme.palette.primary.main
            : theme.palette.divider
      }`,
      transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
      boxShadow: isAnimating 
        ? `0 4px 12px ${isIncluded ? 'rgba(76, 175, 80, 0.4)' : 'rgba(0, 0, 0, 0.2)'}`
        : isIncluded 
          ? '0 2px 5px rgba(76, 175, 80, 0.25)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
    };
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        bgcolor: isDarkMode ? 'background.paper' : '#f8f8f8',
        borderRadius: 2,
        mb: 3,
        overflow: 'auto',
        maxWidth: width,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        margin: '0 auto'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        Subset Sum Visualization
      </Typography>
      
      {/* Target and Current Sum Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid sx={{ width: { xs: '100%', md: '33%' } }}>
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
              Target Sum: {target}
            </Typography>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', md: '67%' } }}>
            <Grow in={animateSum} timeout={500}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body1" 
                  fontWeight="bold" 
                  sx={{ 
                    color: isSuccess 
                      ? theme.palette.success.main 
                      : isExceeded 
                        ? theme.palette.error.main 
                        : theme.palette.primary.main,
                    transition: 'color 0.3s ease'
                  }}
                >
                  Current Sum: {currentSum}
                </Typography>
                
                {isSuccess && <CheckCircleIcon color="success" fontSize="small" />}
                {isExceeded && <CancelIcon color="error" fontSize="small" />}
              </Box>
            </Grow>
          </Grid>
        </Grid>
        
        <Box sx={{ position: 'relative', pt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            color={isSuccess ? "success" : isExceeded ? "error" : "primary"}
            sx={{ 
              height: 10, 
              borderRadius: 5,
              bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }} 
          />
          {/* Marker for target */}
          <Box 
            sx={{ 
              position: 'absolute', 
              left: '100%', 
              top: 0, 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center',
              transform: 'translateX(-2px)'
            }}
          >
            <Box 
              sx={{ 
                height: 20, 
                width: 4, 
                bgcolor: theme.palette.success.main, 
                borderRadius: 4,
                boxShadow: '0 0 5px rgba(76, 175, 80, 0.7)'
              }}
            />
          </Box>
        </Box>
      </Box>
      
      {/* Original Set Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
          Original Set:
        </Typography>
        <Grid container spacing={1.5}>
          {set.map((value, index) => (
            <Grid 
              key={`original-${index}`} 
              sx={{ width: 'auto' }}
            >
              <Tooltip 
                title={
                  index === currentIndex 
                    ? "Current Element" 
                    : isInCurrentSubset(value) 
                      ? `Included (position: ${getSubsetIndex(value) + 1})` 
                      : "Not included"
                }
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    ...getElementStyle(index, value)
                  }}
                >
                  {value}
                  {index === currentIndex && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        border: `2px solid ${isDarkMode ? '#000' : '#fff'}`
                      }}
                    >
                      ?
                    </Box>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Current Subset Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
          Current Subset:
        </Typography>
        
        {currentSubset.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            <Grid container spacing={1.5} alignItems="center">
              {currentSubset.map((value, index) => (
                <Grid key={`subset-${index}`} sx={{ width: 'auto' }}>
                  <Fade in={true} timeout={500}>
                    <Card 
                      sx={{ 
                        width: 100,
                        height: index === currentSubset.length - 1 && animateSum ? 110 : 100,
                        bgcolor: theme.palette.success.light,
                        color: theme.palette.success.contrastText,
                        transition: 'all 0.3s ease',
                        transform: index === currentSubset.length - 1 && animateSum ? 'translateY(-5px)' : 'none',
                        boxShadow: index === currentSubset.length - 1 && animateSum 
                          ? '0 8px 16px rgba(76, 175, 80, 0.3)'
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                      }}
                    >
                      <CardContent sx={{ p: '16px !important', textAlign: 'center' }}>
                        <Typography variant="h5" component="div" fontWeight="bold">
                          {value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          Element {index + 1}
                        </Typography>
                      </CardContent>
                      {index < currentSubset.length - 1 && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            right: -12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: isDarkMode ? '#424242' : '#fff',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          <AddIcon fontSize="small" color="success" />
                        </Box>
                      )}
                    </Card>
                  </Fade>
                </Grid>
              ))}
              
              {/* Sum Display */}
              {currentSubset.length > 0 && (
                <Grid sx={{ width: 'auto' }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      pl: 2
                    }}
                  >
                    <span>=</span>
                    <Chip
                      label={currentSum}
                      color={isSuccess ? "success" : isExceeded ? "error" : "primary"}
                      sx={{ 
                        ml: 2, 
                        px: 1,
                        fontSize: '1rem', 
                        fontWeight: 'bold',
                        transform: animateSum ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        height: 36
                      }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No elements selected yet
          </Typography>
        )}
      </Box>
      
      {/* Current Decision Section */}
      {currentIndex !== undefined && currentIndex < set.length && (
        <Grow in={true}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
            }}
          >
            <Typography fontWeight="medium">
              Current Decision:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Chip 
                icon={<AddIcon />} 
                label={`Include ${set[currentIndex]}`} 
                color="success" 
                variant="outlined"
                sx={{ px: 1 }}
              />
              <Typography variant="body2">or</Typography>
              <Chip 
                icon={<RemoveIcon />} 
                label={`Exclude ${set[currentIndex]}`} 
                color="default" 
                variant="outlined"
                sx={{ px: 1 }}
              />
            </Stack>
          </Box>
        </Grow>
      )}
      
      {/* Algorithm Information */}
      <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {isSuccess 
            ? "✅ Valid solution found! Current subset sums to the target value."
            : isExceeded 
              ? "❌ Current sum exceeds target. Algorithm will backtrack."
              : currentIndex !== undefined && currentIndex >= set.length
                ? "🔄 All elements processed. Backtracking..."
                : "🔍 Searching for a subset that sums to the target value."}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SubsetSumVisualizer;
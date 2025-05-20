import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme, Chip, Stack, Button, Tooltip, Collapse, Divider, Paper, Grid } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { RecursiveCall } from '../types';

interface RecursionTreeVisualizerProps {
  recursionData: RecursiveCall[];
  currentStage: number;
  maxNodes?: number;
}

const RecursionTreeVisualizer: React.FC<RecursionTreeVisualizerProps> = ({
  recursionData,
  currentStage,
  maxNodes = 50 // Default maximum number of nodes to show before simplifying
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [showBacktracking, setShowBacktracking] = useState(true);

  if (!recursionData.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1">No recursion data available yet.</Typography>
      </Box>
    );
  }

  // Group nodes by level for hierarchical display
  const nodesByLevel = recursionData.reduce((acc, node) => {
    if (!acc[node.level]) acc[node.level] = [];
    acc[node.level].push(node);
    return acc;
  }, {} as Record<number, RecursiveCall[]>);

  // Get node status based on current stage
  const getNodeStatus = (node: RecursiveCall): 'active' | 'completed' | 'backtracking' | 'waiting' => {
    // Calculate various thresholds for visualization states
    const isDownwardPhase = currentStage <= recursionData.length / 2;
    const nodeThreshold = isDownwardPhase ? 
      Math.min(currentStage * 2, recursionData.length / 2) : 
      recursionData.length / 2 + (currentStage - recursionData.length / 2);
    
    // For merge nodes or result nodes, determine if we're in the backtracking phase
    const isResultNode = node.id.includes('merge') || node.id.includes('result');
    
    // Active nodes are those currently being processed
    if (node.level === Math.floor(currentStage / 3)) {
      return 'active';
    } 
    // Completed nodes are those that have been fully processed and returned values
    else if (node.level < Math.floor(currentStage / 3) || 
            (isResultNode && currentStage > recursionData.length / 2)) {
      return 'completed';
    }
    // Backtracking nodes are parent nodes receiving values from child calls
    else if (!isDownwardPhase && node.level <= Math.ceil(currentStage / 2) && !isResultNode) {
      return 'backtracking';
    }
    // Otherwise, the node is waiting
    return 'waiting';
  };

  // Determine if we should simplify the tree (too many nodes)
  const shouldSimplify = recursionData.length > maxNodes;

  // Create a mapping of parent-child relationships for backtracking visualization
  const childrenByParent: Record<string, string[]> = {};
  recursionData.forEach(node => {
    if (node.parentId) {
      if (!childrenByParent[node.parentId]) {
        childrenByParent[node.parentId] = [];
      }
      childrenByParent[node.parentId].push(node.id);
    }
  });

  // Get node by ID for lookup
  const getNodeById = (id: string): RecursiveCall | undefined => {
    return recursionData.find(node => node.id === id);
  };

  // Helper function to identify nodes that are currently backtracking
  const isBacktrackingActive = (nodeId: string): boolean => {
    const isNodeBacktracking = getNodeStatus(recursionData.find(n => n.id === nodeId)!) === 'backtracking';
    const hasActiveChildren = childrenByParent[nodeId]?.some(childId => 
      getNodeStatus(recursionData.find(n => n.id === childId)!) === 'completed'
    );
    return isNodeBacktracking && hasActiveChildren;
  };

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Recursion Tree Visualization
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            size="small"
            variant={showBacktracking ? "contained" : "outlined"}
            onClick={() => setShowBacktracking(!showBacktracking)}
            startIcon={showBacktracking ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          >
            {showBacktracking ? "Show Backtracking" : "Hide Backtracking"}
          </Button>
          <Button 
            size="small"
            onClick={() => setExpanded(!expanded)}
            startIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Collapse in={expanded}>
        <Box sx={{ 
          width: '100%', 
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: '600px',
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minWidth: '100%',
            position: 'relative'
          }}>
            {/* Root node */}
            {recursionData.filter(node => node.parentId === null).map(rootNode => (
              <Box key={rootNode.id} sx={{ mb: 2, textAlign: 'center', position: 'relative' }}>
                <NodeCard 
                  node={rootNode} 
                  status={getNodeStatus(rootNode)} 
                  simplified={shouldSimplify}
                />
                
                {/* Show backtracking arrows returning to root */}
                {showBacktracking && currentStage > recursionData.length / 2 && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: '-20px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    width: '30px',
                    height: '20px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <ArrowUpwardIcon color="success" />
                  </Box>
                )}
              </Box>
            ))}

            {/* Render each level with backtracking indicators */}
            {Object.entries(nodesByLevel)
              .sort(([levelA], [levelB]) => Number(levelA) - Number(levelB))
              .filter(([level]) => Number(level) > 0) // Skip root level
              .map(([level, nodes]) => (
                <Box 
                  key={level} 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    mb: 4,
                    gap: 2,
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  {nodes.map(node => {
                    const nodeStatus = getNodeStatus(node);
                    const isBacktracking = nodeStatus === 'backtracking' || nodeStatus === 'completed';
                    const parentNode = node.parentId ? getNodeById(node.parentId) : null;
                    const showBacktrackingArrow = showBacktracking && isBacktracking && parentNode;

                    return (
                      <Box 
                        key={node.id}
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: shouldSimplify ? '120px' : '180px',
                          position: 'relative'
                        }}
                      >
                        {/* Downward connection line to node */}
                        <Box sx={{ 
                          height: '20px', 
                          width: '2px', 
                          bgcolor: nodeStatus === 'active' ? theme.palette.primary.main : theme.palette.divider 
                        }} />
                        
                        <NodeCard 
                          node={node} 
                          status={nodeStatus} 
                          simplified={shouldSimplify}
                        />

                        {/* Backtracking arrow */}
                        {showBacktrackingArrow && (
                          <Stack 
                            direction="column" 
                            alignItems="center"
                            sx={{ 
                              position: 'absolute',
                              top: '-25px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '20px',
                              height: '20px'
                            }}
                          >
                            <ArrowUpwardIcon 
                              fontSize="small" 
                              color={nodeStatus === 'backtracking' ? 'warning' : 'success'} 
                              sx={{ 
                                animation: nodeStatus === 'backtracking' ? 'pulse 1.5s infinite' : 'none',
                                '@keyframes pulse': {
                                  '0%': { opacity: 0.5 },
                                  '50%': { opacity: 1 },
                                  '100%': { opacity: 0.5 }
                                }
                              }}
                            />
                            {node.result && (
                              <Tooltip title={`Returns: [${node.result.join(', ')}]`}>
                                <Chip 
                                  label={node.result.length > 2 ? "..." : node.result.join(', ')} 
                                  size="small" 
                                  color="success"
                                  sx={{ fontSize: '0.6rem', height: '16px' }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))
            }
          </Box>
        </Box>
      </Collapse>

      {/* Explanation of backtracking visualization */}
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Understanding the Visualization</Typography>
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Downward Phase (Recursion):</strong> This is when the problem is divided into smaller subproblems, represented by the downward arrows.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <ArrowDownwardIcon fontSize="small" color="primary" />
              <Typography variant="caption">Dividing into subproblems</Typography>
            </Stack>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: '50%' }, p: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Upward Phase (Backtracking):</strong> This is when solutions to subproblems are combined to solve the original problem, represented by the upward arrows.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <ArrowUpwardIcon fontSize="small" color="success" />
              <Typography variant="caption">Combining solutions (backtracking)</Typography>
            </Stack>
          </Grid>
        </Grid>
        
        {/* Legend for node colors */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip 
            size="small" 
            sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }} 
            label="Active Call" 
          />
          <Chip 
            size="small" 
            sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.contrastText }} 
            label="Backtracking" 
          />
          <Chip 
            size="small" 
            sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText }} 
            label="Completed" 
          />
          <Chip 
            size="small" 
            sx={{ bgcolor: theme.palette.background.paper }} 
            label="Waiting" 
            variant="outlined" 
          />
        </Box>
      </Box>
    </Paper>
  );
};

interface NodeCardProps {
  node: RecursiveCall;
  status: 'active' | 'completed' | 'backtracking' | 'waiting';
  simplified: boolean;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, status, simplified }) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  
  // Determine card styling based on status
  const getCardStyle = () => {
    switch (status) {
      case 'active':
        return {
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.contrastText,
          borderColor: theme.palette.primary.main
        };
      case 'backtracking':
        return {
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          borderColor: theme.palette.warning.main
        };
      case 'completed':
        return {
          bgcolor: theme.palette.success.light,
          color: theme.palette.success.contrastText,
          borderColor: theme.palette.success.main
        };
      default:
        return {
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider
        };
    }
  };

  // Array representation with truncation if needed
  const arrayDisplay = () => {
    if (simplified) {
      return node.array.length > 5 
        ? `[${node.array.slice(0, 3).join(', ')}, ... (${node.array.length})]`
        : `[${node.array.join(', ')}]`;
    }
    return `[${node.array.join(', ')}]`;
  };

  // Get a descriptive label for the node
  const getNodeLabel = () => {
    if (node.id.includes('merge')) return 'Merge';
    if (node.id.includes('result')) return 'Result';
    if (node.id.includes('left')) return 'Left';
    if (node.id.includes('right')) return 'Right';
    if (status === 'backtracking') return 'Backtrack';
    return 'Divide';
  };

  return (
    <Card 
      sx={{ 
        minWidth: simplified ? '120px' : '180px',
        maxWidth: simplified ? '140px' : '220px',
        border: `2px solid ${getCardStyle().borderColor}`,
        ...getCardStyle(),
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          boxShadow: 3
        }
      }}
      onClick={() => setShowDetails(!showDetails)}
    >
      <CardContent sx={{ p: simplified ? 1 : 1.5 }}>
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {getNodeLabel()}
          </Typography>
          {status === 'backtracking' && (
            <Tooltip title="Currently backtracking">
              <ArrowUpwardIcon fontSize="small" color="warning" />
            </Tooltip>
          )}
        </Stack>
        
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {arrayDisplay()}
        </Typography>
        
        <Collapse in={showDetails || !simplified}>
          {node.pivot !== undefined && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              Pivot: {node.pivot}
            </Typography>
          )}
          
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            Range: [{node.start}...{node.end}]
          </Typography>
          
          {node.result && (
            <Box sx={{ mt: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                Returns:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                [{node.result.join(', ')}]
              </Typography>
            </Box>
          )}
        </Collapse>
        
        {/* Status indicator */}
        {status !== 'waiting' && (
          <Chip 
            label={status.charAt(0).toUpperCase() + status.slice(1)} 
            size="small"
            sx={{ 
              position: 'absolute',
              top: '4px',
              right: '4px',
              height: '18px',
              fontSize: '0.6rem',
              opacity: 0.9
            }}
            color={
              status === 'active' ? 'primary' :
              status === 'backtracking' ? 'warning' :
              'success'
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RecursionTreeVisualizer;
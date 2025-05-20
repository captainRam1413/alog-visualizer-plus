import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Fade, Tooltip, useTheme } from '@mui/material';
import { GraphColoringState } from '../types';

// Enhanced color map with nicer colors
const colorMap: Record<number, string> = {
  0: '#e0e0e0', // Uncolored/default
  1: '#ff5252', // Vibrant Red
  2: '#2196f3', // Bright Blue
  3: '#ffc107', // Amber Yellow
  4: '#9c27b0', // Purple
  5: '#4caf50', // Green
  6: '#ff9800', // Orange
  7: '#00bcd4', // Cyan
  8: '#795548', // Brown
  9: '#607d8b', // Blue Grey
  10: '#673ab7', // Deep Purple
};

// Convert positions for nodes in a circular layout with slight randomization for more natural look
const getNodePosition = (index: number, total: number, radius: number) => {
  const angle = (index / total) * 2 * Math.PI;
  // Add small randomization factor for more organic look
  const randomFactor = 0.05; // Reduced randomization factor for better centering
  const randomOffsetX = (Math.random() * 2 - 1) * randomFactor * radius;
  const randomOffsetY = (Math.random() * 2 - 1) * randomFactor * radius;
  return {
    x: radius + radius * Math.cos(angle) + randomOffsetX,
    y: radius + radius * Math.sin(angle) + randomOffsetY,
  };
};

interface GraphVisualizerProps {
  graphState: GraphColoringState;
  width?: number;
  height?: number;
}

/**
 * Enhanced component for visualizing graph coloring algorithm with animations and better styling
 */
const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  graphState,
  width = 600,
  height = 450,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { nodes, edges, colors, currentNode, maxColors } = graphState;
  
  // Adjusted radius calculation for better centering
  const radius = Math.min(width, height) * 0.35;
  const nodeRadius = Math.min(28, radius * 0.18);
  
  // Calculate center point of the SVG
  const centerX = width / 2;
  const centerY = height / 2;
  
  // State for animation effects
  const [animated, setAnimated] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  // Generate node positions in a slightly randomized circular layout, offset from center
  const [nodePositions] = useState(() => 
    Array.from({ length: nodes }, (_, i) => {
      const position = getNodePosition(i, nodes, radius);
      // Offset positions to center of SVG
      return {
        x: centerX - radius + position.x,
        y: centerY - radius + position.y
      };
    })
  );

  // Animate when current node changes
  useEffect(() => {
    setAnimated(true);
    const timer = setTimeout(() => setAnimated(false), 600);
    return () => clearTimeout(timer);
  }, [currentNode, colors]);

  // Calculate which edges are constraints for the current node
  const isConstraintEdge = (edge: {from: number; to: number}) => {
    return currentNode !== undefined && (edge.from === currentNode || edge.to === currentNode);
  };

  // Calculate which nodes are neighbors of the current node
  const isNeighborNode = (nodeIndex: number) => {
    return currentNode !== undefined && 
           edges.some(edge => 
             (edge.from === currentNode && edge.to === nodeIndex) || 
             (edge.to === currentNode && edge.from === nodeIndex)
           );
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        bgcolor: isDarkMode ? 'background.paper' : '#f5f5f5',
        borderRadius: 2,
        mb: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        Graph Coloring Visualization
      </Typography>
      <Box
        sx={{
          width: width,
          height: height,
          position: 'relative',
          margin: '0 auto',
          overflow: 'hidden',
          borderRadius: 1,
          background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.9)',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <svg width={width} height={height}>
          {/* Render edges */}
          {edges.map((edge, i) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            const isConstraint = isConstraintEdge(edge);
            
            return (
              <line
                key={`edge-${i}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isConstraint ? '#ff5722' : isDarkMode ? '#555' : '#aaa'}
                strokeWidth={isConstraint ? 3 : 1.5}
                strokeOpacity={isConstraint ? 0.8 : 0.5}
                strokeDasharray={isConstraint ? '5,3' : ''}
                strokeLinecap="round"
              />
            );
          })}

          {/* Render nodes */}
          {Array.from({ length: nodes }, (_, i) => {
            const pos = nodePositions[i];
            const color = colors[i] || 0;
            const isCurrentNode = currentNode === i;
            const isNeighbor = isNeighborNode(i);
            const isHovered = hoveredNode === i;
            
            // Apply visual treatment based on node state
            const nodeSize = isCurrentNode ? nodeRadius * 1.2 : 
                           isHovered ? nodeRadius * 1.1 : 
                           nodeRadius;
            
            const strokeWidth = isCurrentNode ? 3 : 
                               isNeighbor ? 2 : 
                               isHovered ? 2 : 
                               1;
            
            const strokeColor = isCurrentNode ? '#f44336' : 
                               isNeighbor ? '#ff9800' : 
                               isDarkMode ? '#fff' : '#666';
            
            return (
              <g 
                key={`node-${i}`}
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Shadow for depth effect */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeSize + 2}
                  fill="rgba(0,0,0,0.3)"
                  opacity={0.5}
                />
                
                {/* Highlight animation circle */}
                {(isCurrentNode || isHovered) && (
                  <Fade in={animated || isHovered} timeout={300}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeSize * 1.3}
                      fill="transparent"
                      stroke={isCurrentNode ? '#f44336' : '#2196f3'}
                      strokeWidth={1.5}
                      strokeDasharray="3,2"
                      opacity={0.7}
                    />
                  </Fade>
                )}
                
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeSize}
                  fill={colorMap[color]}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  style={{
                    transition: 'all 0.3s ease-in-out',
                    filter: isCurrentNode ? 'drop-shadow(0 0 5px rgba(255,0,0,0.5))' : 
                            isHovered ? 'drop-shadow(0 0 3px rgba(33,150,243,0.5))' : 'none'
                  }}
                />
                
                {/* Node label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={nodeSize * 0.7}
                  fontWeight={isCurrentNode || isHovered ? "bold" : "normal"}
                  fill={isDarkMode ? '#fff' : '#333'}
                  style={{ userSelect: 'none' }}
                >
                  {i}
                </text>
                
                {/* Color number badge */}
                {color > 0 && (
                  <g>
                    <circle 
                      cx={pos.x + nodeSize * 0.7} 
                      cy={pos.y - nodeSize * 0.7}
                      r={nodeSize * 0.4}
                      fill={isDarkMode ? '#333' : '#fff'}
                      stroke={colorMap[color]}
                      strokeWidth={1.5}
                    />
                    <text
                      x={pos.x + nodeSize * 0.7}
                      y={pos.y - nodeSize * 0.7}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={nodeSize * 0.5}
                      fontWeight="bold"
                      fill={isDarkMode ? '#fff' : '#333'}
                    >
                      {color}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Current node information overlay */}
        {currentNode !== undefined && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              p: 1.5,
              borderRadius: 1,
              bgcolor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Current Node: {currentNode}
            </Typography>
            <Typography variant="body2">
              Color: {colors[currentNode] > 0 ? colors[currentNode] : 'None'}
            </Typography>
            <Typography variant="body2">
              Neighbors: {edges.filter(e => e.from === currentNode || e.to === currentNode)
                .map(e => e.from === currentNode ? e.to : e.from)
                .join(', ')}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Color legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 2,
          mb: 1,
          justifyContent: 'center',
          p: 1,
          borderRadius: 1,
          bgcolor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
        }}
      >
        {Array.from({ length: maxColors + 1 }, (_, i) => (
          <Tooltip key={`color-${i}`} title={i === 0 ? 'Unassigned' : `Color ${i}`} arrow>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: colorMap[i],
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              />
              <Typography variant="caption" fontWeight={i === 0 ? 'normal' : 'medium'}>
                {i === 0 ? 'Uncolored' : `#${i}`}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* Instructions */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
        Hover over nodes to see details. Highlighted edges indicate constraints.
      </Typography>
    </Paper>
  );
};

export default GraphVisualizer;
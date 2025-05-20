import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { GraphVisualizationData } from '../types';

interface GraphVisualizerProps {
  graphData: GraphVisualizationData;
  description: string;
}

/**
 * A component that visualizes graph algorithms like MST and Dijkstra's algorithm
 */
const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ graphData, description }) => {
  const { nodes, edges, selectedEdges = [], currentVertex } = graphData;
  
  // Helper function to check if an edge is selected
  const isEdgeSelected = (from: number, to: number) => {
    return selectedEdges.some(edge => 
      (edge.from === from && edge.to === to) || 
      (edge.from === to && edge.to === from)
    );
  };
  
  // Helper to get total weight of selected edges
  const getTotalWeight = () => {
    return selectedEdges.reduce((sum, edge) => sum + edge.weight, 0);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {description}
      </Typography>
      
      {selectedEdges.length > 0 && (
        <Typography variant="body2" sx={{ mb: 2, color: 'success.main' }}>
          Total weight of selected edges: {getTotalWeight()}
        </Typography>
      )}
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 2, 
          height: 'calc(100% - 80px)', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5', 
          overflow: 'hidden'
        }}
      >
        <svg width="100%" height="100%" viewBox="-10 -10 220 220">
          {/* Draw edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;
            
            // Calculate node positions (in a circular layout for simplicity)
            const radius = 90;
            const angleFrom = (edge.from / nodes.length) * 2 * Math.PI;
            const angleTo = (edge.to / nodes.length) * 2 * Math.PI;
            
            const x1 = 100 + radius * Math.cos(angleFrom);
            const y1 = 100 + radius * Math.sin(angleFrom);
            const x2 = 100 + radius * Math.cos(angleTo);
            const y2 = 100 + radius * Math.sin(angleTo);
            
            // Determine if this edge is part of our solution
            const selected = isEdgeSelected(edge.from, edge.to);
            
            return (
              <React.Fragment key={`edge-${index}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={selected ? "#4caf50" : "#aaa"}
                  strokeWidth={selected ? 3 : 1.5}
                />
                
                {/* Edge weight */}
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2}
                  textAnchor="middle"
                  dy="-5"
                  fill={selected ? "#1b5e20" : "#555"}
                  fontSize="12"
                >
                  {edge.weight}
                </text>
              </React.Fragment>
            );
          })}
          
          {/* Draw nodes */}
          {nodes.map((node) => {
            const radius = 90;
            const angle = (node.id / nodes.length) * 2 * Math.PI;
            const x = 100 + radius * Math.cos(angle);
            const y = 100 + radius * Math.sin(angle);
            
            // Check if this is the current vertex in the algorithm
            const isCurrent = currentVertex === node.id;
            
            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 15 : 12}
                  fill={isCurrent ? "#ff9800" : "#2196f3"}
                  stroke={isCurrent ? "#e65100" : "#0d47a1"}
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy=".3em"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Paper>
      
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#2196f3', borderRadius: '50%', mr: 0.5 }} />
            <Typography variant="caption">Regular Node</Typography>
          </Box>
        </Grid>
        <Grid>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#ff9800', borderRadius: '50%', mr: 0.5 }} />
            <Typography variant="caption">Current Node</Typography>
          </Box>
        </Grid>
        <Grid>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 2, bgcolor: '#aaa', mr: 0.5 }} />
            <Typography variant="caption">Edge</Typography>
          </Box>
        </Grid>
        <Grid>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 3, bgcolor: '#4caf50', mr: 0.5 }} />
            <Typography variant="caption">Selected Edge</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GraphVisualizer;
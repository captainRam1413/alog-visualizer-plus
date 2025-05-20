import React, { useRef, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { SkipListState, SkipListNode } from '../types';

interface SkipListVisualizerProps {
  dataState: SkipListState;
}

const SkipListVisualizer: React.FC<SkipListVisualizerProps> = ({ dataState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Visualization constants
  const NODE_WIDTH = 50;
  const NODE_HEIGHT = 30;
  const LEVEL_HEIGHT = 60;
  const HORIZONTAL_GAP = 30; // Increased gap for better visualization
  const VERTICAL_GAP = 30;
  const ARROW_HEAD_SIZE = 6;
  
  // Colors
  const COLORS = {
    background: '#f5f5f5',
    node: '#e3f2fd',
    nodeHighlighted: '#bbdefb',
    nodeBorder: '#1976d2',
    nodeHighlightedBorder: '#1565c0',
    nodeCurrent: '#4fc3f7',
    nodeCurrentBorder: '#0277bd',
    sentinel: '#f3e5f5',
    sentinelBorder: '#9c27b0',
    text: '#212121',
    arrow: '#1976d2',
    expressLane: '#4caf50',
    searchPath: '#4caf50',
    levelIndicator: '#9e9e9e'
  };
  
  // Function to draw the Skip List
  const drawSkipList = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate the total width needed
    const maxNodesInLevel = Math.max(...dataState.levels.map(level => level.length));
    const totalWidth = (maxNodesInLevel * (NODE_WIDTH + HORIZONTAL_GAP)) + 100;
    const totalHeight = (dataState.levels.length * LEVEL_HEIGHT) + 50;
    
    // Set canvas dimensions
    canvas.width = Math.max(800, totalWidth); // Increased width for better visibility
    canvas.height = Math.max(300, totalHeight);
    
    // Clear canvas again with new dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw level indicators (y-axis)
    ctx.fillStyle = COLORS.levelIndicator;
    ctx.font = '14px Arial';
    
    for (let i = 0; i < dataState.levels.length; i++) {
      const y = i * LEVEL_HEIGHT + NODE_HEIGHT / 2 + 30;
      ctx.fillText(`Level ${dataState.levels.length - 1 - i}`, 10, y);
    }
    
    // Add title with level probability explanation
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText("Skip List: Each level i has ~1/2ⁱ of the nodes (p=0.5)", 60, 10);
    
    // Draw nodes and connections
    for (let levelIdx = 0; levelIdx < dataState.levels.length; levelIdx++) {
      const level = dataState.levels[dataState.levels.length - 1 - levelIdx]; // Draw from top to bottom
      const y = levelIdx * LEVEL_HEIGHT + 30;
      
      // First pass: draw connection lines/pointers
      for (let i = 0; i < level.length - 1; i++) {
        const fromNode = level[i];
        const toNode = level[i + 1];
        
        const fromX = 60 + fromNode.position.x * (NODE_WIDTH + HORIZONTAL_GAP) + NODE_WIDTH;
        const toX = 60 + toNode.position.x * (NODE_WIDTH + HORIZONTAL_GAP);
        const centerY = y + NODE_HEIGHT / 2;
        
        // Make express lanes (higher levels) more distinguished
        const expressLevel = dataState.levels.length - 1 - levelIdx;
        const isExpressLane = expressLevel > 0;
        
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(fromX, centerY);
        ctx.lineTo(toX, centerY);
        ctx.strokeStyle = isExpressLane ? COLORS.expressLane : COLORS.arrow;
        ctx.lineWidth = isExpressLane ? 2.5 : 2;
        
        // If this is an express lane, use dashed lines to indicate faster traversal
        if (isExpressLane) {
          ctx.setLineDash([5, 3]);
        } else {
          ctx.setLineDash([]);
        }
        
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(toX, centerY);
        ctx.lineTo(toX + ARROW_HEAD_SIZE, centerY - ARROW_HEAD_SIZE);
        ctx.lineTo(toX + ARROW_HEAD_SIZE, centerY + ARROW_HEAD_SIZE);
        ctx.fillStyle = isExpressLane ? COLORS.expressLane : COLORS.arrow;
        ctx.fill();
      }

      // Second pass: draw nodes
      for (let i = 0; i < level.length; i++) {
        const node = level[i];
        const x = 60 + node.position.x * (NODE_WIDTH + HORIZONTAL_GAP);
        
        // Determine node style based on state
        let fillColor, borderColor;
        
        // Check if this is a sentinel node (head/tail)
        if (node.isHeader || node.value === -Infinity || node.value === Infinity) {
          fillColor = COLORS.sentinel;
          borderColor = COLORS.sentinelBorder;
        } else if (dataState.currentNode && 
            node.value === dataState.currentNode.value && 
            node.position.y === dataState.currentNode.position.y) {
          fillColor = COLORS.nodeCurrent;
          borderColor = COLORS.nodeCurrentBorder;
        } else if (node.isHighlighted) {
          fillColor = COLORS.nodeHighlighted;
          borderColor = COLORS.nodeHighlightedBorder;
        } else {
          fillColor = COLORS.node;
          borderColor = COLORS.nodeBorder;
        }
        
        // Check if node is part of search path
        const isSearchPath = dataState.searchPath?.some(
          pathNode => pathNode.value === node.value && pathNode.position.y === node.position.y
        );
        
        if (isSearchPath) {
          borderColor = COLORS.searchPath;
          ctx.lineWidth = 3; // Thicker border for search path
        } else {
          ctx.lineWidth = 2;
        }
        
        // Draw node rectangle
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = borderColor;
        ctx.beginPath();
        ctx.roundRect(x, y, NODE_WIDTH, NODE_HEIGHT, 5);
        ctx.fill();
        ctx.stroke();
        
        // Draw node value
        ctx.fillStyle = COLORS.text;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let displayValue;
        if (node.value === -Infinity) {
          displayValue = "HEAD";
        } else if (node.value === Infinity) {
          displayValue = "TAIL";
        } else {
          displayValue = node.value;
        }
        ctx.fillText(String(displayValue), x + NODE_WIDTH / 2, y + NODE_HEIGHT / 2);
      }
    }

    // Draw vertical pointers (dotted lines) connecting the same node across levels
    // This helps visualize the tower structure of Skip Lists
    for (let levelIdx = 1; levelIdx < dataState.levels.length; levelIdx++) {
      const levelAbove = dataState.levels[dataState.levels.length - levelIdx];
      const levelBelow = dataState.levels[dataState.levels.length - levelIdx - 1];
      const yAbove = levelIdx * LEVEL_HEIGHT + 30;
      const yBelow = (levelIdx + 1) * LEVEL_HEIGHT + 30;
      
      // Find matching values (same node at different levels)
      for (let i = 0; i < levelAbove.length; i++) {
        const nodeAbove = levelAbove[i];
        
        // Skip sentinel nodes for vertical links
        if (nodeAbove.value === -Infinity || nodeAbove.value === Infinity) continue;
        
        for (let j = 0; j < levelBelow.length; j++) {
          const nodeBelow = levelBelow[j];
          if (nodeAbove.value === nodeBelow.value) {
            // Draw vertical connector (dotted line)
            const x = 60 + nodeAbove.position.x * (NODE_WIDTH + HORIZONTAL_GAP) + NODE_WIDTH / 2;
            
            ctx.beginPath();
            ctx.moveTo(x, yAbove + NODE_HEIGHT);
            ctx.lineTo(x, yBelow);
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = '#8c8c8c';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
            break;
          }
        }
      }
    }

    // Draw operation information if applicable
    if (dataState.operation !== 'none' && dataState.target !== undefined) {
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      
      let operationText = "";
      switch (dataState.operation) {
        case 'search':
          operationText = `Searching for: ${dataState.target}`;
          break;
        case 'insert':
          operationText = `Inserting: ${dataState.target}`;
          break;
        case 'delete':
          operationText = `Deleting: ${dataState.target}`;
          break;
      }
      
      ctx.fillText(operationText, canvas.width - 20, 10);
    }
  };
  
  // Effect to redraw when state changes
  useEffect(() => {
    drawSkipList();
  }, [dataState]);
  
  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Skip List Visualization
        </Typography>
        
        {dataState && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1, overflow: 'auto' }}>
            <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
          </Box>
        )}
        
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: COLORS.node, border: `2px solid ${COLORS.nodeBorder}`, mr: 1 }} />
            <Typography variant="caption">Node</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: COLORS.sentinel, border: `2px solid ${COLORS.sentinelBorder}`, mr: 1 }} />
            <Typography variant="caption">Sentinel Node</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: COLORS.nodeHighlighted, border: `2px solid ${COLORS.nodeHighlightedBorder}`, mr: 1 }} />
            <Typography variant="caption">Highlighted Node</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: COLORS.nodeCurrent, border: `2px solid ${COLORS.nodeCurrentBorder}`, mr: 1 }} />
            <Typography variant="caption">Current Node</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, bgcolor: COLORS.node, border: `2px solid ${COLORS.searchPath}`, mr: 1 }} />
            <Typography variant="caption">Search Path</Typography>
          </Box>
        </Box>
        
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Key Features of Skip Lists:
        </Typography>
        <Typography variant="body2" paragraph>
          • Each node can appear at multiple levels based on probabilistic promotion
        </Typography>
        <Typography variant="body2" paragraph>
          • Higher levels act as "express lanes" for faster searching
        </Typography>
        <Typography variant="body2" paragraph>
          • New nodes have a 50% chance of promotion to each higher level
        </Typography>
      </Paper>
    </Box>
  );
};

export default SkipListVisualizer;
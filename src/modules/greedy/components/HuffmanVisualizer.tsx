import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { HuffmanNode } from '../types';

interface HuffmanVisualizerProps {
  huffmanTree?: HuffmanNode;
  description: string;
}

/**
 * A component that visualizes the Huffman coding algorithm and tree
 */
const HuffmanVisualizer: React.FC<HuffmanVisualizerProps> = ({ huffmanTree, description }) => {
  // Calculate tree dimensions
  const getTreeDepth = (node?: HuffmanNode): number => {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
  };
  
  const treeDepth = getTreeDepth(huffmanTree);
  const nodeWidth = 60;
  const nodeHeight = 40;
  const levelHeight = 80;
  const treeWidth = Math.pow(2, treeDepth - 1) * nodeWidth * 2;
  const treeHeight = treeDepth * levelHeight;
  
  // Extract codes from tree
  const extractCodes = (
    node?: HuffmanNode, 
    code: string = '', 
    codes: {[key: string]: string} = {}
  ): {[key: string]: string} => {
    if (!node) return codes;
    
    if (node.char && node.char !== 'ROOT') {
      codes[node.char] = code;
    }
    
    extractCodes(node.left, code + '0', codes);
    extractCodes(node.right, code + '1', codes);
    
    return codes;
  };
  
  const codes = huffmanTree ? extractCodes(huffmanTree) : {};
  
  // Recursively render the tree nodes
  const renderTreeNode = (
    node?: HuffmanNode, 
    x: number = treeWidth / 2, 
    y: number = 30, 
    level: number = 0,
    parentX?: number,
    parentY?: number,
    edgeLabel?: string
  ): React.ReactNode => {
    if (!node) return null;
    
    const spacing = treeWidth / Math.pow(2, level + 1);
    
    return (
      <React.Fragment key={`node-${node.id}`}>
        {/* Edge from parent to this node */}
        {parentX !== undefined && parentY !== undefined && (
          <React.Fragment>
            <line
              x1={parentX}
              y1={parentY}
              x2={x}
              y2={y}
              stroke="#555"
              strokeWidth={1.5}
            />
            {/* Edge label (0 or 1) */}
            <text
              x={(parentX + x) / 2}
              y={(parentY + y) / 2 - 5}
              textAnchor="middle"
              fontSize="12"
              fill="#d32f2f"
              fontWeight="bold"
            >
              {edgeLabel}
            </text>
          </React.Fragment>
        )}
        
        {/* Node */}
        <circle
          cx={x}
          cy={y}
          r={nodeHeight / 2}
          fill={node.char ? '#bbdefb' : '#e0e0e0'}
          stroke={node.char ? '#1976d2' : '#757575'}
          strokeWidth={1.5}
        />
        
        {/* Node label - Character */}
        {node.char && (
          <text
            x={x}
            y={y - 5}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
          >
            {node.char}
          </text>
        )}
        
        {/* Node frequency */}
        <text
          x={x}
          y={y + 10}
          textAnchor="middle"
          fontSize="10"
        >
          {node.frequency}
        </text>
        
        {/* Render children */}
        {renderTreeNode(
          node.left, 
          x - spacing / 2, 
          y + levelHeight, 
          level + 1,
          x,
          y,
          '0'
        )}
        {renderTreeNode(
          node.right, 
          x + spacing / 2, 
          y + levelHeight, 
          level + 1,
          x,
          y,
          '1'
        )}
      </React.Fragment>
    );
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {description}
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          height: 'calc(100% - 200px)', 
          backgroundColor: '#f5f5f5', 
          overflow: 'auto'
        }}
      >
        {huffmanTree ? (
          <svg width="100%" height={treeHeight + 50} viewBox={`0 0 ${treeWidth} ${treeHeight + 50}`}>
            {renderTreeNode(huffmanTree)}
          </svg>
        ) : (
          <Box 
            sx={{ 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography color="text.secondary">
              No Huffman tree to display yet
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Display the generated codes */}
      {Object.keys(codes).length > 0 && (
        <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Generated Huffman Codes:</Typography>
          <Grid container spacing={1}>
            {Object.entries(codes).map(([char, code]) => (
              <Grid sx={{ gridColumn: { xs: 'span 4', sm: 'span 3', md: 'span 2' } }} key={char}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: 1,
                  bgcolor: 'primary.lightest'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                    '{char}':
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {code}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 14, 
            height: 14, 
            borderRadius: '50%',
            bgcolor: '#bbdefb', 
            border: '1.5px solid #1976d2', 
            mr: 0.5 
          }} />
          <Typography variant="caption">Leaf Node (Character)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 14, 
            height: 14,
            borderRadius: '50%', 
            bgcolor: '#e0e0e0', 
            border: '1.5px solid #757575', 
            mr: 0.5 
          }} />
          <Typography variant="caption">Internal Node</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" fontWeight="bold" color="#d32f2f">0</Typography>
          <Box sx={{ width: 10, height: 1, bgcolor: '#555', mx: 0.5 }} />
          <Typography variant="caption">Edge Label</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HuffmanVisualizer;
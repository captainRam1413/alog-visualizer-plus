import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  isProcessed?: boolean;
  isCurrent?: boolean;
}

interface RecursiveTreeVisualizerProps {
  treeData?: TreeNode;
  currentNodeId?: string;
}

const RecursiveTreeVisualizer: React.FC<RecursiveTreeVisualizerProps> = ({ 
  treeData, 
  currentNodeId 
}) => {
  if (!treeData) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1">No recursive calls to visualize yet.</Typography>
      </Box>
    );
  }

  // Render a tree node recursively
  const renderNode = (node: TreeNode) => {
    const isCurrent = node.id === currentNodeId;
    const bgColor = isCurrent 
      ? 'primary.main'
      : node.isProcessed
      ? 'success.light'
      : 'grey.100';
    
    const textColor = isCurrent ? 'white' : 'text.primary';
    
    return (
      <Box key={node.id} sx={{ textAlign: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'inline-block',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '4px',
            padding: '8px 16px',
            bgcolor: bgColor,
            color: textColor,
            transition: 'all 0.3s',
            fontWeight: isCurrent ? 'bold' : 'normal',
          }}
        >
          {node.label}
        </Box>
        
        {node.children.length > 0 && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            mt: 2,
            '&:before': {
              content: '""',
              position: 'absolute',
              top: '-10px',
              left: '50%',
              width: '2px',
              height: '10px',
              bgcolor: 'grey.400',
              zIndex: 0,
            }
          }}>
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-around', 
              width: '100%',
              flexWrap: 'wrap',
              gap: 2
            }}>
              {node.children.map((child) => renderNode(child))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, overflow: 'auto', maxHeight: '500px' }}>
      <Typography variant="h6" gutterBottom align="center">
        Recursive Call Tree
      </Typography>

      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        {renderNode(treeData)}
      </Box>
    </Paper>
  );
};

export default RecursiveTreeVisualizer;
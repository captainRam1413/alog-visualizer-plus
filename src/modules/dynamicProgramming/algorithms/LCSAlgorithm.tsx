import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, Stack } from '@mui/material';
import { DPVisualizationState, DPProblemProps } from '../types';
import { createInitialDPState, updateCurrentCell, markCellCompleted, finalizeDPState, delay } from './utils';

interface LCSProps extends DPProblemProps {
  string1?: string;
  string2?: string;
}

export const LCSAlgorithm: React.FC<LCSProps> = ({
  string1 = "ABCBDAB",
  string2 = "BDCABA",
  speed = 500,
  onVisualizationChange
}) => {
  const [input1, setInput1] = useState<string>(string1);
  const [input2, setInput2] = useState<string>(string2);
  const [visualizationState, setVisualizationState] = useState<DPVisualizationState | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<any>(null);

  // Calculate LCS with visualization
  const calculateLCS = async (text1: string, text2: string) => {
    const m = text1.length;
    const n = text2.length;
    
    // Initialize DP table (m+1) x (n+1)
    let state = createInitialDPState(m + 1, n + 1);
    
    // Initialize the recursive tree structure
    const rootNode = {
      id: `lcs-${m}-${n}`,
      label: `LCS("${text1}", "${text2}")`,
      children: [],
      isCurrent: true
    };
    setTreeData(rootNode);
    
    updateVisualization(state);
    await delay(speed);
    
    // Fill the first row with 0s
    for (let j = 0; j <= n; j++) {
      state = updateCurrentCell(
        state, 
        0, 
        j, 
        0, 
        j === 0 ? 
          `Initialize dp[0][0] = 0 (base case: empty strings)` :
          `Initialize dp[0][${j}] = 0 (base case: first string is empty)`
      );
      updateVisualization(state);
      await delay(speed / 2);
      
      state = markCellCompleted(state, 0, j);
      updateVisualization(state);
    }
    
    // Fill the first column with 0s
    for (let i = 1; i <= m; i++) {
      state = updateCurrentCell(
        state, 
        i, 
        0, 
        0, 
        `Initialize dp[${i}][0] = 0 (base case: second string is empty)`
      );
      updateVisualization(state);
      await delay(speed / 2);
      
      state = markCellCompleted(state, i, 0);
      updateVisualization(state);
    }
    
    // Build a tree structure showing a few call levels
    await buildLCSTree(text1, text2, rootNode, 3); // Limit to 3 levels of recursion for display
    
    // Fill the DP table
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const nodeId = `lcs-${i}-${j}`;
        updateTreeNodeState(nodeId, true, false); // Mark current node
        
        if (text1[i - 1] === text2[j - 1]) {
          // Characters match - add 1 to diagonal value
          state = updateCurrentCell(
            state, 
            i, 
            j, 
            state.table[i - 1][j - 1] + 1,
            `Characters match: ${text1[i-1]} = ${text2[j-1]}, so dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${state.table[i-1][j-1]} + 1 = ${state.table[i-1][j-1] + 1}`
          );
        } else {
          // Characters don't match - take max of left and top
          const left = state.table[i][j - 1];
          const top = state.table[i - 1][j];
          state = updateCurrentCell(
            state, 
            i, 
            j, 
            Math.max(left, top),
            `Characters don't match: ${text1[i-1]} ≠ ${text2[j-1]}, so dp[${i}][${j}] = max(dp[${i}][${j-1}], dp[${i-1}][${j}]) = max(${left}, ${top}) = ${Math.max(left, top)}`
          );
        }
        
        updateVisualization(state);
        await delay(speed);
        
        state = markCellCompleted(state, i, j);
        updateTreeNodeState(nodeId, false, true); // Mark node as processed
        updateVisualization(state);
      }
    }
    
    // Reconstruct the LCS
    let lcs = "";
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
      if (text1[i - 1] === text2[j - 1]) {
        lcs = text1[i - 1] + lcs;
        i--;
        j--;
      } else if (state.table[i - 1][j] > state.table[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    // Finalize visualization
    state = finalizeDPState(
      state,
      `LCS of "${text1}" and "${text2}" is "${lcs}" with length ${state.table[m][n]}`
    );
    updateVisualization(state);
    
    return lcs;
  };
  
  // Create recursive call tree (simplified for display purposes)
  const buildLCSTree = async (text1: string, text2: string, node: any, depth: number) => {
    if (depth <= 0 || !text1 || !text2) return;
    
    const m = text1.length;
    const n = text2.length;
    
    if (m > 0 && n > 0) {
      // Case 1: Characters match - diagonal recursion
      if (text1[m-1] === text2[n-1]) {
        const childNode = {
          id: `lcs-${m-1}-${n-1}`,
          label: `LCS("${text1.slice(0, m-1)}", "${text2.slice(0, n-1)}")`,
          children: [],
          isProcessed: false
        };
        node.children.push(childNode);
        await buildLCSTree(text1.slice(0, m-1), text2.slice(0, n-1), childNode, depth - 1);
      } else {
        // Case 2: Skip character from first string
        const child1 = {
          id: `lcs-${m-1}-${n}`,
          label: `LCS("${text1.slice(0, m-1)}", "${text2}")`,
          children: [],
          isProcessed: false
        };
        node.children.push(child1);
        await buildLCSTree(text1.slice(0, m-1), text2, child1, depth - 1);
        
        // Case 3: Skip character from second string
        const child2 = {
          id: `lcs-${m}-${n-1}`,
          label: `LCS("${text1}", "${text2.slice(0, n-1)}")`,
          children: [],
          isProcessed: false
        };
        node.children.push(child2);
        await buildLCSTree(text1, text2.slice(0, n-1), child2, depth - 1);
      }
    }
    
    // For visualization purposes, truncate string display if too long
    node.label = truncateLabel(node.label);
    setTreeData({...rootTreeNode}); // Forcing state update
  };
  
  const truncateLabel = (label: string): string => {
    const maxLen = 15;
    if (label.length > maxLen * 2) {
      return label.substring(0, maxLen) + "..." + label.substring(label.length - maxLen);
    }
    return label;
  };
  
  // Global reference to tree root for state updates
  let rootTreeNode: any = null;
  
  // Helper to update node state in tree
  const updateTreeNodeState = (nodeId: string, isCurrent: boolean, isProcessed: boolean) => {
    if (!treeData) return;
    
    const updateNode = (node: any): boolean => {
      if (node.id === nodeId) {
        node.isCurrent = isCurrent;
        node.isProcessed = isProcessed;
        return true;
      }
      
      for (let child of node.children) {
        if (updateNode(child)) return true;
      }
      
      return false;
    };
    
    rootTreeNode = {...treeData};
    updateNode(rootTreeNode);
    setTreeData(rootTreeNode);
  };
  
  // Update visualization state and notify parent component
  const updateVisualization = (state: DPVisualizationState) => {
    setVisualizationState(state);
    if (onVisualizationChange) {
      // Enhance visualization state with tree data for parent component
      const enhancedState = {
        ...state,
        auxData: {
          treeData: treeData,
          algorithm: 'lcs'
        }
      };
      onVisualizationChange(enhancedState);
    }
  };
  
  const handleCalculate = async () => {
    setIsRunning(true);
    rootTreeNode = {
      id: `lcs-${input1.length}-${input2.length}`,
      label: `LCS("${input1}", "${input2}")`,
      children: [],
      isCurrent: true
    };
    setTreeData(rootTreeNode);
    await calculateLCS(input1, input2);
    setIsRunning(false);
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Longest Common Subsequence
      </Typography>
      <Typography variant="body2" paragraph>
        Find the longest subsequence common to two strings. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.
      </Typography>
      
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="String 1"
          value={input1}
          onChange={(e) => setInput1(e.target.value.toUpperCase())}
          size="small"
          disabled={isRunning}
        />
        <TextField
          label="String 2"
          value={input2}
          onChange={(e) => setInput2(e.target.value.toUpperCase())}
          size="small"
          disabled={isRunning}
        />
        <Button 
          variant="contained" 
          onClick={handleCalculate}
          disabled={isRunning || !input1 || !input2}
        >
          {isRunning ? 'Running...' : 'Visualize'}
        </Button>
      </Stack>
      
      {visualizationState && visualizationState.steps.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Step: {visualizationState.currentStep} of {visualizationState.steps.length}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {visualizationState.steps[visualizationState.currentStep - 1] || 'Initializing...'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// A function to solve LCS without animation for code explanation
export const lcsDP = (text1: string, text2: string): string => {
  const m = text1.length;
  const n = text2.length;
  
  // Create DP table
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Reconstruct the LCS
  let lcs = "";
  let i = m, j = n;
  
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      lcs = text1[i - 1] + lcs;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs;
};

export default LCSAlgorithm;
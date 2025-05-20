import React, { useState } from 'react';
import { Box, Button, Paper, Typography, Stack, TextField, Slider, Chip } from '@mui/material';
import { DPVisualizationState, DPProblemProps } from '../types';
import { createInitialDPState, updateCurrentCell, markCellCompleted, finalizeDPState, delay } from './utils';

interface Item {
  weight: number;
  value: number;
}

interface KnapsackProps extends DPProblemProps {
  initialItems?: Item[];
  initialCapacity?: number;
}

export const KnapsackAlgorithm: React.FC<KnapsackProps> = ({
  initialItems = [{ weight: 1, value: 60 }, { weight: 2, value: 100 }, { weight: 3, value: 120 }],
  initialCapacity = 5,
  speed = 500,
  onVisualizationChange
}) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [capacity, setCapacity] = useState<number>(initialCapacity);
  const [newItemWeight, setNewItemWeight] = useState<number>(1);
  const [newItemValue, setNewItemValue] = useState<number>(50);
  const [visualizationState, setVisualizationState] = useState<DPVisualizationState | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<any>(null);
  
  // Calculate Knapsack with visualization
  const calculateKnapsack = async (items: Item[], capacity: number) => {
    const n = items.length;
    
    // Initialize DP table
    let state = createInitialDPState(n + 1, capacity + 1);
    
    // Initialize recursive tree structure
    const rootNode = {
      id: `knapsack-${n}-${capacity}`,
      label: `Knapsack(items[0..${n-1}], ${capacity})`,
      children: [],
      isCurrent: true
    };
    
    let rootTreeNode = rootNode;
    setTreeData(rootNode);
    
    updateVisualization(state);
    await delay(speed);
    
    // Build a simplified recursive tree for visualization
    await buildKnapsackTree(items, capacity, n, rootNode, 2);
    
    // Base case: Fill the first row (0 items) with 0s
    for (let w = 0; w <= capacity; w++) {
      state = updateCurrentCell(
        state, 
        0, 
        w, 
        0, 
        w === 0 ? 
          `Initialize dp[0][0] = 0 (base case: no items, 0 capacity)` : 
          `Initialize dp[0][${w}] = 0 (base case: no items, capacity ${w})`
      );
      updateVisualization(state);
      await delay(speed / 2);
      
      state = markCellCompleted(state, 0, w);
      updateVisualization(state);
    }

    // Fill the DP table
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        const currentItem = items[i - 1];
        const nodeId = `knapsack-${i}-${w}`;
        
        // Update tree node status
        updateTreeNodeState(nodeId, true, false);
        
        if (currentItem.weight <= w) {
          // Can include this item
          const includeValue = currentItem.value + state.table[i - 1][w - currentItem.weight];
          const excludeValue = state.table[i - 1][w];
          
          if (includeValue > excludeValue) {
            state = updateCurrentCell(
              state, 
              i, 
              w, 
              includeValue,
              `For item ${i} (weight=${currentItem.weight}, value=${currentItem.value}) and capacity ${w}: 
               Include: ${currentItem.value} + dp[${i-1}][${w-currentItem.weight}] = ${currentItem.value} + ${state.table[i-1][w-currentItem.weight]} = ${includeValue}
               Exclude: dp[${i-1}][${w}] = ${excludeValue}
               Take max: ${includeValue}`
            );
          } else {
            state = updateCurrentCell(
              state, 
              i, 
              w, 
              excludeValue,
              `For item ${i} (weight=${currentItem.weight}, value=${currentItem.value}) and capacity ${w}: 
               Include: ${currentItem.value} + dp[${i-1}][${w-currentItem.weight}] = ${currentItem.value} + ${state.table[i-1][w-currentItem.weight]} = ${includeValue}
               Exclude: dp[${i-1}][${w}] = ${excludeValue}
               Take max: ${excludeValue}`
            );
          }
        } else {
          // Item is too heavy, can't include it
          state = updateCurrentCell(
            state, 
            i, 
            w, 
            state.table[i - 1][w],
            `For item ${i} (weight=${currentItem.weight}, value=${currentItem.value}) and capacity ${w}: Item too heavy, so dp[${i}][${w}] = dp[${i-1}][${w}] = ${state.table[i-1][w]}`
          );
        }
        
        updateVisualization(state);
        await delay(speed);
        
        state = markCellCompleted(state, i, w);
        updateTreeNodeState(nodeId, false, true);
        updateVisualization(state);
      }
    }
    
    // Determine which items were included in the optimal solution
    const includedItems: number[] = [];
    let i = n;
    let w = capacity;
    
    while (i > 0 && w > 0) {
      if (state.table[i][w] !== state.table[i - 1][w]) {
        // This item is included
        includedItems.unshift(i - 1);
        w -= items[i - 1].weight;
      }
      i--;
    }
    
    // Finalize visualization
    const itemsList = includedItems.map(idx => `Item ${idx + 1} (weight=${items[idx].weight}, value=${items[idx].value})`).join(", ");
    
    state = finalizeDPState(
      state,
      `Maximum value: ${state.table[n][capacity]}. Items included: ${itemsList || "none"}`
    );
    updateVisualization(state);
    
    return {
      maxValue: state.table[n][capacity],
      includedItems
    };
  };
  
  // Build a recursive tree for the knapsack problem (simplified for visualization)
  const buildKnapsackTree = async (
    items: Item[], 
    capacity: number, 
    itemIdx: number, 
    node: any, 
    depth: number
  ) => {
    if (depth <= 0 || itemIdx <= 0 || capacity <= 0) return;
    
    // Create children representing the two choices: include or exclude current item
    const item = items[itemIdx - 1];
    
    // Case 1: Exclude the current item
    const excludeNode = {
      id: `knapsack-${itemIdx-1}-${capacity}`,
      label: `Knapsack(items[0..${itemIdx-2}], ${capacity})`,
      children: [],
      isProcessed: false
    };
    node.children.push(excludeNode);
    
    // Recursive call for exclude case
    await buildKnapsackTree(items, capacity, itemIdx - 1, excludeNode, depth - 1);
    
    // Case 2: Include the current item (only if it fits)
    if (item.weight <= capacity) {
      const includeNode = {
        id: `knapsack-${itemIdx-1}-${capacity-item.weight}`,
        label: `Knapsack(items[0..${itemIdx-2}], ${capacity-item.weight})`,
        children: [],
        isProcessed: false
      };
      node.children.push(includeNode);
      
      // Recursive call for include case
      await buildKnapsackTree(items, capacity - item.weight, itemIdx - 1, includeNode, depth - 1);
    }
    
    // Update the tree visualization
    setTreeData({...treeData});
  };
  
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
    
    const updatedTree = {...treeData};
    updateNode(updatedTree);
    setTreeData(updatedTree);
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
          algorithm: 'knapsack'
        }
      };
      onVisualizationChange(enhancedState);
    }
  };
  
  const handleAddItem = () => {
    if (newItemWeight > 0 && newItemValue > 0) {
      setItems([...items, { weight: newItemWeight, value: newItemValue }]);
      setNewItemWeight(1);
      setNewItemValue(50);
    }
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  const handleCalculate = async () => {
    setIsRunning(true);
    await calculateKnapsack(items, capacity);
    setIsRunning(false);
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        0/1 Knapsack Problem
      </Typography>
      <Typography variant="body2" paragraph>
        Given a set of items, each with a weight and a value, determine which items to include in a knapsack 
        to maximize the value while not exceeding the capacity.
      </Typography>
      
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Knapsack Capacity</Typography>
        <Slider
          value={capacity}
          onChange={(_, value) => setCapacity(value as number)}
          min={1}
          max={20}
          step={1}
          marks
          valueLabelDisplay="auto"
          disabled={isRunning}
        />
        
        <Typography variant="subtitle2">Items</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {items.map((item, index) => (
            <Chip
              key={index}
              label={`Item ${index + 1}: W${item.weight}, V${item.value}`}
              onDelete={() => handleRemoveItem(index)}
              disabled={isRunning}
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="Weight"
            type="number"
            value={newItemWeight}
            onChange={(e) => setNewItemWeight(Math.max(1, parseInt(e.target.value)))}
            inputProps={{ min: 1, step: 1 }}
            size="small"
            sx={{ width: 100 }}
            disabled={isRunning}
          />
          <TextField
            label="Value"
            type="number"
            value={newItemValue}
            onChange={(e) => setNewItemValue(Math.max(1, parseInt(e.target.value)))}
            inputProps={{ min: 1, step: 1 }}
            size="small"
            sx={{ width: 100 }}
            disabled={isRunning}
          />
          <Button 
            variant="outlined" 
            onClick={handleAddItem}
            disabled={isRunning}
          >
            Add Item
          </Button>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={handleCalculate}
          disabled={isRunning || items.length === 0}
        >
          {isRunning ? 'Running...' : 'Visualize'}
        </Button>
      </Stack>
      
      {visualizationState && visualizationState.steps.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Step: {visualizationState.currentStep} of {visualizationState.steps.length}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {visualizationState.steps[visualizationState.currentStep - 1] || 'Initializing...'}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// A function to solve Knapsack without animation for code explanation
export const knapsackDP = (items: { weight: number, value: number }[], capacity: number): number => {
  const n = items.length;
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const currentItem = items[i - 1];
      
      if (currentItem.weight <= w) {
        dp[i][w] = Math.max(
          currentItem.value + dp[i - 1][w - currentItem.weight],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
};

export default KnapsackAlgorithm;
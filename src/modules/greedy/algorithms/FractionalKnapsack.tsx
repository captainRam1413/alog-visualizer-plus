import React from 'react';
import { Typography, Box } from '@mui/material';
import { KnapsackItem, AlgorithmStep } from '../types';

/**
 * Implements the Fractional Knapsack greedy algorithm
 * @param items Array of items with value and weight
 * @param capacity The knapsack capacity
 * @returns Array of steps showing the progression of the algorithm
 */
export const runFractionalKnapsack = (items: KnapsackItem[], capacity: number): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  // Step 1: Calculate value per unit weight for each item
  const itemsWithRatio = items.map(item => ({
    ...item,
    ratio: item.value / item.weight,
    fraction: 0
  }));
  
  steps.push({
    description: "Calculate value-to-weight ratio for each item.",
    knapsackState: [...itemsWithRatio],
    highlightedCode: ["items.map(item => ({ ...item, ratio: item.value / item.weight }))"]
  });
  
  // Step 2: Sort items by value per unit weight in non-increasing order
  const sortedItems = [...itemsWithRatio].sort((a, b) => b.ratio - a.ratio);
  
  steps.push({
    description: "Sort items by value-to-weight ratio in non-increasing order.",
    knapsackState: [...sortedItems],
    highlightedCode: ["items.sort((a, b) => b.ratio - a.ratio)"]
  });
  
  // Step 3: Fill the knapsack
  let remainingCapacity = capacity;
  let totalValue = 0;
  const result = [...sortedItems];
  
  for (let i = 0; i < sortedItems.length; i++) {
    if (remainingCapacity <= 0) break;
    
    const currentItem = sortedItems[i];
    
    if (currentItem.weight <= remainingCapacity) {
      // Take the whole item
      result[i] = {
        ...currentItem,
        fraction: 1,
        selected: true
      };
      
      totalValue += currentItem.value;
      remainingCapacity -= currentItem.weight;
      
      steps.push({
        description: `Take the entire item ${currentItem.id} (value: ${currentItem.value}, weight: ${currentItem.weight}). Remaining capacity: ${remainingCapacity}. Total value: ${totalValue}.`,
        knapsackState: [...result],
        highlightedCode: ["if (item.weight <= remainingCapacity)", "  // Take whole item", "  result.push({ ...item, fraction: 1 })", "  remainingCapacity -= item.weight"]
      });
    } else {
      // Take a fraction of the item
      const fraction = remainingCapacity / currentItem.weight;
      result[i] = {
        ...currentItem,
        fraction,
        selected: true
      };
      
      totalValue += currentItem.value * fraction;
      remainingCapacity = 0;
      
      steps.push({
        description: `Take fraction ${fraction.toFixed(2)} of item ${currentItem.id} (value: ${(currentItem.value * fraction).toFixed(2)}, weight: ${remainingCapacity}). Remaining capacity: 0. Total value: ${totalValue.toFixed(2)}.`,
        knapsackState: [...result],
        highlightedCode: ["else", "  // Take fractional part", "  const fraction = remainingCapacity / item.weight", "  result.push({ ...item, fraction })", "  remainingCapacity = 0"]
      });
    }
  }
  
  steps.push({
    description: `Fractional knapsack completed with maximum value: ${totalValue.toFixed(2)}.`,
    knapsackState: [...result],
    highlightedCode: ["return result"]
  });
  
  return steps;
};

export const FractionalKnapsackDescription = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Fractional Knapsack</Typography>
    <Typography variant="body1" paragraph>
      The Fractional Knapsack problem is a variation of the knapsack problem where we can take fractions of items, 
      unlike the 0-1 knapsack where we can either take an item completely or not at all.
    </Typography>
    <Typography variant="subtitle1" gutterBottom>How it works:</Typography>
    <Typography component="ol" sx={{ pl: 2 }}>
      <li>Calculate value-to-weight ratio for each item</li>
      <li>Sort items by this ratio in non-increasing order</li>
      <li>Take items with highest value-to-weight ratio first:
        <Typography component="ol" sx={{ pl: 2 }} type="a">
          <li>If the item fits completely, take all of it</li>
          <li>If only a fraction fits, take that fraction</li>
        </Typography>
      </li>
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Time Complexity:</Typography>
    <Typography variant="body1">
      O(n log n) due to the sorting step, where n is the number of items.
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Applications:</Typography>
    <Typography variant="body1">
      Resource allocation problems where items are divisible, such as filling a container with liquids or other divisible resources.
    </Typography>
  </Box>
);

export default { runFractionalKnapsack, FractionalKnapsackDescription };
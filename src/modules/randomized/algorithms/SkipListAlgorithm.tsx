import { SkipListState, VisualizationState, SkipListNode } from '../types';
import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

// Maximum level for the Skip List (0-indexed)
const MAX_LEVEL = 4;
// Probability factor for level promotion (standard is 0.5 or 1/2)
const P = 0.5;

// Function to determine a random level for a new node
function randomLevel(stats: VisualizationState['stats']): number {
  let level = 0;
  stats.randomCalls++;
  
  // Each level has P (50%) chance of promotion
  while (Math.random() < P && level < MAX_LEVEL - 1) {
    level++;
    stats.randomCalls++;
  }
  return level;
}

// Run the Skip List algorithm and generate visualization steps
export function runSkipList(): VisualizationState {
  const startTime = performance.now();
  
  // Create initial Skip List with values
  const initialValues = [3, 6, 7, 9, 12, 19, 25];
  const steps: VisualizationState['steps'] = [];
  const stats = {
    comparisons: 0,
    swaps: 0,
    randomCalls: 0,
    timeElapsed: 0
  };
  
  // Initialize Skip List data structure with sentinel nodes
  let skipList: SkipListState = {
    levels: Array.from({ length: MAX_LEVEL }, () => []),
    operation: 'none'
  };
  
  // Add header/sentinel nodes to each level
  for (let i = 0; i < MAX_LEVEL; i++) {
    // Header node (negative infinity)
    skipList.levels[i].push({
      value: -Infinity,
      position: { x: 0, y: i },
      isHeader: true
    });
    
    // Tail node (positive infinity) - optional in real implementation but helps visualization
    skipList.levels[i].push({
      value: Infinity,
      position: { x: 1, y: i },
      isHeader: true
    });
  }
  
  // Add initial step
  steps.push({
    description: "Starting with an empty Skip List with sentinel nodes at each level",
    dataState: structuredClone(skipList)
  });
  
  // Insert initial values
  for (const value of initialValues) {
    insertWithSteps(skipList, value, steps, stats);
  }
  
  // Show complete Skip List
  steps.push({
    description: "Skip List initialized with sorted values. The Skip List allows O(log n) expected time search operations.",
    dataState: structuredClone(skipList)
  });
  
  // Search demonstrations
  const searchValues = [7, 19, 15];
  for (const value of searchValues) {
    searchWithSteps(skipList, value, steps, stats);
  }
  
  // Delete demonstration
  deleteWithSteps(skipList, 9, steps, stats);
  deleteWithSteps(skipList, 25, steps, stats);
  
  // Insert a few more values to demonstrate
  insertWithSteps(skipList, 15, steps, stats);
  insertWithSteps(skipList, 22, steps, stats);
  
  // Final state
  steps.push({
    description: "Skip List operations complete. The Skip List data structure maintains elements in sorted order with O(log n) expected time operations.",
    dataState: structuredClone(skipList)
  });
  
  // Calculate time taken
  stats.timeElapsed = performance.now() - startTime;
  
  return {
    steps,
    stats
  };
}

// Find the node positions before insertion or deletion point
function findUpdateNodes(
  skipList: SkipListState,
  value: number,
  steps: VisualizationState['steps'],
  stats: VisualizationState['stats'],
  description: string
): { update: SkipListNode[], updateIndices: number[] } {
  // Array to store the update nodes (the nodes that might need their forward pointers changed)
  const update: SkipListNode[] = Array(MAX_LEVEL).fill(null);
  const updateIndices: number[] = Array(MAX_LEVEL).fill(0);
  
  // Start from the highest level
  let currentLevel = MAX_LEVEL - 1;
  // Start from header node
  let currentNodeIdx = 0;
  
  // Keep track of the search path for visualization
  skipList.searchPath = [];
  
  // For each level from top to bottom
  for (let i = MAX_LEVEL - 1; i >= 0; i--) {
    const level = skipList.levels[i];
    let j = currentNodeIdx;
    
    // Move horizontally as far as possible until we find a node with value >= target
    while (j < level.length - 1 && level[j+1].value < value) {
      j++;
      stats.comparisons++;
      
      // Visualize the current search path
      const tempSkipList = structuredClone(skipList);
      tempSkipList.currentNode = level[j];
      tempSkipList.searchPath?.push(level[j]);
      
      steps.push({
        description: `${description} - Level ${i}: Moving right to node with value ${level[j].value === -Infinity ? "HEAD" : level[j].value === Infinity ? "TAIL" : level[j].value}`,
        dataState: tempSkipList
      });
    }
    
    // Save this node and its index as the update node for this level
    update[i] = level[j];
    updateIndices[i] = j;
    
    // Continue search from the same horizontal position on the level below
    currentNodeIdx = j;
  }
  
  return { update, updateIndices };
}

// Function to insert a value into the Skip List with visualization steps
function insertWithSteps(
  skipList: SkipListState,
  value: number,
  steps: VisualizationState['steps'],
  stats: VisualizationState['stats']
): void {
  skipList.operation = 'insert';
  skipList.target = value;
  
  // Display the value to be inserted
  steps.push({
    description: `Inserting value ${value} into the Skip List`,
    dataState: structuredClone(skipList)
  });
  
  // Find the positions in the skip list where we need to insert the new node
  const { update, updateIndices } = findUpdateNodes(
    skipList, value, steps, stats, "Finding insertion position"
  );
  
  // Check if value already exists
  const bottomLevelIdx = updateIndices[0] + 1;
  if (
    bottomLevelIdx < skipList.levels[0].length && 
    skipList.levels[0][bottomLevelIdx].value === value
  ) {
    steps.push({
      description: `Value ${value} already exists in the Skip List, not inserting duplicate`,
      dataState: structuredClone(skipList)
    });
    
    // Reset search state
    skipList.searchPath = undefined;
    skipList.currentNode = undefined;
    skipList.operation = 'none';
    return;
  }
  
  // Determine the random level for the new node
  const newNodeLevel = randomLevel(stats);
  
  steps.push({
    description: `Randomly determined level ${newNodeLevel} for new node with value ${value} (using p=${P})`,
    dataState: structuredClone(skipList)
  });
  
  // Calculate horizontal position for correct visual ordering
  // In a real Skip List, this would be pointer manipulation
  const horizontalPos = updateIndices[0] + 1;
  
  // Create the new node for each level it will appear in
  for (let i = 0; i <= newNodeLevel; i++) {
    // Create new node for this level
    const newNode: SkipListNode = {
      value,
      position: { x: horizontalPos, y: i },
      isHighlighted: true
    };
    
    // Insert node at the correct position
    skipList.levels[i].splice(updateIndices[i] + 1, 0, newNode);
    
    // Adjust x positions for all nodes to the right
    for (let j = updateIndices[i] + 2; j < skipList.levels[i].length; j++) {
      skipList.levels[i][j].position.x += 1;
    }
    
    steps.push({
      description: `Inserted value ${value} at level ${i}`,
      dataState: structuredClone(skipList)
    });
  }
  
  // Clear the search path and reset operation
  skipList.searchPath = undefined;
  skipList.currentNode = undefined;
  skipList.operation = 'none';
  
  // Remove highlights after a brief pause
  const finalSkipList = structuredClone(skipList);
  for (let i = 0; i < MAX_LEVEL; i++) {
    for (let j = 0; j < finalSkipList.levels[i].length; j++) {
      finalSkipList.levels[i][j].isHighlighted = false;
    }
  }
  
  steps.push({
    description: `Completed insertion of value ${value} into the Skip List`,
    dataState: finalSkipList
  });
}

// Function to search for a value in the Skip List with visualization steps
function searchWithSteps(
  skipList: SkipListState,
  value: number,
  steps: VisualizationState['steps'],
  stats: VisualizationState['stats']
): void {
  skipList.operation = 'search';
  skipList.target = value;
  
  // Display the value to be searched
  steps.push({
    description: `Searching for value ${value} in the Skip List`,
    dataState: structuredClone(skipList)
  });
  
  // Find the node - similar to how we would in insertion
  const { update, updateIndices } = findUpdateNodes(
    skipList, value, steps, stats, "Searching"
  );
  
  // Check if the value was found at the bottom level
  const bottomLevel = skipList.levels[0];
  const nextIdx = updateIndices[0] + 1;
  
  const found = nextIdx < bottomLevel.length && bottomLevel[nextIdx].value === value;
  
  if (found) {
    // Highlight the found value at all levels
    const highlightedSkipList = structuredClone(skipList);
    for (let i = 0; i < MAX_LEVEL; i++) {
      for (let j = 0; j < highlightedSkipList.levels[i].length; j++) {
        if (highlightedSkipList.levels[i][j].value === value) {
          highlightedSkipList.levels[i][j].isHighlighted = true;
        }
      }
    }
    
    steps.push({
      description: `Found value ${value} in the Skip List!`,
      dataState: highlightedSkipList
    });
  } else {
    steps.push({
      description: `Value ${value} not found in the Skip List`,
      dataState: structuredClone(skipList)
    });
  }
  
  // Clear the search path and reset operation
  skipList.searchPath = undefined;
  skipList.currentNode = undefined;
  skipList.operation = 'none';
  
  // Remove highlights
  const finalSkipList = structuredClone(skipList);
  for (let i = 0; i < MAX_LEVEL; i++) {
    for (let j = 0; j < finalSkipList.levels[i].length; j++) {
      finalSkipList.levels[i][j].isHighlighted = false;
    }
  }
  
  steps.push({
    description: `Search for ${value} complete`,
    dataState: finalSkipList
  });
}

// Function to delete a value from the Skip List with visualization steps
function deleteWithSteps(
  skipList: SkipListState,
  value: number,
  steps: VisualizationState['steps'],
  stats: VisualizationState['stats']
): void {
  skipList.operation = 'delete';
  skipList.target = value;
  
  // Display the value to be deleted
  steps.push({
    description: `Deleting value ${value} from the Skip List`,
    dataState: structuredClone(skipList)
  });
  
  // Find the nodes before the node to delete
  const { update, updateIndices } = findUpdateNodes(
    skipList, value, steps, stats, "Finding deletion position"
  );
  
  // Check if the value exists at the bottom level
  const bottomLevel = skipList.levels[0];
  const nextIdx = updateIndices[0] + 1;
  
  if (nextIdx < bottomLevel.length && bottomLevel[nextIdx].value === value) {
    // Highlight the node to be deleted at all levels where it exists
    const highlightedSkipList = structuredClone(skipList);
    const toDelete = [];
    
    // Find and mark all occurrences of the value for deletion
    for (let i = 0; i < MAX_LEVEL; i++) {
      const level = skipList.levels[i];
      const idx = updateIndices[i] + 1;
      
      if (idx < level.length && level[idx].value === value) {
        // Mark for visual highlighting
        highlightedSkipList.levels[i][idx].isHighlighted = true;
        toDelete.push({ level: i, index: idx });
      }
    }
    
    steps.push({
      description: `Found value ${value} to delete from the Skip List`,
      dataState: highlightedSkipList
    });
    
    // Process deletions from highest level to lowest to demonstrate the process
    toDelete.sort((a, b) => b.level - a.level);
    
    for (const del of toDelete) {
      // Remove the node
      skipList.levels[del.level].splice(del.index, 1);
      
      // Adjust positions for all nodes to the right
      for (let j = del.index; j < skipList.levels[del.level].length; j++) {
        skipList.levels[del.level][j].position.x -= 1;
      }
      
      steps.push({
        description: `Removed ${value} from level ${del.level}`,
        dataState: structuredClone(skipList)
      });
    }
    
    steps.push({
      description: `Successfully deleted value ${value} from all levels`,
      dataState: structuredClone(skipList)
    });
  } else {
    // Value not found
    steps.push({
      description: `Value ${value} not found in the Skip List, cannot delete`,
      dataState: structuredClone(skipList)
    });
  }
  
  // Clear the search path and reset operation
  skipList.searchPath = undefined;
  skipList.currentNode = undefined;
  skipList.operation = 'none';
  
  // Remove highlights
  const finalSkipList = structuredClone(skipList);
  for (let i = 0; i < MAX_LEVEL; i++) {
    for (let j = 0; j < finalSkipList.levels[i].length; j++) {
      finalSkipList.levels[i][j].isHighlighted = false;
    }
  }
  
  steps.push({
    description: `Deletion operation for ${value} complete`,
    dataState: finalSkipList
  });
}

// Component to show Skip List algorithm description
export function SkipListDescription() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Skip List
      </Typography>
      
      <Typography variant="body1" paragraph>
        Skip List is a probabilistic data structure that allows O(log n) search complexity 
        as well as O(log n) insertion and deletion complexities within an ordered sequence. 
        It uses multiple layers of linked lists to achieve this performance, with each higher 
        layer acting as an "express lane" for the lists below.
      </Typography>
      
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Key Operations:
        </Typography>
        <Typography component="ol" sx={{ pl: 2 }}>
          <li>Search: Start from the top level and move right until finding a larger element, then drop down a level</li>
          <li>Insert: Search for the position, then randomly determine how many levels the new node should span</li>
          <li>Delete: Search for the node and remove it from all levels it appears in</li>
        </Typography>
      </Paper>
      
      <Typography variant="subtitle1" gutterBottom>
        Time Complexity:
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Search: O(log n) expected time
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Insert: O(log n) expected time
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Delete: O(log n) expected time
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Probabilistic Properties:
      </Typography>
      <Typography variant="body2" paragraph>
        The height of each node is determined randomly:
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Level 0: All nodes (probability 1)
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Level 1: ~1/2 of the nodes (probability 1/2)
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Level 2: ~1/4 of the nodes (probability 1/4)
      </Typography>
      <Typography variant="body2" paragraph sx={{ pl: 2 }}>
        • Level i: ~1/2ⁱ of the nodes (probability 1/2ⁱ)
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Key Features:
      </Typography>
      <Typography variant="body2" paragraph>
        Skip Lists use randomization to maintain a balanced structure without requiring the 
        complex rebalancing operations of trees like AVL or Red-Black trees. The random height 
        assigned to nodes ensures that, with high probability, the structure remains balanced 
        enough to provide logarithmic time operations.
      </Typography>
    </Box>
  );
}

// Export the source code for visualization
export const SkipListCode = `
class Node {
  constructor(value, level) {
    this.value = value;
    // Array to hold references to node of different levels
    this.forward = new Array(level + 1).fill(null);
  }
}

class SkipList {
  constructor(maxLevel = 16, p = 0.5) {
    this.maxLevel = maxLevel;
    this.p = p; // Probability of level promotion
    this.level = 0;
    // Create header node with max level
    this.header = new Node(-Infinity, maxLevel);
  }
  
  // Generate a random level for node
  randomLevel() {
    let lvl = 0;
    while (Math.random() < this.p && lvl < this.maxLevel) {
      lvl++;
    }
    return lvl;
  }
  
  // Search for element in skip list
  search(value) {
    let current = this.header;
    
    // Start from highest level and move down
    for (let i = this.level; i >= 0; i--) {
      // Move forward while current value is less
      while (current.forward[i] !== null && 
             current.forward[i].value < value) {
        current = current.forward[i];
      }
    }
    
    // Reached level 0, move to right if it exists
    current = current.forward[0];
    
    // Return node if it contains value
    if (current !== null && current.value === value) {
      return current;
    }
    return null;
  }
  
  // Insert element in skip list
  insert(value) {
    let update = Array(this.maxLevel + 1).fill(this.header);
    let current = this.header;
    
    // Find position to insert at each level
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && 
             current.forward[i].value < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }
    
    // Check if value already exists
    current = current.forward[0];
    if (current !== null && current.value === value) {
      return false; // Value exists
    }
    
    // Get level for new node
    const randomLevel = this.randomLevel();
    
    // Update the list level if needed
    if (randomLevel > this.level) {
      for (let i = this.level + 1; i <= randomLevel; i++) {
        update[i] = this.header;
      }
      this.level = randomLevel;
    }
    
    // Create new node
    const newNode = new Node(value, randomLevel);
    
    // Insert node at all levels
    for (let i = 0; i <= randomLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }
    
    return true;
  }
  
  // Delete element from skip list
  delete(value) {
    let update = Array(this.maxLevel + 1).fill(null);
    let current = this.header;
    
    // Find positions to update for each level
    for (let i = this.level; i >= 0; i--) {
      while (current.forward[i] !== null && 
             current.forward[i].value < value) {
        current = current.forward[i];
      }
      update[i] = current;
    }
    
    // If element is present, delete from all levels
    current = current.forward[0];
    if (current !== null && current.value === value) {
      for (let i = 0; i <= this.level; i++) {
        if (update[i].forward[i] !== current) break;
        update[i].forward[i] = current.forward[i];
      }
      
      // Update list level if needed
      while (this.level > 0 && 
             this.header.forward[this.level] === null) {
        this.level--;
      }
      return true;
    }
    return false;
  }
  
  // Print the skip list structure for debugging
  printList() {
    console.log("\\nSkip List:");
    for (let i = 0; i <= this.level; i++) {
      let result = "Level " + i + ": ";
      let node = this.header.forward[i];
      
      while (node !== null) {
        result += node.value + " → ";
        node = node.forward[i];
      }
      
      result += "null";
      console.log(result);
    }
  }
}

// Example usage
const skipList = new SkipList();
skipList.insert(3);
skipList.insert(6);
skipList.insert(7);
skipList.insert(9);
skipList.insert(12);
skipList.insert(19);
skipList.insert(25);
skipList.printList();

console.log("\\nSearching for 19:", skipList.search(19) ? "Found" : "Not found");
console.log("Searching for 18:", skipList.search(18) ? "Found" : "Not found");

skipList.delete(9);
console.log("\\nAfter deleting 9:");
skipList.printList();

skipList.delete(25);
console.log("\\nAfter deleting 25:");
skipList.printList();

skipList.insert(15);
skipList.insert(22);
console.log("\\nAfter adding 15 and 22:");
skipList.printList();
`;
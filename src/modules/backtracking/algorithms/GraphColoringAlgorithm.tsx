import React from 'react';
import { GraphColoringState, AlgorithmStep, VisualizationState } from '../types';

/**
 * Solves the Graph Coloring problem using backtracking
 * @param nodes Number of nodes in the graph
 * @param edges Array of edges connecting nodes
 * @param maxColors Maximum number of colors to use
 * @returns Visualization state with steps showing the progression of the algorithm
 */
export const runGraphColoringAlgorithm = (
  nodes: number,
  edges: { from: number; to: number }[],
  maxColors: number
): VisualizationState => {
  // Initialize state for visualization
  const steps: AlgorithmStep[] = [];
  const stats = {
    statesExplored: 0,
    backtracks: 0,
    solutionsFound: 0,
    timeElapsed: 0
  };

  // Initialize graph state with all nodes uncolored (color = 0)
  const initialState: GraphColoringState = {
    nodes,
    edges,
    colors: Array(nodes).fill(0),
    maxColors
  };

  // Keep track of all solutions found
  const allSolutions: GraphColoringState[] = [];

  // Add initial step
  steps.push({
    description: `Starting to solve Graph Coloring for ${nodes} nodes with maximum ${maxColors} colors.`,
    graphState: { ...initialState },
    highlightedCode: [
      "function graphColoring(graph, m) {",
      "  const colors = Array(graph.length).fill(0);",
      "  if (solveColoringUtil(graph, m, colors, 0)) {",
      "    return colors;",
      "  }",
      "  return null;",
      "}"
    ]
  });

  // Start timer
  const startTime = performance.now();

  // Solve the Graph Coloring problem with backtracking
  solveGraphColoring(nodes, edges, maxColors, steps, stats, allSolutions);

  // End timer and update stats
  const endTime = performance.now();
  stats.timeElapsed = (endTime - startTime) / 1000; // Convert to seconds

  // Add final step with all solutions
  if (stats.solutionsFound > 0) {
    steps.push({
      description: `Graph Coloring solution complete! Found ${stats.solutionsFound} solution(s).`,
      graphState: { ...allSolutions[0] }, // Show first solution as final state
      highlightedCode: [
        "// All solutions found or all possibilities exhausted"
      ]
    });
  } else {
    steps.push({
      description: `Graph Coloring solution complete! No valid coloring found with ${maxColors} colors.`,
      graphState: { ...initialState },
      highlightedCode: [
        "// No solutions found"
      ]
    });
  }

  return {
    steps,
    currentStep: 0,
    isComplete: true,
    totalSteps: steps.length,
    stats
  };
};

/**
 * Check if a color can be assigned to a node
 */
const isSafe = (
  node: number, 
  color: number, 
  colors: number[], 
  edges: { from: number; to: number }[]
): boolean => {
  // Check all adjacent nodes
  for (const edge of edges) {
    if ((edge.from === node && colors[edge.to] === color) || 
        (edge.to === node && colors[edge.from] === color)) {
      return false;
    }
  }
  return true;
};

/**
 * Recursive utility function to solve graph coloring
 */
const graphColoringUtil = (
  node: number,
  nodes: number,
  colors: number[],
  edges: { from: number; to: number }[],
  maxColors: number,
  steps: AlgorithmStep[],
  stats: any,
  allSolutions: GraphColoringState[]
): boolean => {
  // Base case: if all nodes are colored
  if (node === nodes) {
    stats.solutionsFound++;
    
    // Create a deep copy for this solution
    const solution: GraphColoringState = {
      nodes,
      edges,
      colors: [...colors],
      maxColors
    };
    
    // Add solution to the collection
    allSolutions.push(solution);
    
    steps.push({
      description: `Solution #${stats.solutionsFound} found! All nodes colored without conflicts.`,
      graphState: { ...solution },
      highlightedCode: [
        "// Base case: all nodes are colored",
        "if (node === nodes) {",
        "  // Solution found!",
        "  return true;",
        "}"
      ]
    });
    
    // Return false to continue searching for more solutions
    return false;
  }
  
  // Try different colors for the current node
  for (let color = 1; color <= maxColors; color++) {
    stats.statesExplored++;
    
    // Record attempt to color node
    steps.push({
      description: `Trying to color node ${node} with color ${color}.`,
      graphState: {
        nodes,
        edges,
        colors: [...colors],
        currentNode: node,
        maxColors
      },
      highlightedCode: [
        `// Try coloring node ${node} with color ${color}`,
        "if (isSafe(node, color, colors, graph)) {",
        "  colors[node] = color;",
        "  // Recurse for next node",
        "}"
      ]
    });
    
    // Check if color can be assigned
    if (isSafe(node, color, colors, edges)) {
      // Assign the color
      colors[node] = color;
      
      // Record successful coloring
      steps.push({
        description: `Node ${node} colored with color ${color}. Moving to the next node.`,
        graphState: {
          nodes,
          edges,
          colors: [...colors],
          currentNode: node,
          maxColors
        },
        highlightedCode: [
          `colors[${node}] = ${color}; // Assign color`,
          `graphColoringUtil(${node + 1}, nodes, colors, edges, maxColors); // Recur for next node`
        ]
      });
      
      // Recur to color the next node
      if (graphColoringUtil(node + 1, nodes, colors, edges, maxColors, steps, stats, allSolutions)) {
        return true;
      }
      
      // If coloring doesn't lead to a solution, backtrack
      colors[node] = 0;
      stats.backtracks++;
      
      // Record backtracking
      steps.push({
        description: `Backtracking from node ${node} with color ${color} as it doesn't lead to a solution.`,
        graphState: {
          nodes,
          edges,
          colors: [...colors],
          currentNode: node,
          maxColors
        },
        highlightedCode: [
          "// Backtrack if coloring doesn't lead to a solution",
          "colors[node] = 0; // Remove color"
        ]
      });
    } else {
      // Record invalid coloring
      steps.push({
        description: `Cannot color node ${node} with color ${color} due to conflicts with adjacent nodes.`,
        graphState: {
          nodes,
          edges,
          colors: [...colors],
          currentNode: node,
          maxColors
        },
        highlightedCode: [
          "// Position is not safe for this color",
          "// Conflicts with adjacent nodes"
        ]
      });
    }
  }
  
  // If no color can be assigned to this node
  return false;
};

/**
 * Solve the Graph Coloring problem
 */
const solveGraphColoring = (
  nodes: number,
  edges: { from: number; to: number }[],
  maxColors: number,
  steps: AlgorithmStep[],
  stats: any,
  allSolutions: GraphColoringState[]
): void => {
  // Create a colors array initialized with 0 (no color)
  const colors = Array(nodes).fill(0);
  
  // Start coloring from node 0
  graphColoringUtil(0, nodes, colors, edges, maxColors, steps, stats, allSolutions);
};

// Component describing the Graph Coloring algorithm
export const GraphColoringDescription = () => (
  <React.Fragment>
    <h3>Graph Coloring Problem</h3>
    <p>
      The Graph Coloring problem involves assigning colors to each vertex of a graph such that 
      no adjacent vertices have the same color. The goal is to use the minimum number of colors possible.
    </p>
    <h4>How the backtracking algorithm works:</h4>
    <ol>
      <li>Start with all vertices uncolored</li>
      <li>Color vertices one by one</li>
      <li>For each vertex, try all possible colors</li>
      <li>Check if the color assignment is valid (doesn't conflict with adjacent vertices)</li>
      <li>If valid, move to the next vertex</li>
      <li>If invalid, try the next color</li>
      <li>If no valid color is available, backtrack to the previous vertex and try a different color</li>
      <li>If all vertices are colored, a solution is found</li>
    </ol>
    <h4>Time and Space Complexity:</h4>
    <p>
      <strong>Time complexity:</strong> O(m<sup>n</sup>), where n is the number of vertices and m is the number of colors.
      <br />
      <strong>Space complexity:</strong> O(n) for the color array and recursion stack.
    </p>
    <h4>Applications:</h4>
    <p>
      Graph coloring has many practical applications including:
      <ul>
        <li>Scheduling problems</li>
        <li>Register allocation in compilers</li>
        <li>Frequency assignment in wireless networks</li>
        <li>Map coloring</li>
        <li>Sudoku solving</li>
      </ul>
    </p>
  </React.Fragment>
);

export default { runGraphColoringAlgorithm, GraphColoringDescription };
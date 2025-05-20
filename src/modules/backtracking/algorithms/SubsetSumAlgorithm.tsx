import React from 'react';
import { SubsetSumState, AlgorithmStep, VisualizationState } from '../types';

/**
 * Solves the Subset Sum problem using backtracking
 * @param set Array of integers to find subsets from
 * @param targetSum Target sum to achieve
 * @returns Visualization state with steps showing the progression of the algorithm
 */
export const runSubsetSumAlgorithm = (
  set: number[],
  targetSum: number
): VisualizationState => {
  // Initialize state for visualization
  const steps: AlgorithmStep[] = [];
  const stats = {
    statesExplored: 0,
    backtracks: 0,
    solutionsFound: 0,
    timeElapsed: 0
  };

  // Initialize subset sum state
  const initialState: SubsetSumState = {
    set,
    target: targetSum,
    currentSubset: [],
    currentSum: 0,
    currentIndex: 0,
    includedIndices: []
  };

  // Keep track of all solutions found
  const allSolutions: SubsetSumState[] = [];

  // Add initial step
  steps.push({
    description: `Starting to find subsets of [${set.join(', ')}] that sum to ${targetSum}.`,
    subsetState: { ...initialState },
    highlightedCode: [
      "function findSubsets(set, targetSum) {",
      "  const solutions = [];",
      "  const currentSubset = [];",
      "  subsetSumUtil(set, targetSum, 0, 0, currentSubset, solutions);",
      "  return solutions;",
      "}"
    ]
  });

  // Start timer
  const startTime = performance.now();

  // Solve the Subset Sum problem with backtracking
  solveSubsetSum(set, targetSum, steps, stats, allSolutions);

  // End timer and update stats
  const endTime = performance.now();
  stats.timeElapsed = (endTime - startTime) / 1000; // Convert to seconds

  // Add final step with all solutions
  if (stats.solutionsFound > 0) {
    steps.push({
      description: `Subset Sum algorithm complete! Found ${stats.solutionsFound} subset(s) that sum to ${targetSum}.`,
      subsetState: { ...allSolutions[0] }, // Show first solution as final state
      highlightedCode: [
        "// All solutions found or all possibilities exhausted"
      ]
    });
  } else {
    steps.push({
      description: `Subset Sum algorithm complete! No subset found that sums to ${targetSum}.`,
      subsetState: { ...initialState },
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
 * Recursive utility function to solve subset sum
 */
const subsetSumUtil = (
  set: number[],
  targetSum: number,
  currentIndex: number,
  currentSum: number,
  currentSubset: number[],
  steps: AlgorithmStep[],
  stats: any,
  allSolutions: SubsetSumState[]
): void => {
  stats.statesExplored++;
  
  // If the current sum equals the target, we found a solution
  if (currentSum === targetSum) {
    stats.solutionsFound++;
    
    // Create a deep copy for this solution
    const solution: SubsetSumState = {
      set,
      target: targetSum,
      currentSubset: [...currentSubset],
      currentSum,
      currentIndex,
      includedIndices: currentSubset.map((_, i) => i)
    };
    
    // Add solution to the collection
    allSolutions.push(solution);
    
    steps.push({
      description: `Solution #${stats.solutionsFound} found! Subset [${currentSubset.join(', ')}] sums to ${targetSum}.`,
      subsetState: { ...solution },
      highlightedCode: [
        "// Solution found",
        "if (currentSum === targetSum) {",
        "  solutions.push([...currentSubset]);",
        "  return;",
        "}"
      ]
    });
    
    return; // Continue searching for more solutions
  }
  
  // If current sum exceeds target or all elements are considered
  if (currentSum > targetSum || currentIndex >= set.length) {
    if (currentSum > targetSum) {
      steps.push({
        description: `Current sum ${currentSum} exceeds target ${targetSum}. Backtracking.`,
        subsetState: {
          set,
          target: targetSum,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex,
          includedIndices: currentSubset.map((_, i) => i)
        },
        highlightedCode: [
          "// Current sum exceeds target, backtrack",
          "if (currentSum > targetSum) {",
          "  return;",
          "}"
        ]
      });
    } else if (currentIndex >= set.length) {
      steps.push({
        description: `Reached end of set without finding the target sum. Backtracking.`,
        subsetState: {
          set,
          target: targetSum,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex,
          includedIndices: currentSubset.map((_, i) => i)
        },
        highlightedCode: [
          "// All elements considered without finding target sum",
          "if (currentIndex >= set.length) {",
          "  return;",
          "}"
        ]
      });
    }
    
    stats.backtracks++;
    return;
  }
  
  // Decision 1: Include current element
  currentSubset.push(set[currentIndex]);
  
  steps.push({
    description: `Including element ${set[currentIndex]} at index ${currentIndex}. Current subset: [${currentSubset.join(', ')}], sum: ${currentSum + set[currentIndex]}.`,
    subsetState: {
      set,
      target: targetSum,
      currentSubset: [...currentSubset],
      currentSum: currentSum + set[currentIndex],
      currentIndex,
      includedIndices: currentSubset.map((_, i) => i)
    },
    highlightedCode: [
      `// Include element ${set[currentIndex]}`,
      "currentSubset.push(set[currentIndex]);",
      `subsetSumUtil(set, targetSum, ${currentIndex + 1}, ${currentSum + set[currentIndex]}, currentSubset, solutions);`
    ]
  });
  
  // Recur with included element
  subsetSumUtil(
    set,
    targetSum,
    currentIndex + 1,
    currentSum + set[currentIndex],
    currentSubset,
    steps,
    stats,
    allSolutions
  );
  
  // Decision 2: Exclude current element (backtrack)
  currentSubset.pop();
  
  steps.push({
    description: `Excluding element ${set[currentIndex]} at index ${currentIndex}. Current subset: [${currentSubset.join(', ')}], sum: ${currentSum}.`,
    subsetState: {
      set,
      target: targetSum,
      currentSubset: [...currentSubset],
      currentSum,
      currentIndex,
      includedIndices: currentSubset.map((_, i) => i)
    },
    highlightedCode: [
      `// Exclude element ${set[currentIndex]}`,
      "currentSubset.pop();",
      `subsetSumUtil(set, targetSum, ${currentIndex + 1}, ${currentSum}, currentSubset, solutions);`
    ]
  });
  
  // Recur without included element
  subsetSumUtil(
    set,
    targetSum,
    currentIndex + 1,
    currentSum,
    currentSubset,
    steps,
    stats,
    allSolutions
  );
};

/**
 * Solve the Subset Sum problem
 */
const solveSubsetSum = (
  set: number[],
  targetSum: number,
  steps: AlgorithmStep[],
  stats: any,
  allSolutions: SubsetSumState[]
): void => {
  // Start with an empty subset
  const currentSubset: number[] = [];
  
  // Start from the first element (index 0) with sum 0
  subsetSumUtil(set, targetSum, 0, 0, currentSubset, steps, stats, allSolutions);
};

// Component describing the Subset Sum algorithm
export const SubsetSumDescription = () => (
  <React.Fragment>
    <h3>Subset Sum Problem</h3>
    <p>
      The Subset Sum problem asks if there exists a subset of a given set of integers that sums up exactly to a
      given target sum. It is a classic example of a problem that can be solved using backtracking.
    </p>
    <h4>How the backtracking algorithm works:</h4>
    <ol>
      <li>Start with an empty subset</li>
      <li>For each element in the set, make two choices:
        <ul>
          <li>Include the current element in the subset</li>
          <li>Exclude the current element from the subset</li>
        </ul>
      </li>
      <li>If the current sum equals the target sum, a solution is found</li>
      <li>If the current sum exceeds the target sum, backtrack</li>
      <li>If all elements are processed without finding a solution in the current branch, backtrack</li>
    </ol>
    <h4>Time and Space Complexity:</h4>
    <p>
      <strong>Time complexity:</strong> O(2<sup>n</sup>), where n is the number of elements in the set. This is because for each element, we have two choices: include it or exclude it.
      <br />
      <strong>Space complexity:</strong> O(n) for the recursion stack and to store the current subset.
    </p>
    <h4>Applications:</h4>
    <p>
      The Subset Sum problem has applications in:
      <ul>
        <li>Resource allocation in operations research</li>
        <li>Cryptography and computer security</li>
        <li>Financial portfolio optimization</li>
        <li>Equal partitioning problems</li>
        <li>Knapsack-type problems</li>
      </ul>
    </p>
    <p>
      It's worth noting that Subset Sum is NP-complete, which means that no polynomial-time algorithm is known to solve it optimally for all inputs.
    </p>
  </React.Fragment>
);

export default { runSubsetSumAlgorithm, SubsetSumDescription };
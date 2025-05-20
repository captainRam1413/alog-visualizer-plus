import React from 'react';
import { BoardState, AlgorithmStep, VisualizationState } from '../types';

/**
 * Solves the N-Queens problem using backtracking
 * @param boardSize The size of the chess board (N)
 * @returns Array of steps showing the progression of the algorithm
 */
export const runNQueensAlgorithm = (boardSize: number): VisualizationState => {
  // Initialize state for visualization
  const steps: AlgorithmStep[] = [];
  const stats = {
    statesExplored: 0,
    backtracks: 0,
    solutionsFound: 0,
    timeElapsed: 0
  };

  // Initialize empty N x N board
  const initialBoard: BoardState = {
    size: boardSize,
    squares: Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  };

  // Keep track of all solutions found
  const allSolutions: BoardState[] = [];

  // Add initial step
  steps.push({
    description: `Starting to solve N-Queens for a ${boardSize}×${boardSize} board.`,
    boardState: { ...initialBoard },
    highlightedCode: [
      "function solveNQueens(n) {",
      "  const board = Array(n).fill().map(() => Array(n).fill(0));",
      "  solveNQueensUtil(board, 0, n);",
      "}"
    ]
  });

  // Start timer
  const startTime = performance.now();

  // Solve the N-Queens problem with backtracking
  solveNQueens(boardSize, steps, stats, allSolutions);

  // End timer and update stats
  const endTime = performance.now();
  stats.timeElapsed = (endTime - startTime) / 1000; // Convert to seconds

  // Add final step with all solutions if more than one solution was found
  if (stats.solutionsFound > 0) {
    steps.push({
      description: `N-Queens solution complete! Found ${stats.solutionsFound} solution(s).`,
      boardState: steps[steps.length - 1].boardState,
      allSolutions: allSolutions, // Include all solutions in the final step
      highlightedCode: [
        "// Solution found or all possibilities exhausted"
      ]
    });
  } else {
    steps.push({
      description: `N-Queens solution complete! No solutions found.`,
      boardState: initialBoard,
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
 * Helper function to solve the N-Queens problem
 * Records steps for visualization
 */
const solveNQueens = (n: number, steps: AlgorithmStep[], stats: any, allSolutions: BoardState[]): void => {
  // Create a board with n x n size
  const board: (number | null)[][] = Array(n).fill(null).map(() => Array(n).fill(null));
  
  // Solve recursively starting from the first row (0)
  solveNQueensUtil(board, 0, n, steps, stats, allSolutions);
};

/**
 * Recursive utility function to solve N-Queens by placing queens row by row
 */
const solveNQueensUtil = (
  board: (number | null)[][],
  row: number,
  n: number,
  steps: AlgorithmStep[],
  stats: any,
  allSolutions: BoardState[]
): boolean => {
  // Base case: If all queens are placed (we've reached beyond the last row)
  if (row >= n) {
    stats.solutionsFound++;
    
    // Create a deep copy of the board for this solution
    const solutionBoard: BoardState = {
      size: n,
      squares: board.map(row => [...row]), // Deep copy the board
      solutionNumber: stats.solutionsFound // Add solution number for display
    };
    
    // Add solution to the collection
    allSolutions.push(solutionBoard);
    
    steps.push({
      description: `Solution #${stats.solutionsFound} found! Placed ${n} queens without conflicts.`,
      boardState: solutionBoard,
      allSolutions: [...allSolutions], // Send all solutions found so far
      highlightedCode: [
        "// Base case: all queens are placed",
        "if (row >= n) {",
        "  // Solution found!",
        "  return true;",
        "}"
      ]
    });
    
    // Return false to continue searching for more solutions
    return false;
  }

  // Try placing queen in each column of the current row
  for (let col = 0; col < n; col++) {
    stats.statesExplored++;
    
    // Record attempt to place queen
    steps.push({
      description: `Trying to place a queen at row ${row}, column ${col}.`,
      boardState: {
        size: n,
        squares: board.map(r => [...r]),
        currentRow: row,
        currentCol: col
      },
      highlightedCode: [
        `// Try placing queen at position (${row}, ${col})`,
        "if (isSafe(board, row, col, n)) {",
        "  board[row][col] = 1;",
        "  // Recurse to place queen in next row",
        "}"
      ]
    });

    // Check if queen can be placed at board[row][col]
    if (isSafe(board, row, col, n)) {
      // Place the queen
      board[row][col] = 1;
      
      // Record successful placement
      steps.push({
        description: `Queen placed at row ${row}, column ${col}. Moving to the next row.`,
        boardState: {
          size: n,
          squares: board.map(r => [...r]),
          currentRow: row,
          currentCol: col,
          isValid: true
        },
        highlightedCode: [
          "board[row][col] = 1; // Place queen",
          `solveNQueensUtil(board, ${row + 1}, n, steps, stats, allSolutions); // Recur for next row`
        ]
      });
      
      // Recur to place queen in the next row
      if (solveNQueensUtil(board, row + 1, n, steps, stats, allSolutions)) {
        return true;
      }
      
      // If placing queen in board[row][col] doesn't lead to a solution, backtrack
      board[row][col] = null;
      stats.backtracks++;
      
      // Record backtracking
      steps.push({
        description: `Backtracking from row ${row}, column ${col} as it doesn't lead to a solution.`,
        boardState: {
          size: n,
          squares: board.map(r => [...r]),
          currentRow: row,
          currentCol: col,
          isValid: false
        },
        highlightedCode: [
          "// Backtrack if placing queen doesn't lead to a solution",
          "board[row][col] = 0; // Remove queen"
        ]
      });
    } else {
      // Record invalid placement
      steps.push({
        description: `Cannot place a queen at row ${row}, column ${col} due to conflicts.`,
        boardState: {
          size: n,
          squares: board.map(r => [...r]),
          currentRow: row,
          currentCol: col,
          isValid: false
        },
        highlightedCode: [
          "// Position is not safe for queen placement",
          "// Conflicts with existing queens"
        ]
      });
    }
  }
  
  // If queen can't be placed in any column of this row
  return false;
};

/**
 * Checks if it's safe to place a queen at board[row][col]
 */
const isSafe = (
  board: (number | null)[][],
  row: number,
  col: number,
  n: number
): boolean => {
  // Check this column on upper rows
  for (let i = 0; i < row; i++) {
    if (board[i][col] === 1) {
      return false;
    }
  }
  
  // Check upper-left diagonal
  for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === 1) {
      return false;
    }
  }
  
  // Check upper-right diagonal
  for (let i = row, j = col; i >= 0 && j < n; i--, j++) {
    if (board[i][j] === 1) {
      return false;
    }
  }
  
  // Position is safe
  return true;
};

// Component describing the N-Queens algorithm
export const NQueensDescription = () => (
  <React.Fragment>
    <h3>N-Queens Problem</h3>
    <p>
      The N-Queens problem asks how to place N queens on an N×N chessboard so that no two queens 
      threaten each other. A solution requires that no two queens share the same row, column, or diagonal.
    </p>
    <h4>How the backtracking algorithm works:</h4>
    <ol>
      <li>Start with an empty board</li>
      <li>Place queens one by one in each row</li>
      <li>For each queen, try all columns in the current row</li>
      <li>Check if the placement is valid (doesn't conflict with previously placed queens)</li>
      <li>If valid, move to the next row</li>
      <li>If invalid, try the next column in the same row</li>
      <li>If no valid position in a row, backtrack to the previous row and try a different configuration</li>
      <li>If all N queens are placed, a solution is found</li>
    </ol>
    <h4>Time and Space Complexity:</h4>
    <p>
      <strong>Time complexity:</strong> O(N!), as there are N! possible arrangements of queens.
      <br />
      <strong>Space complexity:</strong> O(N²) for the chessboard.
    </p>
    <h4>Applications:</h4>
    <p>
      While the N-Queens problem itself is primarily academic, the backtracking technique it demonstrates 
      is widely used in constraint satisfaction problems, scheduling, and puzzle solving.
    </p>
  </React.Fragment>
);

export default { runNQueensAlgorithm, NQueensDescription };
import React from 'react';
import { Box, Paper, Typography, styled, useTheme } from '@mui/material';

// Define props interface for the styled component
interface CodeLineProps {
  highlighted?: string;
}

const CodeLine = styled(Box)<CodeLineProps>(({ theme, highlighted }) => ({
  fontFamily: '"Roboto Mono", monospace',
  padding: '2px 8px',
  backgroundColor: highlighted === 'true' ? '#ffffff' : 'transparent',
  color: highlighted === 'true' ? '#000000' : '#000000',
  borderRadius: '2px',
  transition: 'all 0.2s ease-in-out',
  whiteSpace: 'pre-wrap'
}));

interface CodeVisualizerProps {
  highlightedLines?: string[];
  algorithm?: string;
}

const CodeVisualizer: React.FC<CodeVisualizerProps> = ({ 
  highlightedLines = [], 
  algorithm = 'nqueens' 
}) => {
  const theme = useTheme();
  
  // Common backtracking pseudocode structure
  const backtrackingTemplate = [
    "function backtrackingSearch(state) {",
    "  if (isGoalState(state)) return state;  // Solution found",
    "  if (isInvalidState(state)) return null;  // Pruning branch",
    "",
    "  for each possibleAction in getActions(state) {",
    "    newState = applyAction(state, possibleAction);",
    "    result = backtrackingSearch(newState);  // Recursive exploration",
    "    if (result != null) return result;",
    "  }",
    "",
    "  return null;  // No solution found in this branch",
    "}"
  ];

  // Algorithm-specific pseudocode
  const algorithmCode: { [key: string]: string[] } = {
    nqueens: [
      "function solveNQueens(n) {",
      "  // Create an empty n×n board",
      "  const board = Array(n).fill().map(() => Array(n).fill(0));",
      "  solveNQueensUtil(board, 0, n);",
      "}",
      "",
      "function solveNQueensUtil(board, row, n) {",
      "  // Base case: If all queens are placed",
      "  if (row >= n) return true;",
      "",
      "  // Try placing queen in each column of this row",
      "  for (let col = 0; col < n; col++) {",
      "    // Check if safe to place queen at board[row][col]",
      "    if (isSafe(board, row, col, n)) {",
      "      // Place the queen",
      "      board[row][col] = 1;",
      "",
      "      // Recursively place rest of the queens",
      "      if (solveNQueensUtil(board, row + 1, n)) {",
      "        return true;",
      "      }",
      "",
      "      // If placing queen doesn't lead to a solution",
      "      // backtrack and remove the queen",
      "      board[row][col] = 0;  // BACKTRACK",
      "    }",
      "  }",
      "",
      "  // If queen can't be placed in any column in this row",
      "  return false;",
      "}",
      "",
      "function isSafe(board, row, col, n) {",
      "  // Check this column on upper rows",
      "  for (let i = 0; i < row; i++) {",
      "    if (board[i][col] === 1) return false;",
      "  }",
      "",
      "  // Check upper-left diagonal",
      "  for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {",
      "    if (board[i][j] === 1) return false;",
      "  }",
      "",
      "  // Check upper-right diagonal",
      "  for (let i = row, j = col; i >= 0 && j < n; i--, j++) {",
      "    if (board[i][j] === 1) return false;",
      "  }",
      "",
      "  // Position is safe",
      "  return true;",
      "}"
    ],
    sudoku: [
      "function solveSudoku(board) {",
      "  // Find an empty cell",
      "  const emptyCell = findEmptyCell(board);",
      "  if (!emptyCell) return true;  // No empty cells left - solved!",
      "",
      "  const [row, col] = emptyCell;",
      "",
      "  // Try digits 1-9",
      "  for (let num = 1; num <= 9; num++) {",
      "    if (isValid(board, row, col, num)) {",
      "      // Place the digit",
      "      board[row][col] = num;",
      "",
      "      // Recursively try to solve rest of the board",
      "      if (solveSudoku(board)) {",
      "        return true;",
      "      }",
      "",
      "      // If we get here, this digit didn't work out",
      "      // Backtrack and try a different digit",
      "      board[row][col] = 0;  // BACKTRACK",
      "    }",
      "  }",
      "",
      "  // No solution found with current configuration",
      "  return false;",
      "}"
    ],
    // More algorithms can be added here
  };

  // Determine which code to display
  const codeToDisplay = algorithmCode[algorithm] || backtrackingTemplate;

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Algorithm Implementation
      </Typography>
      
      <Box sx={{ 
        p: 1, 
        bgcolor: '#f8f9fa',
        color: '#000000',
        border: '1px solid #dee2e6',
        borderRadius: 1, 
        fontFamily: '"Roboto Mono", monospace', 
        fontSize: '0.875rem'
      }}>
        {codeToDisplay.map((line, idx) => (
          <CodeLine 
            key={idx} 
            highlighted={highlightedLines.includes(line) ? 'true' : 'false'}
          >
            {line}
          </CodeLine>
        ))}
      </Box>
    </Paper>
  );
};

export default CodeVisualizer;
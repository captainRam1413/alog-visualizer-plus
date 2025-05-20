import React from 'react';
import { Box, Typography, Grid, Paper, styled, Divider } from '@mui/material';
import { BoardState } from '../types';

// Define props for styled component to fix TypeScript errors
interface ChessSquareProps {
  isqueenplaced?: string;
  isselected?: string;
  isvalid?: string;
  isdarkcolor?: string;
}

// Styled components for the chess board
const ChessSquare = styled(Paper)<ChessSquareProps>(({ theme, isqueenplaced, isselected, isvalid, isdarkcolor }) => ({
  aspectRatio: '1 / 1',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  cursor: 'default',
  backgroundColor: 
    isselected === 'true' 
      ? (isvalid === 'true' ? '#a5d6a7' : '#ef9a9a') // Green for valid, red for invalid
      : (isdarkcolor === 'true' ? '#b0bec5' : '#eceff1'), // Dark and light squares
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
    zIndex: 2
  }
}));

// Styled component for queen icon
const QueenIcon = styled('div')({
  fontSize: '2rem', // Increased font size
  fontWeight: 'bold',
  color: '#000', // Solid black color
  textShadow: '0px 0px 2px #fff', // White outline to make it visible on dark backgrounds
  lineHeight: 1
});

interface ChessboardProps {
  boardState: BoardState;
  allSolutions?: BoardState[];
}

const ChessboardVisualizer: React.FC<ChessboardProps> = ({ boardState, allSolutions }) => {
  const { size, squares, currentRow, currentCol, isValid } = boardState;
  
  // Helper to determine if a square is dark or light
  const isDarkSquare = (row: number, col: number): boolean => {
    return (row + col) % 2 === 1;
  };

  // Helper to render a queen on the board
  const renderSquareContent = (value: number | null): React.ReactNode => {
    if (value === 1) {
      return <QueenIcon>♕</QueenIcon>; // Queen character wrapped in styled component
    }
    return null;
  };

  // Render a single chessboard
  const renderChessboard = (board: BoardState, index?: number, isSolution: boolean = false) => (
    <Box sx={{ mt: 2, mb: 2 }}>
      {index !== undefined && (
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
          Solution #{index + 1}
        </Typography>
      )}
      
      <Box sx={{ 
        maxWidth: 600, 
        mx: 'auto',
        border: isSolution ? '2px solid #4caf50' : 'none', // Green border for solutions
        borderRadius: '4px',
        p: isSolution ? 1 : 0
      }}>
        <Grid container spacing={0.5} sx={{ display: 'grid', gridTemplateColumns: `repeat(${board.size}, 1fr)` }}>
          {board.squares.map((row, rowIndex) => 
            row.map((square, colIndex) => (
              <Grid key={`square-${index !== undefined ? `sol${index}-` : ''}${rowIndex}-${colIndex}`}>
                <ChessSquare 
                  elevation={1}
                  isqueenplaced={square === 1 ? 'true' : 'false'}
                  isselected={(board.currentRow === rowIndex && board.currentCol === colIndex && !isSolution) ? 'true' : 'false'}
                  isvalid={board.isValid === undefined ? 'true' : board.isValid ? 'true' : 'false'}
                  isdarkcolor={isDarkSquare(rowIndex, colIndex) ? 'true' : 'false'}
                >
                  {renderSquareContent(square)}
                </ChessSquare>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        N-Queens Visualization ({size}×{size} Board)
      </Typography>
      
      {/* Render current board state */}
      {renderChessboard(boardState)}
      
      {/* Render previously found solutions if available */}
      {allSolutions && allSolutions.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Solutions Found ({allSolutions.length})
            <Typography variant="body2" color="text.secondary" component="div" sx={{ fontStyle: 'italic', mt: 1 }}>
              (Solutions will persist until you reset the visualization)
            </Typography>
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: allSolutions.length > 1 ? 'repeat(2, 1fr)' : '1fr' }, 
            gap: 2 
          }}>
            {allSolutions.map((solution, index) => (
              <Box key={`solution-${index}`}>
                {renderChessboard(solution, index, true)}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Status display */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {currentRow !== undefined && currentCol !== undefined 
            ? `Evaluating position: Row ${currentRow + 1}, Column ${currentCol + 1}`
            : 'Viewing the board state'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default ChessboardVisualizer;
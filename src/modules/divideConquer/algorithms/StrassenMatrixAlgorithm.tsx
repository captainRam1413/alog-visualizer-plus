import { AlgorithmInfo, AlgorithmVisualizer, ArrayElement, RecursiveCall, VisualizationState } from '../types';
import { createArrayElements, calculateTotalSteps, resetArrayElementStatus } from '../utils';

export const strassenMatrixInfo: AlgorithmInfo = {
  name: "Strassen's Matrix Multiplication",
  description: 'Multiplies two matrices more efficiently than the standard O(n³) algorithm by using a recursive divide-and-conquer approach.',
  timeComplexity: {
    best: 'O(n^2.8074)',
    average: 'O(n^2.8074)',
    worst: 'O(n^2.8074)'
  },
  spaceComplexity: 'O(n²)',
  stable: true,
  additionalNotes: 'More efficient for large matrices, but has higher constant factors than standard matrix multiplication',
  pseudocode: `function strassen(A, B):
    n = size of matrix A
    
    if n == 1:
        return A[0][0] * B[0][0]
    
    // Divide matrices into quadrants
    a11, a12, a21, a22 = divide(A)
    b11, b12, b21, b22 = divide(B)
    
    // 7 recursive multiplications instead of 8
    p1 = strassen(a11 + a22, b11 + b22)
    p2 = strassen(a21 + a22, b11)
    p3 = strassen(a11, b12 - b22)
    p4 = strassen(a22, b21 - b11)
    p5 = strassen(a11 + a12, b22)
    p6 = strassen(a21 - a11, b11 + b12)
    p7 = strassen(a12 - a22, b21 + b22)
    
    // Compute result quadrants
    c11 = p1 + p4 - p5 + p7
    c12 = p3 + p5
    c21 = p2 + p4
    c22 = p1 - p2 + p3 + p6
    
    return combine(c11, c12, c21, c22)`
};

const strassenMatrixVisualizer: AlgorithmVisualizer = {
  generateVisualization: (array: number[]): [VisualizationState, RecursiveCall[]] => {
    // For Strassen's, we need square matrices with dimensions that are powers of 2
    const size = Math.max(2, Math.pow(2, Math.floor(Math.log2(Math.sqrt(array.length)))));
    
    // Create two matrices from the input array
    const matrixA: number[][] = [];
    const matrixB: number[][] = [];
    
    // Fill matrix A with input array values
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        row.push(index < array.length ? array[index] : Math.floor(Math.random() * 10));
      }
      matrixA.push(row);
    }
    
    // Create matrix B with random values
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.floor(Math.random() * 10));
      }
      matrixB.push(row);
    }
    
    // Flatten matrices for visualization
    const flattenedMatrixA = matrixA.flat();
    const flattenedMatrixB = matrixB.flat();
    
    // For visualization, we'll show both matrices side by side
    const combinedArray = [...flattenedMatrixA, ...flattenedMatrixB];
    
    // Create array elements
    const initialElements: ArrayElement[] = combinedArray.map((value, index) => ({ 
      value, 
      status: index < flattenedMatrixA.length ? 'left' : 'right'
    }));
    
    // Create initial visualization state
    const initialState: VisualizationState = {
      array: initialElements,
      currentStep: 0,
      totalSteps: calculateTotalSteps('strassenMatrix', size),
      description: `Strassen's Matrix Multiplication for ${size}×${size} matrices`,
      activeIndices: [],
      callStack: []
    };
    
    // Generate recursion tree for Strassen's algorithm
    const recursionTree: RecursiveCall[] = [{
      id: 'root',
      parentId: null,
      array: combinedArray,
      level: 0,
      start: 0,
      end: combinedArray.length - 1,
      status: 'active'
    }];
    
    // For 2x2 matrices, add the 7 recursive multiplications
    const operations = [
      "P1 = (A11 + A22)(B11 + B22)",
      "P2 = (A21 + A22)B11",
      "P3 = A11(B12 - B22)",
      "P4 = A22(B21 - B11)",
      "P5 = (A11 + A12)B22",
      "P6 = (A21 - A11)(B11 + B12)",
      "P7 = (A12 - A22)(B21 + B22)"
    ];
    
    // Add recursive multiplications to the tree
    operations.forEach((operation, index) => {
      recursionTree.push({
        id: `operation-${index + 1}`,
        parentId: 'root',
        array: [],  // Will be populated during visualization
        level: 1,
        start: 0,
        end: 0,
        status: 'waiting'
      });
    });
    
    // Add node for result combination
    recursionTree.push({
      id: 'result',
      parentId: 'root',
      array: [],
      level: 2,
      start: 0,
      end: 0,
      status: 'waiting'
    });
    
    return [initialState, recursionTree];
  },
  
  updateVisualizationState: (state: VisualizationState, stage: number): void => {
    const currentStage = stage - 1;
    
    // Reset all statuses first
    resetArrayElementStatus(state.array);
    
    // Determine matrix size (assume square matrix)
    const totalElements = state.array.length;
    const matrixSize = Math.sqrt(totalElements / 2); // Divide by 2 because we have 2 matrices
    const elementsPerMatrix = Math.floor(totalElements / 2);
    
    if (currentStage === 0) {
      // Initial display - highlight the two matrices
      for (let i = 0; i < elementsPerMatrix; i++) {
        state.array[i].status = 'left'; // Matrix A
      }
      
      for (let i = elementsPerMatrix; i < totalElements; i++) {
        state.array[i].status = 'right'; // Matrix B
      }
      
      state.description = `Matrix A (${matrixSize}×${matrixSize}) and Matrix B (${matrixSize}×${matrixSize})`;
    } else if (currentStage === 1) {
      // Divide matrices into quadrants
      const quadrantSize = Math.floor(matrixSize / 2);
      
      // Helper to get element index in flattened matrix
      const getIndex = (matrix: 'A' | 'B', row: number, col: number) => {
        const baseOffset = matrix === 'B' ? elementsPerMatrix : 0;
        return baseOffset + row * matrixSize + col;
      };
      
      // Highlight quadrants with different statuses
      // A11
      for (let i = 0; i < quadrantSize; i++) {
        for (let j = 0; j < quadrantSize; j++) {
          state.array[getIndex('A', i, j)].status = 'left';
        }
      }
      
      // A12
      for (let i = 0; i < quadrantSize; i++) {
        for (let j = quadrantSize; j < matrixSize; j++) {
          state.array[getIndex('A', i, j)].status = 'right';
        }
      }
      
      // A21
      for (let i = quadrantSize; i < matrixSize; i++) {
        for (let j = 0; j < quadrantSize; j++) {
          state.array[getIndex('A', i, j)].status = 'comparing';
        }
      }
      
      // A22
      for (let i = quadrantSize; i < matrixSize; i++) {
        for (let j = quadrantSize; j < matrixSize; j++) {
          state.array[getIndex('A', i, j)].status = 'pivot';
        }
      }
      
      // Just mark all of B as normal for now to avoid too many colors
      for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
          state.array[getIndex('B', i, j)].status = 'normal';
        }
      }
      
      state.description = `Divide each matrix into 4 quadrants: A11, A12, A21, A22 and B11, B12, B21, B22`;
    } else if (currentStage >= 2 && currentStage <= 8) {
      // Seven recursive multiplications (P1 through P7)
      const stepIndex = currentStage - 2;
      const operations = [
        "P1 = (A11 + A22)(B11 + B22)",
        "P2 = (A21 + A22)B11",
        "P3 = A11(B12 - B22)",
        "P4 = A22(B21 - B11)",
        "P5 = (A11 + A12)B22",
        "P6 = (A21 - A11)(B11 + B12)",
        "P7 = (A12 - A22)(B21 + B22)"
      ];
      
      const quadrantSize = Math.floor(matrixSize / 2);
      const getIndex = (matrix: 'A' | 'B', row: number, col: number) => {
        const baseOffset = matrix === 'B' ? elementsPerMatrix : 0;
        return baseOffset + row * matrixSize + col;
      };
      
      // Highlight different parts of the matrices based on the current operation
      if (stepIndex === 0) { // P1
        // Highlight A11 + A22
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B11 + B22
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      } else if (stepIndex === 1) { // P2
        // Highlight A21 + A22
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B11
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      } else if (stepIndex === 2) { // P3
        // Highlight A11
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B12 - B22
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'right';
          }
        }
      } else if (stepIndex === 3) { // P4
        // Highlight A22
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B21 - B11
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('B', i, j)].status = 'right';
          }
        }
      } else if (stepIndex === 4) { // P5
        // Highlight A11 + A12
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        
        // Highlight B22
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      } else if (stepIndex === 5) { // P6
        // Highlight A21 - A11
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < quadrantSize; j++) {
            state.array[getIndex('A', i, j)].status = 'right';
          }
        }
        
        // Highlight B11 + B12
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = 0; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      } else if (stepIndex === 6) { // P7
        // Highlight A12 - A22
        for (let i = 0; i < quadrantSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'comparing';
          }
        }
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = quadrantSize; j < matrixSize; j++) {
            state.array[getIndex('A', i, j)].status = 'right';
          }
        }
        
        // Highlight B21 + B22
        for (let i = quadrantSize; i < matrixSize; i++) {
          for (let j = 0; j < matrixSize; j++) {
            state.array[getIndex('B', i, j)].status = 'pivot';
          }
        }
      }
      
      state.description = `Computing ${operations[stepIndex]}`;
    } else if (currentStage === 9) {
      // Combining the results
      state.description = `Combining results to form the final matrix:
      C11 = P1 + P4 - P5 + P7
      C12 = P3 + P5
      C21 = P2 + P4
      C22 = P1 - P2 + P3 + P6`;
      
      // Highlight the result matrix area
      for (let i = 0; i < state.array.length; i++) {
        state.array[i].status = 'sorted';
      }
    }
  },
  
  generateSteps: (array: number[]): string[] => {
    return [
      `Initial matrices A and B`,
      `Dividing matrices into quadrants`,
      `Computing P1 = (A11 + A22)(B11 + B22)`,
      `Computing P2 = (A21 + A22)B11`,
      `Computing P3 = A11(B12 - B22)`,
      `Computing P4 = A22(B21 - B11)`,
      `Computing P5 = (A11 + A12)B22`,
      `Computing P6 = (A21 - A11)(B11 + B12)`,
      `Computing P7 = (A12 - A22)(B21 + B22)`,
      `Combining results to form the result matrix`
    ];
  }
};

// Helper functions for actual Strassen's algorithm implementation (for reference)
export function strassenMultiply(A: number[][], B: number[][]): number[][] {
  // Get matrix size (assuming square matrices)
  const n = A.length;
  
  // Base case: 1x1 matrices
  if (n === 1) {
    return [[A[0][0] * B[0][0]]];
  }
  
  // Split matrices into quadrants
  const mid = Math.floor(n / 2);
  const A11 = submatrix(A, 0, 0, mid);
  const A12 = submatrix(A, 0, mid, mid);
  const A21 = submatrix(A, mid, 0, mid);
  const A22 = submatrix(A, mid, mid, mid);
  
  const B11 = submatrix(B, 0, 0, mid);
  const B12 = submatrix(B, 0, mid, mid);
  const B21 = submatrix(B, mid, 0, mid);
  const B22 = submatrix(B, mid, mid, mid);
  
  // Calculate 7 products recursively (Strassen's algorithm)
  const P1 = strassenMultiply(addMatrices(A11, A22), addMatrices(B11, B22));
  const P2 = strassenMultiply(addMatrices(A21, A22), B11);
  const P3 = strassenMultiply(A11, subtractMatrices(B12, B22));
  const P4 = strassenMultiply(A22, subtractMatrices(B21, B11));
  const P5 = strassenMultiply(addMatrices(A11, A12), B22);
  const P6 = strassenMultiply(subtractMatrices(A21, A11), addMatrices(B11, B12));
  const P7 = strassenMultiply(subtractMatrices(A12, A22), addMatrices(B21, B22));
  
  // Calculate the result quadrants
  const C11 = addMatrices(subtractMatrices(addMatrices(P1, P4), P5), P7);
  const C12 = addMatrices(P3, P5);
  const C21 = addMatrices(P2, P4);
  const C22 = addMatrices(subtractMatrices(addMatrices(P1, P3), P2), P6);
  
  // Combine the quadrants into the result
  return combineMatrices(C11, C12, C21, C22);
}

// Helper functions for matrix operations
function submatrix(matrix: number[][], rowStart: number, colStart: number, size: number): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < size; i++) {
    result[i] = [];
    for (let j = 0; j < size; j++) {
      result[i][j] = matrix[rowStart + i][colStart + j];
    }
  }
  return result;
}

function addMatrices(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const result: number[][] = [];
  for (let i = 0; i < n; i++) {
    result[i] = [];
    for (let j = 0; j < n; j++) {
      result[i][j] = A[i][j] + B[i][j];
    }
  }
  return result;
}

function subtractMatrices(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const result: number[][] = [];
  for (let i = 0; i < n; i++) {
    result[i] = [];
    for (let j = 0; j < n; j++) {
      result[i][j] = A[i][j] - B[i][j];
    }
  }
  return result;
}

function combineMatrices(C11: number[][], C12: number[][], C21: number[][], C22: number[][]): number[][] {
  const n = C11.length;
  const result: number[][] = [];
  for (let i = 0; i < n * 2; i++) {
    result[i] = [];
    for (let j = 0; j < n * 2; j++) {
      if (i < n && j < n) {
        result[i][j] = C11[i][j];
      } else if (i < n && j >= n) {
        result[i][j] = C12[i][j - n];
      } else if (i >= n && j < n) {
        result[i][j] = C21[i - n][j];
      } else {
        result[i][j] = C22[i - n][j - n];
      }
    }
  }
  return result;
}

export default strassenMatrixVisualizer;
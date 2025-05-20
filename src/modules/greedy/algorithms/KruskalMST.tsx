import React from 'react';
import { Typography, Box } from '@mui/material';
import { Edge, Graph, AlgorithmStep, GraphVisualizationData } from '../types';

// Utility function for union-find data structure
class DisjointSet {
  private parent: number[];
  private rank: number[];
  
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }
  
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }
  
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    
    if (rootX === rootY) return;
    
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
  }
  
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }
}

/**
 * Implements Kruskal's algorithm for finding the Minimum Spanning Tree
 * @param graph The graph to find MST on
 * @returns Array of steps showing the progression of the algorithm
 */
export const runKruskalMST = (graph: Graph): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const n = graph.vertices;
  
  // Initialize empty graph visualization data
  const initialGraphData: GraphVisualizationData = {
    nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: `${i}` })),
    edges: graph.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: `${edge.weight}`,
      weight: edge.weight
    })),
    selectedEdges: []
  };
  
  steps.push({
    description: "Sort all edges in non-decreasing order of their weight.",
    graphState: initialGraphData,
    highlightedCode: ["edges.sort((a, b) => a.weight - b.weight)"]
  });
  
  // Sort edges by weight
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
  
  // Initialize disjoint set for union-find operations
  const disjointSet = new DisjointSet(n);
  const mst: Edge[] = [];
  
  for (const edge of sortedEdges) {
    const { from, to, weight } = edge;
    
    // Check if adding this edge creates a cycle
    if (!disjointSet.connected(from, to)) {
      // Add edge to MST
      mst.push(edge);
      disjointSet.union(from, to);
      
      steps.push({
        description: `Add edge (${from}, ${to}) with weight ${weight} to the MST. Union vertices ${from} and ${to}.`,
        graphState: {
          ...initialGraphData,
          selectedEdges: [...mst]
        },
        highlightedCode: ["if (!disjointSet.connected(from, to))", "mst.push(edge)", "disjointSet.union(from, to)"]
      });
      
      // If we've added n-1 edges, we're done
      if (mst.length === n - 1) {
        break;
      }
    } else {
      steps.push({
        description: `Skip edge (${from}, ${to}) with weight ${weight} as it would create a cycle.`,
        graphState: {
          ...initialGraphData,
          selectedEdges: [...mst]
        },
        highlightedCode: ["// Skip this edge as it creates a cycle"]
      });
    }
  }
  
  steps.push({
    description: `Kruskal's algorithm complete! Found MST with total weight: ${mst.reduce((sum, edge) => sum + edge.weight, 0)}.`,
    graphState: {
      ...initialGraphData,
      selectedEdges: [...mst]
    },
    highlightedCode: ["return MST"]
  });
  
  return steps;
};

export const KruskalMSTDescription = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Kruskal's Algorithm (MST)</Typography>
    <Typography variant="body1" paragraph>
      Kruskal's algorithm finds a minimum spanning tree for a connected weighted graph. It follows the greedy approach, 
      always adding the next smallest-weight edge that doesn't create a cycle.
    </Typography>
    <Typography variant="subtitle1" gutterBottom>How it works:</Typography>
    <Typography component="ol" sx={{ pl: 2 }}>
      <li>Sort all edges in non-decreasing order of their weight</li>
      <li>Initialize an empty MST</li>
      <li>For each edge in increasing order of weight:
        <Typography component="ol" sx={{ pl: 2 }} type="a">
          <li>If including this edge doesn't create a cycle in the MST, add it</li>
          <li>Otherwise, discard it</li>
        </Typography>
      </li>
      <li>Continue until MST has (V-1) edges, where V is the number of vertices</li>
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Time Complexity:</Typography>
    <Typography variant="body1">
      O(E log E) or O(E log V), where E is the number of edges and V is the number of vertices.
      The bottleneck is sorting the edges which takes O(E log E) time.
    </Typography>
  </Box>
);

export default { runKruskalMST, KruskalMSTDescription };
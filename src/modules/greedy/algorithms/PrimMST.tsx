import React from 'react';
import { Typography, Box } from '@mui/material';
import { Edge, Graph, AlgorithmStep, GraphVisualizationData } from '../types';

/**
 * Implements Prim's algorithm for finding the Minimum Spanning Tree
 * @param graph The graph to find MST on
 * @returns Array of steps showing the progression of the algorithm
 */
export const runPrimMST = (graph: Graph): AlgorithmStep[] => {
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
    description: "Initialize the MST with an arbitrary vertex (0). Mark it as visited.",
    graphState: {
      ...initialGraphData,
      currentVertex: 0
    },
    highlightedCode: ["let MST = []", "let visited = [0]"]
  });

  const visited = new Array(n).fill(false);
  visited[0] = true;
  const mst: Edge[] = [];
  
  // Track how many vertices we've added to the MST
  let numVisited = 1;
  
  while (numVisited < n) {
    let minWeight = Infinity;
    let minEdge: Edge | null = null;
    let nextVertex = -1;
    
    // Find the minimum weight edge from the current MST to a non-visited vertex
    for (let i = 0; i < n; i++) {
      if (!visited[i]) continue;
      
      for (const edge of graph.edges) {
        if ((edge.from === i && !visited[edge.to]) || 
            (edge.to === i && !visited[edge.from])) {
          
          if (edge.weight < minWeight) {
            minWeight = edge.weight;
            minEdge = edge;
            nextVertex = edge.from === i ? edge.to : edge.from;
          }
        }
      }
    }
    
    if (minEdge) {
      // Add the edge to MST
      mst.push(minEdge);
      visited[nextVertex] = true;
      numVisited++;
      
      steps.push({
        description: `Add edge (${minEdge.from}, ${minEdge.to}) with weight ${minEdge.weight} to the MST. Mark vertex ${nextVertex} as visited.`,
        graphState: {
          ...initialGraphData,
          selectedEdges: [...mst],
          currentVertex: nextVertex
        },
        highlightedCode: ["MST.push(minEdge)", "visited[nextVertex] = true"]
      });
    } else {
      // No edge found, graph might be disconnected
      steps.push({
        description: "No more edges can be added. The graph might be disconnected.",
        graphState: {
          ...initialGraphData,
          selectedEdges: [...mst]
        }
      });
      break;
    }
  }
  
  steps.push({
    description: `Prim's algorithm complete! Found MST with total weight: ${mst.reduce((sum, edge) => sum + edge.weight, 0)}.`,
    graphState: {
      ...initialGraphData,
      selectedEdges: [...mst]
    },
    highlightedCode: ["return MST"]
  });
  
  return steps;
};

export const PrimMSTDescription = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Prim's Algorithm (MST)</Typography>
    <Typography variant="body1" paragraph>
      Prim's algorithm finds a minimum spanning tree for a weighted undirected graph. It starts with 
      a single vertex and grows the minimum spanning tree one edge at a time.
    </Typography>
    <Typography variant="subtitle1" gutterBottom>How it works:</Typography>
    <Typography component="ol" sx={{ pl: 2 }}>
      <li>Initialize an empty MST and a set with an arbitrary starting vertex</li>
      <li>While there are vertices not yet in the MST:
        <Typography component="ol" sx={{ pl: 2 }} type="a">
          <li>Find the minimum weight edge connecting the MST to a vertex not in the MST</li>
          <li>Add this edge to the MST and the new vertex to the set</li>
        </Typography>
      </li>
      <li>Return the MST when all vertices have been included</li>
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Time Complexity:</Typography>
    <Typography variant="body1">
      O(E log V) with a binary heap implementation, where E is the number of edges and V is the number of vertices.
    </Typography>
  </Box>
);

export default { runPrimMST, PrimMSTDescription };
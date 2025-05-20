import React from 'react';
import { Typography, Box } from '@mui/material';
import { Edge, Graph, AlgorithmStep, GraphVisualizationData } from '../types';

/**
 * Implements Dijkstra's algorithm for finding the shortest path
 * @param graph The graph to find shortest paths on
 * @param source The source vertex
 * @returns Array of steps showing the progression of the algorithm
 */
export const runDijkstraAlgorithm = (graph: Graph, source: number): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  const n = graph.vertices;
  
  // Create adjacency list from edges
  const adjList: {[key: number]: {to: number, weight: number}[]} = {};
  for (let i = 0; i < n; i++) {
    adjList[i] = [];
  }
  
  for (const edge of graph.edges) {
    adjList[edge.from].push({ to: edge.to, weight: edge.weight });
    // For undirected graph
    adjList[edge.to].push({ to: edge.from, weight: edge.weight });
  }
  
  // Initialize graph visualization data
  const initialGraphData: GraphVisualizationData = {
    nodes: Array.from({ length: n }, (_, i) => ({ 
      id: i, 
      label: i === source ? `${i} (S)` : `${i}`
    })),
    edges: graph.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: `${edge.weight}`,
      weight: edge.weight
    })),
    selectedEdges: [],
    currentVertex: source
  };
  
  // Initialize distances array
  const distances = new Array(n).fill(Infinity);
  distances[source] = 0;
  
  // Initialize visited vertices
  const visited = new Array(n).fill(false);
  
  // Initialize parent array to reconstruct shortest paths
  const parent = new Array(n).fill(-1);
  
  steps.push({
    description: `Initialize distances: Set distance to source ${source} as 0, all others as infinity.`,
    graphState: { ...initialGraphData },
    highlightedCode: [
      "const distances = new Array(n).fill(Infinity)",
      "distances[source] = 0",
      "const visited = new Array(n).fill(false)"
    ]
  });
  
  // Find shortest paths
  for (let i = 0; i < n; i++) {
    // Find the vertex with minimum distance
    let minDistance = Infinity;
    let minVertex = -1;
    
    for (let v = 0; v < n; v++) {
      if (!visited[v] && distances[v] < minDistance) {
        minDistance = distances[v];
        minVertex = v;
      }
    }
    
    // If no vertex found, might be a disconnected graph
    if (minVertex === -1) {
      steps.push({
        description: "No more reachable vertices found. The graph might be disconnected.",
        graphState: { ...initialGraphData },
        highlightedCode: ["// No more vertices to process"]
      });
      break;
    }
    
    // Mark the vertex as visited
    visited[minVertex] = true;
    
    const shortestPaths: Edge[] = [];
    
    // Reconstruct shortest paths for visualization
    for (let v = 0; v < n; v++) {
      if (parent[v] !== -1) {
        shortestPaths.push({
          from: parent[v],
          to: v,
          weight: distances[v] - distances[parent[v]]
        });
      }
    }
    
    steps.push({
      description: `Visit vertex ${minVertex} with distance ${distances[minVertex]}. Mark it as processed.`,
      graphState: {
        ...initialGraphData,
        currentVertex: minVertex,
        selectedEdges: shortestPaths
      },
      highlightedCode: [
        `// Process vertex ${minVertex}`,
        "visited[minVertex] = true"
      ]
    });
    
    // Update distances of adjacent vertices
    for (const neighbor of adjList[minVertex]) {
      const { to, weight } = neighbor;
      
      if (!visited[to] && distances[minVertex] + weight < distances[to]) {
        // Update distance
        distances[to] = distances[minVertex] + weight;
        parent[to] = minVertex;
        
        steps.push({
          description: `Update distance to vertex ${to} via ${minVertex}: ${distances[to]}.`,
          graphState: {
            ...initialGraphData,
            currentVertex: to,
            selectedEdges: [
              ...shortestPaths,
              { from: minVertex, to, weight }
            ]
          },
          highlightedCode: [
            `// Relax edge from ${minVertex} to ${to}`,
            `if (distances[${minVertex}] + ${weight} < distances[${to}])`,
            `  distances[${to}] = distances[${minVertex}] + ${weight}`,
            `  parent[${to}] = ${minVertex}`
          ]
        });
      }
    }
  }
  
  // Final step to show all shortest paths
  const finalPaths: Edge[] = [];
  
  // Reconstruct all shortest paths
  for (let v = 0; v < n; v++) {
    if (parent[v] !== -1) {
      finalPaths.push({
        from: parent[v],
        to: v,
        weight: distances[v] - distances[parent[v]]
      });
    }
  }
  
  steps.push({
    description: `Dijkstra's algorithm complete! Shortest distances from source ${source} to all vertices: ${distances.map((d, i) => `${i}: ${d === Infinity ? '∞' : d}`).join(', ')}.`,
    graphState: {
      ...initialGraphData,
      selectedEdges: finalPaths
    },
    highlightedCode: ["return { distances, parent }"]
  });
  
  return steps;
};

export const DijkstraAlgorithmDescription = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Dijkstra's Algorithm</Typography>
    <Typography variant="body1" paragraph>
      Dijkstra's algorithm finds the shortest paths from a source vertex to all other vertices in a weighted graph 
      with non-negative edge weights. It follows the greedy approach, always selecting the vertex with the minimum 
      distance that hasn't been processed yet.
    </Typography>
    <Typography variant="subtitle1" gutterBottom>How it works:</Typography>
    <Typography component="ol" sx={{ pl: 2 }}>
      <li>Initialize distances: set source distance to 0, all others to infinity</li>
      <li>Create a set of unvisited vertices</li>
      <li>While the unvisited set is not empty:
        <Typography component="ol" sx={{ pl: 2 }} type="a">
          <li>Select the vertex with the minimum distance (greedy choice)</li>
          <li>Mark it as visited</li>
          <li>Update distances to all adjacent unvisited vertices if a shorter path is found</li>
        </Typography>
      </li>
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Time Complexity:</Typography>
    <Typography variant="body1">
      O((V + E) log V) with a binary heap implementation, where V is the number of vertices and E is the number of edges.
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Applications:</Typography>
    <Typography variant="body1">
      GPS navigation systems, network routing protocols, flight scheduling, and other shortest path problems.
    </Typography>
  </Box>
);

export default { runDijkstraAlgorithm, DijkstraAlgorithmDescription };
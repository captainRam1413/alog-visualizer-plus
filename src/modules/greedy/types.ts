// Common types for greedy algorithms

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface Graph {
  vertices: number;
  edges: Edge[];
}

export interface GraphVisualizationData {
  nodes: {id: number, label: string}[];
  edges: {from: number, to: number, label: string, weight: number}[];
  selectedEdges?: Edge[];
  currentVertex?: number;
}

export interface ActivityItem {
  id: number;
  start: number;
  finish: number;
  selected?: boolean;
}

export interface KnapsackItem {
  id: number;
  value: number;
  weight: number;
  fraction?: number;
  selected?: boolean;
}

export interface HuffmanNode {
  id: string;
  frequency: number;
  char?: string;
  left?: HuffmanNode;
  right?: HuffmanNode;
  code?: string;
}

export type AlgorithmStep = {
  description: string;
  graphState?: GraphVisualizationData;
  activities?: ActivityItem[];
  knapsackState?: KnapsackItem[];
  huffmanTree?: HuffmanNode;
  highlightedCode?: string[];
};

export interface VisualizationProps {
  data: any;
  steps: AlgorithmStep[];
  currentStep: number;
  isRunning: boolean;
}
import React from 'react';
import { Typography, Box } from '@mui/material';
import { HuffmanNode, AlgorithmStep } from '../types';

/**
 * Implementation of Huffman Coding algorithm
 * @param text Input text to encode
 * @returns Array of steps showing the progression of the algorithm
 */
export const runHuffmanCoding = (text: string): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  // Step 1: Calculate frequency of each character
  const frequencies: {[key: string]: number} = {};
  for (const char of text) {
    if (!frequencies[char]) {
      frequencies[char] = 1;
    } else {
      frequencies[char]++;
    }
  }
  
  steps.push({
    description: "Calculate frequency of each character in the input text.",
    highlightedCode: ["const frequencies = {}", "for (const char of text) {", "  frequencies[char] = (frequencies[char] || 0) + 1", "}"]
  });
  
  // Step 2: Create leaf nodes for each character
  const nodes: HuffmanNode[] = Object.entries(frequencies).map(([char, frequency], index) => ({
    id: `node_${index}`,
    char,
    frequency,
  }));
  
  steps.push({
    description: "Create a leaf node for each character with its frequency.",
    huffmanTree: { id: 'root', frequency: 0, char: 'ROOT', left: undefined, right: undefined },
    highlightedCode: ["const nodes = Object.entries(frequencies).map(([char, frequency]) => ({", "  char,", "  frequency", "})"]
  });
  
  // Step 3: Build Huffman tree
  const pq = [...nodes];
  
  while (pq.length > 1) {
    // Sort by frequency (lowest first)
    pq.sort((a, b) => a.frequency - b.frequency);
    
    // Extract two nodes with lowest frequencies
    const left = pq.shift()!;
    const right = pq.shift()!;
    
    // Create a new internal node with these two nodes as children
    const newNode: HuffmanNode = {
      id: `internal_${left.id}_${right.id}`,
      frequency: left.frequency + right.frequency,
      left,
      right
    };
    
    // Add new node to the priority queue
    pq.push(newNode);
    
    steps.push({
      description: `Merge nodes: ${left.char || left.id} (${left.frequency}) and ${right.char || right.id} (${right.frequency}) into a new node with frequency ${newNode.frequency}.`,
      huffmanTree: pq.length === 1 ? pq[0] : undefined,
      highlightedCode: [
        "const left = priorityQueue.dequeue()", 
        "const right = priorityQueue.dequeue()",
        "const newNode = { frequency: left.frequency + right.frequency, left, right }",
        "priorityQueue.enqueue(newNode)"
      ]
    });
  }
  
  // The only node left is the root of Huffman Tree
  const huffmanTree = pq[0];
  
  // Step 4: Assign codes to each character (traverse the tree)
  steps.push({
    description: "Huffman tree construction complete. Now assigning codes to each character.",
    huffmanTree,
    highlightedCode: ["// Huffman tree construction complete", "// Now traverse the tree to assign codes"]
  });
  
  // Generate codes by traversing the tree
  const codes: {[key: string]: string} = {};
  const generateCodes = (node: HuffmanNode | undefined, code: string = '') => {
    if (!node) return;
    
    // If this is a leaf node (character node)
    if (node.char && node.char !== 'ROOT') {
      codes[node.char] = code;
      steps.push({
        description: `Assign code "${code}" to character "${node.char}".`,
        huffmanTree,
        highlightedCode: [`codes['${node.char}'] = '${code}'`]
      });
    }
    
    // Traverse left (add 0)
    generateCodes(node.left, code + '0');
    
    // Traverse right (add 1)
    generateCodes(node.right, code + '1');
  };
  
  generateCodes(huffmanTree);
  
  // Step 5: Show the final encoding
  const encodedText = Array.from(text).map(char => codes[char]).join('');
  
  steps.push({
    description: `Huffman coding complete! Original text length: ${text.length * 8} bits. Encoded length: ${encodedText.length} bits.`,
    huffmanTree,
    highlightedCode: ["return { huffmanTree, codes, encodedText }"]
  });
  
  return steps;
};

export const HuffmanCodingDescription = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Huffman Coding</Typography>
    <Typography variant="body1" paragraph>
      Huffman coding is a popular technique for lossless data compression. It assigns variable-length codes to characters
      based on their frequencies in the text. More frequent characters get shorter codes, leading to space savings.
    </Typography>
    <Typography variant="subtitle1" gutterBottom>How it works:</Typography>
    <Typography component="ol" sx={{ pl: 2 }}>
      <li>Calculate the frequency of each character in the input</li>
      <li>Build a priority queue of nodes, with each node containing a character and its frequency</li>
      <li>While there is more than one node in the queue:
        <Typography component="ol" sx={{ pl: 2 }} type="a">
          <li>Remove the two nodes with the lowest frequencies</li>
          <li>Create a new internal node with these two nodes as children and a frequency equal to their sum</li>
          <li>Add the new node back to the queue</li>
        </Typography>
      </li>
      <li>The remaining node is the root of the Huffman tree</li>
      <li>Traverse the tree to assign codes to each character (left = 0, right = 1)</li>
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Time Complexity:</Typography>
    <Typography variant="body1">
      O(n log n), where n is the number of unique characters in the input.
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Applications:</Typography>
    <Typography variant="body1">
      Text compression, image compression (JPEG), and other lossless data compression applications.
    </Typography>
  </Box>
);

export default { runHuffmanCoding, HuffmanCodingDescription };
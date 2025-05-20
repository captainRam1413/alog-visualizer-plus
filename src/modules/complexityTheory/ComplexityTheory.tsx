import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardHeader,
  SelectChangeEvent
} from '@mui/material';

// Import visualizer components
import TravelingSalesmanVisualizer from './components/TravelingSalesmanVisualizer';
import SubsetSumVisualizer from './components/SubsetSumVisualizer';

export default function ComplexityTheory() {
  const [tabValue, setTabValue] = useState(0);
  const [problem, setProblem] = useState('satProblem');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProblemChange = (event: SelectChangeEvent) => {
    setProblem(event.target.value);
  };

  return (
    <Container>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Complexity Theory Simulator
        </Typography>
        <Typography variant="body1" paragraph>
          Explore fundamental concepts in computational complexity theory, including P vs NP,
          NP-completeness, reduction techniques, and satisfiability problems.
          Visualize complexity relationships and understand theoretical limits of computation.
        </Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="complexity theory tabs">
          <Tab label="Problem Simulator" />
          <Tab label="Complexity Classes" />
          <Tab label="Reductions & Completeness" />
          <Tab label="Theory Explorer" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%', mb: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Problem Selection</Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="problem-select-label">Problem</InputLabel>
                <Select
                  labelId="problem-select-label"
                  id="problem-select"
                  value={problem}
                  label="Problem"
                  onChange={handleProblemChange}
                >
                  <MenuItem value="satProblem">Boolean Satisfiability (SAT)</MenuItem>
                  <MenuItem value="graphColoring">Graph Coloring</MenuItem>
                  <MenuItem value="tsp">Traveling Salesperson</MenuItem>
                  <MenuItem value="subset">Subset Sum</MenuItem>
                  <MenuItem value="clique">Clique Problem</MenuItem>
                  <MenuItem value="hamiltonian">Hamiltonian Path</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>
          
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 2, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
              {problem === 'tsp' ? (
                <TravelingSalesmanVisualizer />
              ) : problem === 'subset' ? (
                <SubsetSumVisualizer />
              ) : (
                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {problem === 'satProblem' && 'SAT problem visualization will be displayed here'}
                    {problem === 'graphColoring' && 'Graph coloring visualization will be displayed here'}
                    {problem === 'clique' && 'Clique problem visualization will be displayed here'}
                    {problem === 'hamiltonian' && 'Hamiltonian path visualization will be displayed here'}
                  </Typography>
                  
                  <Divider sx={{ width: '100%', my: 2 }} />
                  
                  <Box sx={{ width: '100%', p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Problem Details:</Typography>
                    {problem === 'satProblem' && (
                      <Typography variant="body2" paragraph>
                        Boolean Satisfiability Problem (SAT): Given a boolean formula, determine if there exists an 
                        assignment of truth values to variables that makes the formula evaluate to true.
                        SAT is a classic NP-complete problem, meaning it's in NP but no polynomial time algorithm is known.
                      </Typography>
                    )}
                    {problem === 'tsp' && (
                      <Typography variant="body2" paragraph>
                        Traveling Salesperson Problem (TSP): Given a list of cities and distances between them, 
                        find the shortest possible route that visits each city exactly once and returns to the origin.
                        TSP is NP-hard, and the decision version is NP-complete.
                      </Typography>
                    )}
                    {problem === 'subset' && (
                      <Typography variant="body2" paragraph>
                        Subset Sum Problem: Given a set of integers, determine if there exists a subset whose sum
                        equals exactly the target value. This is an NP-complete problem with applications in
                        resource allocation and optimization.
                      </Typography>
                    )}
                    {problem === 'graphColoring' && (
                      <Typography variant="body2" paragraph>
                        Graph Coloring Problem: Color the vertices of a graph such that no two adjacent vertices
                        share the same color, using the minimum number of colors possible. The decision version of
                        this problem is NP-complete.
                      </Typography>
                    )}
                    {problem === 'clique' && (
                      <Typography variant="body2" paragraph>
                        Clique Problem: Find the largest complete subgraph (clique) within a graph. A clique is a
                        subset of vertices such that every pair of vertices is connected by an edge. Finding a
                        clique of a given size is NP-complete.
                      </Typography>
                    )}
                    {problem === 'hamiltonian' && (
                      <Typography variant="body2" paragraph>
                        Hamiltonian Path Problem: Determine if a graph contains a path that visits each vertex 
                        exactly once. This is an NP-complete problem closely related to the traveling salesperson
                        problem.
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Complexity Classes Hierarchy</Typography>
              <Box sx={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Complexity classes visualization will be displayed here
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid sx={{ width: '33.33%' }}>
            <Card>
              <CardHeader title="P (Polynomial Time)" />
              <CardContent>
                <Typography variant="body2">
                  Problems that can be solved in polynomial time by a deterministic Turing machine.
                  These are generally considered "tractable" or efficiently solvable.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Examples:</strong> Shortest paths, minimum spanning trees, 2-SAT
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid sx={{ width: '33.33%' }}>
            <Card>
              <CardHeader title="NP (Nondeterministic Polynomial Time)" />
              <CardContent>
                <Typography variant="body2">
                  Problems where solutions can be verified in polynomial time. Contains P as a subset.
                  The question of whether P = NP is one of the most important open problems in computer science.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Examples:</strong> Boolean satisfiability, traveling salesperson, clique
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid sx={{ width: '33.33%' }}>
            <Card>
              <CardHeader title="NP-Complete" />
              <CardContent>
                <Typography variant="body2">
                  The "hardest" problems in NP. If any NP-complete problem has a polynomial time solution,
                  then all problems in NP do (P = NP).
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Examples:</strong> 3-SAT, Hamiltonian path, vertex cover
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Reduction Visualization</Typography>
              <Box sx={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Problem reduction visualization will be displayed here
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>What is a Reduction?</Typography>
                <Typography variant="body2" paragraph>
                  A reduction is a transformation of one problem into another problem, such that a solution
                  to the second problem can be used to solve the first problem. In complexity theory,
                  reductions are used to show that one problem is at least as hard as another.
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>Polynomial-Time Reductions</Typography>
                <Typography variant="body2" paragraph>
                  If problem A can be reduced to problem B in polynomial time, and B can be solved in 
                  polynomial time, then A can also be solved in polynomial time. This is written as A ≤ₚ B.
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>NP-Completeness</Typography>
                <Typography variant="body2">
                  A problem is NP-complete if it is in NP and every problem in NP can be reduced to it in 
                  polynomial time. The first proven NP-complete problem was the Boolean satisfiability problem (SAT),
                  shown by Cook-Levin theorem.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Theory Explorer</Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>P vs NP Problem</Typography>
                <Typography variant="body2" paragraph>
                  The P versus NP problem is a major unsolved problem in theoretical computer science. 
                  It asks whether every problem whose solution can be quickly verified can also be solved quickly.
                </Typography>
                
                <Typography variant="body2" paragraph>
                  If P = NP, many important problems would be solvable in polynomial time, including many optimization
                  problems that are currently considered intractable. Most computer scientists believe that P ≠ NP.
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>Implications</Typography>
                <Typography variant="body2">
                  If P = NP were proven, it would have profound implications for cryptography, mathematics, artificial intelligence,
                  and many other fields. Many encryption methods rely on the assumption that certain problems cannot be solved efficiently.
                </Typography>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>Further Topics in Complexity Theory</Typography>
              <Grid container spacing={2}>
                <Grid sx={{ width: '33.33%' }}>
                  <Button variant="outlined" fullWidth>Space Complexity</Button>
                </Grid>
                <Grid sx={{ width: '33.33%' }}>
                  <Button variant="outlined" fullWidth>Approximation Algorithms</Button>
                </Grid>
                <Grid sx={{ width: '33.33%' }}>
                  <Button variant="outlined" fullWidth>Randomized Algorithms</Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
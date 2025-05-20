import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import './App.css';

// Layout components (we'll create these next)
import MainLayout from './components/layout/MainLayout';
import Home from './components/layout/Home';

// Module components (to be implemented)
import ComplexityAnalysis from './modules/complexity/ComplexityAnalysis';
import SortingAlgorithms from './modules/sorting/SortingAlgorithms';
import DivideConquerAlgorithms from './modules/divideConquer/DivideConquerAlgorithms';
import DynamicProgramming from './modules/dynamicProgramming/DynamicProgramming';
import GreedyAlgorithms from './modules/greedy/GreedyAlgorithms';
import BacktrackingAlgorithms from './modules/backtracking/BacktrackingAlgorithms';
import ComplexityTheory from './modules/complexityTheory/ComplexityTheory';
import RandomizedAlgorithms from './modules/randomized/RandomizedAlgorithms';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="complexity" element={<ComplexityAnalysis />} />
            <Route path="sorting" element={<SortingAlgorithms />} />
            <Route path="divide-conquer" element={<DivideConquerAlgorithms />} />
            <Route path="dynamic-programming" element={<DynamicProgramming />} />
            <Route path="greedy" element={<GreedyAlgorithms />} />
            <Route path="backtracking" element={<BacktrackingAlgorithms />} />
            <Route path="complexity-theory" element={<ComplexityTheory />} />
            <Route path="randomized" element={<RandomizedAlgorithms />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

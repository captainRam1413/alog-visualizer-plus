import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Button,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const moduleCards = [
  {
    title: 'Sorting Algorithms',
    description: 'Visualize and compare classic sorting algorithms like Bubble Sort, Merge Sort, Quick Sort, and more.',
    image: require('../../assets/sorting.png'),
    path: '/sorting',
    color: '#3f51b5'
  },
  {
    title: 'Divide & Conquer',
    description: 'Explore algorithms that solve problems by breaking them into smaller subproblems.',
    image: require('../../assets/divide.jpeg'),
    path: '/divide-conquer',
    color: '#f44336'
  },
  {
    title: 'Greedy Algorithms',
    description: 'Understand algorithms that make locally optimal choices at each stage.',
    image: require('../../assets/greedy.jpeg'),
    path: '/greedy',
    color: '#4caf50'
  },
  {
    title: 'Dynamic Programming',
    description: 'Learn how to solve complex problems by breaking them down into overlapping subproblems.',
    image: require('../../assets/dynamic.jpeg'),
    path: '/dynamic-programming',
    color: '#ff9800'
  },
  {
    title: 'Backtracking',
    description: 'Visualize algorithms that find solutions incrementally and abandon paths that fail.',
    image: require('../../assets/backtracking.png'),
    path: '/backtracking',
    color: '#2196f3'
  },
  {
    title: 'Randomized Algorithms',
    description: 'Explore algorithms that use random numbers to solve problems efficiently.',
    image: require('../../assets/randomized.jpeg'),
    path: '/randomized',
    color: '#9c27b0'
  },
  {
    title: 'Complexity Theory',
    description: 'Understand the fundamental limits of computation and efficiency.',
    image: require('../../assets/complexity.jpeg'),
    path: '/complexity-theory',
    color: '#607d8b'
  }
];

export default function Home() {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          AlgoVisualizer+
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Interactive Algorithm Visualizations for Better Understanding
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/sorting')}
        >
          Get Started
        </Button>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Visualize, Learn, Master
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to AlgoVisualizer+, your comprehensive platform for mastering algorithms through
          interactive visualizations. Whether you're a student, educator, or professional developer,
          our visualizations will help you gain deeper insights into how algorithms work.
        </Typography>
        <Typography variant="body1">
          Choose from any of our algorithm modules below to begin your exploration!
        </Typography>
      </Paper>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Algorithm Modules
        </Typography>
        <Grid container spacing={3}>
          {moduleCards.map(card => (
            <Grid sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1.5 }} key={card.title}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  } 
                }}
              >
                <CardActionArea 
                  onClick={() => handleCardClick(card.path)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box sx={{ height: 140, bgcolor: card.color, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={card.image || `https://source.unsplash.com/random?${card.title}`}
                      alt={card.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '10px'
                      }}
                    >
                      <Typography variant="h6">{card.title}</Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: '#fffffff' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Why Visualize Algorithms?
        </Typography>
        <Typography variant="body1" paragraph>
          Algorithm visualizations serve as powerful educational tools that help:
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography variant="body1" paragraph>
            • Convert abstract concepts into tangible visual representations
          </Typography>
          <Typography variant="body1" paragraph>
            • Identify patterns and behaviors that might be missed in code
          </Typography>
          <Typography variant="body1" paragraph>
            • Compare efficiency and performance between different approaches
          </Typography>
          <Typography variant="body1" paragraph>
            • Debug and understand algorithm execution step by step
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Ready to start your algorithm visualization journey?
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/sorting')}
          sx={{ mt: 2 }}
        >
          Explore Sorting Algorithms
        </Button>
      </Box>
    </Container>
  );
}
import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { ActivityItem } from '../types';

interface ActivityVisualizerProps {
  activities: ActivityItem[];
  description: string;
}

/**
 * A component that visualizes the Activity Selection greedy algorithm
 */
const ActivityVisualizer: React.FC<ActivityVisualizerProps> = ({ activities, description }) => {
  // Find min and max times for scaling
  const minTime = Math.min(...activities.map(a => a.start));
  const maxTime = Math.max(...activities.map(a => a.finish));
  const timeRange = maxTime - minTime;
  
  // Scale factor for timeline visualization
  const timelineWidth = 800;
  const scaleX = (time: number) => ((time - minTime) / timeRange) * timelineWidth;
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Typography variant="subtitle1" gutterBottom>
        {description}
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          height: 'calc(100% - 60px)',
          backgroundColor: '#f5f5f5', 
          overflow: 'auto'
        }}
      >
        {/* Timeline header */}
        <Box sx={{ position: 'relative', mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
          <Grid container>
            {Array.from({ length: 11 }, (_, i) => {
              const time = minTime + (i / 10) * timeRange;
              const position = (i / 10) * timelineWidth;
              
              return (
                <Grid key={i} sx={{ position: 'absolute', left: position, transform: 'translateX(-50%)' }}>
                  <Typography variant="caption" color="text.secondary">{Math.round(time)}</Typography>
                  <Box sx={{ height: 8, width: 1, bgcolor: 'divider', mx: 'auto' }} />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Activities */}
        <Box sx={{ position: 'relative', mt: 4 }}>
          {activities.map((activity, index) => {
            const startPos = scaleX(activity.start);
            const endPos = scaleX(activity.finish);
            const width = endPos - startPos;
            
            return (
              <Box 
                key={activity.id}
                sx={{
                  position: 'relative',
                  my: 1.5,
                  height: 30,
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    left: startPos,
                    width,
                    height: '100%',
                    bgcolor: activity.selected ? '#81c784' : '#bbdefb',
                    border: activity.selected ? '2px solid #2e7d32' : '1px solid #1976d2',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activity.selected ? 2 : 1,
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: activity.selected ? 'bold' : 'normal',
                      color: activity.selected ? '#1b5e20' : '#0d47a1',
                    }}
                  >
                    {activity.id} ({activity.start}-{activity.finish})
                  </Typography>
                </Box>
                
                {/* Time markers */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    left: startPos, 
                    top: '100%',
                    transform: 'translateX(-50%)',
                    color: 'text.secondary' 
                  }}
                >
                  {activity.start}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    left: endPos, 
                    top: '100%', 
                    transform: 'translateX(-50%)',
                    color: 'text.secondary' 
                  }}
                >
                  {activity.finish}
                </Typography>
              </Box>
            );
          })}
        </Box>
        
        {/* Legend */}
        <Box sx={{ mt: 8, display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#bbdefb', border: '1px solid #1976d2', mr: 0.5 }} />
            <Typography variant="caption">Unselected Activity</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#81c784', border: '2px solid #2e7d32', mr: 0.5 }} />
            <Typography variant="caption">Selected Activity</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ActivityVisualizer;
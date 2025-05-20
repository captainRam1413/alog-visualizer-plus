import React from 'react';
import { Typography, Box } from '@mui/material';
import { ActivityItem, AlgorithmStep } from '../types';

/**
 * Implements the Activity Selection greedy algorithm
 * @param activities Array of activities with start and finish times
 * @returns Array of steps showing the progression of the algorithm
 */
export const runActivitySelection = (activities: ActivityItem[]): AlgorithmStep[] => {
  const steps: AlgorithmStep[] = [];
  
  // Step 1: Sort activities by finish time
  steps.push({
    description: "Sort all activities by finish time in non-decreasing order.",
    activities: [...activities],
    highlightedCode: ["activities.sort((a, b) => a.finish - b.finish)"]
  });
  
  const sortedActivities = [...activities].sort((a, b) => a.finish - b.finish);
  
  // Step 2: Select the first activity
  const selectedActivities: ActivityItem[] = [];
  const firstActivity = { ...sortedActivities[0], selected: true };
  selectedActivities.push(firstActivity);
  
  const activitiesAfterFirst = sortedActivities.map((activity, index) => 
    index === 0 ? { ...activity, selected: true } : activity
  );
  
  steps.push({
    description: `Select the first activity: ${firstActivity.id} (${firstActivity.start}-${firstActivity.finish})`,
    activities: activitiesAfterFirst,
    highlightedCode: ["let selected = [activities[0]]", "let lastFinishTime = activities[0].finish"]
  });
  
  // Step 3: Process the remaining activities
  let lastFinishTime = firstActivity.finish;
  
  for (let i = 1; i < sortedActivities.length; i++) {
    const currentActivity = sortedActivities[i];
    const currentActivities = [...sortedActivities];
    
    // If this activity starts after the last selected activity finishes
    if (currentActivity.start >= lastFinishTime) {
      const updatedActivity = { ...currentActivity, selected: true };
      selectedActivities.push(updatedActivity);
      lastFinishTime = updatedActivity.finish;
      
      // Update the visualization with the selected activity
      currentActivities.forEach((act, idx) => {
        if (idx === i) {
          currentActivities[idx] = updatedActivity;
        }
      });
      
      steps.push({
        description: `Select activity: ${updatedActivity.id} (${updatedActivity.start}-${updatedActivity.finish}) as it starts after the last finish time ${lastFinishTime}.`,
        activities: currentActivities.map(act => 
          selectedActivities.some(selected => selected.id === act.id) 
            ? { ...act, selected: true } 
            : act
        ),
        highlightedCode: ["if (currentActivity.start >= lastFinishTime)", "  selected.push(currentActivity)", "  lastFinishTime = currentActivity.finish"]
      });
    } else {
      steps.push({
        description: `Skip activity: ${currentActivity.id} (${currentActivity.start}-${currentActivity.finish}) as it overlaps with previously selected activities.`,
        activities: currentActivities.map(act => 
          selectedActivities.some(selected => selected.id === act.id) 
            ? { ...act, selected: true } 
            : act
        ),
        highlightedCode: ["// Skip this activity as it overlaps"]
      });
    }
  }
  
  steps.push({
    description: `Activity selection complete! Selected ${selectedActivities.length} activities: ${selectedActivities.map(a => a.id).join(', ')}.`,
    activities: sortedActivities.map(act => 
      selectedActivities.some(selected => selected.id === act.id) 
        ? { ...act, selected: true } 
        : act
    ),
    highlightedCode: ["return selected"]
  });
  
  return steps;
};

export const ActivitySelectionDescription = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Activity Selection</Typography>
    <Typography variant="body1" paragraph>
      The Activity Selection problem involves selecting the maximum number of activities that don't overlap 
      with each other. Each activity has a start time and finish time.
    </Typography>
    <Typography variant="subtitle1" gutterBottom>How it works:</Typography>
    <Typography component="ol" sx={{ pl: 2 }}>
      <li>Sort all activities by finish time</li>
      <li>Select the first activity (earliest finish time)</li>
      <li>For each remaining activity:
        <Typography component="ol" sx={{ pl: 2 }} type="a">
          <li>If the activity starts after or at the finish time of the last selected activity, select it</li>
          <li>Otherwise, skip it</li>
        </Typography>
      </li>
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Time Complexity:</Typography>
    <Typography variant="body1">
      O(n log n) due to the sorting step, where n is the number of activities.
    </Typography>
    <Typography variant="subtitle1" gutterBottom mt={2}>Applications:</Typography>
    <Typography variant="body1">
      Scheduling problems, resource allocation, and room booking systems.
    </Typography>
  </Box>
);

export default { runActivitySelection, ActivitySelectionDescription };
import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Sort as SortIcon,
  CallSplit as CallSplitIcon,
  GridView as GridViewIcon,
  Bolt as BoltIcon,
  Loop as LoopIcon,
  Psychology as PsychologyIcon,
  Shuffle as ShuffleIcon
} from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { name: 'Home', path: '/', icon: <HomeIcon /> },
  { name: 'Complexity Analysis', path: '/complexity', icon: <TimelineIcon /> },
  { name: 'Sorting & Searching', path: '/sorting', icon: <SortIcon /> },
  { name: 'Divide & Conquer', path: '/divide-conquer', icon: <CallSplitIcon /> },
  { name: 'Dynamic Programming', path: '/dynamic-programming', icon: <GridViewIcon /> },
  { name: 'Greedy Algorithms', path: '/greedy', icon: <BoltIcon /> },
  { name: 'Backtracking', path: '/backtracking', icon: <LoopIcon /> },
  { name: 'Complexity Theory', path: '/complexity-theory', icon: <PsychologyIcon /> },
  { name: 'Randomized Algorithms', path: '/randomized', icon: <ShuffleIcon /> }
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
      <img src={require("../../assets/logo.jpg")} alt="Logo" style={{ height: '40px' }} />
        <Typography variant="h6" noWrap component="div">
          AlgoVisualizer+
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <img src={require("../../assets/logo.jpg")} alt="Logo" style={{ height: '50px' }} />
          <Typography variant="h6" noWrap component="div">
            AlgoVisualizer+: Interactive Algorithm Visualization
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: theme.palette.background.default
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
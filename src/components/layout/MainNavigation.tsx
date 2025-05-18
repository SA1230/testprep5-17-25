"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BugReportIcon from '@mui/icons-material/BugReport';
import StorageIcon from '@mui/icons-material/Storage';

const navItems = [
  { name: 'Home', path: '/', icon: <HomeIcon /> },
  { name: 'Practice', path: '/practice', icon: <SchoolIcon /> },
  { name: 'Quiz', path: '/quiz', icon: <QuizIcon /> },
  { name: 'Review', path: '/review', icon: <HistoryIcon /> },
  { name: 'Mock Exam', path: '/mock', icon: <AssessmentIcon /> },
  { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { name: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
];

const devItems = [
  { name: 'Test Data', path: '/test-data', icon: <StorageIcon /> },
  { name: 'Test GraphQL', path: '/test-graphql', icon: <BugReportIcon /> },
];

export default function MainNavigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: theme.palette.primary.main }}>
        Dreambound GED
      </Typography>
      <List>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem 
              key={item.name} 
              sx={{
                color: isActive ? theme.palette.primary.main : 'inherit',
                bgcolor: isActive ? 'rgba(54, 46, 106, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(54, 46, 106, 0.04)',
                },
              }}
            >
              <Link href={item.path} style={{ display: 'flex', width: '100%', textDecoration: 'none', color: 'inherit' }}>
              
              <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
              </Link>
            </ListItem>
          );
        })}
        
        {/* Development/Testing Links */}
        <ListItem sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Development Tools
          </Typography>
        </ListItem>
        
        {devItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem 
              key={item.name} 
              sx={{
                color: isActive ? theme.palette.primary.main : 'inherit',
                bgcolor: isActive ? 'rgba(54, 46, 106, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(54, 46, 106, 0.04)',
                },
              }}
            >
              <Link href={item.path} style={{ display: 'flex', width: '100%', textDecoration: 'none', color: 'inherit' }}>
              <ListItemIcon sx={{ color: isActive ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} />
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{ 
                flexGrow: 1, 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Dreambound GED
            </Typography>
            {!isMobile && (
              <Box sx={{ display: 'flex' }}>
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Button
                      key={item.name}
                      component={Link}
                      href={item.path}
                      startIcon={item.icon}
                      sx={{
                        mx: 1,
                        color: isActive ? theme.palette.primary.main : 'inherit',
                        fontWeight: isActive ? 600 : 400,
                        '&:hover': {
                          bgcolor: 'rgba(54, 46, 106, 0.04)',
                        },
                      }}
                    >
                      {item.name}
                    </Button>
                  );
                })}
                
                {/* Development Tools */}
                <Box sx={{ display: 'flex', ml: 2, borderLeft: 1, borderColor: 'divider' }}>
                  {devItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Button
                        key={item.name}
                        component={Link}
                        href={item.path}
                        startIcon={item.icon}
                        size="small"
                        sx={{
                          mx: 1,
                          color: isActive ? theme.palette.primary.main : 'text.secondary',
                          fontWeight: isActive ? 600 : 400,
                          '&:hover': {
                            bgcolor: 'rgba(54, 46, 106, 0.04)',
                          },
                        }}
                      >
                        {item.name}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}

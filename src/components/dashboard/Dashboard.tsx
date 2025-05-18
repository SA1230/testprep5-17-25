"use client";

import { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import Link from 'next/link';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Mock user data for demo purposes
const MOCK_USER = {
  name: 'Alex Johnson',
  plan: 'free',
  progress: {
    math: 65,
    language: 42,
    science: 28,
    social: 35
  },
  stats: {
    questionsAnswered: 124,
    correctAnswers: 87,
    quizzesTaken: 5,
    mockExamsTaken: 1,
    studyTime: 8.5 // hours
  },
  streakDays: 4
};

// Feature cards data
const featureCards = [
  {
    title: 'Practice Questions',
    description: 'Adaptive practice questions that adjust to your skill level',
    icon: <SchoolIcon fontSize="large" sx={{ color: '#4caf50' }} />,
    path: '/practice',
    isPremium: false,
    stats: `${MOCK_USER.stats.questionsAnswered} questions answered`
  },
  {
    title: 'Structured Quiz',
    description: 'Take timed quizzes to test your knowledge and track progress',
    icon: <QuizIcon fontSize="large" sx={{ color: '#2196f3' }} />,
    path: '/quiz',
    isPremium: false,
    stats: `${MOCK_USER.stats.quizzesTaken} quizzes completed`
  },
  {
    title: 'Mock Exams',
    description: 'Full-length practice tests that simulate the real GED exam',
    icon: <AssessmentIcon fontSize="large" sx={{ color: '#ff9800' }} />,
    path: '/mock',
    isPremium: false, // Base access is free, but full access requires premium
    stats: `${MOCK_USER.stats.mockExamsTaken} exams taken`
  },
  {
    title: 'Review Hub',
    description: 'Review your past answers and focus on areas that need improvement',
    icon: <HistoryIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
    path: '/review',
    isPremium: false,
    stats: 'Track your progress'
  }
];

// Premium features
const premiumFeatures = [
  'Unlimited practice questions',
  'Access to all mock exams',
  'Personalized study recommendations',
  'Detailed performance analytics',
  'Custom study plans'
];

export default function Dashboard() {
  const isPremiumUser = MOCK_USER.plan === 'premium';
  
  return (
    <Box sx={{ mt: 4 }}>
      {/* User welcome and stats summary */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'primary.main',
                  mr: 2 
                }}
              >
                {MOCK_USER.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  Welcome back, {MOCK_USER.name}!
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    label={isPremiumUser ? 'Premium Plan' : 'Free Plan'} 
                    color={isPremiumUser ? 'secondary' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<AccessTimeIcon fontSize="small" />}
                    label={`${MOCK_USER.stats.studyTime} hours studied`}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    icon={<EmojiEventsIcon fontSize="small" />}
                    label={`${MOCK_USER.streakDays} day streak`}
                    variant="outlined"
                    size="small"
                    color="success"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="subtitle1" gutterBottom>
                Study Time
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {MOCK_USER.stats.studyTime} hrs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  study time
                </Typography>
              </Box>
              {!isPremiumUser && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 1 }}
                  component="a"
                  href="/profile"
                >
                  Upgrade for 100 daily tokens
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Subject progress */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Your Progress
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Mathematical Reasoning
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={MOCK_USER.progress.math} 
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {MOCK_USER.progress.math}% mastery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Reasoning Through Language Arts
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={MOCK_USER.progress.language} 
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {MOCK_USER.progress.language}% mastery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Science
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={MOCK_USER.progress.science} 
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {MOCK_USER.progress.science}% mastery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Social Studies
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={MOCK_USER.progress.social} 
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {MOCK_USER.progress.social}% mastery
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Feature cards */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Study Resources
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {featureCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  {card.isPremium && !isPremiumUser && (
                    <Chip
                      icon={<LockIcon />}
                      label="Premium"
                      size="small"
                      color="secondary"
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {card.description}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {card.stats}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Button 
                  component={Link} 
                  href={card.path}
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={card.isPremium && !isPremiumUser}
                >
                  {card.isPremium && !isPremiumUser ? 'Upgrade to Access' : 'Start Now'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Premium upgrade card */}
      {!isPremiumUser && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'secondary.light' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom>
                Upgrade to Premium
              </Typography>
              
              <Typography variant="body1" paragraph>
                Unlock all features and maximize your GED test preparation with our premium plan.
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {premiumFeatures.map((feature, index) => (
                  <Chip 
                    key={index}
                    label={feature}
                    icon={<CheckCircleIcon />}
                    variant="outlined"
                    sx={{ my: 0.5 }}
                  />
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                component="a"
                href="/profile"
                sx={{ mt: { xs: 2, md: 0 } }}
              >
                Upgrade Now
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Recent activity - simplified for demo */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Recent Activity
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          Your recent activity will appear here as you use the platform.
        </Typography>
      </Paper>
    </Box>
  );
}

// Helper component for CheckCircleIcon
function CheckCircleIcon() {
  return <TrendingUpIcon fontSize="small" sx={{ color: 'secondary.main' }} />;
}

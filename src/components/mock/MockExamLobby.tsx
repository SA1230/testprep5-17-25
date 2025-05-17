"use client";

import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid,
  Paper,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import MockExam from './MockExam';

// Mock user plan for demo purposes
const MOCK_USER_PLAN = {
  tier: 'free'
};

// Mock exam data
const mockExams = [
  {
    id: '1',
    title: 'Mathematical Reasoning',
    description: 'Test your math skills with questions covering basic math, geometry, algebra, and graphs.',
    questionCount: 45,
    timeLimit: 115, // minutes
    isPremium: false,
    icon: <SchoolIcon fontSize="large" sx={{ color: '#4caf50' }} />
  },
  {
    id: '2',
    title: 'Reasoning Through Language Arts',
    description: 'Assess your reading comprehension, writing, and language skills.',
    questionCount: 50,
    timeLimit: 150, // minutes
    isPremium: true,
    icon: <SchoolIcon fontSize="large" sx={{ color: '#2196f3' }} />
  },
  {
    id: '3',
    title: 'Science',
    description: 'Test your knowledge of life science, physical science, and Earth and space science.',
    questionCount: 40,
    timeLimit: 90, // minutes
    isPremium: true,
    icon: <SchoolIcon fontSize="large" sx={{ color: '#ff9800' }} />
  },
  {
    id: '4',
    title: 'Social Studies',
    description: 'Evaluate your understanding of civics, government, economics, geography, and history.',
    questionCount: 35,
    timeLimit: 70, // minutes
    isPremium: true,
    icon: <SchoolIcon fontSize="large" sx={{ color: '#9c27b0' }} />
  },
  {
    id: '5',
    title: 'Practice Mini-Exam',
    description: 'A shorter version of the full exam with questions from all subjects.',
    questionCount: 20,
    timeLimit: 45, // minutes
    isPremium: false,
    icon: <QuizIcon fontSize="large" sx={{ color: '#f44336' }} />
  }
];

export default function MockExamLobby() {
  const [selectedExam, setSelectedExam] = useState<typeof mockExams[0] | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  
  const isPremiumUser = MOCK_USER_PLAN.tier === 'premium';
  
  const handleExamSelect = (exam: typeof mockExams[0]) => {
    if (exam.isPremium && !isPremiumUser) {
      setShowPremiumDialog(true);
    } else {
      setSelectedExam(exam);
      setShowStartDialog(true);
    }
  };
  
  const handleStartExam = () => {
    setShowStartDialog(false);
    setExamStarted(true);
  };
  
  const handleClosePremiumDialog = () => {
    setShowPremiumDialog(false);
  };
  
  const handleCloseStartDialog = () => {
    setShowStartDialog(false);
  };
  
  const handleExitExam = () => {
    setExamStarted(false);
    setSelectedExam(null);
  };
  
  // Format time as HH:MM
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };
  
  if (examStarted && selectedExam) {
    return <MockExam exam={selectedExam} onExit={handleExitExam} />;
  }
  
  return (
    <Box sx={{ mt: 4 }}>
      {!isPremiumUser && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Free Plan Limitations
          </Typography>
          <Typography variant="body2">
            With the free plan, you have access to partial mock exams only. Upgrade to premium for full access to all mock exams and detailed performance analytics.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            sx={{ mt: 1 }}
            component="a"
            href="/profile"
          >
            Upgrade to Premium
          </Button>
        </Alert>
      )}
      
      <Typography variant="h5" gutterBottom>
        Available Exams
      </Typography>
      
      <Grid container spacing={3}>
        {mockExams.map((exam) => (
          <Grid item xs={12} md={6} key={exam.id}>
            <Card 
              sx={{
                height: '100%',
                position: 'relative',
                ...(exam.isPremium && !isPremiumUser && {
                  opacity: 0.8,
                })
              }}
            >
              {exam.isPremium && !isPremiumUser && (
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    icon={<LockIcon />}
                    label="Premium"
                    color="secondary"
                  />
                </Box>
              )}
              
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {exam.icon}
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {exam.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {exam.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Chip
                    icon={<QuizIcon />}
                    label={`${exam.questionCount} Questions`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={formatTime(exam.timeLimit)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleExamSelect(exam)}
                >
                  {exam.isPremium && !isPremiumUser ? 'Upgrade to Access' : 'Start Exam'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Premium Upgrade Dialog */}
      <Dialog
        open={showPremiumDialog}
        onClose={handleClosePremiumDialog}
      >
        <DialogTitle>Premium Feature</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This mock exam is available exclusively to premium users. Upgrade your plan to access all mock exams and unlock additional features.
          </DialogContentText>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Premium Benefits:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Access to all mock exams" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Unlimited practice questions" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="100 AI tutor tokens per day" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Detailed performance analytics" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Custom filters and study plans" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePremiumDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            component="a"
            href="/profile"
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Start Exam Dialog */}
      <Dialog
        open={showStartDialog}
        onClose={handleCloseStartDialog}
      >
        <DialogTitle>Start {selectedExam?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to start a timed mock exam. Please ensure you have enough time to complete it. The exam has {selectedExam?.questionCount} questions and a time limit of {formatTime(selectedExam?.timeLimit || 0)}.
          </DialogContentText>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Exam Rules:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="The timer will start as soon as you begin the exam." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <QuizIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="You can navigate between questions freely." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BarChartIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Your results and score will be shown at the end." />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStartDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleStartExam}
          >
            Begin Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

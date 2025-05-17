"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Button, 
  CircularProgress,
  Divider,
  Alert,
  Paper,
  Chip,
  Stack,
  Grid,
  LinearProgress,
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
import { useQuery, gql } from '@apollo/client';
import TimerIcon from '@mui/icons-material/Timer';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FlagIcon from '@mui/icons-material/Flag';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// GraphQL query to get questions for a mock exam
const GET_MOCK_EXAM_QUESTIONS = gql`
  query GetMockExamQuestions($subject: String!, $limit: Int!) {
    questionsCollection(
      filter: { subject: { name: { eq: $subject } } }
      first: $limit
    ) {
      edges {
        node {
          id
          stem
          choices
          correct_choice
          difficulty
          subject {
            id
            name
          }
        }
      }
    }
  }
`;

interface Choice {
  label: string;
  text: string;
}

interface Question {
  id: string;
  stem: string;
  choices: Choice[];
  correct_choice: number;
  difficulty: number;
  subject: {
    id: string;
    name: string;
  };
}

interface ExamProps {
  exam: {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    timeLimit: number; // in minutes
    isPremium: boolean;
    icon: React.ReactNode;
  };
  onExit: () => void;
}

interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeTaken: number;
  score: number;
  passingScore: number;
  passed: boolean;
}

export default function MockExam({ exam, onExit }: ExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(exam.timeLimit * 60); // convert to seconds
  const [examCompleted, setExamCompleted] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  
  // Mock questions for demo purposes
  const mockQuestions: Question[] = Array(exam.questionCount).fill(null).map((_, index) => ({
    id: `mock-${exam.id}-${index}`,
    stem: `This is a sample question for the ${exam.title} exam. It tests your knowledge about a specific topic related to this subject area. What is the correct answer?`,
    choices: [
      { label: 'A', text: 'First possible answer that could be correct or incorrect.' },
      { label: 'B', text: 'Second possible answer with different wording and approach.' },
      { label: 'C', text: 'Third option that presents another perspective on the question.' },
      { label: 'D', text: 'Fourth and final option to consider for this question.' },
    ],
    correct_choice: Math.floor(Math.random() * 4), // Random correct answer for demo
    difficulty: Math.floor(Math.random() * 5) + 1, // Random difficulty 1-5
    subject: {
      id: exam.id,
      name: exam.title
    }
  }));
  
  // Query to get mock exam questions (commented out for demo)
  /*
  const { data: questionsData, loading: questionsLoading } = 
    useQuery(GET_MOCK_EXAM_QUESTIONS, {
      variables: { subject: exam.title, limit: exam.questionCount },
      fetchPolicy: 'network-only'
    });
  */
  
  // For demo purposes, we're using mock questions instead of actual GraphQL query
  const questionsLoading = false;
  const questions = mockQuestions;
  
  // Initialize user answers and flagged questions arrays
  useEffect(() => {
    setUserAnswers(Array(exam.questionCount).fill(null));
    setFlaggedQuestions(Array(exam.questionCount).fill(false));
  }, [exam.questionCount]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!examCompleted && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        
        // Show warning when 5 minutes remaining
        if (timeRemaining === 300) {
          setShowTimeWarning(true);
        }
      }, 1000);
    } else if (timeRemaining === 0 && !examCompleted) {
      completeExam();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [examCompleted, timeRemaining]);
  
  // Handle answer selection
  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = parseInt(event.target.value, 10);
    setUserAnswers(newAnswers);
  };
  
  // Toggle flagged status for current question
  const handleToggleFlag = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  };
  
  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Move to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Jump to a specific question
  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  // Complete the exam and calculate results
  const completeExam = () => {
    setExamCompleted(true);
    
    // Calculate results
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === null) {
        skippedCount++;
      } else if (userAnswers[i] === questions[i].correct_choice) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }
    
    const timeTaken = (exam.timeLimit * 60) - timeRemaining;
    const score = Math.round((correctCount / questions.length) * 100);
    const passingScore = 65; // GED passing score is typically 65%
    
    setExamResult({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      skippedQuestions: skippedCount,
      timeTaken,
      score,
      passingScore,
      passed: score >= passingScore
    });
  };
  
  // Handle exit confirmation
  const handleExitConfirm = () => {
    setShowExitConfirmation(true);
  };
  
  const handleExitCancel = () => {
    setShowExitConfirmation(false);
  };
  
  const handleExitExam = () => {
    setShowExitConfirmation(false);
    onExit();
  };
  
  // Handle time warning close
  const handleCloseTimeWarning = () => {
    setShowTimeWarning(false);
  };
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  // Get the current question
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];
  const isQuestionFlagged = flaggedQuestions[currentQuestionIndex];
  
  // Loading state
  if (questionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading exam questions...
        </Typography>
      </Box>
    );
  }
  
  // Exam completed state
  if (examCompleted && examResult) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {examResult.passed ? 'Congratulations!' : 'Exam Completed'}
          </Typography>
          
          <Typography variant="h5" color={examResult.passed ? 'success.main' : 'error.main'} gutterBottom>
            Your Score: {examResult.score}%
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            Passing Score: {examResult.passingScore}%
          </Typography>
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={examResult.score}
              color={examResult.passed ? 'success' : 'error'}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          
          <Typography variant="body1" gutterBottom>
            {examResult.passed
              ? 'You have successfully passed this mock exam!'
              : 'You did not pass this mock exam. Keep practicing and try again!'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Time taken: {formatTime(examResult.timeTaken)}
          </Typography>
        </Paper>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  {examResult.correctAnswers}
                </Typography>
                <Typography variant="body2">
                  Correct Answers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  {examResult.incorrectAnswers}
                </Typography>
                <Typography variant="body2">
                  Incorrect Answers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  {examResult.skippedQuestions}
                </Typography>
                <Typography variant="body2">
                  Skipped Questions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  {examResult.totalQuestions}
                </Typography>
                <Typography variant="body2">
                  Total Questions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onExit}
          >
            Return to Exam Lobby
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            component="a"
            href="/review"
          >
            Review Your Answers
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ mt: 4 }}>
      {/* Exam header */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimerIcon color={timeRemaining < 300 ? 'error' : 'primary'} />
              <Typography variant="h6" color={timeRemaining < 300 ? 'error' : 'inherit'}>
                {formatTime(timeRemaining)}
              </Typography>
            </Stack>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" align="center">
              {exam.title}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" align="right">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <LinearProgress 
              variant="determinate" 
              value={(currentQuestionIndex / questions.length) * 100} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Question card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Chip 
              label={`Difficulty: ${currentQuestion.difficulty}`} 
              color="secondary" 
              variant="outlined" 
            />
            
            <Button
              variant={isQuestionFlagged ? 'contained' : 'outlined'}
              color="warning"
              startIcon={<FlagIcon />}
              size="small"
              onClick={handleToggleFlag}
            >
              {isQuestionFlagged ? 'Flagged' : 'Flag for Review'}
            </Button>
          </Box>
          
          <Typography variant="h5" component="h2" gutterBottom>
            {currentQuestion.stem}
          </Typography>
          
          <RadioGroup
            value={selectedAnswer}
            onChange={handleAnswerSelect}
          >
            {currentQuestion.choices.map((choice, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={`${choice.label}. ${choice.text}`}
              />
            ))}
          </RadioGroup>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNextQuestion}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={completeExam}
              >
                Finish Exam
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Question navigation */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Question Navigation
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {userAnswers.map((answer, index) => {
            let buttonColor = 'default';
            if (flaggedQuestions[index]) buttonColor = 'warning';
            else if (answer !== null) buttonColor = 'primary';
            
            return (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? 'contained' : 'outlined'}
                color={buttonColor}
                size="small"
                onClick={() => handleJumpToQuestion(index)}
                sx={{ minWidth: 40, height: 40 }}
              >
                {index + 1}
              </Button>
            );
          })}
        </Box>
      </Paper>
      
      {/* Exam controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleExitConfirm}
        >
          Exit Exam
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={completeExam}
        >
          Submit Exam
        </Button>
      </Box>
      
      {/* Time warning dialog */}
      <Dialog
        open={showTimeWarning}
        onClose={handleCloseTimeWarning}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Time Warning
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have 5 minutes remaining to complete this exam. Please review your answers and submit before time runs out.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTimeWarning} autoFocus>
            Continue Exam
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Exit confirmation dialog */}
      <Dialog
        open={showExitConfirmation}
        onClose={handleExitCancel}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          Exit Exam?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to exit this exam? Your progress will be lost and you will not receive a score.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExitCancel}>
            Cancel
          </Button>
          <Button onClick={handleExitExam} color="error" variant="contained">
            Exit Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

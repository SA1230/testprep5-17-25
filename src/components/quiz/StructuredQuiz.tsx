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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent
} from '@mui/material';
import { useQuery, gql } from '@apollo/client';
import TimerIcon from '@mui/icons-material/Timer';

// GraphQL query to get subjects
const GET_SUBJECTS = gql`
  query GetSubjects {
    subjectsCollection {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// GraphQL query to get questions for a quiz
const GET_QUIZ_QUESTIONS = gql`
  query GetQuizQuestions($subject_id: UUID!, $limit: Int!) {
    questionsCollection(
      filter: { subject_id: { eq: $subject_id } }
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

interface Subject {
  id: string;
  name: string;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  accuracy: number;
}

const QUIZ_LENGTH = 15; // Number of questions in the quiz
const QUIZ_TIME_LIMIT = 15 * 60; // 15 minutes in seconds

export default function StructuredQuiz() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(QUIZ_TIME_LIMIT);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Query to get all subjects
  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS);

  // Query to get quiz questions
  const { data: questionsData, loading: questionsLoading } = 
    useQuery(GET_QUIZ_QUESTIONS, {
      variables: { subject_id: selectedSubject, limit: QUIZ_LENGTH },
      skip: !selectedSubject || !quizStarted,
      fetchPolicy: 'network-only'
    });

  // Handle subject selection
  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value);
  };

  // Start the quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(QUIZ_LENGTH).fill(null));
    setTimeRemaining(QUIZ_TIME_LIMIT);
  };

  // Handle answer selection
  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = parseInt(event.target.value, 10);
    setUserAnswers(newAnswers);
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  // Move to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Complete the quiz and calculate results
  const completeQuiz = () => {
    setQuizCompleted(true);
    
    // Calculate results
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correct_choice) {
        correctCount++;
      }
    }
    
    const timeTaken = QUIZ_TIME_LIMIT - timeRemaining;
    const accuracy = (correctCount / questions.length) * 100;
    
    setQuizResult({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeTaken,
      accuracy
    });
    
    setShowResultDialog(true);
  };

  // Close the result dialog
  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
  };

  // Reset the quiz
  const handleResetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setUserAnswers([]);
    setTimeRemaining(QUIZ_TIME_LIMIT);
    setQuizResult(null);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Effect to set the questions when data is loaded
  useEffect(() => {
    if (questionsData?.questionsCollection?.edges) {
      const loadedQuestions = questionsData.questionsCollection.edges.map((edge: any) => edge.node);
      setQuestions(loadedQuestions);
    }
  }, [questionsData]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !quizCompleted) {
      completeQuiz();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [quizStarted, quizCompleted, timeRemaining]);

  // Loading state
  if (subjectsLoading) {
    return <CircularProgress />;
  }

  // Extract subjects from the query result
  const subjects: Subject[] = subjectsData?.subjectsCollection?.edges?.map((edge: any) => edge.node) || [];

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = userAnswers[currentQuestionIndex];

  return (
    <Box sx={{ mt: 4 }}>
      {!quizStarted ? (
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Start a Timed Quiz
            </Typography>
            <Typography variant="body1" paragraph>
              This quiz consists of {QUIZ_LENGTH} questions and has a time limit of {QUIZ_TIME_LIMIT / 60} minutes.
              You can navigate between questions and change your answers before submitting.
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel id="subject-select-label">Select Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                value={selectedSubject}
                label="Select Subject"
                onChange={handleSubjectChange}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleStartQuiz}
              disabled={!selectedSubject}
              fullWidth
            >
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      ) : questionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : questions.length > 0 ? (
        <Box>
          {/* Timer and progress bar */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TimerIcon color="primary" />
                  <Typography variant="h6">
                    {formatTime(timeRemaining)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
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
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={currentQuestion.subject.name} 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={`Difficulty: ${currentQuestion.difficulty}`} 
                  color="secondary" 
                  variant="outlined" 
                />
              </Stack>
              
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
                    onClick={completeQuiz}
                  >
                    Finish Quiz
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
          
          {/* Question navigation */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Question Navigation
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userAnswers.map((answer, index) => (
                <Button
                  key={index}
                  variant={currentQuestionIndex === index ? 'contained' : 'outlined'}
                  color={answer !== null ? 'primary' : 'inherit'}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(index)}
                  sx={{ minWidth: 40, height: 40 }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>
      ) : (
        <Alert severity="error">
          No questions available for this subject. Please select a different subject or try again later.
        </Alert>
      )}
      
      {/* Results Dialog */}
      <Dialog
        open={showResultDialog}
        onClose={handleCloseResultDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Quiz Results</DialogTitle>
        <DialogContent>
          {quizResult && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                You scored {quizResult.correctAnswers} out of {quizResult.totalQuestions}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                Accuracy: {quizResult.accuracy.toFixed(1)}%
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                Time taken: {formatTime(quizResult.timeTaken)}
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={quizResult.accuracy}
                color={quizResult.accuracy >= 70 ? 'success' : quizResult.accuracy >= 50 ? 'warning' : 'error'}
                sx={{ height: 10, borderRadius: 5, mt: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {quizResult.accuracy >= 70
                  ? 'Great job! You have a good understanding of this subject.'
                  : quizResult.accuracy >= 50
                  ? 'Good effort! With more practice, you can improve your score.'
                  : 'Keep practicing! Focus on the areas where you had difficulty.'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResultDialog}>Close</Button>
          <Button onClick={handleResetQuiz} variant="contained" color="primary">
            Start New Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

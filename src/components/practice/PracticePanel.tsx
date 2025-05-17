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
  SelectChangeEvent
} from '@mui/material';
import AiTutor from './AiTutor';
import { useQuery, useMutation, gql } from '@apollo/client';

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

// GraphQL query to get a question
const GET_QUESTION = gql`
  query GetQuestion($id: UUID!) {
    questionsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          stem
          choices
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

// GraphQL query to get an adaptive question
const GET_ADAPTIVE_QUESTION = gql`
  query GetAdaptiveQuestion($subject_id: UUID!) {
    fn_get_adaptive_question(subject_id: $subject_id)
  }
`;

// GraphQL mutation to submit an answer
const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($user_id: UUID!, $question_id: UUID!, $is_correct: Boolean!, $response_ms: Int) {
    insertIntoAnswerEventsCollection(
      objects: [
        { 
          user_id: $user_id, 
          question_id: $question_id, 
          is_correct: $is_correct, 
          response_ms: $response_ms 
        }
      ]
    ) {
      affectedCount
      records {
        id
      }
    }
  }
`;

// Mock user ID for demo purposes
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Mock user plan for demo purposes
const MOCK_USER_PLAN = {
  tier: 'free',
  tutor_tokens_today: 0,
  tutor_tokens_limit: 2
};

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

export default function PracticePanel() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);

  // Query to get all subjects
  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS);

  // Query to get an adaptive question based on the selected subject
  const { data: adaptiveQuestionData, loading: adaptiveQuestionLoading, refetch: refetchAdaptiveQuestion } = 
    useQuery(GET_ADAPTIVE_QUESTION, {
      variables: { subject_id: selectedSubject },
      skip: !selectedSubject,
      fetchPolicy: 'network-only'
    });

  // Query to get question details
  const { data: questionData, loading: questionLoading, refetch: refetchQuestion } = 
    useQuery(GET_QUESTION, {
      variables: { id: adaptiveQuestionData?.fn_get_adaptive_question },
      skip: !adaptiveQuestionData?.fn_get_adaptive_question,
      fetchPolicy: 'network-only'
    });

  // Mutation to submit an answer
  const [submitAnswer, { loading: submittingAnswer }] = useMutation(SUBMIT_ANSWER);

  // Handle subject selection
  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value);
    resetQuestion();
  };

  // Handle answer selection
  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(parseInt(event.target.value, 10));
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setResponseTime(timeTaken);

    const isAnswerCorrect = selectedAnswer === currentQuestion.correct_choice;
    setIsCorrect(isAnswerCorrect);
    setIsAnswerSubmitted(true);
    
    // Update stats
    setQuestionsAnswered(prev => prev + 1);
    if (isAnswerCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Submit answer to the server
    try {
      await submitAnswer({
        variables: {
          user_id: MOCK_USER_ID,
          question_id: currentQuestion.id,
          is_correct: isAnswerCorrect,
          response_ms: timeTaken
        }
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  // Handle next question
  const handleNextQuestion = () => {
    resetQuestion();
    refetchAdaptiveQuestion();
  };

  // Reset question state
  const resetQuestion = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  // Effect to set the current question when data is loaded
  useEffect(() => {
    if (questionData?.questionsCollection?.edges?.length > 0) {
      const questionNode = questionData.questionsCollection.edges[0].node;
      setCurrentQuestion(questionNode);
      setStartTime(Date.now());
    }
  }, [questionData]);

  // Loading state
  if (subjectsLoading) {
    return <CircularProgress />;
  }

  // Extract subjects from the query result
  const subjects: Subject[] = subjectsData?.subjectsCollection?.edges?.map((edge: any) => edge.node) || [];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Subject selection */}
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

      {/* Stats display */}
      <Paper sx={{ p: 2, mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2">Questions Answered</Typography>
          <Typography variant="h6">{questionsAnswered}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Correct Answers</Typography>
          <Typography variant="h6">{correctAnswers}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Accuracy</Typography>
          <Typography variant="h6">
            {questionsAnswered > 0 ? `${Math.round((correctAnswers / questionsAnswered) * 100)}%` : '0%'}
          </Typography>
        </Box>
      </Paper>

      {/* Question card */}
      {selectedSubject ? (
        adaptiveQuestionLoading || questionLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : currentQuestion ? (
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
                    disabled={isAnswerSubmitted}
                    sx={{
                      ...(isAnswerSubmitted && index === currentQuestion.correct_choice && {
                        color: 'success.main',
                        fontWeight: 'bold',
                      }),
                      ...(isAnswerSubmitted && selectedAnswer === index && index !== currentQuestion.correct_choice && {
                        color: 'error.main',
                      }),
                    }}
                  />
                ))}
              </RadioGroup>
              
              {isAnswerSubmitted ? (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mb: 2 }}>
                    {isCorrect 
                      ? 'Correct! Well done.' 
                      : `Incorrect. The correct answer is ${currentQuestion.choices[currentQuestion.correct_choice].label}.`}
                  </Alert>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Response time: {(responseTime / 1000).toFixed(2)} seconds
                  </Typography>
                  
                  {/* AI Tutor integration */}
                  <AiTutor 
                    questionId={currentQuestion.id} 
                    questionText={currentQuestion.stem}
                    userPlan={MOCK_USER_PLAN}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleNextQuestion}
                      disabled={submittingAnswer}
                    >
                      Next Question
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || submittingAnswer}
                  >
                    Submit Answer
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            No questions available for this subject. Please select a different subject or try again later.
          </Alert>
        )
      ) : (
        <Alert severity="info">
          Please select a subject to start practicing.
        </Alert>
      )}
    </Box>
  );
}

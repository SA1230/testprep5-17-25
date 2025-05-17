import { Typography, Box } from '@mui/material';
import StructuredQuiz from '@/components/quiz/StructuredQuiz';

export default function QuizPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Timed Quiz
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Take a timed mini-quiz with 15 questions to test your knowledge and track your progress.
      </Typography>
      <StructuredQuiz />
    </Box>
  );
}

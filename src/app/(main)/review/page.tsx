import { Typography, Box } from '@mui/material';
import ReviewHub from '@/components/review/ReviewHub';

export default function ReviewPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Review Your Progress
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Review your past questions, focus on areas that need improvement, and track your progress.
      </Typography>
      <ReviewHub />
    </Box>
  );
}

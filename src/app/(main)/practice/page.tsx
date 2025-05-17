import { Typography, Box } from '@mui/material';
import PracticePanel from '@/components/practice/PracticePanel';

export default function PracticePage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Practice Questions
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Improve your GED score with adaptive practice questions tailored to your skill level.
      </Typography>
      <PracticePanel />
    </Box>
  );
}

import { Typography, Box } from '@mui/material';
import MockExamLobby from '@/components/mock/MockExamLobby';

export default function MockExamPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Mock Exams
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Take full-length practice tests that simulate the real GED exam experience and predict your score.
      </Typography>
      <MockExamLobby />
    </Box>
  );
}

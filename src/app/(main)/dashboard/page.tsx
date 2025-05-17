import { Typography, Box } from '@mui/material';
import Dashboard from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Your Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Track your progress and access all GED test preparation features.
      </Typography>
      <Dashboard />
    </Box>
  );
}

import { Box, Typography, Button, Grid, Card, CardContent, Container, Stack, Divider } from '@mui/material';
import Link from 'next/link';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MainNavigation from '@/components/layout/MainNavigation';

export default function Home() {
  return (
    <>
      <MainNavigation />
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            py: { xs: 6, md: 12 },
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Ace Your GED Test with Adaptive Learning
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mb: 4 }}>
            Personalized practice, adaptive learning, and real-time feedback to help you succeed.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              component={Link}
              href="/practice"
              variant="contained"
              size="large"
              startIcon={<SchoolIcon />}
            >
              Start Practicing
            </Button>
            <Button
              component={Link}
              href="/profile"
              variant="outlined"
              size="large"
            >
              Create Account
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Features Section */}
        <Box sx={{ py: 6 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Key Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mt: 2 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Adaptive Practice
                </Typography>
                <Typography color="text.secondary">
                  Questions that adjust to your skill level, focusing on areas where you need the most improvement.
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <QuizIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Personalized Learning
                </Typography>
                <Typography color="text.secondary">
                  Get personalized explanations and guidance tailored to your learning style when you're stuck on a problem.
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <AssessmentIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Mock Exams
                </Typography>
                <Typography color="text.secondary">
                  Full-length practice tests that simulate the real GED exam experience and predict your score.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            p: 6,
            mt: 6,
            mb: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography sx={{ mb: 4 }}>
            Begin your GED preparation journey today with our adaptive learning platform.
          </Typography>
          <Button
            component={Link}
            href="/practice"
            variant="contained"
            color="secondary"
            size="large"
          >
            Start Free Practice
          </Button>
        </Box>
      </Container>
    </>
  );
}

import MainNavigation from '@/components/layout/MainNavigation';
import { Container, Box } from '@mui/material';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MainNavigation />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      </Container>
    </>
  );
}

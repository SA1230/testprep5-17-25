"use client";

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import { supabase } from '@/lib/supabase/client';

interface AiTutorProps {
  questionId: string;
  questionText: string;
  userPlan: {
    tier: string;
    tutor_tokens_today: number;
    tutor_tokens_limit: number;
  };
}

export default function AiTutor({ questionId, questionText, userPlan }: AiTutorProps) {
  const [userQuestion, setUserQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTutor, setShowTutor] = useState(false);
  const [tokensUsed, setTokensUsed] = useState(userPlan.tutor_tokens_today);
  const [tokensRemaining, setTokensRemaining] = useState(userPlan.tutor_tokens_limit - userPlan.tutor_tokens_today);

  const handleUserQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuestion(event.target.value);
  };

  const handleSubmitQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Call the AI Tutor Edge Function
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: { questionId, userQuestion }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setTutorResponse(data.response);
      setTokensUsed(data.tokens_used);
      setTokensRemaining(data.tokens_remaining);
    } catch (err: any) {
      setError(err.message || 'Failed to get tutor response');
    } finally {
      setLoading(false);
    }
  };

  const toggleTutor = () => {
    setShowTutor(!showTutor);
    if (!showTutor) {
      setTutorResponse('');
      setError('');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        startIcon={<ChatIcon />}
        onClick={toggleTutor}
        sx={{ mb: 2 }}
      >
        {showTutor ? 'Hide AI Tutor' : 'Ask AI Tutor'}
      </Button>
      
      <Collapse in={showTutor}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">AI Tutor</Typography>
            <IconButton size="small" onClick={toggleTutor}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Question: {questionText}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Alert severity="info" sx={{ mb: 2 }}>
            You have used {tokensUsed} of {userPlan.tutor_tokens_limit} tutor tokens today.
            {userPlan.tier === 'free' && tokensRemaining === 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Upgrade to premium for more tutor tokens!
              </Typography>
            )}
          </Alert>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {tutorResponse && (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" gutterBottom>
                Tutor Response:
              </Typography>
              <Typography variant="body1">
                {tutorResponse}
              </Typography>
            </Paper>
          )}
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Ask a question about this problem"
              variant="outlined"
              value={userQuestion}
              onChange={handleUserQuestionChange}
              disabled={loading || tokensRemaining === 0}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleSubmitQuestion}
              disabled={!userQuestion.trim() || loading || tokensRemaining === 0}
            >
              Ask
            </Button>
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
}

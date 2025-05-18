"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Box, Typography, Paper, List, ListItem, Divider, Chip, CircularProgress } from '@mui/material';

export default function TestDataPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');
        
        if (subjectsError) throw new Error(`Error fetching subjects: ${subjectsError.message}`);
        setSubjects(subjectsData || []);
        
        // Fetch questions with subject info
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            subject:subjects(*)
          `);
        
        if (questionsError) throw new Error(`Error fetching questions: ${questionsError.message}`);
        setQuestions(questionsData || []);
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">Error</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Test Data</Typography>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Subjects ({subjects.length})</Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <List>
          {subjects.map((subject) => (
            <ListItem key={subject.id}>
              <Typography>{subject.name}</Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Typography variant="h5" gutterBottom>Questions ({questions.length})</Typography>
      {questions.map((question) => (
        <Paper key={question.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={question.subject?.name || 'Unknown'} 
              color="primary" 
              size="small" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label={`Difficulty: ${question.difficulty}`} 
              color="secondary" 
              size="small" 
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>{question.stem}</Typography>
          
          {(typeof question.choices === 'string' ? JSON.parse(question.choices) : question.choices).map((choice: any, index: number) => (
            <Typography 
              key={choice.label} 
              sx={{ 
                mb: 1, 
                fontWeight: index === question.correct_choice ? 'bold' : 'normal',
                color: index === question.correct_choice ? 'success.main' : 'inherit'
              }}
            >
              {choice.label}. {choice.text}
            </Typography>
          ))}
          
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Explanation:</Typography>
          <Typography variant="body2">{question.explanation}</Typography>
        </Paper>
      ))}
    </Box>
  );
}

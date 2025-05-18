"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  FormControlLabel, 
  Checkbox,
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
  TextField,
  Grid,
  Tabs,
  Tab,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { useQuery, gql } from '@apollo/client';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';


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

// GraphQL query to get tags
const GET_TAGS = gql`
  query GetTags {
    tagsCollection {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// GraphQL query to get user's answer history
const GET_USER_ANSWERS = gql`
  query GetUserAnswers(
    $user_id: UUID!, 
    $is_correct: Boolean, 
    $subject_id: UUID,
    $limit: Int!,
    $offset: Int!
  ) {
    answerEventsCollection(
      filter: { 
        user_id: { eq: $user_id },
        is_correct: { eq: $is_correct },
        question: { subject_id: { eq: $subject_id } }
      },
      orderBy: { attempted_at: DESC },
      first: $limit,
      offset: $offset
    ) {
      edges {
        node {
          id
          is_correct
          response_ms
          attempted_at
          question {
            id
            stem
            choices
            correct_choice
            difficulty
            subject {
              id
              name
            }
            questionTagsCollection {
              edges {
                node {
                  tag {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Mock user ID for demo purposes
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

// Mock user plan for demo purposes
const MOCK_USER_PLAN = {
  tier: 'free'
};

interface Choice {
  label: string;
  text: string;
}

interface Tag {
  id: string;
  name: string;
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
  questionTagsCollection: {
    edges: Array<{
      node: {
        tag: Tag;
      };
    }>;
  };
}

interface AnswerEvent {
  id: string;
  is_correct: boolean;
  response_ms: number;
  attempted_at: string;
  question: Question;
}

interface Subject {
  id: string;
  name: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`review-tabpanel-${index}`}
      aria-labelledby={`review-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ReviewHub() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | ''>('');
  const [incorrectOnly, setIncorrectOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  
  const pageSize = 10;

  // Query to get all subjects
  const { data: subjectsData, loading: subjectsLoading } = useQuery(GET_SUBJECTS);

  // Query to get all tags
  const { data: tagsData, loading: tagsLoading } = useQuery(GET_TAGS);

  // Query to get user's answer history
  const { data: answersData, loading: answersLoading, refetch: refetchAnswers } = 
    useQuery(GET_USER_ANSWERS, {
      variables: { 
        user_id: MOCK_USER_ID, 
        is_correct: incorrectOnly ? false : undefined,
        subject_id: selectedSubject || undefined,
        limit: pageSize,
        offset: page * pageSize
      },
      fetchPolicy: 'network-only'
    });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle subject selection
  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value);
    setPage(0);
  };

  // Handle difficulty selection
  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setSelectedDifficulty(event.target.value === '' ? '' : Number(event.target.value));
    setPage(0);
  };

  // Handle incorrect only toggle
  const handleIncorrectOnlyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncorrectOnly(event.target.checked);
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle question expansion
  const handleExpandQuestion = (questionId: string) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  // Handle pagination
  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePrevPage = () => {
    setPage(Math.max(0, page - 1));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Filter answers based on difficulty and search term
  const filteredAnswers = answersData?.answerEventsCollection?.edges
    .map((edge: any) => edge.node)
    .filter((answer: AnswerEvent) => {
      // Filter by difficulty if selected
      if (selectedDifficulty !== '' && answer.question.difficulty !== selectedDifficulty) {
        return false;
      }
      
      // Filter by search term if provided
      if (searchTerm && !answer.question.stem.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    }) || [];

  // Loading state
  if (subjectsLoading || tagsLoading) {
    return <CircularProgress />;
  }

  // Extract subjects and tags from the query results
  const subjects: Subject[] = subjectsData?.subjectsCollection?.edges?.map((edge: any) => edge.node) || [];
  const tags: Tag[] = tagsData?.tagsCollection?.edges?.map((edge: any) => edge.node) || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <FilterListIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Filters
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                value={selectedSubject}
                label="Subject"
                onChange={handleSubjectChange}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="difficulty-select-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-select-label"
                value={selectedDifficulty.toString()}
                label="Difficulty"
                onChange={handleDifficultyChange}
              >
                <MenuItem value="">All Difficulties</MenuItem>
                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={level.toString()}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={incorrectOnly}
                    onChange={handleIncorrectOnlyChange}
                    color="primary"
                  />
                }
                label="Show incorrect answers only"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search questions"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Questions" />
        <Tab label="Performance" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        {answersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredAnswers.length > 0 ? (
          <>
            {filteredAnswers.map((answer: AnswerEvent) => (
              <Card key={answer.id} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        label={answer.question.subject.name} 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Difficulty: ${answer.question.difficulty}`} 
                        color="secondary" 
                        variant="outlined" 
                      />
                      {answer.is_correct ? (
                        <Chip 
                          icon={<ThumbUpIcon />} 
                          label="Correct" 
                          color="success" 
                        />
                      ) : (
                        <Chip 
                          icon={<ThumbDownIcon />} 
                          label="Incorrect" 
                          color="error" 
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(answer.attempted_at)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {answer.question.stem}
                  </Typography>
                  
                  {answer.question.questionTagsCollection.edges.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tags:
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {answer.question.questionTagsCollection.edges.map((edge: any) => (
                          <Chip 
                            key={edge.node.tag.id} 
                            label={edge.node.tag.name} 
                            size="small" 
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleExpandQuestion(answer.question.id)}
                    >
                      {expandedQuestionId === answer.question.id ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </Box>
                  
                  {expandedQuestionId === answer.question.id && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Answer Choices:
                      </Typography>
                      
                      {answer.question.choices.map((choice, index) => (
                        <Typography 
                          key={index} 
                          variant="body1" 
                          sx={{
                            mb: 1,
                            pl: 2,
                            ...(index === answer.question.correct_choice && {
                              color: 'success.main',
                              fontWeight: 'bold',
                            }),
                          }}
                        >
                          {choice.label}. {choice.text}
                          {index === answer.question.correct_choice && ' (Correct)'}
                        </Typography>
                      ))}
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Response time: {(answer.response_ms / 1000).toFixed(2)} seconds
                      </Typography>
                      

                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                disabled={page === 0}
                onClick={handlePrevPage}
              >
                Previous
              </Button>
              
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Page {page + 1}
              </Typography>
              
              <Button
                variant="outlined"
                disabled={!answersData?.answerEventsCollection?.pageInfo?.hasNextPage}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </Box>
          </>
        ) : (
          <Alert severity="info">
            No questions found matching your criteria. Try adjusting your filters.
          </Alert>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Summary
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            This feature is available in the premium plan. Upgrade to see detailed performance analytics, including:
            <ul>
              <li>Subject-specific accuracy rates</li>
              <li>Progress over time</li>
              <li>Difficulty breakdown</li>
              <li>Personalized study recommendations</li>
            </ul>
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            component="a"
            href="/profile"
          >
            Upgrade to Premium
          </Button>
        </Paper>
      </TabPanel>
    </Box>
  );
}

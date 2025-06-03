import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { Box, Typography, Button, Chip, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, Rating, Divider } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import { FeedbackType } from '@/types/feedback.types';

export const FeedbackStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ARCHIVED: 'ARCHIVED',
} as const;

import { getFeedbackById, deleteFeedback } from '../../api/feedbackApi';
import type { Feedback } from '../../api/feedbackApi';
// Define a simple auth context type since we can't find the actual context
interface AuthContextType {
  user?: {
    id: string;
    role?: string;
    // Add other user properties as needed
  };
}

// Mock useAuth hook if the actual one is not available
const useAuth = (): AuthContextType => ({
  user: undefined
});

const FeedbackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Get feedback by ID
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!id) return;
      try {
        const data = await getFeedbackById(id);
        setFeedback(data);
      } catch {
        enqueueSnackbar('Failed to load feedback', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, enqueueSnackbar]);

  const getTypeLabel = (type: string): string => {
    const label = getFeedbackTypeLabel(type);
    return label === 'Unknown' ? 'Feedback' : `${label} Feedback`;
  };

  const getFeedbackTypeLabel = (type: string): string => {
    // Convert string to FeedbackType enum value
    const feedbackType = Object.values(FeedbackType).find(
      (t) => t.toLowerCase() === type.toLowerCase()
    ) as FeedbackType | undefined;
    
    if (!feedbackType) return 'Unknown';
    switch (feedbackType) {
      case FeedbackType.PEER:
        return 'Peer';
      case FeedbackType.MANAGER:
        return 'Manager';
      case FeedbackType.SELF:
        return 'Self';
      case FeedbackType.UPWARD:
        return 'Upward';
      case FeedbackType.THREE_SIXTY:
        return '360°';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    if (!Object.values(FeedbackStatus).includes(status as keyof typeof FeedbackStatus)) return 'default';
    switch (status) {
      case FeedbackStatus.SUBMITTED:
        return 'success';
      case FeedbackStatus.DRAFT:
        return 'warning';
      case FeedbackStatus.ARCHIVED:
        return 'default';
      default:
        return 'info';
    }
  };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const data = await getFeedbackById(id!);
        setFeedback(data);
      } catch (err) {
        enqueueSnackbar('Error loading feedback', { variant: 'error' });
        console.error('Error fetching feedback:', err);
        navigate('/feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, enqueueSnackbar, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await deleteFeedback(id!);
        enqueueSnackbar('Feedback deleted successfully', { variant: 'success' });
        navigate('/feedback');
      } catch (error) {
        enqueueSnackbar('Error deleting feedback', { variant: 'error' });
        console.error('Error deleting feedback:', error);
      }
    }
  };

  if (loading || !feedback) {
    return <div>Loading...</div>;
  }

  // Check if current user is the feedback author or admin
  const isAuthor = Boolean(user && feedback && user.id === feedback.fromUserId);
  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const canEdit = isAuthor || isAdmin;


  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Feedback Details
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back to List
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          {getFeedbackTypeLabel(feedback.type as string)}
        </Typography>
      </Box>
      {canEdit && (
        <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/feedback/${feedback.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '66.666%' } }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="div">
                  {getTypeLabel(feedback.type as string)}
                </Typography>
                <Chip
                  label={feedback.status.toLowerCase()}
                  color={getStatusColor(feedback.status) as 'success' | 'warning' | 'default' | 'info'}
                  size="small"
                  sx={{ ml: 1, textTransform: 'capitalize' }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {feedback.content}
                </Typography>
              </Box>
              {feedback.strengths && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Strengths
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {feedback.strengths}
                  </Typography>
                </Box>
              )}
              
              {feedback.improvements && (
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {feedback.improvements}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '33.333%' } }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ratings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {feedback.ratings && Object.entries(feedback.ratings).length > 0 ? (
                <List>
                  {Object.entries(feedback.ratings).map(([criterion, value]) => (
                    <ListItem key={criterion} disableGutters>
                      <ListItemText 
                        primary={
                          <Typography variant="body2">
                            {criterion.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Typography>
                        }
                      />
                      <Rating value={value} precision={0.5} readOnly />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No ratings provided
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem disableGutters>
                  <ListItemAvatar>
                    <Avatar>
                      {feedback.fromUser?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="From" 
                    secondary={
                      feedback.isAnonymous 
                        ? 'Anonymous' 
                        : feedback.fromUser?.name || 'Unknown User'
                    } 
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemAvatar>
                    <Avatar>
                      {feedback.toUser?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="To" 
                    secondary={feedback.toUser?.name || 'Unknown User'} 
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Submitted On" 
                    secondary={format(new Date(feedback.createdAt), 'MMM dd, yyyy')} 
                  />
                </ListItem>
                
                {feedback.cycleId && (
                  <ListItem disableGutters>
                    <ListItemText 
                      primary="Cycle" 
                      secondary={feedback.cycleId} // You might want to fetch and show cycle name
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default FeedbackDetail;

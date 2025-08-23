import React from 'react';
import { useParams } from '@tanstack/react-router';
import { ApplicationReview } from '../components/ApplicationReview';

export const ApplicationReviewPage: React.FC = () => {
  const { applicationId } = useParams({ from: '/financial-institution/applications/$applicationId' });
  
  return <ApplicationReview applicationId={applicationId} />;
};

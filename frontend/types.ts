
import React from 'react';

export enum Category {
  SCHOOL = 'High School (11-12)',
  COLLEGE = 'University/Placement'
}

export interface ProgramFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface AIResponse {
  feedback: string;
  suggestions: string[];
  score?: number;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  template: string;
}

export const DEFAULT_SUBJECTS = [
  'C Programming',
  'OOP',
  'Unix',
  'Data Structures',
  'Computer Intro',
  'Operating System',
  'Computer Network',
  'DBMS',
  'Software Engineering',
  'Machine Learning',
  'Others'
];

export const WEAK_SUBJECT_THRESHOLD = 60;

export const STREAK_GRACE_DAYS = 1;

export const PRIORITY_LEVELS = ['low', 'medium', 'high'];

export const REVISION_STATUS = ['pending', 'completed'];

export const SUBJECT_SUGGESTIONS = {
  'C Programming': [
    { maxAccuracy: 40, suggestion: 'Revise Pointers & Memory Management fundamentals' },
    { maxAccuracy: 60, suggestion: 'Practice Array & String manipulation problems in C' },
  ],
  'Operating System': [
    { maxAccuracy: 40, suggestion: 'Start from basics: Process vs Thread, PCB structure' },
    { maxAccuracy: 60, suggestion: 'Revise CPU Scheduling algorithms' },
  ],
  'Data Structures': [
    { maxAccuracy: 40, suggestion: 'Revise core data structures: Arrays, Linked Lists, Stacks' },
    { maxAccuracy: 60, suggestion: 'Practice sorting algorithms and their complexities' },
  ],
  'DBMS': [
    { maxAccuracy: 40, suggestion: 'Revise ER diagrams and basic SQL' },
    { maxAccuracy: 60, suggestion: 'Practice Normalization (1NF–BCNF)' },
  ],
};

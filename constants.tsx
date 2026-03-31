import React from 'react';
import type { User, Course, Achievement } from './types';
import { Icon } from './components/Icon';

export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Alex Morgan',
        email: 'alex.morgan@cortouch.io',
        avatarUrl: 'https://picsum.photos/seed/user-avatar/100/100',
        role: 'admin',
        enrolledCourseIds: [1, 2, 4],
    },
    {
        id: 2,
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        avatarUrl: 'https://picsum.photos/seed/user2/100/100',
        role: 'student',
        enrolledCourseIds: [1, 3],
    },
    {
        id: 4,
        name: 'John Smith',
        email: 'john.smith@example.com',
        avatarUrl: 'https://picsum.photos/seed/user4/100/100',
        role: 'student',
        enrolledCourseIds: [1],
    },
    {
        id: 5,
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        avatarUrl: 'https://picsum.photos/seed/user5/100/100',
        role: 'student',
        enrolledCourseIds: [1, 2],
    },
    {
        id: 3,
        name: 'David Miller',
        email: 'david.miller@cortouch.io',
        avatarUrl: 'https://picsum.photos/seed/instructor1/100/100',
        role: 'instructor',
        enrolledCourseIds: [],
    }
];

export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'UI/UX Design Masterclass',
    category: 'Web Development',
    instructor: 'David Miller',
    duration: '6 Weeks',
    description: 'A comprehensive course covering the fundamentals of UI/UX design, from user research to high-fidelity prototyping. Learn to create intuitive and beautiful digital products.',
    imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?w=600&h=400&fit=crop',
    price: 45000,
    rating: 4.8,
    enrollmentCount: 1250,
    modules: 5,
    progress: 60,
    completed: false,
    content: [
      { id: 101, title: 'Introduction to UX', progress: 100, lessons: [
        { id: 1011, title: 'What is UX Design?', duration: '10 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: true },
        { id: 1012, title: 'The UX Design Process', duration: '15 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: true },
      ]},
      { id: 102, title: 'User Research & Personas', progress: 50, lessons: [
        { id: 1021, title: 'Conducting User Interviews', duration: '25 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: true },
        { id: 1022, title: 'Creating User Personas', duration: '20 min', type: 'text', content: 'User personas are fictional characters, which you create based upon your research in order to represent the different user types that might use your service, product, site, or brand in a similar way.', isCompleted: false },
      ]},
      { id: 103, title: 'Wireframing & Prototyping', progress: 0, lessons: [
        { id: 1031, title: 'Low-Fidelity Wireframing', duration: '30 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
        { id: 1032, title: 'Interactive Prototyping in Figma', duration: '45 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
      ]},
    ],
    projects: [
      { id: 1, title: 'Create a User Persona', description: 'Based on sample interview data, create a detailed user persona for a new mobile app.', isSubmitted: false },
      { id: 2, title: 'Design a Mobile App Prototype', description: 'Design a high-fidelity, interactive prototype for a fictional coffee ordering app.', isSubmitted: false }
    ],
    reviews: [
        { id: 1, author: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/user2/40/40', rating: 5, comment: 'Excellent course! The instructor is very clear and the projects are very practical.' },
        { id: 2, author: 'John Smith', avatarUrl: 'https://picsum.photos/seed/user4/40/40', rating: 4, comment: 'Great introduction to UI/UX. I learned a lot about Figma.' },
        { id: 3, author: 'Sarah Wilson', avatarUrl: 'https://picsum.photos/seed/user5/40/40', rating: 5, comment: 'The best UI/UX course I have taken so far. Highly recommended!' }
    ],
    webinars: [
        { id: 1, title: 'Live Q&A with David Miller', date: 'June 25, 2024 @ 2:00 PM', status: 'live', joinUrl: '#' },
        { id: 2, title: 'Advanced Prototyping Workshop', date: 'July 2, 2024 @ 11:00 AM', status: 'upcoming' },
        { id: 3, title: 'AMA: Career in UX Design', date: 'June 18, 2024 @ 3:00 PM', status: 'ended' },
    ],
    chatHistory: [
        { id: 1, text: "Hello! I'm your AI assistant for this course. How can I help you learn UI/UX design?", sender: 'bot', timestamp: '10:00 AM' }
    ],
    whatYouWillLearn: [
      'Master the principles of user-centered design',
      'Conduct effective user research and usability testing',
      'Create professional wireframes and high-fidelity prototypes',
      'Design intuitive interfaces for mobile and web',
      'Build a strong UI/UX design portfolio'
    ],
    requirements: [
      'No prior design experience required',
      'A computer with Figma (free version is fine)',
      'Willingness to learn and experiment'
    ],
    instructorBio: 'David is a Senior Product Designer with over 10 years of experience in the tech industry. He has worked with top-tier companies and startups to build user-centric digital products.',
    features: [
      'Hands-on projects',
      'AI-powered grading',
      'Live Q&A sessions',
      'Certificate of completion'
    ]
  },
  {
    id: 2,
    title: 'Advanced Python for Data Science',
    category: 'Python',
    instructor: 'Emily Carter',
    duration: '8 Weeks',
    description: 'Dive deep into Python libraries like Pandas, NumPy, and Scikit-learn. Work on real-world datasets and build predictive models.',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d4fd4345c60a?w=600&h=400&fit=crop',
    price: 60000,
    rating: 4.9,
    enrollmentCount: 980,
    modules: 6,
    progress: 25,
    completed: false,
    content: [
      { id: 201, title: 'Python for Data Analysis', progress: 50, lessons: [
        { id: 2011, title: 'NumPy Basics', duration: '20 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
        { id: 2012, title: 'Pandas DataFrames', duration: '30 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: false },
      ]},
      { id: 202, title: 'Machine Learning Fundamentals', progress: 0, lessons: [
        { id: 2021, title: 'Linear Regression', duration: '40 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: false },
        { id: 2022, title: 'Classification with Scikit-learn', duration: '45 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: false },
      ]},
    ],
    projects: [
      { id: 201, title: 'Analyze a Housing Dataset', description: 'Use Pandas and NumPy to clean and analyze a dataset of housing prices.', isSubmitted: false },
      { id: 202, title: 'Predict Customer Churn', description: 'Build a machine learning model to predict which customers are likely to churn.', isSubmitted: false }
    ],
    reviews: [
        { id: 1, author: 'Alex Morgan', avatarUrl: 'https://picsum.photos/seed/user-avatar/40/40', rating: 5, comment: 'This course is a game changer for data science. Emily is an amazing instructor.' },
        { id: 2, author: 'Michael Chen', avatarUrl: 'https://picsum.photos/seed/instructor2/40/40', rating: 4, comment: 'Very detailed and well-structured. The projects are challenging but rewarding.' }
    ],
    prerequisiteCourseIds: [4],
    chatHistory: [
        { id: 1, text: "Welcome to Advanced Python! Ask me anything about Pandas, NumPy, or machine learning concepts.", sender: 'bot', timestamp: '11:00 AM' }
    ],
    whatYouWillLearn: [
      'Advanced data manipulation with Pandas',
      'Numerical computing with NumPy',
      'Machine learning algorithms with Scikit-learn',
      'Data visualization with Matplotlib and Seaborn',
      'Building and evaluating predictive models'
    ],
    requirements: [
      'Basic knowledge of Python',
      'Understanding of basic statistics',
      'Python installed on your computer'
    ],
    instructorBio: 'Emily is a Data Scientist and Python expert with a passion for teaching. She has a PhD in Computer Science and years of experience in the field.',
    features: [
      'Real-world datasets',
      'Interactive coding exercises',
      'Expert feedback',
      'Career guidance'
    ]
  },
  {
    id: 3,
    title: 'Social Media Marketing Strategy',
    category: 'Web Development',
    instructor: 'Michael Chen',
    duration: '4 Weeks',
    description: 'Learn to create and implement effective social media strategies across various platforms to grow brands and engage audiences.',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop',
    price: 35000,
    rating: 4.7,
    enrollmentCount: 2100,
    modules: 4,
    progress: 90,
    completed: false,
    content: [
      { id: 301, title: 'Social Media Fundamentals', progress: 100, lessons: [
        { id: 3011, title: 'The Social Media Landscape', duration: '15 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
        { id: 3012, title: 'Defining Your Target Audience', duration: '20 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
      ]},
      { id: 302, title: 'Content Strategy', progress: 80, lessons: [
        { id: 3021, title: 'Creating Engaging Content', duration: '25 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
        { id: 3022, title: 'Content Calendars and Scheduling', duration: '15 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: false },
      ]},
    ],
    projects: [
      { id: 301, title: 'Create a Social Media Audit', description: 'Perform an audit of a brand\'s current social media presence and provide recommendations.', isSubmitted: false },
      { id: 302, title: 'Develop a 30-Day Content Plan', description: 'Create a detailed content calendar for a brand for the next 30 days.', isSubmitted: false }
    ],
    reviews: [
        { id: 1, author: 'Sarah Wilson', avatarUrl: 'https://picsum.photos/seed/user5/40/40', rating: 5, comment: 'I learned how to build a real marketing strategy. This course is worth every penny.' },
        { id: 2, author: 'David Miller', avatarUrl: 'https://picsum.photos/seed/instructor1/40/40', rating: 4, comment: 'Good overview of social media platforms and strategy.' }
    ],
    chatHistory: [
        { id: 1, text: "Hi there! I'm your AI assistant for Social Media Marketing. Let's create some amazing campaigns together!", sender: 'bot', timestamp: '12:00 PM' }
    ],
    whatYouWillLearn: [
      'Develop a comprehensive social media strategy',
      'Create engaging content for different platforms',
      'Understand social media analytics and reporting',
      'Manage social media advertising campaigns',
      'Build and engage online communities'
    ],
    requirements: [
      'Basic understanding of social media platforms',
      'Interest in marketing and brand building',
      'No prior marketing experience needed'
    ],
    instructorBio: 'Michael is a Digital Marketing Strategist with a focus on social media. He has helped numerous brands grow their online presence and reach their target audience.',
    features: [
      'Case studies of successful campaigns',
      'Practical assignments',
      'Networking opportunities',
      'Industry-recognized certificate'
    ]
  },
  {
    id: 4,
    title: 'Introduction to Web Development',
    category: 'Web Development',
    instructor: 'Sarah Jenkins',
    duration: '10 Weeks',
    description: 'The complete beginner\'s guide to web development. Learn HTML, CSS, and JavaScript from scratch and build your first websites.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    price: 55000,
    rating: 4.8,
    enrollmentCount: 3200,
    modules: 8,
    progress: 100,
    completed: true,
    content: [
      { id: 401, title: 'HTML & CSS Basics', progress: 100, lessons: [
        { id: 4011, title: 'Introduction to HTML', duration: '15 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
        { id: 4012, title: 'Styling with CSS', duration: '20 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
      ]},
      { id: 402, title: 'JavaScript Fundamentals', progress: 100, lessons: [
        { id: 4021, title: 'Variables and Data Types', duration: '25 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
        { id: 4022, title: 'Functions and Control Flow', duration: '30 min', type: 'video', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isCompleted: true },
      ]},
    ],
    projects: [
      { id: 1, title: 'Build a Personal Portfolio Website', description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript.', isSubmitted: true, score: 92, feedback: 'Great job, Alex! Your portfolio is visually appealing and fully responsive. Consider adding a contact form with validation for the next iteration.' }
    ],
    reviews: [],
    chatHistory: [
      { id: 1, text: "Hello! Ready to learn Web Development? I'm here to help you with HTML, CSS, and JavaScript questions.", sender: 'bot', timestamp: '01:00 PM' }
    ],
    whatYouWillLearn: [
      'Build websites with HTML and CSS',
      'Add interactivity with JavaScript',
      'Understand responsive web design',
      'Learn the basics of web accessibility',
      'Deploy your websites to the web'
    ],
    requirements: [
      'No prior coding experience required',
      'A computer with a web browser',
      'A text editor (like VS Code)'
    ],
    instructorBio: 'Sarah is a Full-Stack Developer and educator. She loves building things for the web and helping others start their journey in tech.',
    features: [
      'Step-by-step tutorials',
      'Code-along projects',
      'Supportive community',
      'Lifetime access to materials'
    ]
  },
  {
    id: 5,
    title: 'Mastering Microsoft Excel',
    category: 'Excel',
    instructor: 'Robert Wilson',
    duration: '5 Weeks',
    description: 'Go from beginner to pro in Microsoft Excel. Learn formulas, pivot tables, data visualization, and automation.',
    imageUrl: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?w=600&h=400&fit=crop',
    price: 25000,
    rating: 4.6,
    enrollmentCount: 4500,
    modules: 6,
    progress: 0,
    completed: false,
    content: [
      { id: 501, title: 'Excel Essentials', progress: 0, lessons: [
        { id: 5011, title: 'Getting Started with Excel', duration: '10 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
        { id: 5012, title: 'Basic Formulas and Functions', duration: '20 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
      ]},
      { id: 502, title: 'Data Visualization', progress: 0, lessons: [
        { id: 5021, title: 'Creating Charts and Graphs', duration: '25 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
        { id: 5022, title: 'PivotTables and Data Analysis', duration: '30 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
      ]},
    ],
    projects: [
      { id: 501, title: 'Sales Data Analysis', description: 'Analyze a sales dataset and create a dashboard with charts and PivotTables.', isSubmitted: false },
      { id: 502, title: 'Budget Tracker', description: 'Create a dynamic budget tracker with formulas and data validation.', isSubmitted: false }
    ],
    reviews: [],
    whatYouWillLearn: [
      'Master essential Excel formulas and functions',
      'Create dynamic charts and dashboards',
      'Analyze large datasets with PivotTables',
      'Automate repetitive tasks with Macros',
      'Clean and transform data with Power Query'
    ],
    requirements: [
      'Microsoft Excel installed (any recent version)',
      'Basic computer literacy'
    ],
    instructorBio: 'Robert is a business analyst and Excel expert with over 15 years of experience training corporate teams.',
    features: [
      'Downloadable practice files',
      'Real-world business cases',
      'Quizzes and assessments'
    ]
  },
  {
    id: 6,
    title: 'JavaScript: The Complete Guide',
    category: 'JavaScript',
    instructor: 'James Obalola',
    duration: '12 Weeks',
    description: 'Master JavaScript from the basics to advanced concepts like asynchronous programming, ES6+, and functional programming.',
    imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&h=400&fit=crop',
    price: 50000,
    rating: 4.9,
    enrollmentCount: 5600,
    modules: 12,
    progress: 0,
    completed: false,
    content: [
      { id: 601, title: 'JavaScript Basics', progress: 0, lessons: [
        { id: 6011, title: 'Variables and Constants', duration: '15 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
        { id: 6012, title: 'Operators and Expressions', duration: '20 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
      ]},
      { id: 602, title: 'Advanced JavaScript', progress: 0, lessons: [
        { id: 6021, title: 'Asynchronous Programming', duration: '35 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
        { id: 6022, title: 'ES6+ Features', duration: '30 min', type: 'video', videoUrl: 'https://www.youtube.com/embed/zHAa-m16NGk', isCompleted: false },
      ]},
    ],
    projects: [
      { id: 601, title: 'Build a Weather App', description: 'Use a weather API to build a simple weather application with JavaScript.', isSubmitted: false },
      { id: 602, title: 'Create a Task Manager', description: 'Build a task management app with local storage and advanced JavaScript features.', isSubmitted: false }
    ],
    reviews: [],
    whatYouWillLearn: [
      'Deep dive into JavaScript engine and execution',
      'Master DOM manipulation and events',
      'Understand Promises, Async/Await, and AJAX',
      'Learn modern ES6+ syntax and features',
      'Build complex web applications'
    ],
    requirements: [
      'Basic HTML and CSS knowledge',
      'A computer and a text editor'
    ],
    instructorBio: 'James is a Senior Software Engineer and a passionate educator who has taught thousands of students worldwide.',
    features: [
      'Comprehensive curriculum',
      'Coding challenges',
      'Project-based learning'
    ]
  },
  {
    id: 7,
    title: 'Data Science with R and Python',
    category: 'Data Science',
    instructor: 'Dr. Linda Okafor',
    duration: '14 Weeks',
    description: 'A comprehensive path to becoming a data scientist. Learn statistical analysis, machine learning, and data visualization.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    price: 75000,
    rating: 4.8,
    enrollmentCount: 1800,
    modules: 15,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: [],
    whatYouWillLearn: [
      'Statistical inference and hypothesis testing',
      'Machine learning with Scikit-learn and Caret',
      'Data wrangling with Tidyverse and Pandas',
      'Deep learning basics with TensorFlow',
      'Communicating insights with R Markdown and Jupyter'
    ],
    requirements: [
      'Basic math and statistics knowledge',
      'No prior programming experience required'
    ],
    instructorBio: 'Dr. Linda is a researcher and data science consultant with a focus on predictive analytics in healthcare.',
    features: [
      'Capstone project with real data',
      'One-on-one mentoring',
      'Job placement support'
    ]
  },
  {
    id: 8,
    title: 'AWS Certified Solutions Architect',
    category: 'Amazon AWS',
    instructor: 'Samuel Adebayo',
    duration: '8 Weeks',
    description: 'Prepare for the AWS Solutions Architect Associate certification. Learn to design scalable and resilient cloud architectures.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    price: 65000,
    rating: 4.7,
    enrollmentCount: 2400,
    modules: 10,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: [],
    whatYouWillLearn: [
      'Design and deploy scalable systems on AWS',
      'Understand AWS core services: EC2, S3, RDS, VPC',
      'Implement security and compliance on the cloud',
      'Optimize costs and performance',
      'Prepare for the SAA-C03 exam'
    ],
    requirements: [
      'Basic understanding of networking and servers',
      'An AWS free tier account'
    ],
    instructorBio: 'Samuel is a Cloud Architect and AWS Certified Professional with extensive experience in cloud migration.',
    features: [
      'Exam simulation tests',
      'Hands-on labs',
      'Certification guide'
    ]
  },
  {
    id: 9,
    title: 'Digital Illustration with Procreate',
    category: 'Drawing',
    instructor: 'Victoria Chen',
    duration: '4 Weeks',
    description: 'Learn to create stunning digital art on your iPad. Master brushes, layers, and composition techniques in Procreate.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
    price: 30000,
    rating: 4.9,
    enrollmentCount: 3100,
    modules: 5,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: [],
    whatYouWillLearn: [
      'Master Procreate interface and tools',
      'Create custom brushes and textures',
      'Understand color theory and lighting',
      'Character design and environment painting',
      'Exporting art for print and web'
    ],
    requirements: [
      'iPad with Procreate installed',
      'Apple Pencil or compatible stylus'
    ],
    instructorBio: 'Victoria is a freelance digital illustrator whose work has been featured in several magazines and games.',
    features: [
      'Speed-painting demos',
      'Brush pack included',
      'Portfolio review'
    ]
  },
  {
    id: 10,
    title: 'React - The Complete Guide 2024',
    category: 'Web Development',
    instructor: 'Maximilian Schwarzmüller',
    duration: '48 hours',
    description: 'Dive deep into React.js with hooks, context, and more. Build high-performance web applications.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    price: 45000,
    rating: 4.9,
    enrollmentCount: 250000,
    modules: 30,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 11,
    title: 'Python for Financial Analysis',
    category: 'Python',
    instructor: 'Jose Portilla',
    duration: '20 hours',
    description: 'Use Python for financial data analysis, algorithmic trading, and portfolio management.',
    imageUrl: 'https://images.unsplash.com/photo-1611974714014-4b3211a99558?w=600&h=400&fit=crop',
    price: 55000,
    rating: 4.7,
    enrollmentCount: 45000,
    modules: 15,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 12,
    title: 'Machine Learning A-Z™',
    category: 'Data Science',
    instructor: 'Kirill Eremenko',
    duration: '45 hours',
    description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.',
    imageUrl: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&h=400&fit=crop',
    price: 65000,
    rating: 4.8,
    enrollmentCount: 150000,
    modules: 25,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 13,
    title: 'AWS Certified Cloud Practitioner',
    category: 'Amazon AWS',
    instructor: 'Stephane Maarek',
    duration: '15 hours',
    description: 'Pass the AWS Certified Cloud Practitioner Exam CLF-C02 with confidence.',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
    price: 35000,
    rating: 4.9,
    enrollmentCount: 85000,
    modules: 12,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 14,
    title: 'Excel VBA Programming',
    category: 'Excel',
    instructor: 'Leila Gharani',
    duration: '10 hours',
    description: 'Automate your Excel tasks with VBA and Macros. Save hours of manual work.',
    imageUrl: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=600&h=400&fit=crop',
    price: 30000,
    rating: 4.8,
    enrollmentCount: 35000,
    modules: 8,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 15,
    title: 'Node.js, Express & MongoDB',
    category: 'Web Development',
    instructor: 'Brad Traversy',
    duration: '35 hours',
    description: 'Build a full-stack social network application with Node.js, Express, and MongoDB.',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
    price: 40000,
    rating: 4.8,
    enrollmentCount: 95000,
    modules: 20,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 16,
    title: 'TypeScript Masterclass',
    category: 'JavaScript',
    instructor: 'Stephen Grider',
    duration: '25 hours',
    description: 'Master TypeScript by building real-world projects. Learn design patterns and best practices.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
    price: 45000,
    rating: 4.9,
    enrollmentCount: 65000,
    modules: 18,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 17,
    title: 'Tableau 2024 A-Z',
    category: 'Data Science',
    instructor: 'Kirill Eremenko',
    duration: '12 hours',
    description: 'Learn Tableau for Data Science step-by-step. Real-life data analytics exercises included.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    price: 30000,
    rating: 4.7,
    enrollmentCount: 42000,
    modules: 10,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 18,
    title: 'Docker and Kubernetes',
    category: 'Amazon AWS',
    instructor: 'Stephen Grider',
    duration: '22 hours',
    description: 'Build, test, and deploy Docker applications with Kubernetes. Learn CI/CD workflows.',
    imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=600&h=400&fit=crop',
    price: 50000,
    rating: 4.9,
    enrollmentCount: 75000,
    modules: 16,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 19,
    title: 'Graphic Design Bootcamp',
    category: 'Drawing',
    instructor: 'Derrick Mitchell',
    duration: '15 hours',
    description: 'Learn Photoshop, Illustrator, and InDesign from scratch. Build a professional portfolio.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
    price: 35000,
    rating: 4.8,
    enrollmentCount: 55000,
    modules: 14,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 20,
    title: 'Next.js 14 Full Course',
    category: 'Web Development',
    instructor: 'Lee Robinson',
    duration: '12 hours',
    description: 'Master Next.js 14 with App Router, Server Components, and Server Actions.',
    imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=400&fit=crop',
    price: 45000,
    rating: 4.9,
    enrollmentCount: 32000,
    modules: 10,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 21,
    title: 'Python for DevOps',
    category: 'Python',
    instructor: 'Nana Janashia',
    duration: '18 hours',
    description: 'Learn Python for automation, scripting, and cloud infrastructure management.',
    imageUrl: 'https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=600&h=400&fit=crop',
    price: 50000,
    rating: 4.8,
    enrollmentCount: 28000,
    modules: 12,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 22,
    title: 'Advanced SQL for Data Analytics',
    category: 'Data Science',
    instructor: 'Colt Steele',
    duration: '10 hours',
    description: 'Master complex queries, window functions, and performance optimization in SQL.',
    imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd54867e?w=600&h=400&fit=crop',
    price: 25000,
    rating: 4.9,
    enrollmentCount: 48000,
    modules: 8,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 23,
    title: 'AWS Security Specialty',
    category: 'Amazon AWS',
    instructor: 'Zeal Vora',
    duration: '25 hours',
    description: 'Master AWS security services and pass the AWS Certified Security - Specialty exam.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
    price: 60000,
    rating: 4.8,
    enrollmentCount: 15000,
    modules: 18,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 24,
    title: 'Advanced React Patterns',
    category: 'Web Development',
    instructor: 'Kent C. Dodds',
    duration: '15 hours',
    description: 'Learn advanced React patterns like compound components, render props, and hooks.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=400&fit=crop',
    price: 55000,
    rating: 4.9,
    enrollmentCount: 12000,
    modules: 10,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 25,
    title: 'Python for Cybersecurity',
    category: 'Python',
    instructor: 'Heath Adams',
    duration: '22 hours',
    description: 'Learn to use Python for ethical hacking, network security, and automation.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
    price: 45000,
    rating: 4.8,
    enrollmentCount: 22000,
    modules: 14,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 26,
    title: 'Excel Data Analysis with Power BI',
    category: 'Excel',
    instructor: 'Chris Dutton',
    duration: '18 hours',
    description: 'Master data modeling and visualization using Excel and Power BI.',
    imageUrl: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?w=600&h=400&fit=crop',
    price: 35000,
    rating: 4.7,
    enrollmentCount: 38000,
    modules: 12,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 27,
    title: 'Deep Learning Specialization',
    category: 'Data Science',
    instructor: 'Andrew Ng',
    duration: '60 hours',
    description: 'Master Deep Learning, and break into AI. Learn Neural Networks, CNNs, and RNNs.',
    imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600&h=400&fit=crop',
    price: 85000,
    rating: 4.9,
    enrollmentCount: 450000,
    modules: 40,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 28,
    title: 'AWS Certified Developer Associate',
    category: 'Amazon AWS',
    instructor: 'Neal Davis',
    duration: '20 hours',
    description: 'Master AWS development and pass the DVA-C02 exam with hands-on labs.',
    imageUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=600&h=400&fit=crop',
    price: 40000,
    rating: 4.8,
    enrollmentCount: 52000,
    modules: 15,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 29,
    title: 'Creative Coding with p5.js',
    category: 'Drawing',
    instructor: 'Daniel Shiffman',
    duration: '10 hours',
    description: 'Learn to code artistic visuals and interactive animations using p5.js.',
    imageUrl: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=600&h=400&fit=crop',
    price: 25000,
    rating: 4.9,
    enrollmentCount: 18000,
    modules: 8,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 30,
    title: 'Full Stack JavaScript with MERN',
    category: 'JavaScript',
    instructor: 'John Smilga',
    duration: '40 hours',
    description: 'Build and deploy a full-stack MERN application (MongoDB, Express, React, Node).',
    imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop',
    price: 50000,
    rating: 4.8,
    enrollmentCount: 72000,
    modules: 25,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 31,
    title: 'Data Engineering with Python',
    category: 'Data Science',
    instructor: 'Andreas Kretz',
    duration: '25 hours',
    description: 'Learn to build data pipelines, ETL processes, and data warehouses with Python.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    price: 60000,
    rating: 4.7,
    enrollmentCount: 14000,
    modules: 18,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 32,
    title: 'AWS SysOps Administrator',
    category: 'Amazon AWS',
    instructor: 'Adrian Cantrill',
    duration: '30 hours',
    description: 'Master AWS operations and pass the SysOps Administrator Associate exam.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    price: 55000,
    rating: 4.9,
    enrollmentCount: 21000,
    modules: 22,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  },
  {
    id: 33,
    title: 'Advanced CSS and Sass',
    category: 'Web Development',
    instructor: 'Jonas Schmedtmann',
    duration: '28 hours',
    description: 'Master modern CSS, Sass, Flexbox, and Grid. Build beautiful and responsive websites.',
    imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&h=400&fit=crop',
    price: 35000,
    rating: 4.9,
    enrollmentCount: 110000,
    modules: 18,
    progress: 0,
    completed: false,
    content: [],
    projects: [],
    reviews: []
  }
];

export const mockAchievements: Achievement[] = [
    {
        id: 1,
        title: 'Course Completist',
        description: 'Finish your first course',
        icon: <Icon name="award" className="w-6 h-6 text-yellow-500" />
    },
    {
        id: 2,
        title: 'Quick Learner',
        description: 'Complete a course in 7 days',
        icon: <Icon name="trendingUp" className="w-6 h-6 text-green-500" />
    },
    {
        id: 3,
        title: 'Community Helper',
        description: 'Post 10 helpful messages',
        icon: <Icon name="community" className="w-6 h-6 text-[#219BD5]" />
    },
    {
        id: 4,
        title: 'Perfect Score',
        description: 'Get 100% on a project',
        icon: <Icon name="star" className="w-6 h-6 text-purple-500" />
    }
];

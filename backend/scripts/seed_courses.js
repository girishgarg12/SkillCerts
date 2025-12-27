import mongoose from 'mongoose';
import { Course } from '../model/course.model.js';
import { User } from '../model/user.model.js';
import { Category } from '../model/category.model.js';
import { env } from '../utils/env.js';
import bcrypt from 'bcrypt';

const sampleCourses = [
  // ... (same sampleCourses array) ...
  {
    title: 'Complete Web Development Bootcamp',
    description: 'Learn full-stack web development from scratch. HTML, CSS, Javascript, React, Node.js and more.',
    thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=2670&auto=format&fit=crop',
    price: 99.99,
    isFree: false,
    level: 'beginner',
    language: 'English',
    categoryName: 'Web Development',
    published: true,
  },
  {
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts, hooks, and performance optimization techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2670&auto=format&fit=crop',
    price: 79.99,
    isFree: false,
    level: 'advanced',
    language: 'English',
    categoryName: 'Web Development',
    published: true,
  },
  {
    title: 'Data Science for Beginners',
    description: 'Introduction to Python programming and data analysis libraries like Pandas and NumPy.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
    price: 89.99,
    isFree: false,
    level: 'beginner',
    language: 'English',
    categoryName: 'Data Science',
    published: true,
  },
  {
    title: 'Machine Learning A-Z',
    description: 'Hands-on machine learning course using Python. Build predictive models and neural networks.',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2665&auto=format&fit=crop',
    price: 129.99,
    isFree: false,
    level: 'intermediate',
    language: 'English',
    categoryName: 'Machine Learning',
    published: true,
  },
  {
    title: 'UI/UX Design Masterclass',
    description: 'Design beautiful user interfaces and user experiences using Figma and Adobe XD.',
    thumbnail: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=2680&auto=format&fit=crop',
    price: 69.99,
    isFree: false,
    level: 'beginner',
    language: 'English',
    categoryName: 'UI/UX Design',
    published: true,
  },
  {
    title: 'Mobile App Development with Flutter',
    description: 'Build native iOS and Android apps using a single codebase with Flutter and Dart. This comprehensive course takes you from zero to hero in mobile app development.',
    thumbnail: '/Mobileapp.png',
    price: 109.99,
    isFree: false,
    level: 'intermediate',
    language: 'English',
    categoryName: 'Mobile Dev',
    published: true,
    learningOutcomes: [
        'Build beautiful, fast and native-quality apps with Flutter',
        'Become a fully-fledged Flutter developer',
        'Build iOS and Android apps with just one codebase',
        'Build a portfolio of beautiful Flutter apps to impress any recruiter',
        'Understand all the fundamental concepts of Flutter development',
        'Master the Dart programming language'
    ],
    requirements: [
        'Basic programming knowledge helps but is not required',
        'A computer (Windows, Mac, or Linux)',
        'No previous Flutter or Dart experience needed'
    ]
  },
  {
    title: 'DevOps Engineer Professional',
    description: 'Master Docker, Kubernetes, Jenkins, and AWS to become a certified DevOps engineer. Learn the industry-standard CI/CD pipelines and infrastructure as code.',
    thumbnail: '/devops.png',
    price: 149.99,
    isFree: false,
    level: 'advanced',
    language: 'English',
    categoryName: 'DevOps',
    published: true,
    learningOutcomes: [
        'Master Docker and Containerization',
        'Orchestrate applications with Kubernetes',
        'Build CI/CD pipelines with Jenkins and GitHub Actions',
        'Infrastructure as Code (IaC) with Terraform',
        'AWS Cloud Services for DevOps',
        'Monitoring and Logging with Prometheus and Grafana'
    ],
    requirements: [
        'Basic understanding of Linux commands',
        'Familiarity with at least one scripting language (Python/Bash)',
        'Basic networking knowledge'
    ]
  },
  {
    title: 'Cybersecurity Fundamentals',
    description: 'Learn the basics of ethical hacking, network security, and cryptography. Prepare for standard industry certifications and secure your digital assets.',
    thumbnail: '/cyber.png',
    price: 89.99,
    isFree: false,
    level: 'beginner',
    language: 'English',
    categoryName: 'Cybersecurity',
    published: true,
    learningOutcomes: [
        'Understand the core principles of Information Security',
        'Learn about Network Security and Protocols',
        'Master the basics of Ethical Hacking and Penetration Testing',
        'Cryptography and securing data',
        'Identify and mitigate common security threats',
        'Security governance and compliance'
    ],
    requirements: [
        'Basic computer skills',
        'No prior cybersecurity experience required',
        'Willingness to learn and explore'
    ]
  },
  {
    title: 'Blockchain & Cryptography',
    description: 'Understand how blockchain works internally and build your own cryptocurrency. Deep dive into smart contracts and decentralized applications.',
    thumbnail: 'https://plus.unsplash.com/premium_photo-1681400678259-255b10890b08?q=80&w=2679&auto=format&fit=crop',
    price: 119.99,
    isFree: false,
    level: 'intermediate',
    language: 'English',
    categoryName: 'Blockchain',
    published: true,
    learningOutcomes: [
        'Understand the theory and technical underpinnings of Blockchain',
        'Build your own blockchain from scratch',
        'Develop Smart Contracts using Solidity',
        'Create Decentralized Applications (DApps)',
        'Understanding Consensus Mechanisms',
        'Tokenization and DeFi fundamentals'
    ],
    requirements: [
        'Basic Javascript or Python knowledge',
        'Basic understanding of data structures'
    ]
  }
];

const seedCourses = async () => {
  try {
    const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/course-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Create or Find an Instructor
    let instructor = await User.findOne({ email: 'instructor@example.com' });
    if (!instructor) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        instructor = await User.create({
            name: 'John Instructor',
            email: 'instructor@example.com',
            passwordHash: hashedPassword,
            role: 'instructor'
        });
        console.log('✅ Created dummy instructor');
    }

    // 2. Clear existing data
    await Course.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing courses and categories');

    // 3. Create Courses with Categories
    const coursesToCreate = [];
    
    for (const courseData of sampleCourses) {
        // Find or create category
        const slug = courseData.categoryName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        let category = await Category.findOne({ slug });
        
        if (!category) {
            category = await Category.create({
                name: courseData.categoryName,
                slug: slug
            });
        }

        coursesToCreate.push({
            ...courseData,
            category: category._id,
            instructor: instructor._id,
            slug: courseData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim()
        });
    }

    await Course.insertMany(coursesToCreate);
    console.log(`✅ Successfully seeded ${coursesToCreate.length} courses`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();

/**
 * Add Comprehensive News Articles Script
 * Adds detailed news articles to the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Article = require('../models/Article');
const User = require('../models/User');

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studywave';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function addNewsArticles() {
  console.log('📰 Adding comprehensive news articles...\n');
  
  try {
    // Find admin user to be the author
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Please run seed script first.');
      return;
    }

    const newsArticles = [
      {
        title: 'Digital Learning Initiative Launched by Ministry of Education',
        summary: 'The Ministry of National Education has launched an ambitious digital learning initiative aimed at modernizing education across Morocco.',
        content: `The Ministry of National Education, Preschool and Sports has launched an ambitious digital learning initiative aimed at modernizing education across Morocco. This comprehensive program represents a significant step forward in the country's commitment to educational excellence and technological advancement.

## Key Components of the Initiative

### Digital Infrastructure
The initiative includes the implementation of state-of-the-art digital attendance systems that utilize QR code technology for seamless student tracking. This system has already shown remarkable results in pilot programs, reducing administrative overhead by up to 60% while significantly improving accuracy.

### Online Learning Platforms
New online learning platforms are being deployed across educational institutions, providing students and teachers with access to:
- Interactive digital textbooks and resources
- Virtual classroom environments
- Real-time collaboration tools
- Assessment and grading systems
- Progress tracking and analytics

### Enhanced Connectivity
The program includes major infrastructure improvements to ensure reliable internet connectivity in schools across Morocco, particularly in rural areas where access has been limited.

## Implementation Timeline

The rollout is planned in three phases:
1. **Phase 1 (2024)**: Major urban centers including Rabat, Casablanca, and Fez
2. **Phase 2 (2025)**: Secondary cities and regional centers
3. **Phase 3 (2026)**: Rural areas and remote communities

## Expected Impact

This initiative is expected to:
- Improve educational outcomes for over 2 million students
- Enhance teacher effectiveness through digital tools
- Reduce administrative burden on educational staff
- Provide better data for educational planning and policy-making
- Bridge the digital divide between urban and rural areas

The Ministry has allocated significant resources to ensure the success of this program, including comprehensive teacher training and ongoing technical support.`,
        author: admin._id,
        category: 'announcement',
        status: 'published',
        isImportant: true,
        tags: ['Digital Learning', 'Technology', 'Education Reform', 'QR Codes'],
        publishedAt: new Date('2024-01-15'),
        visibility: 'public',
        source: 'Ministry of National Education',
        priority: 'high',
        images: [{
          url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center',
          alt: 'Digital learning classroom with students using tablets'
        }]
      },
      {
        title: 'Major Universities Adopt Modern Attendance Tracking Systems',
        summary: 'Following the success of pilot programs, major universities in Rabat, Casablanca, and Fez are now adopting modern attendance tracking systems.',
        content: `Following the success of pilot programs, major universities in Rabat, Casablanca, and Fez are now adopting modern attendance tracking systems. The QR code-based approach has revolutionized how educational institutions manage student attendance and engagement.

## Pilot Program Results

The initial pilot programs conducted at three major universities showed exceptional results:
- **60% reduction** in administrative overhead
- **95% accuracy** in attendance tracking
- **40% improvement** in student engagement metrics
- **Significant time savings** for faculty and staff

## University Adoption Details

### Mohammed V University - Rabat
The flagship university has implemented the system across all faculties, serving over 80,000 students. The implementation includes:
- QR code scanners in all lecture halls
- Mobile app integration for students
- Real-time attendance dashboards for professors
- Automated reporting systems for administration

### Hassan II University - Casablanca
With over 120,000 students, this implementation represents one of the largest deployments of digital attendance systems in North Africa. Key features include:
- Multi-language support (Arabic, French, English)
- Integration with existing student information systems
- Advanced analytics and reporting capabilities
- Mobile-first design for accessibility

### Sidi Mohamed Ben Abdellah University - Fez
This historic university has embraced modern technology while maintaining its traditional values:
- Seamless integration with traditional teaching methods
- Respect for cultural and linguistic diversity
- Enhanced security features for student privacy
- Comprehensive training programs for faculty

## Technical Implementation

The system utilizes cutting-edge technology including:
- **QR Code Generation**: Unique codes for each class session
- **Mobile Applications**: Cross-platform apps for iOS and Android
- **Cloud Infrastructure**: Scalable and secure data management
- **Analytics Dashboard**: Real-time insights and reporting
- **API Integration**: Seamless connection with existing systems

## Future Expansion

Plans are underway to expand this system to:
- All public universities in Morocco by 2025
- Private educational institutions
- Technical and vocational schools
- International campuses and partnerships

The success of this initiative demonstrates Morocco's commitment to educational innovation and technological advancement in higher education.`,
        author: admin._id,
        category: 'news',
        status: 'published',
        isImportant: false,
        tags: ['Universities', 'QR Codes', 'Attendance', 'Higher Education'],
        publishedAt: new Date('2024-01-10'),
        visibility: 'public',
        source: 'University Consortium',
        priority: 'normal',
        images: [{
          url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop&crop=center',
          alt: 'University students in modern lecture hall'
        }]
      },
      {
        title: 'Moroccan Students Excel at International Science Fair',
        summary: 'A team of Moroccan students has achieved remarkable success at the International Science and Engineering Fair.',
        content: `A team of Moroccan students has achieved remarkable success at the International Science and Engineering Fair, bringing home gold and silver medals in various categories including robotics, environmental science, and mathematics. This outstanding achievement highlights the excellence of Morocco's educational system and the dedication of its students.

## Award Winners

### Gold Medal Recipients
- **Fatima El Zahra** - Environmental Science: "Solar-Powered Water Purification System for Rural Communities"
- **Ahmed Bennani** - Robotics: "AI-Powered Agricultural Monitoring Drone"
- **Yasmine Alaoui** - Mathematics: "Advanced Algorithms for Traffic Optimization"

### Silver Medal Recipients
- **Omar Chakir** - Computer Science: "Blockchain-Based Student Credential Verification"
- **Aicha Berrada** - Chemistry: "Biodegradable Plastic Alternatives from Agricultural Waste"
- **Youssef Tazi** - Physics: "Renewable Energy Storage Solutions"

## Project Highlights

### Environmental Innovation
The winning environmental science project developed a revolutionary solar-powered water purification system specifically designed for rural Moroccan communities. The system:
- Uses locally available materials
- Requires minimal maintenance
- Provides clean water for up to 500 people daily
- Costs 70% less than traditional purification methods

### Robotics Excellence
The gold medal robotics project created an AI-powered drone system for agricultural monitoring that:
- Analyzes crop health using computer vision
- Optimizes irrigation patterns
- Predicts harvest yields with 90% accuracy
- Reduces water usage by up to 40%

### Mathematical Innovation
The mathematics project developed advanced algorithms that:
- Reduce urban traffic congestion by 35%
- Optimize public transportation routes
- Minimize environmental impact
- Improve overall city efficiency

## Educational Impact

This success reflects the strength of Morocco's STEM education programs:
- **Enhanced Curriculum**: Focus on practical problem-solving
- **Modern Laboratories**: State-of-the-art equipment and facilities
- **Qualified Teachers**: Ongoing professional development programs
- **International Partnerships**: Collaboration with global institutions

## Recognition and Support

The Ministry of National Education has announced:
- Scholarship opportunities for all medal winners
- Funding for project development and commercialization
- Mentorship programs with industry experts
- Support for international patent applications

## Future Initiatives

Building on this success, new programs will include:
- Expanded STEM education in rural areas
- International exchange programs
- Innovation incubators in schools
- Industry partnership programs

This achievement demonstrates Morocco's growing reputation as a center of educational excellence and innovation in the region.`,
        author: admin._id,
        category: 'news',
        status: 'published',
        isImportant: true,
        tags: ['Students', 'Science Fair', 'Innovation', 'STEM', 'Awards'],
        publishedAt: new Date('2024-01-08'),
        visibility: 'public',
        source: 'International Science Fair Committee',
        priority: 'high',
        images: [{
          url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=600&fit=crop&crop=center',
          alt: 'Students presenting their science projects'
        }]
      },
      {
        title: 'Nationwide Teacher Digital Training Initiative Launched',
        summary: 'A nationwide training initiative has been launched to equip teachers with skills in digital classroom management.',
        content: `A nationwide training initiative has been launched to equip teachers with skills in digital classroom management, online assessment tools, and student engagement platforms. This comprehensive program represents a significant investment in Morocco's educational workforce.

## Program Overview

The Teacher Digital Competency Program is a comprehensive initiative designed to prepare educators for the digital age of education. The program addresses the growing need for digital literacy among teaching professionals and ensures that Morocco's educators are equipped with the latest tools and methodologies.

## Training Components

### Digital Classroom Management
Teachers will learn to:
- Utilize interactive whiteboards and digital displays
- Manage online learning environments
- Coordinate hybrid classroom settings
- Implement digital attendance systems
- Use educational software and applications

### Online Assessment Tools
The program covers:
- Creating digital assessments and quizzes
- Using automated grading systems
- Providing digital feedback to students
- Tracking student progress online
- Maintaining academic integrity in digital environments

### Student Engagement Platforms
Training includes:
- Interactive presentation tools
- Gamification techniques for learning
- Virtual collaboration platforms
- Social learning environments
- Mobile learning applications

## Implementation Strategy

### Phase 1: Urban Centers (2024)
- 15,000 teachers in major cities
- Intensive 40-hour training programs
- Hands-on workshops and practical sessions
- Certification upon completion

### Phase 2: Regional Expansion (2024-2025)
- 25,000 teachers in secondary cities
- Blended learning approach
- Peer mentoring programs
- Ongoing support and resources

### Phase 3: Rural Outreach (2025-2026)
- 20,000 teachers in rural areas
- Mobile training units
- Satellite internet connectivity
- Community-based learning centers

## Training Methodology

The program employs innovative training methods:
- **Hands-on Learning**: Practical experience with digital tools
- **Peer Collaboration**: Teachers learning from teachers
- **Mentorship Programs**: Experienced digital educators as guides
- **Continuous Support**: Ongoing assistance and resources
- **Assessment and Certification**: Formal recognition of competencies

## Expected Outcomes

Upon completion, teachers will be able to:
- Effectively integrate technology into their teaching
- Create engaging digital learning experiences
- Assess student performance using digital tools
- Collaborate with colleagues and students online
- Adapt to emerging educational technologies

## Support Infrastructure

The program includes:
- **Technical Support**: 24/7 helpdesk for technical issues
- **Resource Library**: Comprehensive digital teaching materials
- **Community Forums**: Peer support and knowledge sharing
- **Regular Updates**: Training on new tools and technologies
- **Career Development**: Pathways for advancement in digital education

## Funding and Partnerships

The initiative is supported by:
- Ministry of National Education budget allocation
- International development partnerships
- Technology company sponsorships
- European Union educational grants
- World Bank educational development funds

This program positions Morocco as a leader in educational innovation and ensures that its teachers are prepared for the future of education.`,
        author: admin._id,
        category: 'news',
        status: 'published',
        isImportant: false,
        tags: ['Teacher Training', 'Digital Skills', 'Professional Development', 'Education Technology'],
        publishedAt: new Date('2024-01-05'),
        visibility: 'public',
        source: 'Teacher Development Institute',
        priority: 'normal',
        images: [{
          url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop&crop=center',
          alt: 'Teachers in digital training workshop'
        }]
      },
      {
        title: 'Morocco Wins Pan-African Robotics Cup with AI Innovation',
        summary: 'Moroccan students have won the prestigious Pan-African Robotics Cup with their innovative AI-powered logistics automation robot.',
        content: `Moroccan students have won the prestigious Pan-African Robotics Cup with their innovative AI-powered logistics automation robot. This groundbreaking achievement showcases Morocco's growing expertise in artificial intelligence and robotics education.

## Competition Details

The Pan-African Robotics Cup brought together the most talented young engineers and programmers from across the continent. Morocco's team, consisting of students from various technical institutes, demonstrated exceptional skill and innovation.

### The Winning Solution

The Moroccan team's logistics automation robot featured:
- **Advanced AI Navigation**: Real-time path planning and obstacle detection
- **Energy Efficiency**: Optimized power consumption extending operational time by 40%
- **Modular Design**: Adaptable components for various logistics scenarios
- **Autonomous Operation**: Minimal human intervention required

### Technical Specifications

- **Processing Power**: ARM-based microcontroller with dedicated AI chip
- **Sensors**: LiDAR, ultrasonic, and camera-based vision system
- **Communication**: 5G connectivity for remote monitoring
- **Battery Life**: 8-hour continuous operation
- **Payload Capacity**: Up to 50kg with precision handling

## Impact on Education

This victory has significant implications for Morocco's educational landscape:

### Immediate Benefits
- Increased funding for STEM programs
- Enhanced international recognition for Moroccan technical education
- Scholarship opportunities for team members
- Industry partnerships with logistics companies

### Long-term Vision
- Expansion of robotics clubs in secondary schools
- Integration of AI and robotics curricula
- Establishment of innovation labs in universities
- Development of local tech industry

## Ministry Support

The Ministry of National Education has announced comprehensive support including:
- **Equipment Grants**: Modern robotics kits for 100 schools
- **Teacher Training**: Specialized programs for robotics instruction
- **Competition Funding**: Annual national robotics championships
- **Industry Partnerships**: Internship programs with tech companies

This achievement positions Morocco as a leader in educational technology and innovation across Africa.`,
        author: admin._id,
        category: 'news',
        status: 'published',
        isImportant: true,
        tags: ['Robotics', 'AI', 'Innovation', 'STEM Education', 'Competition'],
        publishedAt: new Date('2024-08-10'),
        visibility: 'public',
        source: 'Pan-African Robotics Committee',
        priority: 'high',
        images: [{
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center',
          alt: 'Students working on robotics project'
        }]
      }
    ];

    // Check for existing articles and add only new ones
    const addedArticles = [];
    
    for (const articleData of newsArticles) {
      try {
        // Check if article already exists (by title)
        const existingArticle = await Article.findOne({
          title: articleData.title
        });

        if (!existingArticle) {
          const article = new Article(articleData);
          await article.save();
          addedArticles.push(article);
          console.log(`✅ Added: ${article.title}`);
        } else {
          console.log(`⏭️ Skipped existing: ${articleData.title}`);
        }
      } catch (error) {
        console.error(`❌ Error adding article: ${articleData.title}`, error.message);
      }
    }

    console.log(`\n🎉 Successfully added ${addedArticles.length} new articles!`);
    
    // Display summary
    if (addedArticles.length > 0) {
      console.log('\n📋 Added Articles:');
      addedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   Category: ${article.category}`);
        console.log(`   Important: ${article.isImportant ? 'Yes' : 'No'}`);
        console.log(`   Published: ${article.publishedAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    return addedArticles;

  } catch (error) {
    console.error('❌ Error adding articles:', error);
    return [];
  }
}

async function main() {
  console.log('📰 StudyWave News Articles Importer\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    const addedArticles = await addNewsArticles();
    
    console.log('\n📊 Summary:');
    console.log(`   Total articles processed: 5`);
    console.log(`   New articles added: ${addedArticles.length}`);
    console.log(`   Existing articles skipped: ${5 - addedArticles.length}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Visit the News page to see the new articles');
    console.log('   2. Test the article filtering by category');
    console.log('   3. Check the admin panel for article management');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { addNewsArticles };

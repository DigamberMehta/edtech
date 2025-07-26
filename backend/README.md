# EdTech Platform - Database Initialization Scripts

This folder contains scripts to initialize the EdTech platform with realistic dummy data for development and testing purposes.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend/init
npm install
```

### 2. Set Up Environment

Make sure your MongoDB connection is configured in the parent directory's `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/edtech
```

### 3. Initialize All Data

```bash
npm run init:all
```

This will create:

- **5 Tutors** with institutes and subjects
- **25 Students** with parent details and enrollments
- **15-25 Batches** with schedules and fee structures
- **500+ Attendance Records** with realistic patterns
- **200+ Tests** with results and grades
- **1000+ Fee Records** with payment tracking

## 📋 Individual Scripts

You can also run individual initialization scripts:

```bash
# Clear all data
npm run clear:all

# Initialize step by step
npm run init:users      # Create tutor and student user accounts
npm run init:tutors     # Create tutor profiles with institutes
npm run init:students   # Create student profiles with parent info
npm run init:batches    # Create batches and assign students
npm run init:attendance # Generate attendance records
npm run init:tests      # Create tests with results
npm run init:fees       # Generate fee records and payments
```

## 🔐 Default Login Credentials

After initialization, you can login with these credentials:

**Tutors:**

- Email: `tutor1@edtech.com` to `tutor5@edtech.com`
- Password: `password123`

**Students:**

- Email: `student1@edtech.com` to `student25@edtech.com`
- Password: `password123`

## 📊 Generated Data Overview

### Users & Profiles

- **Realistic Indian names** and phone numbers
- **Institute details** for tutors with subjects and experience
- **Student details** with parent information and school data
- **Profile images** placeholder support

### Academic Structure

- **Batch schedules** with realistic time slots and days
- **Subject variety** including Math, Physics, Chemistry, Biology, etc.
- **Fee structures** with monthly and registration fees in INR
- **Student-batch assignments** with capacity management

### Attendance & Performance

- **Realistic attendance patterns** (62.5% present, 25% absent, 12.5% late)
- **Academic year coverage** (June to May)
- **Test results** with proper grade distribution
- **Performance tracking** with ranks and percentages

### Financial Records

- **Monthly fee tracking** for each student-batch combination
- **Payment status distribution** (paid, pending, overdue)
- **Multiple payment methods** (cash, UPI, card, bank transfer)
- **Fee types** (monthly, registration, exam, material)

## 🗂️ File Structure

```
backend/init/
├── package.json          # Dependencies and scripts
├── database.js           # Database connection
├── utils.js              # Utility functions for generating realistic data
├── clearAll.js           # Clear all data from database
├── initUsers.js          # Initialize user accounts
├── initTutors.js         # Initialize tutor profiles
├── initStudents.js       # Initialize student profiles
├── initBatches.js        # Initialize batches and assignments
├── initAttendance.js     # Initialize attendance records
├── initTests.js          # Initialize tests and results
├── initFees.js           # Initialize fee records
├── initAll.js            # Main script to run everything
└── README.md             # This file
```

## 🔧 Customization

### Modify Data Quantities

Edit the individual script files to change the number of records:

```javascript
// In initUsers.js
for (let i = 0; i < 10; i++) {
  // Change from 5 to 10 tutors
  // ...
}

for (let i = 0; i < 50; i++) {
  // Change from 25 to 50 students
  // ...
}
```

### Add Custom Data

Extend the `utils.js` file to add more realistic data generators:

```javascript
// Add more Indian names
const firstNames = ["Arjun", "Aditi", "Your", "Custom", "Names"];

// Add more subjects
const subjects = ["Mathematics", "Physics", "Your", "Custom", "Subjects"];
```

### Environment Configuration

The scripts automatically load environment variables from `../env` but you can also set:

```bash
export MONGODB_URI="mongodb://your-custom-uri/database"
```

## ⚠️ Important Notes

1. **Data Consistency**: Scripts maintain referential integrity between collections
2. **Academic Calendar**: All dates follow June-to-May academic year pattern
3. **Realistic Patterns**: Attendance, grades, and payments follow realistic distributions
4. **Performance**: Full initialization takes 10-30 seconds depending on your system

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh
# or
mongo
```

### Permission Errors

```bash
# Ensure write permissions
chmod +x backend/init/*.js
```

### Dependency Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📈 Usage in Development

1. **API Testing**: Use generated data to test all endpoints
2. **Frontend Development**: Realistic data for UI/UX development
3. **Performance Testing**: Sufficient data volume for optimization
4. **Demo Purposes**: Professional-looking data for presentations

---

**Happy coding! 🚀**

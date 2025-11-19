// SIGN UP USER IMPLEMENTATION WITH MONGODB INTEGRATION
// ====================================================

## Overview
The Sign Up page now collects user data and sends it to MongoDB with duplicate checking. Users cannot sign up with the same email or name twice.

## Files Created/Modified

### 1. NEW: api/signUpUser.js
Backend API endpoint for user registration with duplicate detection:
- **POST /api/signUpUser** - Create new user account
  - Validates required fields (name, email)
  - Validates email format
  - Checks if user already exists (by email OR name)
  - Stores in "Users" collection with timestamps
  - Returns 409 Conflict if user exists
  - Returns 201 Created on success

- **GET /api/signUpUser?email=user@example.com** - Check if email exists
  - Optional: used for pre-validation

### 2. MODIFIED: src/components/pages/SignUp.jsx
Updated Sign Up component with:
- Form state management with error tracking
- Loading state for async submission
- API call to `/api/signUpUser` on form submit
- Error message display with validation feedback
- Success message display
- Disabled submit button during submission
- User-friendly error messages for different scenarios

### 3. MODIFIED: src/components/pages/SignUp.css
Added styling for:
- Error message box (red accent)
- Success message animations
- Disabled button state
- Slide animations for error/success messages

## Data Flow

### Sign Up Process:
1. User fills form with:
   - Name (required)
   - Email (required, validated)
   - Preferred Color (optional, defaults to teal)
   - Favorite Bible Verse (optional)
   - Would You Rather Answer (optional)

2. User clicks "Create Player Profile"

3. Frontend validates:
   - Name and email not empty
   - Email format is valid
   - Shows error if validation fails

4. Frontend sends POST to `/api/signUpUser`

5. Backend validates and checks MongoDB:
   - Validates required fields
   - Validates email format
   - Queries Users collection for duplicates
   - If found: Returns 409 with error message
   - If not found: Creates new user document

6. User sees success message or error

## MongoDB Users Collection

### Document Structure:
```javascript
{
  _id: ObjectId("..."),
  name: string,                    // Trimmed, unique
  email: string,                   // Lowercase, unique
  preferredColor: string,          // Hex color code
  favoriteBibleVerse: string|null, // Optional scripture
  wouldYouRatherAnswer: string|null, // Optional answer
  createdAt: Date,                 // Account creation timestamp
  updatedAt: Date                  // Last update timestamp
}
```

### Recommended Indexes:
```javascript
// Ensure unique emails
db.Users.createIndex({ email: 1 }, { unique: true })

// Ensure unique names
db.Users.createIndex({ name: 1 }, { unique: true })

// For querying by creation date
db.Users.createIndex({ createdAt: 1 })
```

## Error Handling

### Frontend:
- Displays user-friendly error messages
- Prevents submission while loading
- Clears errors when user starts typing

### Backend Errors:
- **400 Bad Request**: Missing name/email or invalid email format
- **409 Conflict**: User already exists (by email or name)
- **500 Server Error**: Database connection or insertion error

### API Response Examples:

**Success (201 Created):**
```javascript
{
  message: "User created successfully!",
  userId: ObjectId("..."),
  user: {
    name: "John Doe",
    email: "john@example.com",
    preferredColor: "#4ECDC4",
    favoriteBibleVerse: "...",
    wouldYouRatherAnswer: "...",
    createdAt: ISODate("2025-11-18T..."),
    updatedAt: ISODate("2025-11-18T...")
  }
}
```

**Duplicate Email (409 Conflict):**
```javascript
{
  message: "User already exists. An account with this email already exists.",
  existingUser: {
    id: ObjectId("..."),
    name: "John Doe",
    email: "john@example.com"
  }
}
```

**Duplicate Name (409 Conflict):**
```javascript
{
  message: "User already exists. An account with this name already exists.",
  existingUser: {
    id: ObjectId("..."),
    name: "John Doe",
    email: "john@example.com"
  }
}
```

**Invalid Input (400 Bad Request):**
```javascript
{
  message: "Invalid email format"
}
```

## Features

✅ **Duplicate Prevention**
- Checks by email (exact match, case-insensitive)
- Checks by name (exact match)

✅ **Data Validation**
- Server-side validation of all inputs
- Email format validation
- Required field validation

✅ **User Feedback**
- Real-time error messages
- Loading state during submission
- Success confirmation
- Clear indication of what went wrong

✅ **Security**
- Email stored in lowercase (prevents duplicates)
- Names stored trimmed (prevents duplicates)
- Server-side validation (never trust client)

✅ **Data Storage**
- Automatic timestamps for audit trail
- Structured document in MongoDB
- Ready for future expansions (profile picture, preferences, etc.)

## Testing the Feature

### Test Case 1: Successful Sign Up
1. Fill all fields with unique name and email
2. Click "Create Player Profile"
3. Should see success message
4. Check MongoDB Users collection for new document

### Test Case 2: Duplicate Email
1. Sign up with email: test@example.com
2. Try signing up again with same email
3. Should see error: "An account with this email already exists"

### Test Case 3: Duplicate Name
1. Sign up with name: "John Doe"
2. Try signing up again with same name but different email
3. Should see error: "An account with this name already exists"

### Test Case 4: Invalid Email
1. Try signing up with invalid email (no @ or .com)
2. Should see error: "Please enter a valid email address!"

### Test Case 5: Missing Fields
1. Try submitting without name or email
2. Should see error: "Please fill in your name and email!"

## Future Enhancements

- Email verification before account creation
- Password hashing and authentication
- Profile picture/avatar support
- User preferences dashboard
- Social sign-up (Google, GitHub, etc.)
- Two-factor authentication
- Password reset functionality

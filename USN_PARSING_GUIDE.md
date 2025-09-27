# AlumniVerse USN Parsing Guide

## 📧 Email Format Requirements

### Valid SIT Email Format
```
Format: [digit][college][year][branch][number]@sit.ac.in
Example: 1si23is117@sit.ac.in
```

### Breakdown
- **1**: College identifier (always 1 for SIT)
- **si**: College code (always "si" for SIT)
- **23**: Year digits (23 = 2023)
- **is**: Branch code (Information Science)
- **117**: Student number (001-999)

## 🎓 Supported Branch Codes

| Code | Full Branch Name |
|------|------------------|
| `cs` | Computer Science |
| `is` | Information Science |
| `ec` | Electronics and Communication |
| `ee` | Electrical Engineering |
| `me` | Mechanical Engineering |
| `cv` | Civil Engineering |
| `bt` | Biotechnology |
| `ch` | Chemical Engineering |
| `ae` | Aeronautical Engineering |
| `im` | Industrial Engineering and Management |
| `tc` | Telecommunication Engineering |

## 🔄 Automatic Data Extraction

### Input Email: `1si23is117@sit.ac.in`

**Parsed Output:**
```json
{
  "usn": "1SI23IS117",
  "joiningYear": 2023,
  "passingYear": 2027,
  "branch": "Information Science",
  "branchCode": "IS"
}
```

### Year Calculation Logic
- Year digits `23` → Joining year `2023`
- Passing year = Joining year + 4 (assumes 4-year degree)
- Handles years up to 5 years in the future

## ✅ Valid Examples

```javascript
// All these will parse successfully
'1si23is117@sit.ac.in'  // Information Science, 2023
'1si20cs045@sit.ac.in'  // Computer Science, 2020
'1si22ec089@sit.ac.in'  // Electronics & Communication, 2022
'1si21me156@sit.ac.in'  // Mechanical Engineering, 2021
'1si24bt001@sit.ac.in'  // Biotechnology, 2024
```

## ❌ Invalid Examples

```javascript
// These will be rejected with appropriate error messages
'invalid@sit.ac.in'     // Invalid USN format
'test@gmail.com'        // Wrong domain
'1si23xx117@sit.ac.in'  // Unknown branch code 'xx'
'si23is117@sit.ac.in'   // Missing first digit
'1si23is@sit.ac.in'     // Missing student number
'123@sit.ac.in'         // Completely invalid format
```

## 🛠️ Implementation Details

### Function Location
```javascript
// File: backend/controllers/supabaseAuthController.js
const parseUSNFromEmail = (email) => {
  // Implementation details...
}
```

### Error Handling
- **Invalid Format**: "Invalid USN format in email"
- **Unknown Branch**: "Unknown branch code: {code}"
- **General Error**: "Failed to parse USN: {specific error}"

### Integration Points
1. **Signup Controller**: Automatically called during user registration
2. **Validation**: Runs before Supabase user creation
3. **Error Response**: Returns 400 status with descriptive message
4. **Logging**: Logs parsed data with operation ID

## 🧪 Testing

### Unit Tests
```bash
# Run USN parsing tests
cd backend
node test-usn-parsing.js
```

### Manual Testing
1. Try signup with valid SIT email
2. Verify auto-populated fields
3. Test with different branch codes
4. Confirm error handling for invalid formats

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Invalid USN format in email"
- **Cause**: Email doesn't match expected pattern
- **Solution**: Ensure format is `1si[YY][branch][number]@sit.ac.in`

**Issue**: "Unknown branch code: xx"
- **Cause**: Branch code not in supported list
- **Solution**: Add new branch code to `branchMap` in controller

**Issue**: Profile creation fails after parsing
- **Cause**: Database constraints or RLS policies
- **Solution**: Check Supabase logs and admin permissions

### Adding New Branch Codes

```javascript
// In parseUSNFromEmail function, update branchMap:
const branchMap = {
  'cs': 'Computer Science',
  'is': 'Information Science',
  // Add new branch here:
  'ai': 'Artificial Intelligence',
  'ds': 'Data Science'
};
```

## 📊 Monitoring

### Key Metrics
- USN parsing success rate
- Most common branch codes
- Error patterns by email format
- Year distribution of students

### Log Patterns
```
[operation_id] Parsed USN data: {"usn":"1SI23IS117",...}
[operation_id] USN parsing failed: Invalid USN format in email
```

## 🔮 Future Enhancements

### Potential Improvements
1. **Dynamic Branch Loading**: Load branch codes from database
2. **Validation Rules**: Add more sophisticated validation
3. **Multiple Formats**: Support other college email formats
4. **Batch Processing**: Parse multiple emails at once
5. **Analytics**: Track parsing patterns and success rates

### Backward Compatibility
- Current implementation maintains compatibility
- New branch codes can be added without breaking changes
- Error messages are descriptive and actionable

---

*This guide covers the automatic USN parsing functionality implemented in AlumniVerse v2.0*

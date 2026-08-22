import { signUpSchema, signInSchema, resetPasswordSchema, profileUpdateSchema, tripCreateSchema, stopCreateSchema, tripActivityCreateSchema, expenseCreateSchema } from '../shared/validation';

async function runValidationAuditTests() {
  console.log('--- Testing Zod Schemas Client/Server Side ---');

  // 1. Sign Up Schema
  const signUpCheck = signUpSchema.safeParse({ email: 'bad-email', password: '123', full_name: '' });
  console.log('SignUp Validation (Invalid):', !signUpCheck.success && signUpCheck.error.issues.length >= 3 ? 'PASS' : 'FAIL');

  // 2. Sign In Schema
  const signInCheck = signInSchema.safeParse({ email: '', password: '' });
  console.log('SignIn Validation (Empty):', !signInCheck.success && signInCheck.error.issues.length === 2 ? 'PASS' : 'FAIL');

  // 3. Reset Password Schema
  const resetCheck = resetPasswordSchema.safeParse({ email: 'not-an-email' });
  console.log('Reset Password Validation (Invalid):', !resetCheck.success ? 'PASS' : 'FAIL');

  // 4. Trip Create Schema
  const tripCheck = tripCreateSchema.safeParse({ name: '', start_date: '2026-10-20', end_date: '2026-10-10' });
  console.log('Trip Create Validation (End before Start):', !tripCheck.success && tripCheck.error.issues.some(i => i.message.includes('End date must be on or after start date')) ? 'PASS' : 'FAIL');

  // 5. Stop Create Schema
  const stopCheck = stopCreateSchema.safeParse({ trip_id: '123', city_id: '456', order_index: -1, arrival_date: '2026-10-20', departure_date: '2026-10-10' });
  console.log('Stop Create Validation (UUID & Date bounds):', !stopCheck.success ? 'PASS' : 'FAIL');

  // 6. Trip Activity Create Schema
  const activityCheck = tripActivityCreateSchema.safeParse({ stop_id: 'not-a-uuid', custom_cost: -50 });
  console.log('Trip Activity Create Validation (Cost & UUID):', !activityCheck.success ? 'PASS' : 'FAIL');

  // 7. Expense Create Schema
  const expenseCheck = expenseCreateSchema.safeParse({ category: 'invalid_cat', amount: 0, label: '' });
  console.log('Expense Create Validation (Category & Amount):', !expenseCheck.success ? 'PASS' : 'FAIL');

  // 8. Profile Update Schema
  const profileCheck = profileUpdateSchema.safeParse({ full_name: '', language_pref: 'unsupported' as any });
  console.log('Profile Update Validation (Name & Enum):', !profileCheck.success ? 'PASS' : 'FAIL');

  console.log('--- All Zod Schema Assertions Verified ---');
}

runValidationAuditTests();

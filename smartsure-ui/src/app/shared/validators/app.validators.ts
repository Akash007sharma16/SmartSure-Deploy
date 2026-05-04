import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

// ─── 1. No leading/trailing whitespace ───────────────────────────────────────
export const noWhitespaceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const val = control.value as string;
  if (!val) return null;
  return val.trim().length === 0 ? { whitespace: true } : null;
};

// ─── 2. Strong password ───────────────────────────────────────────────────────
// Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char, no spaces
export const strongPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const val = control.value as string;
  if (!val) return null;
  const errors: ValidationErrors = {};
  if (val.length < 8)                    errors['minLength']   = true;
  if (!/[A-Z]/.test(val))               errors['uppercase']   = true;
  if (!/[a-z]/.test(val))               errors['lowercase']   = true;
  if (!/\d/.test(val))                  errors['digit']       = true;
  if (!/[\W_]/.test(val))               errors['special']     = true;
  if (/\s/.test(val))                   errors['spaces']      = true;
  return Object.keys(errors).length ? errors : null;
};

// ─── 3. Name validator ────────────────────────────────────────────────────────
// Only letters and spaces, min 3, max 50
export const nameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const val = (control.value as string)?.trim();
  if (!val) return null;
  const errors: ValidationErrors = {};
  if (val.length < 3)                   errors['minLength']   = true;
  if (val.length > 50)                  errors['maxLength']   = true;
  if (!/^[a-zA-Z\s]+$/.test(val))      errors['invalidChars'] = true;
  return Object.keys(errors).length ? errors : null;
};

// ─── 4. Policy type name validator ───────────────────────────────────────────
// Letters, spaces, hyphens only; min 3, max 100; not all numbers
export const policyNameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const val = (control.value as string)?.trim();
  if (!val) return null;
  const errors: ValidationErrors = {};
  if (val.length < 3)                        errors['minLength']    = true;
  if (val.length > 100)                      errors['maxLength']    = true;
  if (!/^[a-zA-Z0-9\s\-]+$/.test(val))      errors['invalidChars'] = true;
  if (/^\d+$/.test(val))                     errors['onlyNumbers']  = true;
  return Object.keys(errors).length ? errors : null;
};

// ─── 5. Description validator ─────────────────────────────────────────────────
// Min 10, max 500; not just repeated characters
export const descriptionValidator = (min = 10, max = 500): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value as string)?.trim();
    if (!val) return null;
    const errors: ValidationErrors = {};
    if (val.length < min)                    errors['minLength']  = true;
    if (val.length > max)                    errors['maxLength']  = true;
    // Detect spam: same char repeated > 70% of string
    const dominant = val.split('').sort((a, b) =>
      val.split(b).length - val.split(a).length)[0];
    const ratio = (val.split(dominant).length - 1) / val.length;
    if (ratio > 0.7)                         errors['spam']       = true;
    return Object.keys(errors).length ? errors : null;
  };

// ─── 6. Numeric range validator ───────────────────────────────────────────────
export const numericRangeValidator = (min: number, max: number): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const val = Number(control.value);
    if (isNaN(val)) return { notNumeric: true };
    if (val < min)  return { min: { min, actual: val } };
    if (val > max)  return { max: { max, actual: val } };
    return null;
  };

// ─── 7. Date range validator (cross-field) ────────────────────────────────────
// startDate must be today or future; endDate must be after startDate
export const dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const fg = group as FormGroup;
  const start = fg.get('startDate')?.value;
  const end   = fg.get('endDate')?.value;
  if (!start || !end) return null;

  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = new Date(start);
  const endDate   = new Date(end);
  const errors: ValidationErrors = {};

  if (startDate < today)      errors['startInPast']   = true;
  if (endDate <= startDate)   errors['endBeforeStart'] = true;

  return Object.keys(errors).length ? errors : null;
};

// ─── 8. Report title validator ────────────────────────────────────────────────
// Min 5, max 100, no special chars like @#$%
export const reportTitleValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const val = (control.value as string)?.trim();
  if (!val) return null;
  const errors: ValidationErrors = {};
  if (val.length < 5)                        errors['minLength']    = true;
  if (val.length > 100)                      errors['maxLength']    = true;
  if (/[@#$%^&*<>{}|\\]/.test(val))         errors['invalidChars'] = true;
  return Object.keys(errors).length ? errors : null;
};

// ─── 9. Strict email (no whitespace, proper format) ──────────────────────────
export const strictEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const val = control.value as string;
  if (!val) return null;
  if (/\s/.test(val)) return { whitespace: true };
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(val) ? null : { email: true };
};

// ─── Helper: get first error message for a control ───────────────────────────
export function getErrorMessage(controlName: string, errors: ValidationErrors | null): string {
  if (!errors) return '';
  const messages: Record<string, Record<string, string>> = {
    email: {
      required:   'Email address is required.',
      email:      'Please enter a valid email address.',
      whitespace: 'Email cannot contain spaces.'
    },
    password: {
      required:   'Password is required.',
      minLength:  'Password must be at least 8 characters.',
      uppercase:  'Must include at least one uppercase letter.',
      lowercase:  'Must include at least one lowercase letter.',
      digit:      'Must include at least one number.',
      special:    'Must include at least one special character.',
      spaces:     'Password cannot contain spaces.'
    },
    fullName: {
      required:    'Full name is required.',
      minLength:   'Name must be at least 3 characters.',
      maxLength:   'Name cannot exceed 50 characters.',
      invalidChars:'Name can only contain letters and spaces.'
    },
    name: {
      required:    'Policy type name is required.',
      minLength:   'Name must be at least 3 characters.',
      maxLength:   'Name cannot exceed 100 characters.',
      invalidChars:'Only letters, numbers, spaces, and hyphens allowed.',
      onlyNumbers: 'Name cannot be only numbers.'
    },
    description: {
      required:   'Description is required.',
      minLength:  'Description must be at least 10 characters.',
      maxLength:  'Description cannot exceed 500 characters.',
      spam:       'Please enter a meaningful description.'
    },
    coverageAmount: {
      required:   'Coverage amount is required.',
      min:        'Minimum coverage is ₹1,000.',
      max:        'Maximum coverage is ₹10,00,00,000.',
      notNumeric: 'Please enter a valid number.'
    },
    claimAmount: {
      required:   'Claim amount is required.',
      min:        'Claim amount must be at least ₹1.',
      max:        'Claim amount cannot exceed policy coverage.'
    },
    baseRate: {
      required:   'Base rate is required.',
      min:        'Base rate must be at least 0.1%.',
      max:        'Base rate cannot exceed 100%.'
    },
    title: {
      required:    'Report title is required.',
      minLength:   'Title must be at least 5 characters.',
      maxLength:   'Title cannot exceed 100 characters.',
      invalidChars:'Title cannot contain special characters like @#$%.'
    }
  };

  const fieldMessages = messages[controlName] ?? {};
  for (const key of Object.keys(errors)) {
    if (fieldMessages[key]) return fieldMessages[key];
  }
  return 'Invalid value.';
}

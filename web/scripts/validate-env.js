#!/usr/bin/env node

/**
 * Comprehensive environment variable validation script
 * Checks all required and optional environment variables
 * Run: node scripts/validate-env.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function check(name, value, required = true, validator = null) {
  const isSet = value !== undefined && value !== null && value !== '';
  const isValid = validator ? validator(value) : true;
  
  if (!isSet) {
    return {
      status: required ? 'missing' : 'optional',
      message: required ? '✗ Missing (required)' : '○ Not set (optional)',
      required
    };
  }
  
  if (!isValid) {
    return {
      status: 'invalid',
      message: '✗ Invalid format',
      required
    };
  }
  
  return {
    status: 'ok',
    message: '✓ Set',
    required,
    preview: value.length > 50 ? value.substring(0, 47) + '...' : value
  };
}

function validateDatabaseUrl(url) {
  if (!url) return false;
  return url.startsWith('postgresql://') || url.startsWith('postgres://');
}

function validateUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validateEmailService(key) {
  if (!key) return false;
  return key.length > 10; // Basic check
}

console.log(`${colors.blue}=== Environment Variables Validation ===${colors.reset}\n`);

const checks = {
  // Required - Database
  'DATABASE_URL': check('DATABASE_URL', process.env.DATABASE_URL, true, validateDatabaseUrl),
  
  // Required - Authentication
  'NEXTAUTH_URL': check('NEXTAUTH_URL', process.env.NEXTAUTH_URL, true, validateUrl),
  'NEXTAUTH_SECRET': check('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET, true),
  'AUTH_SECRET': check('AUTH_SECRET', process.env.AUTH_SECRET, false), // Optional if NEXTAUTH_SECRET is set
  
  // Required - Cloudinary (for image uploads)
  'CLOUDINARY_CLOUD_NAME': check('CLOUDINARY_CLOUD_NAME', process.env.CLOUDINARY_CLOUD_NAME, true),
  'CLOUDINARY_API_KEY': check('CLOUDINARY_API_KEY', process.env.CLOUDINARY_API_KEY, true),
  'CLOUDINARY_API_SECRET': check('CLOUDINARY_API_SECRET', process.env.CLOUDINARY_API_SECRET, true),
  
  // Required - Supabase Storage
  'NEXT_PUBLIC_SUPABASE_URL': check('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, true, validateUrl),
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': check('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, true),
  
  // Required - Didit KYC (hosted flow)
  'DIDIT_API_KEY': check('DIDIT_API_KEY', process.env.DIDIT_API_KEY, true),
  'DIDIT_WORKFLOW_ID': check('DIDIT_WORKFLOW_ID', process.env.DIDIT_WORKFLOW_ID, true),
  'DIDIT_WEBHOOK_SECRET': check('DIDIT_WEBHOOK_SECRET', process.env.DIDIT_WEBHOOK_SECRET, true),
  'DIDIT_BASE_URL': check('DIDIT_BASE_URL', process.env.DIDIT_BASE_URL ?? 'https://api.getdidit.com', true, validateUrl),

  // Optional - Didit redirect overrides
  'DIDIT_SUCCESS_REDIRECT': check('DIDIT_SUCCESS_REDIRECT', process.env.DIDIT_SUCCESS_REDIRECT, false, validateUrl),
  'DIDIT_FAILURE_REDIRECT': check('DIDIT_FAILURE_REDIRECT', process.env.DIDIT_FAILURE_REDIRECT, false, validateUrl),
  'DIDIT_CALLBACK_URL': check('DIDIT_CALLBACK_URL', process.env.DIDIT_CALLBACK_URL, false, validateUrl),

  // Optional - Email (Brevo)
  'BREVO_API_KEY': check('BREVO_API_KEY', process.env.BREVO_API_KEY, false, validateEmailService),
};

let hasErrors = false;
let hasWarnings = false;

// Check each variable
Object.entries(checks).forEach(([name, result]) => {
  let color = colors.reset;
  let icon = '';
  
  if (result.status === 'ok') {
    color = colors.green;
    icon = '✓';
  } else if (result.status === 'missing' && result.required) {
    color = colors.red;
    icon = '✗';
    hasErrors = true;
  } else if (result.status === 'invalid') {
    color = colors.red;
    icon = '✗';
    hasErrors = true;
  } else {
    color = colors.yellow;
    icon = '○';
    hasWarnings = true;
  }
  
  console.log(`${color}${icon} ${name.padEnd(30)} ${result.message}${colors.reset}`);
  if (result.preview && result.status === 'ok') {
    console.log(`   ${colors.blue}→ ${result.preview}${colors.reset}`);
  }
});

// Special checks
console.log(`\n${colors.blue}=== Additional Checks ===${colors.reset}\n`);

// Check AUTH_SECRET vs NEXTAUTH_SECRET
if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  console.log(`${colors.yellow}○ AUTH_SECRET not set, using NEXTAUTH_SECRET (this is fine)${colors.reset}`);
} else if (process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
  if (process.env.AUTH_SECRET === process.env.NEXTAUTH_SECRET) {
    console.log(`${colors.green}✓ AUTH_SECRET matches NEXTAUTH_SECRET${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ AUTH_SECRET and NEXTAUTH_SECRET are different (should be the same)${colors.reset}`);
  }
}

// Check DATABASE_URL format
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.includes('?sslmode=require')) {
    console.log(`${colors.yellow}⚠ DATABASE_URL should include ?sslmode=require for Supabase${colors.reset}`);
  }
  if (!dbUrl.includes(':5432')) {
    console.log(`${colors.yellow}⚠ DATABASE_URL should use port 5432 (direct connection) for migrations${colors.reset}`);
  }
}

// Check NEXTAUTH_URL
if (process.env.NEXTAUTH_URL) {
  const url = process.env.NEXTAUTH_URL;
  if (url === 'http://localhost:3000') {
    console.log(`${colors.blue}ℹ Using localhost URL (development mode)${colors.reset}`);
  } else if (url.includes('localhost')) {
    console.log(`${colors.yellow}⚠ NEXTAUTH_URL uses localhost - make sure this matches your setup${colors.reset}`);
  }
}

// Summary
console.log(`\n${colors.blue}=== Summary ===${colors.reset}\n`);

const requiredCount = Object.values(checks).filter(c => c.required && c.status === 'ok').length;
const requiredTotal = Object.values(checks).filter(c => c.required).length;
const optionalCount = Object.values(checks).filter(c => !c.required && c.status === 'ok').length;
const optionalTotal = Object.values(checks).filter(c => !c.required).length;

console.log(`Required variables: ${colors.green}${requiredCount}${colors.reset}/${requiredTotal} set`);
console.log(`Optional variables: ${optionalCount}/${optionalTotal} set`);

if (hasErrors) {
  console.log(`\n${colors.red}❌ ERRORS FOUND: Some required variables are missing or invalid!${colors.reset}`);
  console.log(`${colors.red}Please check your .env.local file and add the missing variables.${colors.reset}`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`\n${colors.yellow}⚠ Some optional variables are not set (this is okay for development)${colors.reset}`);
  console.log(`${colors.green}✓ All required variables are set!${colors.reset}`);
  process.exit(0);
} else {
  console.log(`\n${colors.green}✅ All environment variables are properly configured!${colors.reset}`);
  process.exit(0);
}


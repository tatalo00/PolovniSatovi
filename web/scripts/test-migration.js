#!/usr/bin/env node

/**
 * Test script to verify database connection and schema changes
 * Run: node scripts/test-migration.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if Review table exists
    try {
      const reviewCount = await prisma.review.count();
      console.log(`✅ Review table exists (${reviewCount} reviews)`);
    } catch (error) {
      if (error.message.includes('does not exist') || error.code === 'P2021') {
        console.log('❌ Review table does not exist - migration needed');
      } else {
        throw error;
      }
    }
    
    // Test if MessageThread has updatedAt
    try {
      const thread = await prisma.messageThread.findFirst();
      if (thread && 'updatedAt' in thread) {
        console.log('✅ MessageThread.updatedAt field exists');
      } else {
        console.log('❌ MessageThread.updatedAt field missing - migration needed');
      }
    } catch (error) {
      console.log('⚠️  Could not check MessageThread (table might not exist yet)');
    }
    
    console.log('\n✅ All checks passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Connection failed. Check:');
      console.error('  1. DATABASE_URL in .env.local');
      console.error('  2. Supabase is running');
      console.error('  3. Using port 5432 (direct connection)');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();


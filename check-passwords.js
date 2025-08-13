import { db } from './server/db.ts';
import { employees } from './shared/schema.ts';

async function checkPasswords() {
  try {
    const users = await db.select().from(employees);
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, empCode: ${user.empCode}, name: ${user.name}`);
      if (user.password) {
        const isHashed = user.password.includes('.');
        console.log(`Password format: ${isHashed ? 'HASHED (hex.salt)' : 'PLAIN TEXT'}`);
        console.log(`Password value: ${user.password.substring(0, 20)}...`);
      } else {
        console.log('Password: NONE');
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPasswords();

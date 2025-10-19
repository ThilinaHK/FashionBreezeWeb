const bcrypt = require('bcryptjs');

async function testPassword() {
  const hash = '$2b$10$j2F2pTJg78RvhtS4o2CYreiDjp8DVRh0pmJbjMBW9DLtlZfYIjKAu';
  const password = '123';
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password "123" matches hash:', isValid);
}

testPassword();
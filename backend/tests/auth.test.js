import { expect, test } from 'vitest'
const {authenticateToken, login, logout, requestNewToken, register} = require('../src/controllers/auth.js')

  it("hashes password on register", async () => {
    const hash = await registerUser("password123");
    const match = await bcrypt.compare("password123", hash);
    expect(match).toBe(true);
  });

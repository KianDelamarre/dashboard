import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../src/db/db.js', () => ({
  default: {
    get: vi.fn(),
    run: vi.fn()
  }
}))


import db from '../src/db/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import {
  loginService,
  registerService,
  authenticateUser,
  storeRefreshToken,
  logoutService,
  requestNewAccessTokenService,
  verifyAccessToken,
  generateAccessToken,
  generateRefreshToken,
  getUser,
  verifyPassword
} from '../src/services/auth.service.js'
import * as authService from '../src/services/auth.service.js'  //import auth service as a module to spy on so i can mock

describe('login service', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loginService throws if username missing', async () => {
    await expect(loginService('', 'pass')).rejects.toThrow()
  })

  it('loginService throws if password missing', async () => {
    await expect(loginService('user')).rejects.toThrow()
  })

  it('resolves with user when username and password are correct', async () => {
    const fakeUser = { id: 1, username: 'bob', password_hash: '12345' }

    // Mock getUser to return fake user
    vi.spyOn(authService, 'getUser').mockResolvedValue(fakeUser)

    // Mock verifyPassword to succeed
    vi.spyOn(authService, 'verifyPassword').mockResolvedValue(true)

    const user = await authService.authenticateUser('bob', '12345')
    expect(user).toEqual(fakeUser)
  })

  it('throws if authenticateUser rejects', async () => {
    // Mock authenticateUser to fail
    vi.spyOn(authService, 'authenticateUser').mockRejectedValue(new Error('fail'))

    await expect(loginService('bob', '123'))
      .rejects.toThrow('invalid username or password')
  })

  it('throws if storeRefreshToken rejects', async () => {
    vi.spyOn(authService, 'storeRefreshToken').mockRejectedValue(new Error('fail'))

    await expect(loginService('bob', '123')).rejects.toThrow()
  })

  it('returns payload for valid token', () => {
    const payload = { id: 1, username: 'bob' }
    // Sign a real token using the same secret your service uses
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
    const result = verifyAccessToken(token)
    expect(result).toMatchObject(payload)
  })


})

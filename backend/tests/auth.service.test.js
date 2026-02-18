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
  verifyAccessToken,
  authenticateUser
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

  it('throws if authenticateUser rejects', async () => {

  })

  it('authenticate user returns passed in user if valid', async () => {
    const fakeUser = { id: 1, username: 'bob', password_hash: '12345' }
    vi.spyOn(db, 'get').mockImplementation((sql, params, cb) => {
      cb(null, fakeUser)
    })
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)

    const user = await authService.authenticateUser('bob', '12345')
    expect(user).toEqual(fakeUser)
  })


  it('throws if storeRefreshToken rejects', async () => {

  })

  it('returns payload for valid token', () => {
    const payload = { id: 1, username: 'bob' }
    // Sign a real token using the same secret your service uses
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
    const result = verifyAccessToken(token)
    expect(result).toMatchObject(payload)
  })


})

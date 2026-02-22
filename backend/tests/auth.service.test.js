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
  
} from '../src/auth/auth.service.js'

import * as authRepo from '../src/auth/auth.repository.js'  //import auth service as a module to spy on so i can mock
// import { authenticateUser, } from '../src/auth/auth.repository.js'

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

  it('should throw "invalid username or password" when authenticateUser fails', async () => {
    // make authenticate user fail
    vi.spyOn(authRepo, 'authenticateUser').mockRejectedValue()

    //make generate access token pass
    vi.spyOn(authRepo, 'generateAccessToken').mockResolvedValue('accessToken')

    //make generate refresh token pass
    vi.spyOn(authRepo, 'generateRefreshToken').mockResolvedValue('refreshToken')

    //make store refresh token pass
    vi.spyOn(authRepo, 'storeRefreshToken').mockResolvedValue('1')

    await expect(loginService('bob','12345')).rejects.toThrow('invalid username or password')    
  })

    it('should throw "invalid username or password" when storeRefreshToken fails', async () => {
    // make authenticate user pass
    const fakeUser = { id: 1, username: 'bob', password_hash: '12345' }

    vi.spyOn(authRepo, 'authenticateUser').mockResolvedValue(fakeUser)

    //make generate access token pass
    vi.spyOn(authRepo, 'generateAccessToken').mockResolvedValue('accessToken')

    //make generate refresh token pass
    vi.spyOn(authRepo, 'generateRefreshToken').mockResolvedValue('refreshToken')

    //make store refresh token fail
    vi.spyOn(authRepo, 'storeRefreshToken').mockRejectedValue()

    await expect(loginService('bob','12345')).rejects.toThrow('invalid username or password')    
  })

  // it('authenticate user returns passed in user if valid', async () => {
  //   const fakeUser = { id: 1, username: 'bob', password_hash: '12345' }
  //   vi.spyOn(db, 'get').mockImplementation((sql, params, cb) => {
  //     cb(null, fakeUser)
  //   })
  //   vi.spyOn(bcrypt, 'compare').mockResolvedValue(true)

  //   const user = await authService.authenticateUser('bob', '12345')
  //   expect(user).toEqual(fakeUser)
  // })


// it('rejects if db.run returns an error', async () => {
//   vi.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
//     callback(new Error('db fail'))
//   })

//   await expect(authService.storeRefreshToken(1, 'hash'))
//     .rejects.toThrow('db fail')
// })  

// it('rejects if no rows were inserted', async () => {
//   vi.spyOn(db, 'run').mockImplementation(function (sql, params, callback) {
//     callback.call({ changes: 0 }, null)
//   })

//   await expect(authService.storeRefreshToken(1, 'hash'))
//     .rejects.toThrow('Could not store token in db')
// })

//   it('returns payload for valid tokenauthService', () => {
//     const payload = { id: 1, username: 'bob' }
//     // Sign a real token using the same secret your service uses
//     const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)
//     const result = verifyAccessToken(token)
//     expect(result).toMatchObject(payload)
//   })

//   it('returns tokens when login succeeds', async () => {
//   const fakeUser = { id: 1, username: 'bob' }

//   vi.spyOn(authService, 'authenticateUser')
//     .mockResolvedValue(fakeUser)
//     //authenticate users resolve fakeUser

//   vi.spyOn(authService, 'storeRefreshToken')
//     .mockResolvedValue(123)
//     //store refrehs token resolve

//   vi.spyOn(jwt, 'sign')
//     .mockReturnValueOnce('access-token')
//     .mockReturnValueOnce('refresh-token')

//   const result = await loginService('bob', '123')

//   expect(result).toEqual({
//     accessToken: 'access-token',
//     refreshToken: 'refresh-token'
//   })

//   expect(authService.storeRefreshToken)
//     .toHaveBeenCalledWith(1, 'refresh-token')
// })



})

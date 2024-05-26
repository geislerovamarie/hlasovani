import crypto from 'crypto'
import knex from "knex"
import knexfile from '../knexfile.js';

export const db = knex(knexfile)

export const createUser = async (login, password) => {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    const token = crypto.randomBytes(16).toString('hex')
  
    const [user] = await db('users').insert({ login, hash, salt, token }).returning('*')
  
    return user
  }

export const getUser = async (login, password) => {
    const user = await db('users').select("*").where("login", login).first()
    if (!user) return null
  
    const salt = user.salt
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    if (hash !== user.hash) return null
  
    return user
  }

  export const loginAlreadyUsed = async (login) => {
    const user = await db('users').where({ login }).first()
    if (!user) return false
    return true
  }
 
  export const getUserByToken = async (token) => {
    const user = await db('users').where({ token }).first()
    return user
  }
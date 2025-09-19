import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || "dev-secret"

// Create a token
export function generateToken(payload: object, expiresIn: string = "1h") {
  return jwt.sign(payload, SECRET, { expiresIn })
}

// Verify a token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch (err) {
    throw new Error("Invalid token")
  }
}
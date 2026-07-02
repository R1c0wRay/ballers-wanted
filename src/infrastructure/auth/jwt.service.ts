import jwt from 'jsonwebtoken';

export class JwtService {
  private readonly secret = 'super-secret-key'; // ✅ plus tard → env

  generate(userId: string): string {
    return jwt.sign(
      { sub: userId },
      this.secret,
      { expiresIn: '1h' }
    );
  }
}

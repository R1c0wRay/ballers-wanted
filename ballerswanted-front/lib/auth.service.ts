import {
  getValidToken,
  logout,
} from './auth.utils';

export class AuthService {

  static getToken() {
    return getValidToken();
  }

  static logout() {
    logout();
  }
}
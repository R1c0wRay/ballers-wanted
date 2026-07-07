export class UserRepository {
  private users: any[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) || null;
  }

  async findByPseudo(pseudo: string) {
    return this.users.find((u) => u.pseudo === pseudo) || null;
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  async save(user: any) {
    const existing = this.users.find((u) => u.id === user.id);

    if (existing) {
      Object.assign(existing, user);
    } else {
      this.users.push(user);
    }
  }
}
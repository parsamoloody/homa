export class UserModel {
    private users = [{ id: 0, name: 'Parsa', email: 'me@gmail.com' }];

    findAll() { return this.users; }

    findById(id: number) { return this.users.find(u => u.id === id); }

    create(data: any) {
        const newUser = { id: this.users.length, name: data.name, email: data.email };
        this.users.push(newUser);
        return newUser;
    }
}
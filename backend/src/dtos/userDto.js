module.exports = class UserDto {
    id;
    login;
    role;

    constructor(model) {
        this.id = model.id;
        this.login = model.login;
        
        
        if (model.role && typeof model.role === 'object') {
            this.role = model.role.name;
        } else {
            this.role = model.role || null;
        }
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'this is an invalid email'
            },
        ];
    }
    if (options.clubUsername.length <= 2) {
        return [
            {
                field: 'clubUsername',
                message: 'length must be greater than 2'
            }
        ];
    }
    if (options.clubUsername.includes("@")) {
        return [
            {
                field: 'clubUsername',
                message: 'username cannot include @'
            }
        ];
    }
    if (options.password.length <= 6) {
        return [
            {
                field: 'password',
                message: 'length must be greater than 6'
            }
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map
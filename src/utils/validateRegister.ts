import { UsernamePasswordInput } from "../shared/UsernamePasswordInput";

/**
 * This is an en error message handler
 * 
 * @param options UsernamePasswordInput
 * @returns field && message error
 */
export const validateRegister = (options: UsernamePasswordInput) => {
    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'this is an invalid email'
            },
        ]
    }

    if (options.clubUsername.length <= 2) {
        return [
            {
                field: 'clubUsername',
                message: 'length must be greater than 2'
            }
        ]
    }

    if (options.clubUsername.includes("@")) {
        return [
            {
                field: 'clubUsername',
                message: 'username cannot include @'
            }
        ]
    }

    if (options.password.length <= 6) {
        return [
            {
                field: 'password',
                message: 'length must be greater than 6'
            }
        ]
    }


    //if it does not work
    return null;
}
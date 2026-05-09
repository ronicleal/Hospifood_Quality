export const validatePassword = (password: string) => {
    return {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&#]/.test(password),
    };
};

export const isPasswordValid = (password: string) => {
    const v = validatePassword(password);
    return v.length && v.hasUpper && v.hasLower && v.hasNumber && v.hasSpecial;
};

export const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
};

export const validateName = (name: string) => {
    // Solo permite letras (incluyendo acentos) y espacios
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
};

// Función extra para capitalizar: "juan luis" -> "Juan Luis"
export const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};
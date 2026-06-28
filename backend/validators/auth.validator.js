const { z } = require('zod');

const registerUserSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const registerFoodPartnerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    contactName: z.string().min(2, "Contact name must be at least 2 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Returns 400 with structured errors on failure.
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }
        req.body = result.data;
        next();
    };
}

module.exports = {
    registerUserSchema,
    registerFoodPartnerSchema,
    loginSchema,
    validate
};

const { z } = require('zod');

const createFoodSchema = z.object({
    name: z.string().min(1, "Food name is required"),
    description: z.string().optional(),
    moodTags: z.array(z.enum([
        'late_night', 'spicy', 'comfort_food', 'healthy',
        'sweet', 'rainy_day', 'breakfast', 'quick_bite'
    ])).optional().default([]),
    cuisineTags: z.array(z.enum([
        'north_indian', 'south_indian', 'chinese', 'italian',
        'mexican', 'thai', 'continental', 'street_food'
    ])).optional().default([]),
    price: z.number().positive("Price must be a positive number"),
    city: z.string().min(1, "City is required")
});

const updateFoodSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    moodTags: z.array(z.enum([
        'late_night', 'spicy', 'comfort_food', 'healthy',
        'sweet', 'rainy_day', 'breakfast', 'quick_bite'
    ])).optional(),
    cuisineTags: z.array(z.enum([
        'north_indian', 'south_indian', 'chinese', 'italian',
        'mexican', 'thai', 'continental', 'street_food'
    ])).optional(),
    price: z.number().positive().optional(),
    isAvailable: z.boolean().optional(),
    city: z.string().min(1).optional()
});

const interactSchema = z.object({
    action: z.enum(['watch', 'like', 'save', 'share', 'skip', 'order']),
    watchPercentage: z.number().min(0).max(100).optional().default(0)
});

const placeOrderSchema = z.object({
    foodId: z.string().min(1, "Food ID is required"),
    amount: z.number().positive("Amount must be a positive number")
});

const updateOrderStatusSchema = z.object({
    status: z.enum(['confirmed', 'preparing', 'delivered', 'cancelled'])
});

module.exports = {
    createFoodSchema,
    updateFoodSchema,
    interactSchema,
    placeOrderSchema,
    updateOrderStatusSchema
};

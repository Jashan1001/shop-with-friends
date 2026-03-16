const { z } = require('zod')

const addProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  price: z.number().min(0).optional(),
  image: z.string().optional().default(''),
  link: z.string()
    .url('Must be a valid URL')
    .refine((u) => u.startsWith('https://'), { message: 'Product links must use HTTPS' })
    .optional()
    .default(''),
  platform: z.enum(['amazon', 'flipkart', 'myntra', 'other']).optional().default('other'),
  description: z.string().max(500).optional().default(''),
})

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  image: z.string().optional(),
  link: z.string().optional(),
  description: z.string().max(500).optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['active', 'bought', 'skipped']),
})

module.exports = { addProductSchema, updateProductSchema, updateStatusSchema }
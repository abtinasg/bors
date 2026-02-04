import { z } from "zod";

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, "شماره موبایل نامعتبر است")
    .max(15, "شماره موبایل نامعتبر است")
    .regex(/^(\+98|98|0)?9\d{9}$/, "فرمت شماره موبایل صحیح نیست"),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(10, "شماره موبایل نامعتبر است")
    .max(15, "شماره موبایل نامعتبر است"),
  code: z
    .string()
    .length(6, "کد تایید باید ۶ رقم باشد")
    .regex(/^\d{6}$/, "کد تایید باید فقط عدد باشد"),
});

// Portfolio validation schemas
export const addPortfolioSchema = z.object({
  assetSlug: z.string().min(1, "شناسه دارایی الزامی است"),
  assetType: z.enum(["currency", "gold", "coin", "crypto"], {
    errorMap: () => ({ message: "نوع دارایی نامعتبر است" }),
  }),
  assetName: z.string().min(1, "نام دارایی الزامی است"),
  quantity: z.number().positive("مقدار باید بیشتر از صفر باشد"),
  buyPrice: z.number().positive("قیمت خرید باید بیشتر از صفر باشد"),
});

export const updatePortfolioSchema = z.object({
  quantity: z.number().positive("مقدار باید بیشتر از صفر باشد").optional(),
  buyPrice: z.number().positive("قیمت خرید باید بیشتر از صفر باشد").optional(),
});

// Watchlist validation schemas
export const addWatchlistSchema = z.object({
  assetSlug: z.string().min(1, "شناسه دارایی الزامی است"),
  assetType: z.enum(["currency", "gold", "coin", "crypto"], {
    errorMap: () => ({ message: "نوع دارایی نامعتبر است" }),
  }),
  assetName: z.string().min(1, "نام دارایی الزامی است"),
});

// Transaction validation schemas
export const addTransactionSchema = z.object({
  assetSlug: z.string().min(1, "شناسه دارایی الزامی است"),
  assetType: z.enum(["currency", "gold", "coin", "crypto", "stock", "car"], {
    errorMap: () => ({ message: "نوع دارایی نامعتبر است" }),
  }),
  assetName: z.string().min(1, "نام دارایی الزامی است"),
  type: z.enum(["buy", "sell"], {
    errorMap: () => ({ message: "نوع تراکنش نامعتبر است" }),
  }),
  quantity: z.number().positive("مقدار باید بیشتر از صفر باشد"),
  price: z.number().positive("قیمت باید بیشتر از صفر باشد"),
  date: z.string().optional(), // ISO date string
  note: z.string().optional(),
});

export type PhoneInput = z.infer<typeof phoneSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type AddPortfolioInput = z.infer<typeof addPortfolioSchema>;
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;
export type AddWatchlistInput = z.infer<typeof addWatchlistSchema>;
export type AddTransactionInput = z.infer<typeof addTransactionSchema>;

import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  description: z.string().min(10, "About description must be at least 10 characters."),
  services: z.string().min(5, "Please list at least one service offered."),
  contactInfo: z.string().min(5, "Contact information is required."),
  address: z.string().min(5, "Physical address is required."),
  businessHours: z.string().min(5, "Business hours are required."),
});

export type CompanyInput = z.infer<typeof CompanySchema>;
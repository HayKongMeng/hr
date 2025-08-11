import { z } from "zod";

export const createEmployeeSchema = z.object({
    name: z
        .string({ required_error: "Username is required." })
        .min(3, { message: "Username must be at least 3 characters." })
        .max(20, { message: "Username must be at most 20 characters." }),

    email: z
        .string({ required_error: "Email is required." })
        .email({ message: "Please enter a valid email." }),

    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z.string().min(8, { message: "Confirm your password" }),

    employee_code: z
        .string({ required_error: "Employee code is required." })
        .min(1, { message: "Phone cannot be empty." }),

    first_name: z
        .string({ required_error: "First name is required." })
        .min(1, { message: "First name cannot be empty." }),

    last_name: z
        .string({ required_error: "Last name is required." })
        .min(1, { message: "Last name cannot be empty." }),

    phone: z
        .string({ required_error: "Phone is required." })
        .min(1, { message: "Phone cannot be empty." }),
    
    address: z.string().optional(),

    date_of_birth: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        "Invalid date"
    ),   
    hire_date: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        "Invalid date"
    ),   
});

// export const updateEmployeeSchema = createEmployeeSchema
//     .omit({ password: true }) // remove password field entirely
//     .extend({
//         password: z.string().min(8).optional(), // or just skip this line if you don't want password at all
//     });

export type CreateEmployeeFormSchema = z.infer<typeof createEmployeeSchema>;
// export type UpdateEmployeeFormSchema = z.infer<typeof updateEmployeeSchema>;

export const positionSchema = z.object({
    code: z
        .string({ required_error: "Code is required." })
        .min(1, { message: "Code must be at least 3 characters." })
        .max(20, { message: "Code must be at most 20 characters." }),
  
    title: z
        .string({ required_error: "Title is required." })
        .min(1, { message: "Title cannot be empty." })
        .max(100, { message: "Title must be at most 100 characters." }),
  
    description: z.string().optional(),
});
  
export type PositionFormSchema = z.infer<typeof positionSchema>;

export const departmentSchema = z.object({
    code: z
        .string({ required_error: "Code is required." })
        .min(1, { message: "Code must be at least 3 characters." })
        .max(20, { message: "Code must be at most 20 characters." }),
  
    name: z
        .string({ required_error: "Title is required." })
        .min(1, { message: "Title cannot be empty." })
        .max(100, { message: "Title must be at most 100 characters." }),

    description: z.string().optional(),
});
  
export type DepartmentFormSchema = z.infer<typeof departmentSchema>;

export const companySchema = z.object({
    company_code: z.string().min(1, "Company code is required"),
    name: z.string().min(1, "Company name is required"),
    type: z.string().min(1, "Company type is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number is required"),
    country: z.string().min(1, "Country is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    zip_code: z.string().min(1, "Zip code is required"),
    address: z.string().min(1, "Address is required"),
    account_url: z.string().min(1, "Account URL is required"),
    website: z.string().min(1, "Website is required"),
    longitude: z.string().min(1, "Longitude is required"),
    latitude: z.string().min(1, "Latitude is required"),
});
export type companyFormSchema = z.infer<typeof companySchema>;

export const companyHistorySchema = z
    .object({
        start_date: z.string().refine(date => !isNaN(Date.parse(date)), {message: "Invalid start date"}),
        end_date: z.string().refine(date => !isNaN(Date.parse(date)), {message: "Invalid end date"}),
        notes: z.string().min(8, { message: "Description must be at least 8 characters." }).nullable().optional(),
    })
    .refine(data => new Date(data.end_date) >= new Date(data.start_date), {
        message: "End date must be after or equal to start date",
        path: ["end_date"], // show error under end_date field
    });

export type companyHistoryFormSchema = z.infer<typeof companyHistorySchema>;

export const userSchema = z
    .object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters" }),
        confirm_password: z.string().min(8, { message: "Confirm your password" }),
        first_name: z.string().min(1, { message: "First name is required" }),
        last_name: z.string().min(1, { message: "Last name is required" }),
        phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }).regex(/^\+?[0-9]{10,15}$/, {message: "Phone number must be valid",}),
    })
    .refine(data => data.password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"], // show error under confirm_password field
    });

export type UserFormSchema = z.infer<typeof userSchema>;

export const roleSchema = z.object({
    role_name: z.string().min(1, { message: "Role name is required" }).max(50, { message: "Role name must be under 50 characters" }),
});

export type RoleFormSchema = z.infer<typeof roleSchema>;

export const leaveSchema = z.object({
    start_date: z
        .string({ required_error: "Start date is required." })
        .min(1, { message: "Start date cannot be empty." })
        .max(20, { message: "Start date must be at most 20 characters." }),

    end_date: z
        .string({ required_error: "End date is required." })
        .min(1, { message: "End date cannot be empty." })
        .max(100, { message: "End date must be at most 100 characters." }),

    reason: z.string().optional(),
});
  
export type LeaveFormSchema = z.infer<typeof leaveSchema>;

export const approveSchema = z.object({
    leave_id: z.number(),
    approved_at: z.string().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled']),
});

export type ApprovedFormSchema = z.infer<typeof approveSchema>;

export const leaveTypeSchema = z.object({
    type_name: z
        .string()
        .min(3, { message: "Type name must be at least 3 characters long" }),
    prefix: z
        .string()
        .min(2, { message: "Prefix must be at least 2 characters long" }),
    max_days: z
        .number({ invalid_type_error: "Max days must be a number" })
        .int("Must be an integer")
        .positive("Max days must be positive")
        .max(365, "Too many days"),
});

export type LeaveTypeFormSchema = z.infer<typeof leaveTypeSchema>;


export const attendanceSchema = z.object({
    date: z.string(),
    clock_in: z.string(), 
    clock_out: z.string()
});

export type AttendanceFormSchema = z.infer<typeof attendanceSchema>;

export const holidaySchema = z.object({
    name: z.string().min(1, 'Occasion is required').max(100, 'Occasion must be at most 100 characters'),
    start_date: z
        .string({ required_error: "Start date is required." })
        .min(1, { message: "Start date cannot be empty." })
        .max(20, { message: "Start date must be at most 20 characters." }),
    end_date: z
        .string({ required_error: "End date is required." })
        .min(1, { message: "End date cannot be empty." })
        .max(100, { message: "End date must be at most 100 characters." }),
    description: z.string().optional(),
});

export type HolidayFormSchema = z.infer<typeof holidaySchema>;

export const emergencyContactSchema = z.object({
    primaryContact: z.object({
        name: z.string().min(1, "Primary contact name is required"),
        relationship: z.string().optional(),
        phone1: z.string().min(1, "Primary contact phone1 is required").regex(/^\+?[0-9\s\-()]{7,15}$/, "Invalid phone number"),
        phone2: z.string().optional(),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
    }),
    secondaryContact: z.object({
        name: z.string().min(1, "Secondary contact name is required"),
        relationship: z.string().optional(),
        phone1: z.string().min(1, "Secondary contact phone1 is required").regex(/^\+?[0-9\s\-()]{7,15}$/, "Invalid phone number"),
        phone2: z.string().optional(),
        email: z.string().email("Invalid email format").optional().or(z.literal("")),
    }),
});

export type EmergencyContactFormSchema = z.infer<typeof emergencyContactSchema>;

export const personalInfoSchema = z.object({
    passport_no: z.string().max(50),
    passport_expiry_date: z.string().refine((date) => {
        return !isNaN(Date.parse(date));
    }, {
        message: "Invalid date format",
    }),
    religion: z.string().optional().nullable(),
    employment_spouse: z.string().optional().nullable(),
    number_of_children: z
        .string()
        .min(1, "This field is required")
        .refine((val) => !isNaN(Number(val)), {
        message: "Must be a number",
        })
        .transform((val) => parseInt(val))
        .refine((val) => val >= 0, {
        message: "Must be 0 or greater",
        }),
});

export type PersonalInfoFormSchema = z.infer<typeof personalInfoSchema>;

export const bankInfoSchema = z.object({
    bank_details: z.string().min(1, { message: "Bank details are required" }),
    bank_account_no:  z.string().optional().nullable(),
    ifsc_code: z.string().optional().nullable(),
    branch_address: z.string().optional().nullable(),
});

export type BankInfoFormSchema = z.infer<typeof bankInfoSchema>;

export const familyInfoSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    relationship: z.string().optional().nullable(),
    passport_expiry_date: z.string().min(1, { message: "Date of birth is required" }),
    phone: z.string().optional().nullable(),
});

export type FamilyInfoFormSchema = z.infer<typeof familyInfoSchema>;

export const educationSchema = z.object({
    institution_name: z.string().min(1, { message: 'Institution name is required' }),
    course: z.string().min(1, { message: 'Course is required' }),
    start_date: z.string().min(1, { message: 'Start date is required' }).refine(val => !isNaN(Date.parse(val)), {message: 'Start date must be a valid date',}),
    end_date: z.string().min(1, { message: 'End date is required' }).refine(val => !isNaN(Date.parse(val)), {message: 'End date must be a valid date',}),
}).refine((data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
}, {
    path: ['end_date'],
    message: 'End date must be after or equal to start date',
});


export type  EducationFormSchema = z.infer<typeof  educationSchema>;

export const experienceSchema = z.object({
    previous_company_name: z.string({ required_error: "Previous company name is required" }).min(1, "Previous company name is required"),
    designation: z.string({ required_error: "Designation is required" }).min(1, "Designation is required"),
    start_date: z.string({ required_error: "Start date is required" }).refine((date) => !isNaN(Date.parse(date)), {message: "Start date must be a valid date",}),
    end_date: z.string({ required_error: "End date is required" }).refine((date) => !isNaN(Date.parse(date)), {message: "End date must be a valid date",}),
    is_current: z.boolean().optional(),
});

export type ExperienceFormSchema = z.infer<typeof  experienceSchema>;


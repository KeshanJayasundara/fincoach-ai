import {
  Stethoscope, Code2, GraduationCap, HeartPulse, Laptop, BookOpen,
  Building2, Settings, Scale, Calculator, Pill, Palette, Palmtree,
  Landmark, Megaphone, Building, Briefcase, TrendingUp, Store,
  BookOpenCheck, Pencil,
  type LucideIcon,
} from "lucide-react";

// key = value stored in the role's `emoji` DB field (reused as an icon key, not a glyph)
export const ROLE_ICON_OPTIONS: { key: string; icon: LucideIcon; name: string }[] = [
  { key: "doctor",       icon: Stethoscope,    name: "Doctor" },
  { key: "engineer_sw",  icon: Code2,          name: "Software Engineer" },
  { key: "student",      icon: GraduationCap,  name: "Student" },
  { key: "nurse",        icon: HeartPulse,     name: "Nurse" },
  { key: "freelancer",   icon: Laptop,         name: "Freelancer" },
  { key: "teacher",      icon: BookOpen,       name: "Teacher" },
  { key: "business",     icon: Building2,      name: "Business Owner" },
  { key: "engineer",     icon: Settings,       name: "Engineer" },
  { key: "lawyer",       icon: Scale,          name: "Lawyer" },
  { key: "accountant",   icon: Calculator,     name: "Accountant" },
  { key: "pharmacist",   icon: Pill,           name: "Pharmacist" },
  { key: "designer",     icon: Palette,        name: "Designer" },
  { key: "retired",      icon: Palmtree,       name: "Retired" },
  { key: "government",   icon: Landmark,       name: "Government" },
  { key: "marketing",    icon: Megaphone,      name: "Marketing" },
  { key: "architect",    icon: Building,       name: "Architect" },
  { key: "consultant",   icon: Briefcase,      name: "Consultant" },
  { key: "finance",      icon: TrendingUp,     name: "Finance" },
  { key: "shop",         icon: Store,          name: "Business" },
  { key: "tutor",        icon: BookOpenCheck,  name: "Tutor" },
  { key: "other",        icon: Pencil,         name: "Other" },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ROLE_ICON_OPTIONS.map((p) => [p.key, p.icon])
);

export function getRoleIcon(key: string | null | undefined): LucideIcon {
  return (key && ICON_MAP[key]) || Briefcase;
}
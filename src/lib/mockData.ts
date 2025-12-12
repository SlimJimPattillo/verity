export interface Metric {
  id: string;
  label: string;
  value: number;
  unit: '$' | '%' | 'People' | '#';
  type: 'output' | 'outcome';
  comparison?: string;
  previousValue?: number;
}

export interface Report {
  id: string;
  name: string;
  type: 'Annual Report' | 'Grant Application' | 'Impact Report';
  dateModified: string;
  status: 'Draft' | 'Published' | 'Under Review';
}

export interface Organization {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
}

export const mockOrganization: Organization = {
  name: "Metroville Food Bank",
  primaryColor: "#0F172A",
  secondaryColor: "#059669",
};

export const mockMetrics: Metric[] = [
  {
    id: "1",
    label: "Meals Served",
    value: 5000,
    unit: "#",
    type: "output",
    comparison: "vs 4,200 last year",
    previousValue: 4200,
  },
  {
    id: "2",
    label: "Reduction in Hunger",
    value: 15,
    unit: "%",
    type: "outcome",
    comparison: "across service area",
    previousValue: 8,
  },
  {
    id: "3",
    label: "Operating Efficiency",
    value: 88,
    unit: "%",
    type: "output",
  },
  {
    id: "4",
    label: "Families Assisted",
    value: 1250,
    unit: "People",
    type: "output",
  },
  {
    id: "5",
    label: "Food Security Improvement",
    value: 23,
    unit: "%",
    type: "outcome",
    comparison: "among regular recipients",
    previousValue: 12,
  },
];

export const mockReports: Report[] = [
  {
    id: "1",
    name: "2024 Annual Impact Report",
    type: "Annual Report",
    dateModified: "2024-01-15",
    status: "Published",
  },
  {
    id: "2",
    name: "Community Foundation Grant",
    type: "Grant Application",
    dateModified: "2024-01-12",
    status: "Under Review",
  },
  {
    id: "3",
    name: "Q4 2023 Progress Report",
    type: "Impact Report",
    dateModified: "2024-01-08",
    status: "Published",
  },
  {
    id: "4",
    name: "Federal Nutrition Grant 2024",
    type: "Grant Application",
    dateModified: "2024-01-05",
    status: "Draft",
  },
];

export const mockUser = {
  name: "Sarah Chen",
  email: "sarah@metrovillefoodbank.org",
  avatar: "SC",
  role: "Executive Director",
};

export const templateSuggestions = [
  { id: "food", label: "Food Banks", icon: "🍎" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
];

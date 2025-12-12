import { Metric } from "./mockData";

export type Sector = "food" | "education" | "healthcare" | "animal" | "other";

export interface SectorConfig {
  id: Sector;
  label: string;
  metrics: Omit<Metric, "id">[];
  narrative: string;
}

export const sectorConfigs: Record<Sector, SectorConfig> = {
  food: {
    id: "food",
    label: "Food Security",
    metrics: [
      { label: "Meals Served", value: 12500, unit: "#", type: "output", comparison: "vs 9,800 last year", previousValue: 9800 },
      { label: "Hunger Reduction", value: 18, unit: "%", type: "outcome", comparison: "across service area" },
      { label: "Families Fed", value: 2100, unit: "People", type: "output" },
      { label: "Food Rescue (lbs)", value: 45000, unit: "#", type: "output", comparison: "vs 32,000 last year", previousValue: 32000 },
      { label: "Food Security Improvement", value: 24, unit: "%", type: "outcome" },
    ],
    narrative: "This year, our food bank expanded operations to serve more families than ever before. Through partnerships with local grocers and restaurants, we rescued over 45,000 pounds of food that would have otherwise gone to waste. Our mobile pantry program reached underserved neighborhoods, contributing to an 18% reduction in food insecurity across our service area.",
  },
  education: {
    id: "education",
    label: "Education & Youth",
    metrics: [
      { label: "Students Tutored", value: 850, unit: "People", type: "output", comparison: "vs 620 last year", previousValue: 620 },
      { label: "Reading Scores Improved", value: 32, unit: "%", type: "outcome", comparison: "average improvement" },
      { label: "Scholarships Awarded", value: 125000, unit: "$", type: "output" },
      { label: "Graduation Rate", value: 94, unit: "%", type: "outcome", comparison: "vs 87% district average", previousValue: 87 },
      { label: "After-School Hours", value: 15000, unit: "#", type: "output" },
    ],
    narrative: "Our education programs reached 850 students this year, providing personalized tutoring and mentorship. We're proud to report that students in our program saw an average 32% improvement in reading scores. Through our scholarship fund, we awarded $125,000 to graduating seniors pursuing higher education.",
  },
  healthcare: {
    id: "healthcare",
    label: "Healthcare",
    metrics: [
      { label: "Patients Served", value: 4200, unit: "People", type: "output", comparison: "vs 3,100 last year", previousValue: 3100 },
      { label: "Health Outcomes Improved", value: 28, unit: "%", type: "outcome" },
      { label: "Free Screenings", value: 1800, unit: "#", type: "output" },
      { label: "Vaccinations Administered", value: 6500, unit: "#", type: "output", comparison: "vs 4,200 last year", previousValue: 4200 },
      { label: "Insurance Enrollments", value: 890, unit: "People", type: "outcome" },
    ],
    narrative: "Our community health initiative provided care to over 4,200 patients this year. Free health screenings detected early-stage conditions in hundreds of individuals, leading to timely interventions. Our vaccination drive reached 6,500 community members, significantly improving public health outcomes in underserved areas.",
  },
  animal: {
    id: "animal",
    label: "Animal Welfare",
    metrics: [
      { label: "Animals Adopted", value: 1450, unit: "#", type: "output", comparison: "vs 1,100 last year", previousValue: 1100 },
      { label: "Save Rate", value: 92, unit: "%", type: "outcome", comparison: "vs 78% three years ago", previousValue: 78 },
      { label: "Spay/Neuter Surgeries", value: 3200, unit: "#", type: "output" },
      { label: "Animals Rescued", value: 2100, unit: "#", type: "output" },
      { label: "Foster Families", value: 280, unit: "People", type: "output", comparison: "vs 180 last year", previousValue: 180 },
    ],
    narrative: "This year marked a milestone for our shelter with a 92% save rate—the highest in our history. We found forever homes for 1,450 animals and expanded our foster network to 280 dedicated families. Our low-cost spay/neuter program performed 3,200 surgeries, helping reduce pet overpopulation in our community.",
  },
  other: {
    id: "other",
    label: "Community Impact",
    metrics: [
      { label: "People Served", value: 5000, unit: "People", type: "output" },
      { label: "Community Impact", value: 25, unit: "%", type: "outcome" },
      { label: "Programs Delivered", value: 48, unit: "#", type: "output" },
      { label: "Volunteer Hours", value: 12000, unit: "#", type: "output", comparison: "vs 8,500 last year", previousValue: 8500 },
      { label: "Grants Secured", value: 450000, unit: "$", type: "output" },
    ],
    narrative: "Our organization continued to make a meaningful difference in our community this year. Through 48 programs and initiatives, we served over 5,000 individuals. Our dedicated volunteers contributed 12,000 hours of service, demonstrating the power of community engagement.",
  },
};

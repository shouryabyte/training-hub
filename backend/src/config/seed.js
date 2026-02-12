const Batch = require("../models/Batch");
const Division = require("../models/Division");
const ProgramPlan = require("../models/ProgramPlan");
const Project = require("../models/Project");
const { slugify } = require("../utils/slug");

async function ensureBatch(name, description) {
  const existing = await Batch.findOne({ name });
  if (existing) return existing;
  return Batch.create({ name, description: description || "" });
}

function courseDefaults({ name, slug }) {
  const base = {
    shortDescription: "High-signal training with real execution.",
    description:
      "A mentor-guided, outcome-driven track designed to convert effort into measurable progress with weekly deliverables and feedback loops.",
    highlights: ["Mentor review", "Weekly deliverables", "Career-aligned roadmap"],
    outcomes: ["Clear milestones", "Portfolio-ready artifacts", "Confidence through execution"],
    sortOrder: 0,
  };

  const bySlug = {
    "career-path-navigator": {
      shortDescription: "Find the right career direction with a clear, step-by-step system.",
      description:
        "A structured exploration-to-execution course that maps your strengths to roles and builds a weekly plan you can actually follow—without confusion or overload.",
      highlights: ["Role mapping", "Weekly action plan", "Mentor checkpoints"],
      outcomes: ["Clarity on direction", "Habit system", "Progress dashboard mindset"],
      sortOrder: 1,
    },
    "elite-college-admissions": {
      shortDescription: "Craft a standout profile with real proof—not generic claims.",
      description:
        "Build a credible admissions portfolio: projects, writing, and positioning. Mentors help you craft a profile that looks polished and authentic.",
      highlights: ["Portfolio-first approach", "Essay/profile reviews", "Strategy sessions"],
      outcomes: ["Stronger applications", "Proof-of-work portfolio", "Confidence in interviews"],
      sortOrder: 2,
    },
    "global-mentorship-circle": {
      shortDescription: "High-trust mentorship with accountability and momentum.",
      description:
        "A mentorship format built on cadence: reviews, checkpoints, and feedback loops. You don't just learn—you execute with guidance.",
      highlights: ["Mentorship cadence", "Accountability loops", "Progress reviews"],
      outcomes: ["Consistency", "Better decisions", "Faster improvement cycles"],
      sortOrder: 3,
    },
    "consultancy-strategy": {
      shortDescription: "Build strategy: time, study systems, and decision-making.",
      description:
        "Learn how to plan like a top performer: schedule design, prioritization, and execution strategy tailored to your goals and constraints.",
      highlights: ["Time strategy", "Decision systems", "Personalized planning"],
      outcomes: ["Better productivity", "Clear priorities", "Reduced overwhelm"],
      sortOrder: 4,
    },
    "student-mentorship": {
      shortDescription: "Confidence, communication, and performance habits.",
      description:
        "A personal growth + execution track: communication, confidence, discipline, and performance habits—built for competitive environments.",
      highlights: ["Habit building", "Communication coaching", "Performance mindset"],
      outcomes: ["Better consistency", "Stronger communication", "Higher self-belief"],
      sortOrder: 5,
    },

    // DELTA
    // Keep legacy slug stable (if already in DB) but show the shorter display name.
    "full-stack-development": {
      shortDescription: "Ship real web apps with clean architecture, auth, and deployment.",
      description:
        "Build production-grade applications: routing, authentication, data modeling, API design, payments, and deployments. Learn the patterns companies expect.",
      highlights: ["Real projects", "Security basics", "Deployments"],
      outcomes: ["Portfolio apps", "Job-ready stack", "System thinking"],
      sortOrder: 1,
    },
    "ai-data-science": {
      shortDescription: "Applied AI skills with real datasets and evaluation.",
      description:
        "Learn practical AI: data pipelines, modeling, evaluation, and real-world constraints. Focus on what's useful in industry, not buzzwords.",
      highlights: ["Applied projects", "Evaluation mindset", "Industry relevance"],
      outcomes: ["AI portfolio", "Data intuition", "Deployable demos"],
      sortOrder: 2,
    },
    "placement-sprint": {
      shortDescription: "Interview readiness with measurable weekly progress.",
      description:
        "A structured sprint: DSA + system design + behavioral. Weekly drills, mock rounds, and a scoreboard to track improvement.",
      highlights: ["Mock interviews", "Scoreboard", "System design practice"],
      outcomes: ["Placement readiness", "Better speed/accuracy", "Stronger confidence"],
      sortOrder: 3,
    },
    "real-product-lab": {
      shortDescription: "Build like a team, ship like a company.",
      description:
        "Work on real product-style problems with constraints, reviews, and milestones. You learn collaboration, polish, and shipping discipline.",
      highlights: ["Team workflows", "Code reviews", "Production constraints"],
      outcomes: ["Real portfolio proof", "Collaboration skills", "Shipping discipline"],
      sortOrder: 4,
    },
  };

  return bySlug[slug] || bySlug[slugify(name)] || base;
}

async function ensureDivision(batchId, { name, slug, legacyNames = [], legacySlugs = [] }) {
  const defaults = courseDefaults({ name, slug });

  const existing = await Division.findOne({
    batch: batchId,
    $or: [
      { slug },
      ...(legacySlugs || []).map((s) => ({ slug: s })),
      { name },
      ...(legacyNames || []).map((n) => ({ name: n })),
    ],
  });

  if (!existing) {
    return Division.create({
      batch: batchId,
      name,
      slug,
      hasResumeTrack: true,
      shortDescription: defaults.shortDescription,
      description: defaults.description,
      highlights: defaults.highlights,
      outcomes: defaults.outcomes,
      sortOrder: defaults.sortOrder,
      isActive: true,
    });
  }

  // Keep _id stable (enrollments/purchases reference it); normalize visible fields and content.
  existing.name = name;
  existing.slug = existing.slug || slug;
  existing.hasResumeTrack = true;
  existing.shortDescription = defaults.shortDescription;
  existing.description = defaults.description;
  existing.highlights = defaults.highlights;
  existing.outcomes = defaults.outcomes;
  existing.sortOrder = defaults.sortOrder;
  existing.isActive = true;
  await existing.save();
  return existing;
}

async function ensureProgramPlan({ key, title, batchId, divisionIds, durationLabel, amount, currency }) {
  const durationDays = durationLabel === "3 months" ? 90 : durationLabel === "6 months" ? 180 : null;
  const existing = await ProgramPlan.findOne({ key });
  if (!existing) {
    return ProgramPlan.create({
      key,
      title,
      batch: batchId,
      includedDivisions: divisionIds,
      durationLabel,
      durationDays,
      amount,
      currency,
      isActive: true,
    });
  }

  existing.title = title;
  existing.batch = batchId;
  existing.includedDivisions = divisionIds;
  existing.durationLabel = durationLabel;
  existing.durationDays = durationDays;
  existing.amount = amount;
  existing.currency = currency;
  existing.isActive = true;
  await existing.save();
  return existing;
}

async function ensureProject(project) {
  const url = String(project?.url || "").trim();
  const title = String(project?.title || "").trim();
  const existing = url ? await Project.findOne({ url }) : await Project.findOne({ title });
  if (existing) {
    existing.title = title || existing.title;
    existing.description = project.description || existing.description;
    existing.partner = project.partner || existing.partner;
    existing.url = url || existing.url;
    existing.status = project.status || existing.status;
    existing.cohortBadge = project.cohortBadge || existing.cohortBadge;
    existing.techStack = Array.isArray(project.techStack) ? project.techStack : existing.techStack;
    existing.difficulty = project.difficulty || existing.difficulty;
    existing.isFeatured = typeof project.isFeatured === "boolean" ? project.isFeatured : existing.isFeatured;
    await existing.save();
    return existing;
  }

  return Project.create({
    title,
    description: project.description || "",
    partner: project.partner || "",
    url,
    status: project.status || "LIVE",
    cohortBadge: project.cohortBadge || "",
    techStack: Array.isArray(project.techStack) ? project.techStack : [],
    difficulty: project.difficulty || "INTERMEDIATE",
    isFeatured: Boolean(project.isFeatured),
  });
}

async function seedCoreCatalog() {
  const alpha = await ensureBatch("ALPHA", "Class 11 & 12 Foundation");
  const delta = await ensureBatch("DELTA", "University Acceleration");

  // Canonical course set (matches the UI screenshots).
  const alphaCourses = [
    { name: "Career Path Navigator", slug: "career-path-navigator" },
    { name: "Elite College Admissions", slug: "elite-college-admissions" },
    { name: "Global Mentorship Circle", slug: "global-mentorship-circle" },
    { name: "Consultancy & Strategy", slug: "consultancy-strategy" },
    { name: "Student Mentorship", slug: "student-mentorship" },
  ];

  const deltaCourses = [
    {
      name: "Full-Stack Dev",
      slug: "full-stack-development",
      legacyNames: ["Full-Stack Development", "Full-Stack Developer"],
      legacySlugs: ["full-stack-dev"],
    },
    { name: "AI & Data Science", slug: "ai-data-science" },
    { name: "Placement Sprint", slug: "placement-sprint" },
    { name: "Real-Product Lab", slug: "real-product-lab", legacyNames: ["Real Product Lab"] },
  ];

  const alphaDivisions = await Promise.all(alphaCourses.map((c) => ensureDivision(alpha._id, c)));
  const deltaDivisions = await Promise.all(deltaCourses.map((c) => ensureDivision(delta._id, c)));

  const alphaAll = alphaDivisions.map((d) => d._id);
  const deltaAll = deltaDivisions.map((d) => d._id);

  // NOTE: Do not disable non-canonical courses here.
  // Teachers can create additional courses, and we want them to remain visible in the catalog.

  await ensureProgramPlan({
    key: "alpha-foundation",
    title: "Alpha Starter",
    batchId: alpha._id,
    divisionIds: alphaAll.slice(0, 3),
    durationLabel: "3 months",
    amount: 299900,
    currency: "INR",
  });

  await ensureProgramPlan({
    key: "alpha-elite",
    title: "Alpha Plus",
    batchId: alpha._id,
    divisionIds: alphaAll,
    durationLabel: "6 months",
    amount: 599900,
    currency: "INR",
  });

  await ensureProgramPlan({
    key: "delta-career",
    title: "Delta Starter",
    batchId: delta._id,
    divisionIds: deltaAll.slice(0, 2),
    durationLabel: "3 months",
    amount: 499900,
    currency: "INR",
  });

  await ensureProgramPlan({
    key: "delta-placement",
    title: "Delta Pro",
    batchId: delta._id,
    divisionIds: deltaAll,
    durationLabel: "6 months",
    amount: 999900,
    currency: "INR",
  });

  await ProgramPlan.updateMany(
    {
      batch: { $in: [alpha._id, delta._id] },
      key: { $nin: ["alpha-foundation", "alpha-elite", "delta-career", "delta-placement"] },
    },
    { $set: { isActive: false } }
  );

  // Seed live projects so the Projects page is populated and admin can manage future projects.
  const liveProjects = [
    {
      title: "MedPulse AI",
      description: "AI-powered healthcare management platform for patients, doctors, clinics, and pharmacists.",
      partner: "Healthcare",
      status: "LIVE",
      url: "https://medpulse-ai-healthcare.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "Node.js", "MongoDB", "Auth"],
      difficulty: "INTERMEDIATE",
      isFeatured: true,
    },
    {
      title: "Aura Brew",
      description: "Cafe and cloud-kitchen experience with smart menus, reservations, and operations workflow.",
      partner: "Hospitality",
      status: "LIVE",
      url: "https://aura-brew-black.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "UI/UX", "Payments"],
      difficulty: "BEGINNER",
      isFeatured: true,
    },
    {
      title: "QuickMart",
      description: "Retail essentials storefront with fast browsing, cart flow, and checkout-ready UX.",
      partner: "Retail",
      status: "LIVE",
      url: "https://quick-mart-eta.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "State", "API"],
      difficulty: "BEGINNER",
      isFeatured: false,
    },
    {
      title: "Paper & Quill",
      description: "Stationery brand + AI concierge for product discovery and editorial workflows.",
      partner: "Commerce",
      status: "LIVE",
      url: "https://paper-quill.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "AI", "Search"],
      difficulty: "INTERMEDIATE",
      isFeatured: false,
    },
    {
      title: "EduTechs",
      description: "Education platform for structured learning experiences with modern UI and growth loops.",
      partner: "Education",
      status: "LIVE",
      url: "https://edu-techs.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "Design System"],
      difficulty: "BEGINNER",
      isFeatured: false,
    },
    {
      title: "School Portal",
      description: "Student lifecycle and application tracking experience for schools and education consultancies.",
      partner: "Education",
      status: "LIVE",
      url: "https://school-ecru-mu.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "Dashboards"],
      difficulty: "INTERMEDIATE",
      isFeatured: false,
    },
    {
      title: "EduConnect",
      description: "Student dashboard platform for managing classes, attendance, wallet credits, and tutor discovery.",
      partner: "Education",
      status: "LIVE",
      url: "https://educonnect-taupe.vercel.app/",
      cohortBadge: "Live",
      techStack: ["React", "Charts", "Forms"],
      difficulty: "INTERMEDIATE",
      isFeatured: false,
    },
  ];

  await Promise.all(liveProjects.map((p) => ensureProject(p)));
}

module.exports = { seedCoreCatalog };

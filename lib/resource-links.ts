export type ResourceLink = {
  label: string;
  url: string;
};

const resourceLinks: Record<string, ResourceLink> = {
  "notion-student-os": {
    label: "Open Notion template",
    url: "https://www.notion.so/templates",
  },
  "notion-freelance-os": {
    label: "Open Notion template",
    url: "https://www.notion.so/templates",
  },
  "exam-focus-planner": {
    label: "Download PDF",
    url: "/resources/exam-focus-planner-sample.pdf",
  },
  "weekly-study-planner": {
    label: "Download PDF",
    url: "/resources/weekly-study-planner-sample.pdf",
  },
  "deep-work-study-guide": {
    label: "Download PDF",
    url: "/resources/deep-work-study-guide-sample.pdf",
  },
  "student-starter-bundle": {
    label: "Download bundle guide",
    url: "/resources/student-starter-bundle-sample.pdf",
  },
  "admission-prep-kit": {
    label: "Download bundle guide",
    url: "/resources/student-starter-bundle-sample.pdf",
  },
};

export function getResourceLink(slug: string): ResourceLink {
  return (
    resourceLinks[slug] ?? {
      label: "Request access",
      url: "",
    }
  );
}

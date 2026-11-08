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
  "deep-work-study-guide": {
    label: "Download PDF",
    url: "/resources/deep-work-study-guide-sample.pdf",
  },
  "student-starter-bundle": {
    label: "Download starter guide",
    url: "/resources/student-starter-bundle-sample.pdf",
  },
  "admission-prep-kit": {
    label: "Download kit guide",
    url: "/resources/admission-prep-kit-sample.pdf",
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

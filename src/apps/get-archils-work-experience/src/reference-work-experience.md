<!--
  reference-work-experience.md

  This file is NOT used at runtime — nothing imports or reads it automatically.
  It is a human-readable source of truth for the content rendered by the React
  component at src/get-archils-work-experience-app.tsx.

  When updating work experience copy, edit both this file and the TSX component
  in sync so they stay consistent.

  All text is written in third person about Archil.
-->

<SectionHeader sectionId="work">Work 👨🏻‍💻</SectionHeader>

![Sortation at Amazon Robotics](https://assets.aboutamazon.com/dims4/default/c90ddd3/2147483647/strip/true/crop/1600x900+0+0/resize/1320x743!/quality/90/?url=https%3A%2F%2Famazon-blogs-brightspot.s3.amazonaws.com%2Ff8%2F1b%2F29a9dcae4fe489b02d520132c0b6%2Fabout-amazon-inline-inline008-amazon-deliveringthefuture-robotics-amazon-mqy1-091124-ls-225-copy-6458x3632.jpg)

Archil is a **Frontend Engineer II** on the 📦 Sortation Insights team at [Amazon Robotics](https://www.aboutamazon.com/news/operations/amazon-robotics-robots-fulfillment-center). His work spans two main areas — dashboard tooling and agentic infrastructure for robotic fleet management.

On the agentic side, Archil has been building proactive management systems using agents, MCP servers, knowledge bases, and memory. Alarm events trigger multistep workflows across fully automated and human-in-the-loop scenarios. He has shipped and iterated across multiple agentic runtimes and frameworks in production — AWS Bedrock, AgentCore, and Strands. He also built a full-stack agentic web app with multi-party conversational UX using React Router v7 (Remix) and React 19.

On the dashboard side, Archil rearchitected a web solution that was taking 15+ seconds to load down to 2s. He introduced feature flags, integration and e2e tests to move from bi-weekly releases to full CI/CD. He also set up real-time CloudWatch dashboards to track load times and errors across all endpoints.

---

Archil previously worked at the enterprise SaaS platform [Quickbase](https://www.quickbase.com), where he joined as a Software Engineering Co-op and advanced to the role of Software Engineer II. He spent most of his time on a UI infrastructure team, building new features, reusable components, and contributing to Quickbase's design system library. He also did significant work on web accessibility testing and improvements, both within his own projects and in collaboration with other teams. He worked primarily in React, using TypeScript and JavaScript, and is comfortable with tools in this domain, including those used for performance profiling and accessibility testing. Below are some of the key features he contributed to:

---

### Quickbase's Navigation ([Release Notes](https://helpv2.quickbase.com/hc/en-us/articles/30212936236948-Quickbase-September-2024-Release-Notes#h_01J7BD3PQ33X5HVGPX3SEJSCM8))

![New Navigation](/quickbase/new-navigation.gif)

Rolled out in 2024, Quickbase's navigation has been rebuilt from the ground up to provide a more modern and intuitive experience for users. Archil's contributions to this feature were as follows:

- Implemented accessibility features (semantic HTML, roles, keyboard navigation and screen-reader performance), ensured WCAG 2.1 compliance for a new navigation UI and its components, enhancing user experience and performance;
- Built components and implemented interactions for the new Reports Panel;

---

### Quickbase's Summary Report ([Release Notes](https://helpv2.quickbase.com/hc/en-us/articles/23804944584468-Quickbase-February-2024-Release-Notes#h_01HPT7ASHWVSMB064ADPVMTR80))

![New Summary Report](/quickbase/summary-report.webp)

New enhanced summary reports offered streamlined navigation, making it easier than ever to find and analyze data. Report Builder Panel enabled consistent interaction across various report types with a unified panel experience. Archil is particularly proud of having completed this feature with his team.

- Led a team of four software engineering co-ops (Master's students from Northeastern University) for six months (Jan-Jun '24) to complete summary report;
- As part of this journey, mentored and assisted co-ops throughout their learning experience;
- Worked on spikes and built prototypes for new features, breaking down larger problems into smaller, manageable pieces.
- Performed accessibility testing and implemented semantic HTML, roles, keyboard navigation and improved screen-reader performance;

---

### Quickbase's Forms Experience ([Release Notes](https://helpv2.quickbase.com/hc/en-us/articles/16259648646292-Quickbase-June-2023-release-notes#h_01GAH1YHWP30JQ63J1ZCZ74YCN))

![New Forms Experience](/quickbase/forms.png)

New forms were released in 2023 and offered form builders a drag-and-drop WYSIWYG experience when designing forms. Archil personally built and refined more than a dozen field components and embedded existing reports into the new form experience. These are his contributions:

- Built and improved 10+ field components for the new forms. Dealt with numbers, decimals, strings, dates as well as more complex types like users and file attachments;
- Developed reusable components across several internal libraries;
- Improved backend APIs (using C++ & Java) to support new field components.
- Performed accessibility testing and improved screen-reader performance;

---

### Quickbase's Calendar Dashboard Widget ([Release Notes](https://helpv2.quickbase.com/hc/en-us/articles/4418012983828-Quickbase-January-2022-Release-Notes))

![New Dashboard Widget](/quickbase/calendars.png)

Released in 2022, calendar report for the new dashboards offered new look and feel, making them more vibrant and easier to resize. Supported views to see a single day, week, or month, as well as drag and drop of events on the calendar to update start or end dates. Archil contributed to this feature by building the calendar report component and improving backend APIs. Here are his contributions:

- Built the component and improved behavior under different use-case (timezones, updates);
- Improved backend APIs (using C++ and Java) to support the new component.
- Implemented unit and integration tests using Jest and TestNG (with Java) for all new capabilities;

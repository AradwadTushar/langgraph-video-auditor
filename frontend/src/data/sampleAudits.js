export const SAMPLE_AUDITS = [
  {
    id: "sample-ftc-violation",
    title: "Fitness Supplement Influencer Review (FTC Non-Compliant)",
    video_url: "https://www.youtube.com/watch?v=M7FIvfx5J10", // Google developer / YouTube demo video
    youtube_id: "M7FIvfx5J10",
    session_id: "aud_9a4f210c-7b19-4b1a",
    video_id: "vid_9a4f210c",
    status: "FAIL",
    compliance_score: 58,
    duration: "02:45",
    final_report: "Audit identified 2 CRITICAL violations and 1 WARNING. The video fails FTC Endorsement Guides § 255.5 due to lack of conspicuous visual and audible disclosures during brand promotion. Additionally, absolute health performance claims ('Guaranteed 10kg fat loss in 14 days') violate substantiated advertising standards without mandatory qualifiers.",
    compliance_results: [
      {
        category: "FTC_DISCLOSURE",
        severity: "CRITICAL",
        timestamp: "00:15",
        seconds: 15,
        description: "Missing Conspicuous Paid Partnership Disclosure: Video introduces sponsor brand without clear audible or visual '#Ad' / 'Paid Partnership' disclosure prior to product endorsement.",
        rule_reference: "FTC 16 CFR § 255.5 — Disclosures must be conspicuous and unavoidable in both audio and video streams."
      },
      {
        category: "Claim Validation",
        severity: "CRITICAL",
        timestamp: "00:42",
        seconds: 42,
        description: "Unsubstantiated Absolute Health Claim: Speaker asserts 'This blend is clinically guaranteed to eliminate fatigue and burn 10kg in 14 days' without required clinical disclaimers or FDA evaluation disclosure.",
        rule_reference: "FTC Deceptive Advertising Guidelines — Objective product performance claims require reasonable basis and competence."
      },
      {
        category: "Platform Specs",
        severity: "WARNING",
        timestamp: "01:20",
        seconds: 80,
        description: "Fine Print Legibility Violation: On-screen disclaimer text is rendered in sub-12pt font against high-contrast background for less than 1.5 seconds, falling below YouTube Ad Specs for readable disclosure time.",
        rule_reference: "YouTube Advertising Policy Specs — Superimposed text disclaimers must remain visible for at least 3 seconds in legible contrast."
      }
    ],
    transcript: "Hey everyone, welcome back! Today I'm super excited because the team sent over this brand new thermogenic energy booster. I've been taking it every morning before my workout and honestly, this blend is clinically guaranteed to eliminate fatigue and burn 10kg in 14 days. Make sure to click the link in my bio to get 20% off your first bottle right now!",
    ocr_text: [
      "00:03 - DAILY VLOG #42",
      "00:15 - SPECIAL SPONSOR SPOTLIGHT",
      "00:42 - 100% ORGANIC & CLINICALLY PROVEN*",
      "01:20 - *results not typical individual experiences may vary read terms"
    ],
    rag_citations: [
      {
        source: "1001a-influencer-guide-508_1.pdf",
        chunk_id: "chunk_04",
        text: "If you endorse a product through social media, your endorsement message must make it obvious that you have a relationship with the brand. A simple tag or buried hashtag is not sufficient."
      },
      {
        source: "youtube-ad-specs.pdf",
        chunk_id: "chunk_18",
        text: "Legal disclaimers and qualifying statements displayed on screen must maintain a minimum contrast ratio of 4.5:1 and be present on screen for a duration sufficient for an average viewer to read (minimum 3 seconds)."
      }
    ]
  },
  {
    id: "sample-compliant-ad",
    title: "SaaS Workflow Tool Commercial (Compliant)",
    video_url: "https://www.youtube.com/watch?v=L_LUpnjgPso",
    youtube_id: "L_LUpnjgPso",
    session_id: "aud_3e810a9f-5c21-4f2b",
    video_id: "vid_3e810a9f",
    status: "PASS",
    compliance_score: 96,
    duration: "01:15",
    final_report: "Audit completed successfully. All statements adhere to FTC endorsement requirements with clear visual and spoken disclosures. Claims regarding productivity gains are adequately qualified with sample size and observational timeframe. Platform aspect ratios and audio loudness standards conform to YouTube Ad Specs.",
    compliance_results: [
      {
        category: "FTC_DISCLOSURE",
        severity: "PASS",
        timestamp: "00:04",
        seconds: 4,
        description: "Clear and prominent '#Ad' disclosure placed in both lower third title card and spoken introduction.",
        rule_reference: "FTC 16 CFR § 255.5 — Compliant disclosure."
      },
      {
        category: "Claim Validation",
        severity: "PASS",
        timestamp: "00:30",
        seconds: 30,
        description: "Productivity metric qualified with on-screen survey footnote (Based on survey of 250 enterprise teams, Q2 2024).",
        rule_reference: "FTC Deceptive Advertising Guidelines — Compliant substantiation."
      }
    ],
    transcript: "This video is sponsored by FlowCraft. Managing multi-region cloud pipelines can slow down sprint velocity. With FlowCraft, teams in our 2024 enterprise study reported saving up to 4 hours per week on average on CI/CD debugging.",
    ocr_text: [
      "00:02 - Sponsored by FlowCraft",
      "00:30 - Based on survey of 250 enterprise teams, Q2 2024",
      "01:05 - Visit flowcraft.io for full documentation"
    ],
    rag_citations: [
      {
        source: "1001a-influencer-guide-508_1.pdf",
        chunk_id: "chunk_02",
        text: "Disclosures placed at the beginning of the video stream and repeated clearly in audio format meet the FTC standard for clear and conspicuous presentation."
      }
    ]
  }
];

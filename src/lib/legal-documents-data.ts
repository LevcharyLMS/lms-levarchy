// Pure authentic content extracted directly from Levchary Word documents
export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  id: string;
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  "userAgreement": {
    "id": "userAgreement",
    "title": "LEVCHARY USER AGREEMENT",
    "effectiveDate": "Effective Date: October 7, 2026",
    "sections": [
      {
        "id": "section-intro",
        "title": "Overview & Introduction",
        "paragraphs": [
          "Welcome to Levchary!",
          "This User Agreement (\"Agreement\") governs your access to and use of the Levchary website, applications, marketplace, communications, classes, payment services, and related services (collectively, the \"Platform\").",
          "By creating an account, clicking \"I Agree,\" enrolling in a class, booking a class, providing services through Levchary, or otherwise using the Platform, you agree to this Agreement and our Privacy Policy.",
          "If you do not agree, you may not use Levchary."
        ]
      },
      {
        "id": "sec-1",
        "title": "1. WHO CAN USE LEVCHARY",
        "paragraphs": [
          "You must provide accurate information when creating an account.",
          "If you are under the age required by applicable law to enter into a contract, your parent or legal guardian must create or approve your account and accept this Agreement on your behalf.",
          "Parents and legal guardians are responsible for the activities of minors using their accounts.",
          "Levchary may require proof of age, identity, parental authorization, or other information before allowing an account to be created or used."
        ]
      },
      {
        "id": "sec-2",
        "title": "2. LEVCHARY'S ROLE",
        "paragraphs": [
          "Levchary operates an educational technology platform that helps students and families discover, schedule, pay for, and participate in educational services provided through the Platform.",
          "Unless expressly stated otherwise, Levchary does not guarantee:",
          "a particular tutor or faculty member;",
          "a particular academic result;",
          "a particular grade, test score, admission result, certification, or career outcome;",
          "that a class will meet a student's specific educational needs;",
          "that the Platform will always be available or error-free; or",
          "that information provided by another user is complete or accurate.",
          "Tutors and faculty members are responsible for the educational services they provide, subject to Levchary's platform rules and applicable agreements."
        ]
      },
      {
        "id": "sec-3",
        "title": "3. ACCOUNTS",
        "paragraphs": [
          "You are responsible for:",
          "providing accurate and current information;",
          "maintaining the confidentiality of your login credentials;",
          "keeping your account secure;",
          "all activity occurring through your account; and",
          "notifying Levchary promptly if you believe your account has been compromised.",
          "You may not:",
          "create an account using another person's identity;",
          "provide false or misleading information;",
          "share your account with another person;",
          "use another person's account;",
          "attempt to access another user's account; or",
          "create multiple accounts to avoid a restriction, suspension, or termination.",
          "Levchary may suspend or terminate an account when reasonably necessary to protect users, the Platform, or Levchary."
        ]
      },
      {
        "id": "sec-4",
        "title": "4. CLASSES AND EDUCATIONAL SERVICES",
        "paragraphs": [
          "Classes may be offered virtually or physically and may include individual or group instruction.",
          "Before booking or enrolling, users are responsible for reviewing the class information, including where applicable:",
          "instructor;",
          "subject;",
          "grade or educational level;",
          "class format;",
          "date and time;",
          "location;",
          "price;",
          "capacity; and",
          "cancellation or refund terms.",
          "A booking or enrollment is not complete until Levchary confirms it.",
          "Levchary may correct obvious pricing, scheduling, availability, or listing errors before a booking is confirmed."
        ]
      },
      {
        "id": "sec-5",
        "title": "5. PRICES AND PAYMENTS",
        "paragraphs": [
          "Prices displayed on Levchary are established or controlled according to Levchary's pricing policies.",
          "Users agree to pay all amounts displayed and applicable taxes or fees before participating in a paid service, unless otherwise stated.",
          "Payments may be processed by third-party payment providers.",
          "By submitting payment information, you authorize Levchary and its payment providers to process the applicable payment.",
          "Levchary does not store full payment-card information when that information is handled directly by an authorized third-party payment processor.",
          "A payment may be refused, reversed, delayed, or placed on hold where reasonably necessary to address fraud, chargebacks, payment disputes, legal requirements, or security concerns."
        ]
      },
      {
        "id": "sec-6",
        "title": "6. CANCELLATIONS, REFUNDS, AND MISSED CLASSES",
        "paragraphs": [
          "Cancellations, refunds, rescheduling, late arrivals, no-shows, and instructor cancellations are governed by the applicable Levchary cancellation and refund policy presented at the time of booking.",
          "Unless required by law, a user is not automatically entitled to a refund merely because the user:",
          "changes their mind;",
          "fails to attend a class;",
          "arrives late;",
          "loses internet access;",
          "experiences a device or technical problem; or",
          "fails to review the applicable cancellation policy.",
          "Where an instructor cancels a class or Levchary determines that a refund is appropriate, Levchary may provide a refund, credit, rescheduling option, or other appropriate remedy under the applicable policy."
        ]
      },
      {
        "id": "sec-7",
        "title": "7. TUTOR AND FACULTY REQUIREMENTS",
        "paragraphs": [
          "Individuals providing educational services through Levchary must satisfy Levchary's onboarding and approval requirements.",
          "Levchary may request information including:",
          "identity information;",
          "education;",
          "qualifications;",
          "certifications;",
          "professional experience;",
          "references;",
          "background-check information; and",
          "other information reasonably necessary for verification, safety, compliance, or platform operations.",
          "Approval by Levchary does not constitute a guarantee of an instructor's qualifications, character, performance, or future conduct.",
          "Levchary may approve, reject, suspend, or remove an instructor at its discretion, subject to applicable law and any separate agreement with that instructor.",
          "Additional terms may apply to tutors and faculty members under a separate Instructor Agreement."
        ]
      },
      {
        "id": "sec-8",
        "title": "8. USER CONDUCT",
        "paragraphs": [
          "You agree to use Levchary lawfully, honestly, respectfully, and safely.",
          "You may not:",
          "harass, threaten, abuse, stalk, or intimidate another user;",
          "engage in discrimination or unlawful conduct;",
          "impersonate another person;",
          "provide fraudulent information;",
          "use the Platform for unauthorized commercial purposes;",
          "attempt to circumvent Levchary's payment system;",
          "interfere with another user's class;",
          "distribute malware or malicious code;",
          "attempt to gain unauthorized access to the Platform;",
          "scrape, copy, or commercially exploit Platform data without permission;",
          "record, photograph, or distribute another person without appropriate authorization or legal basis;",
          "solicit minors improperly;",
          "use Levchary to arrange unsafe or unlawful activities; or",
          "encourage another person to violate this Agreement.",
          "Levchary may investigate suspected violations and take appropriate action."
        ]
      },
      {
        "id": "sec-9",
        "title": "9. COMMUNICATIONS AND MESSAGING",
        "paragraphs": [
          "Levchary may provide messaging, notifications, email, text, or other communication features.",
          "Users must use these features primarily for legitimate educational and platform-related purposes.",
          "Levchary may monitor, review, preserve, or disclose communications transmitted through the Platform when reasonably necessary for:",
          "safety;",
          "fraud prevention;",
          "dispute resolution;",
          "customer support;",
          "enforcing this Agreement;",
          "investigating violations;",
          "complying with legal obligations; or",
          "protecting Levchary, its users, or others.",
          "Users should not assume that communications through Levchary are completely private."
        ]
      },
      {
        "id": "sec-10",
        "title": "10. OFF-PLATFORM TRANSACTIONS",
        "paragraphs": [
          "Users may not use Levchary to improperly circumvent Levchary's fees, payment system, safety procedures, or other platform requirements.",
          "A user may not use information obtained through Levchary to move a transaction off the Platform for the purpose of avoiding Levchary's applicable fees or protections.",
          "Levchary may restrict or terminate accounts involved in suspected payment circumvention, fraud, or abuse.",
          "Nothing in this section prohibits lawful communication or conduct that cannot legally be restricted."
        ]
      },
      {
        "id": "sec-11",
        "title": "11. SAFETY",
        "paragraphs": [
          "Users are responsible for exercising reasonable judgment when interacting with other users.",
          "For physical classes, users should use only locations approved or permitted by Levchary where applicable.",
          "Users should immediately report suspected abuse, harassment, fraud, threats, unsafe conduct, or other serious concerns to Levchary and, where appropriate, the relevant authorities.",
          "Levchary may suspend an account or take other protective action while investigating a safety concern."
        ]
      },
      {
        "id": "sec-12",
        "title": "12. REVIEWS AND USER CONTENT",
        "paragraphs": [
          "Users may be permitted to submit reviews, photographs, comments, messages, profile information, class materials, or other content (\"User Content\").",
          "You retain ownership of User Content that you own.",
          "By submitting User Content to Levchary, you grant Levchary a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, distribute, modify for technical purposes, and use that content as reasonably necessary to operate, improve, promote, and provide the Platform.",
          "You represent that:",
          "you have the right to submit the content;",
          "the content does not violate another person's rights; and",
          "the content does not violate this Agreement or applicable law.",
          "Levchary may remove User Content that it reasonably believes violates this Agreement, applicable law, or the rights or safety of others."
        ]
      },
      {
        "id": "sec-13",
        "title": "13. INTELLECTUAL PROPERTY",
        "paragraphs": [
          "The Levchary name, logo, website, software, design, text, graphics, trademarks, service marks, and other Platform materials belong to Levchary or its licensors unless otherwise stated.",
          "You may use the Platform only for its intended purpose.",
          "You may not copy, reproduce, modify, distribute, sell, license, reverse engineer, or commercially exploit Levchary's intellectual property without written permission."
        ]
      },
      {
        "id": "sec-14",
        "title": "14. THIRD-PARTY SERVICES",
        "paragraphs": [
          "Levchary may use third-party services for functions such as:",
          "payment processing;",
          "identity verification;",
          "background checks;",
          "video conferencing;",
          "email;",
          "cloud storage;",
          "analytics;",
          "authentication; and",
          "communications.",
          "Third-party services may have their own terms and privacy policies.",
          "Levchary is not responsible for the independent acts, policies, availability, or failures of third-party services except to the extent required by applicable law."
        ]
      },
      {
        "id": "sec-15",
        "title": "15. PRIVACY",
        "paragraphs": [
          "Your use of Levchary is also governed by the Levchary Privacy Policy.",
          "The Privacy Policy explains how Levchary collects, uses, stores, protects, and discloses personal information.",
          "By using Levchary, you acknowledge that you have had an opportunity to review the Privacy Policy."
        ]
      },
      {
        "id": "sec-16",
        "title": "16. PLATFORM AVAILABILITY",
        "paragraphs": [
          "Levchary does not guarantee that the Platform will always be available, uninterrupted, secure, or error-free.",
          "The Platform may occasionally be unavailable because of maintenance, updates, technical problems, cybersecurity incidents, third-party failures, or circumstances outside Levchary's reasonable control.",
          "Levchary may modify, suspend, discontinue, or replace any portion of the Platform at any time, subject to applicable law and existing contractual obligations."
        ]
      },
      {
        "id": "sec-17",
        "title": "17. NO GUARANTEE OF EDUCATIONAL RESULTS",
        "paragraphs": [
          "Educational results vary between individuals.",
          "Levchary does not guarantee any particular:",
          "grade;",
          "test score;",
          "examination result;",
          "admission decision;",
          "certification;",
          "academic achievement;",
          "professional outcome; or",
          "financial result.",
          "Users are responsible for making their own educational decisions."
        ]
      },
      {
        "id": "sec-18",
        "title": "18. DISCLAIMERS",
        "paragraphs": [
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE PLATFORM AND ITS CONTENT ARE PROVIDED ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS.",
          "LEVCHARY DISCLAIMS WARRANTIES THAT CANNOT LAWFULLY BE DISCLAIMED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT, EXCEPT TO THE EXTENT SUCH WARRANTIES ARE REQUIRED BY LAW.",
          "NOTHING IN THIS AGREEMENT EXCLUDES OR LIMITS A RIGHT, REMEDY, WARRANTY, OR LIABILITY THAT CANNOT LAWFULLY BE EXCLUDED OR LIMITED."
        ]
      },
      {
        "id": "sec-19",
        "title": "19. LIMITATION OF LIABILITY",
        "paragraphs": [
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEVCHARY WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS, ARISING FROM OR RELATED TO YOUR USE OF THE PLATFORM.",
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEVCHARY'S TOTAL LIABILITY ARISING OUT OF OR RELATING TO THE PLATFORM OR THIS AGREEMENT WILL NOT EXCEED THE GREATER OF:",
          "(A) THE AMOUNT YOU PAID TO LEVCHARY FOR THE SPECIFIC SERVICE GIVING RISE TO THE CLAIM DURING THE SIX MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM; OR",
          "(B) $100.",
          "This limitation does not apply to liability that cannot legally be limited or excluded."
        ]
      },
      {
        "id": "sec-20",
        "title": "20. INDEMNIFICATION",
        "paragraphs": [
          "To the maximum extent permitted by law, you agree to defend, indemnify, and hold harmless Levchary and its owners, officers, directors, employees, agents, contractors, affiliates, and service providers from claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys' fees, arising from:",
          "your violation of this Agreement;",
          "your misuse of the Platform;",
          "your User Content;",
          "your violation of another person's rights; or",
          "your unlawful or negligent conduct.",
          "This provision does not require you to indemnify Levchary for Levchary's own conduct to the extent prohibited by applicable law."
        ]
      },
      {
        "id": "sec-21",
        "title": "21. ACCOUNT SUSPENSION OR TERMINATION",
        "paragraphs": [
          "Levchary may suspend, restrict, or terminate your account if:",
          "you violate this Agreement;",
          "you provide false information;",
          "you engage in fraud or suspected fraud;",
          "you create a safety risk;",
          "you misuse the Platform;",
          "you fail to make required payments;",
          "you attempt to circumvent Platform rules or fees; or",
          "Levchary reasonably determines that action is necessary to protect users, the Platform, or its legal interests.",
          "Where appropriate, Levchary may provide notice and an opportunity to address the issue.",
          "Termination does not eliminate obligations that by their nature should continue, including payment obligations, intellectual-property protections, confidentiality, dispute provisions, disclaimers, limitations of liability, and indemnification."
        ]
      },
      {
        "id": "sec-22",
        "title": "22. DISPUTES",
        "paragraphs": [
          "Before filing a formal legal claim, you agree to contact Levchary and give Levchary a reasonable opportunity to resolve the dispute.",
          "Contact: [LEGAL/ SUPPORT EMAIL]",
          "If the dispute cannot be resolved informally, it will be handled under the dispute-resolution provisions established by applicable law and any separate agreement applicable to the user.",
          "Nothing in this Agreement prevents a user from exercising rights that cannot legally be waived."
        ]
      },
      {
        "id": "sec-23",
        "title": "23. GOVERNING LAW",
        "paragraphs": [
          "This Agreement will be governed by the laws of the State of Maryland, without regard to conflict-of-law principles, except to the extent applicable law requires otherwise.",
          "Any mandatory consumer rights or protections provided by the law applicable to you remain unaffected."
        ]
      },
      {
        "id": "sec-24",
        "title": "24. CHANGES TO THIS AGREEMENT",
        "paragraphs": [
          "Levchary may update this Agreement from time to time.",
          "When changes are material, Levchary will provide reasonable notice as required by applicable law.",
          "Your continued use of the Platform after the effective date of an updated Agreement constitutes acceptance of the updated Agreement to the extent permitted by law.",
          "For material changes requiring affirmative consent, Levchary will request that consent."
        ]
      },
      {
        "id": "sec-25",
        "title": "25. ELECTRONIC AGREEMENT",
        "paragraphs": [
          "You agree that this Agreement may be accepted electronically.",
          "Clicking \"I Agree,\" checking an acceptance box, signing electronically, or taking another affirmative action designated by Levchary constitutes your electronic acceptance of this Agreement.",
          "You agree that electronic records of your acceptance may be retained and used as evidence of your agreement.",
          "Maryland law generally recognizes electronic records and electronic signatures and provides that they may not be denied legal effect solely because they are electronic. (Maryland General Assembly)"
        ]
      },
      {
        "id": "sec-26",
        "title": "26. GENERAL TERMS",
        "paragraphs": [
          "If any provision of this Agreement is found invalid or unenforceable, the remaining provisions will remain in effect to the maximum extent permitted by law.",
          "A failure by Levchary to enforce a provision does not waive Levchary's right to enforce it later.",
          "You may not transfer your rights or obligations under this Agreement without Levchary's written consent.",
          "Levchary may assign this Agreement in connection with a merger, acquisition, corporate restructuring, sale of assets, or similar transaction.",
          "This Agreement, together with documents expressly incorporated into it, constitutes the agreement between you and Levchary concerning your use of the Platform."
        ]
      },
      {
        "id": "sec-27",
        "title": "27. CONTACT",
        "paragraphs": [
          "Questions regarding this Agreement may be directed to:",
          "LevcharyMaryland, USA. 20774Email: contact@levchary.comPhone: +1 443 274 5894 (WhatsApp Only)",
          "USER ACKNOWLEDGMENT",
          "By selecting \"I Agree,\" you confirm that:",
          "\u2610 I have read and agree to the Levchary User Agreement.",
          "\u2610 I have had an opportunity to review the Levchary Privacy Policy.",
          "\u2610 I understand that educational results are not guaranteed.",
          "\u2610 I agree to follow Levchary's rules and policies.",
          "\u2610 I understand that violations may result in suspension or termination of my account.",
          "\u2610 I agree to conduct transactions electronically with Levchary.",
          "Name: __________________________",
          "Electronic Signature: __________________________",
          "Date: __________________________",
          "Account Email: __________________________",
          "Note for Manoj and Bharat (Team) please read the below for your understanding not to be part of the User level agreement.",
          "One important change I recommend for the Levchary setup",
          "Don't make users simply click \"Create Account.\" Have the registration screen show something like:",
          "\u2610 I agree to the Levchary User Agreement and Privacy Policy. I understand that by checking this box and selecting \"Create Account,\" I am electronically agreeing to these documents.",
          "Then your database should preserve a consent record, rather than merely storing Terms Accepted = Yes.",
          "For example:",
          "Record",
          "Store",
          "User ID",
          "Yes",
          "Agreement version",
          "v1.0",
          "Agreement name",
          "User Agreement",
          "Date/time accepted",
          "Yes",
          "IP address",
          "Yes, subject to applicable privacy requirements",
          "User agent/device information",
          "Recommended",
          "Acceptance method",
          "Checkbox + button",
          "Privacy Policy version",
          "Yes",
          "Electronic-consent version",
          "Yes",
          "That gives you a much stronger audit trail if someone later says, \"I never agreed to those terms.\"",
          "Also, because Maryland law prohibits certain unfair or deceptive practices involving consumer services and educational services, the agreement should be protective without making promises or disclaimers that conflict with mandatory consumer protections.",
          "For Levchary specifically, I would next create the separate Tutor/Faculty Agreement and Student/Parent Agreement. Those two documents are where we can make the platform substantially tighter -- for example, independent-contractor status, tutor conduct, background checks, confidentiality, student safety, off-platform payments, intellectual property, tutor payouts, cancellations, minors, and Levchary's right to suspend/remove tutors."
        ]
      }
    ]
  },
  "privacyPolicy": {
    "id": "privacyPolicy",
    "title": "LEVCHARY PRIVACY POLICY",
    "effectiveDate": "Effective Date: October 7, 2026Last Updated: October 7, 2026",
    "sections": [
      {
        "id": "section-intro",
        "title": "Overview & Introduction",
        "paragraphs": [
          "Levchary (\"Levchary,\" \"we,\" \"us,\" or \"our\") operates an educational technology platform and marketplace that connects students, parents and legal guardians, tutors, faculty, and other education professionals.",
          "This Privacy Policy explains how Levchary collects, uses, discloses, stores, protects, and otherwise processes personal information when you visit or use the Levchary website, applications, marketplace, accounts, messaging features, educational services, payment functionality, verification services, and related products and services (collectively, the \"Platform\").",
          "By creating an account or using the Platform, you acknowledge that you have reviewed this Privacy Policy. Where applicable law requires consent, Levchary will obtain the required consent before collecting, using, or disclosing personal information."
        ]
      },
      {
        "id": "sec-1",
        "title": "1. WHO THIS PRIVACY POLICY APPLIES TO",
        "paragraphs": [
          "This Privacy Policy applies to information relating to:",
          "Students",
          "Parents and legal guardians",
          "Tutors",
          "Faculty",
          "Instructors and education professionals",
          "Visitors to the Levchary website",
          "Individuals who communicate with Levchary",
          "Individuals who apply to become tutors or faculty",
          "Individuals whose information is provided to Levchary by an authorized parent, guardian, user, or organization",
          "This Privacy Policy does not necessarily apply to third-party websites, applications, or services that Levchary does not control."
        ]
      },
      {
        "id": "sec-2",
        "title": "2. INFORMATION WE COLLECT",
        "paragraphs": [
          "The information we collect depends on your relationship with Levchary and how you use the Platform."
        ]
      },
      {
        "id": "sec-3",
        "title": "2.1 Account Information",
        "paragraphs": [
          "When you create an account, we may collect:",
          "First name",
          "Last name",
          "Preferred name",
          "Email address",
          "Telephone number",
          "Username",
          "Password or authentication information",
          "Date of birth or age information where necessary",
          "Account role",
          "Parent or guardian information",
          "Account preferences",
          "Profile information"
        ]
      },
      {
        "id": "sec-4",
        "title": "3. STUDENT AND PARENT/GUARDIAN INFORMATION",
        "paragraphs": [
          "For students and their parents or legal guardians, we may collect:",
          "Student name or preferred name",
          "Grade or educational level",
          "School or educational institution",
          "Subjects",
          "Learning interests",
          "Academic goals",
          "Learning objectives",
          "Class preferences",
          "Availability",
          "Virtual or physical class preferences",
          "Relevant academic information voluntarily provided for educational services",
          "Parent or guardian name",
          "Parent or guardian contact information",
          "Parent or guardian relationship to the student",
          "Information required to establish parental or guardian authority where applicable",
          "We only intend to collect student information that is reasonably necessary for operating the Platform and providing educational services."
        ]
      },
      {
        "id": "sec-5",
        "title": "4. TUTOR AND FACULTY INFORMATION",
        "paragraphs": [
          "Individuals applying to provide educational services through Levchary may be required to provide:",
          "Legal name",
          "Display name",
          "Photograph",
          "Email address",
          "Telephone number",
          "Biography",
          "Education",
          "Degrees",
          "Qualifications",
          "Certifications",
          "Professional licenses where applicable",
          "Teaching experience",
          "Professional experience",
          "Subjects",
          "Focus areas",
          "Educational levels served",
          "Grade levels served",
          "Virtual or physical service preferences",
          "Availability",
          "Service locations where applicable",
          "Pricing",
          "Profile information",
          "Payout information",
          "Tutor and faculty information may be displayed publicly or to registered users when reasonably necessary to facilitate educational services.",
          "Levchary may limit the amount of identifying information displayed publicly.",
          "For example, Levchary may display a tutor's first name and last initial rather than the tutor's complete legal name."
        ]
      },
      {
        "id": "sec-6",
        "title": "5. IDENTITY AND CREDENTIAL VERIFICATION",
        "paragraphs": [
          "To maintain the safety and integrity of the Platform, Levchary may require tutors or faculty to complete identity or credential verification.",
          "Information may include:",
          "Government-issued identification",
          "Driver's license",
          "Passport",
          "Date of birth",
          "Identification document information",
          "Education records",
          "Certifications",
          "Professional credentials",
          "Identity-verification results",
          "Credential-verification results",
          "Government identification and verification information will not ordinarily be displayed publicly on a tutor or faculty profile.",
          "Access to this information will be restricted to authorized Levchary personnel and appropriate service providers with a legitimate need to process it."
        ]
      },
      {
        "id": "sec-7",
        "title": "6. BACKGROUND CHECK INFORMATION",
        "paragraphs": [
          "Levchary may require certain tutors or faculty members to undergo background checks.",
          "Where a background check is conducted through a third-party consumer reporting agency or similar provider, Levchary may collect or receive information necessary to administer the process, including:",
          "Verification status",
          "Background-check status",
          "Results or information permitted to be provided to Levchary",
          "Adverse-action information where applicable",
          "Information necessary to determine eligibility to provide services",
          "Where required by law, Levchary will provide appropriate disclosures and obtain required authorization before obtaining a background report.",
          "Background-check information will be handled in accordance with applicable law and applicable provider requirements."
        ]
      },
      {
        "id": "sec-8",
        "title": "7. PAYMENT AND FINANCIAL INFORMATION",
        "paragraphs": [
          "Levchary uses third-party payment providers to facilitate transactions between students, parents or guardians, Levchary, tutors, and faculty.",
          "Payment information may include:",
          "Transaction amount",
          "Payment status",
          "Payment method",
          "Billing information",
          "Refund information",
          "Chargeback information",
          "Transaction identifiers",
          "Payout information",
          "Commission information",
          "Payment-provider account information",
          "Levchary may use payment providers such as Stripe and Stripe Connect.",
          "Levchary generally does not need to store complete payment-card numbers when payment processing is performed by a third-party payment processor.",
          "Payment providers may independently process personal information under their own privacy policies and terms."
        ]
      },
      {
        "id": "sec-9",
        "title": "8. CLASS AND BOOKING INFORMATION",
        "paragraphs": [
          "When you book, enroll in, teach, or participate in a class, Levchary may collect:",
          "Class information",
          "Tutor or faculty information",
          "Student information",
          "Subject",
          "Grade or educational level",
          "Class format",
          "Class date and time",
          "Class location",
          "Virtual meeting information",
          "Price",
          "Commission information",
          "Payment information",
          "Enrollment information",
          "Attendance information",
          "Cancellation information",
          "Refund information",
          "Reviews and ratings",
          "Class-related communications",
          "For confirmed bookings or enrollments, Levchary may maintain records of the applicable price, platform commission, fees, and tutor/faculty payout information for accounting, dispute resolution, and contractual purposes."
        ]
      },
      {
        "id": "sec-10",
        "title": "9. PHYSICAL CLASS INFORMATION",
        "paragraphs": [
          "Where physical classes are offered, Levchary may process information concerning:",
          "Approved class locations",
          "Meeting locations",
          "Scheduling",
          "Tutor/faculty service areas",
          "Student or parent/guardian location information necessary to arrange the service",
          "Attendance",
          "Levchary does not intend to publicly display a student's private home address.",
          "Users should only provide location information that is reasonably necessary for arranging an approved physical service."
        ]
      },
      {
        "id": "sec-11",
        "title": "10. VIRTUAL CLASS INFORMATION",
        "paragraphs": [
          "Where virtual classes are offered, Levchary may process:",
          "Virtual classroom information",
          "Meeting links",
          "Class schedules",
          "Attendance",
          "Participant information",
          "Technical information",
          "Communications relating to the class",
          "Levchary may integrate with third-party video-conferencing services, such as Google Meet, where available.",
          "Those third-party services may have their own privacy policies and terms."
        ]
      },
      {
        "id": "sec-12",
        "title": "11. MESSAGING AND COMMUNICATIONS",
        "paragraphs": [
          "Levchary may provide in-platform messaging between users, including students, parents/guardians, tutors, faculty, and Levchary administrators.",
          "Communications sent through the Platform may be processed or retained for:",
          "Delivery",
          "Customer support",
          "Safety",
          "Fraud prevention",
          "Dispute resolution",
          "Investigations",
          "Enforcement of Platform rules",
          "Protection of users",
          "Legal compliance",
          "Where permitted by applicable law, Levchary may monitor or review communications occurring through its Platform for legitimate safety, security, fraud-prevention, compliance, or operational purposes.",
          "Users should therefore not assume that communications transmitted through Levchary are completely private from Levchary."
        ]
      },
      {
        "id": "sec-13",
        "title": "12. OFF-PLATFORM CONTACT INFORMATION",
        "paragraphs": [
          "Levchary may detect, restrict, or review attempts to exchange contact information or move transactions outside the Platform when such conduct violates Levchary's agreements or policies.",
          "This may include attempts to exchange:",
          "Personal telephone numbers",
          "Personal email addresses",
          "External payment information",
          "Other information intended to circumvent Platform procedures",
          "Such processing is intended to protect users, prevent fraud, enforce Platform rules, and protect the integrity of the marketplace."
        ]
      },
      {
        "id": "sec-14",
        "title": "13. REVIEWS AND USER CONTENT",
        "paragraphs": [
          "Users may submit:",
          "Reviews",
          "Ratings",
          "Comments",
          "Tutor/faculty profiles",
          "Photographs",
          "Educational materials",
          "Messages",
          "Other content",
          "Some information may be visible to other Platform users or publicly, depending on the feature and applicable settings.",
          "Levchary may moderate, remove, restrict, or retain content where reasonably necessary to operate the Platform, maintain safety, enforce agreements, investigate violations, or comply with law.",
          "Users should not submit unnecessary personal information about another person."
        ]
      },
      {
        "id": "sec-15",
        "title": "14. CLASS RECORDINGS",
        "paragraphs": [
          "If Levchary offers class recording functionality, recordings may contain:",
          "Video",
          "Audio",
          "Screen content",
          "Chat messages",
          "Educational materials",
          "Participant information",
          "Class discussions",
          "Levchary will provide appropriate notice and obtain consent where required by applicable law before recording.",
          "Recording availability, access, retention, and use may be governed by a separate Class Recording Policy.",
          "Users should not independently record another person without obtaining any consent required by applicable law."
        ]
      },
      {
        "id": "sec-16",
        "title": "15. INFORMATION COLLECTED AUTOMATICALLY",
        "paragraphs": [
          "When you use Levchary, we may automatically collect:",
          "IP address",
          "Device type",
          "Browser type",
          "Operating system",
          "Device identifiers",
          "Approximate location",
          "Language",
          "Time zone",
          "Login information",
          "Pages visited",
          "Features used",
          "Date and time of activity",
          "Referring website",
          "Error information",
          "Diagnostic information",
          "Security and fraud signals",
          "We use this information to operate, secure, maintain, analyze, and improve the Platform."
        ]
      },
      {
        "id": "sec-17",
        "title": "16. COOKIES AND SIMILAR TECHNOLOGIES",
        "paragraphs": [
          "Levchary may use:",
          "Cookies",
          "Pixels",
          "Software development kits",
          "Local storage",
          "Similar technologies",
          "These technologies may be used for:",
          "Authentication",
          "Account functionality",
          "Security",
          "Fraud prevention",
          "Remembering preferences",
          "Analytics",
          "Performance monitoring",
          "Platform improvement",
          "Marketing where legally permitted",
          "Users may be able to control cookies through browser or device settings.",
          "Disabling certain technologies may affect Platform functionality."
        ]
      },
      {
        "id": "sec-18",
        "title": "17. INFORMATION FROM THIRD PARTIES",
        "paragraphs": [
          "Levchary may receive information from:",
          "Payment processors",
          "Identity-verification providers",
          "Background-check providers",
          "Credential-verification providers",
          "Authentication providers",
          "Video-conferencing providers",
          "Scheduling providers",
          "Analytics providers",
          "Fraud-prevention providers",
          "Customer-support providers",
          "Parents or guardians",
          "Users who invite or refer other users",
          "Government or regulatory sources where permitted by law",
          "Third-party information will be used for legitimate Platform purposes and in accordance with applicable law."
        ]
      },
      {
        "id": "sec-19",
        "title": "18. HOW LEVCHARY USES PERSONAL INFORMATION",
        "paragraphs": [
          "Levchary may use personal information to:",
          "Operate the Platform",
          "Create and maintain accounts",
          "Authenticate users",
          "Facilitate tutoring services",
          "Match students with tutors and faculty",
          "Facilitate bookings",
          "Process enrollments",
          "Manage classes",
          "Process payments",
          "Process refunds",
          "Process tutor/faculty payouts",
          "Calculate commissions",
          "Provide customer support",
          "Maintain safety and trust",
          "Verify identities",
          "Verify qualifications",
          "Conduct background checks",
          "Prevent fraud",
          "Detect suspicious activity",
          "Investigate complaints",
          "Protect minors",
          "Protect users",
          "Investigate violations",
          "Enforce agreements and policies",
          "Communicate with users",
          "We may send:",
          "Account notifications",
          "Booking confirmations",
          "Class reminders",
          "Payment notifications",
          "Payout notifications",
          "Security alerts",
          "Support communications",
          "Service announcements",
          "Policy updates",
          "Where legally permitted, we may also send marketing communications.",
          "Users may opt out of certain promotional communications.",
          "Improve the Platform",
          "We may use information to:",
          "Analyze Platform usage",
          "Improve features",
          "Develop new services",
          "Improve matching",
          "Troubleshoot technical problems",
          "Conduct analytics",
          "Measure performance",
          "Improve safety and security",
          "Protect legal rights",
          "We may use information to:",
          "Enforce agreements",
          "Investigate disputes",
          "Respond to legal requests",
          "Comply with applicable law",
          "Establish or defend legal claims",
          "Protect Levchary and its users"
        ]
      },
      {
        "id": "sec-20",
        "title": "19. CHILDREN AND MINORS",
        "paragraphs": [
          "Levchary is an educational marketplace that may serve students under 18.",
          "We take children's privacy seriously.",
          "The Children's Online Privacy Protection Act (\"COPPA\") applies to covered online services directed to children under 13 and to certain general-audience services that have actual knowledge they are collecting personal information from children under 13. (Federal Trade Commission)",
          "Where COPPA or another applicable children's privacy law requires parental consent, Levchary will obtain the required consent before collecting, using, or disclosing a child's personal information, subject to applicable legal exceptions.",
          "The FTC's amended COPPA Rule also places additional requirements on covered services concerning children's data disclosures, targeted advertising, data minimization, and retention. (Federal Trade Commission)"
        ]
      },
      {
        "id": "sec-21",
        "title": "20. PARENT AND LEGAL GUARDIAN CONTROL",
        "paragraphs": [
          "Where required by law or Levchary policy, a parent or legal guardian must establish or control the account used by a minor.",
          "Parents or guardians may be required to:",
          "Provide consent",
          "Verify identity",
          "Verify parental or guardian authority",
          "Manage the child's account",
          "Review applicable information",
          "Request correction",
          "Request deletion",
          "Withdraw consent where applicable",
          "We may require reasonable verification before providing access to a child's information or processing a deletion request."
        ]
      },
      {
        "id": "sec-22",
        "title": "21. INFORMATION SHARED WITH TUTORS AND FACULTY",
        "paragraphs": [
          "To provide educational services, Levchary may provide a tutor or faculty member with information reasonably necessary to perform the booked service.",
          "This may include:",
          "Student's name or preferred name",
          "Grade",
          "Subject",
          "Learning objectives",
          "Relevant academic information",
          "Class information",
          "Scheduling information",
          "Information necessary to conduct a physical or virtual class",
          "Levchary will not ordinarily provide tutors or faculty with:",
          "Government identification",
          "Complete payment-card information",
          "Private verification documents",
          "Background-check reports",
          "Other restricted information that is unnecessary for providing the educational service"
        ]
      },
      {
        "id": "sec-23",
        "title": "22. INFORMATION SHARED WITH STUDENTS",
        "paragraphs": [
          "Tutor and faculty profiles may contain:",
          "Display name",
          "Photograph",
          "Biography",
          "Education",
          "Qualifications",
          "Certifications",
          "Experience",
          "Subjects",
          "Focus areas",
          "Grades or educational levels served",
          "Availability",
          "Service format",
          "Pricing",
          "Ratings and reviews",
          "Levchary may use privacy-protective display formats, including first name and last initial."
        ]
      },
      {
        "id": "sec-24",
        "title": "23. HOW WE SHARE PERSONAL INFORMATION",
        "paragraphs": [
          "Levchary may disclose personal information to the following categories of recipients.",
          "Tutors and Faculty",
          "Information necessary to provide educational services.",
          "Payment Providers",
          "Information necessary to process payments, refunds, payouts, chargebacks, fraud prevention, and related financial activities.",
          "Identity and Verification Providers",
          "Information necessary for identity, credential, and background verification.",
          "Technology Providers",
          "Providers that support:",
          "Hosting",
          "Databases",
          "Cloud infrastructure",
          "Authentication",
          "Email",
          "Messaging",
          "Analytics",
          "Security",
          "Customer support",
          "Video conferencing",
          "Platform operations",
          "Professional Advisors",
          "Lawyers, accountants, auditors, insurers, consultants, and other professional advisors.",
          "Government and Legal Authorities",
          "Where disclosure is reasonably necessary to:",
          "Comply with law",
          "Respond to legal process",
          "Protect safety",
          "Prevent fraud",
          "Protect rights",
          "Investigate unlawful activity",
          "Business Transactions",
          "If Levchary participates in a merger, acquisition, financing, reorganization, sale of assets, bankruptcy, or similar transaction, personal information may be transferred as part of the transaction, subject to applicable law."
        ]
      },
      {
        "id": "sec-25",
        "title": "24. DOES LEVCHARY SELL PERSONAL INFORMATION?",
        "paragraphs": [
          "Levchary does not intend to operate by selling personal information for monetary consideration.",
          "If Levchary engages in an activity that constitutes a \"sale\" or \"sharing\" of personal information under an applicable privacy law, Levchary will provide the notices and opt-out mechanisms required by that law.",
          "Levchary will not knowingly sell or share children's personal information in a manner prohibited by applicable children's privacy laws."
        ]
      },
      {
        "id": "sec-26",
        "title": "25. SENSITIVE PERSONAL INFORMATION",
        "paragraphs": [
          "Certain information may be considered sensitive under applicable law.",
          "Depending on the circumstances, this may include:",
          "Government identification",
          "Precise location",
          "Financial information",
          "Certain information relating to minors",
          "Biometric information",
          "Information contained in identity-verification documents",
          "Certain background-check information",
          "Levchary will use sensitive personal information only for legitimate purposes permitted by applicable law.",
          "Access will be restricted based on role and business necessity."
        ]
      },
      {
        "id": "sec-27",
        "title": "26. DATA SECURITY",
        "paragraphs": [
          "Levchary uses reasonable administrative, technical, and organizational safeguards designed to protect personal information.",
          "Security measures may include:",
          "Encryption in transit",
          "Access controls",
          "Authentication",
          "Role-based permissions",
          "Administrative controls",
          "Security monitoring",
          "Logging",
          "Vendor controls",
          "Data minimization",
          "Account-security procedures",
          "However, no Internet transmission, database, or electronic storage system can be guaranteed to be completely secure.",
          "Users are responsible for protecting their login credentials and should immediately notify Levchary if they believe an account has been compromised."
        ]
      },
      {
        "id": "sec-28",
        "title": "27. DATA RETENTION",
        "paragraphs": [
          "Levchary retains personal information for as long as reasonably necessary for legitimate business, contractual, legal, safety, security, and operational purposes.",
          "Retention periods may depend on:",
          "The type of information",
          "The purpose for which it was collected",
          "Whether the account remains active",
          "Financial and tax requirements",
          "Legal requirements",
          "Dispute resolution",
          "Fraud prevention",
          "Safety requirements",
          "Contractual obligations",
          "Levchary will not retain children's personal information indefinitely merely because it was collected.",
          "The FTC's amended COPPA Rule expressly requires covered operators to limit retention of children's information to what is reasonably necessary for the specific purpose for which it was collected. (Federal Trade Commission)",
          "When information is no longer reasonably necessary, Levchary may delete, anonymize, or securely dispose of it, subject to applicable law."
        ]
      },
      {
        "id": "sec-29",
        "title": "28. ACCOUNT CLOSURE AND DELETION",
        "paragraphs": [
          "Users may request closure of their Levchary account.",
          "Depending on applicable law, users may also request deletion of personal information.",
          "Account closure does not necessarily result in immediate deletion of every record.",
          "Levchary may retain information reasonably necessary to:",
          "Complete transactions",
          "Process refunds",
          "Resolve disputes",
          "Process chargebacks",
          "Prevent fraud",
          "Maintain financial records",
          "Comply with legal obligations",
          "Establish or defend legal claims",
          "Maintain records of contractual acceptance",
          "Protect users and the Platform",
          "Where appropriate, Levchary may anonymize information instead of permanently deleting it."
        ]
      },
      {
        "id": "sec-30",
        "title": "29. PRIVACY RIGHTS",
        "paragraphs": [
          "Depending on where you live and applicable law, you may have rights regarding your personal information.",
          "These may include:",
          "Right to know",
          "Right to access",
          "Right to correct",
          "Right to delete",
          "Right to obtain a copy of certain information",
          "Right to opt out of certain sales or sharing",
          "Right to limit certain uses of sensitive personal information",
          "Right to withdraw certain consent",
          "Right to object to certain processing",
          "Right to appeal certain privacy decisions",
          "Right to non-discrimination for exercising applicable privacy rights",
          "Not every right applies to every user.",
          "Exceptions may apply."
        ]
      },
      {
        "id": "sec-31",
        "title": "30. CALIFORNIA PRIVACY RIGHTS",
        "paragraphs": [
          "If California privacy law applies to you, you may have additional rights under the California Consumer Privacy Act (\"CCPA\"), as amended by the California Privacy Rights Act (\"CPRA\").",
          "California consumers may have rights including the right to know, access, delete, correct, opt out of certain sales or sharing, limit certain uses of sensitive personal information, and receive equal treatment for exercising applicable rights. (California DOJ Attorney General)",
          "Where applicable, Levchary will provide required notices at or before the collection of personal information and will provide legally required methods for exercising privacy rights. (California DOJ Attorney General)",
          "California users may submit privacy requests through the contact methods provided below.",
          "Where applicable, Levchary will respond within the time required by law."
        ]
      },
      {
        "id": "sec-32",
        "title": "31. OTHER STATE PRIVACY LAWS",
        "paragraphs": [
          "Users in other states may have additional privacy rights under applicable state laws.",
          "Depending on the user's jurisdiction, such laws may provide rights concerning:",
          "Access",
          "Correction",
          "Deletion",
          "Data portability",
          "Opt-out of certain processing",
          "Sensitive personal information",
          "Targeted advertising",
          "Profiling",
          "Appeals",
          "Levchary will comply with applicable privacy laws and provide additional rights or notices where required."
        ]
      },
      {
        "id": "sec-33",
        "title": "32. HOW TO SUBMIT A PRIVACY REQUEST",
        "paragraphs": [
          "Privacy requests may be submitted to:",
          "Email: privacy@levchary.com",
          "Website: https://www.levchary.com/privacy",
          "You may request:",
          "Access to personal information",
          "Correction",
          "Deletion",
          "Information about our privacy practices",
          "Other applicable privacy rights",
          "We may need to verify your identity before processing certain requests.",
          "We will not require you to provide more information than reasonably necessary to verify your identity and process the request."
        ]
      },
      {
        "id": "sec-34",
        "title": "33. AUTHORIZED AGENTS",
        "paragraphs": [
          "Where permitted by applicable law, you may designate an authorized agent to submit a privacy request on your behalf.",
          "Levchary may require:",
          "Proof of authorization",
          "Verification of the consumer's identity",
          "Verification of the agent's identity"
        ]
      },
      {
        "id": "sec-35",
        "title": "34. NON-DISCRIMINATION",
        "paragraphs": [
          "Levchary will not unlawfully discriminate against a user for exercising a privacy right protected by applicable law.",
          "This may include refusing service, charging different prices, or providing a materially different level of service solely because a user exercised a protected privacy right, except where permitted by law."
        ]
      },
      {
        "id": "sec-36",
        "title": "35. THIRD-PARTY SERVICES",
        "paragraphs": [
          "Levchary may integrate with or link to third-party services, including:",
          "Payment processors",
          "Identity-verification services",
          "Background-check providers",
          "Video-conferencing platforms",
          "Authentication providers",
          "Analytics services",
          "Cloud infrastructure",
          "Communication services",
          "Third parties may independently collect and process information according to their own privacy policies.",
          "Levchary does not control the privacy practices of third-party services that it does not own or operate.",
          "Users should review applicable third-party privacy policies before using those services."
        ]
      },
      {
        "id": "sec-37",
        "title": "36. INTERNATIONAL USERS",
        "paragraphs": [
          "Levchary may eventually provide services to users outside the United States.",
          "Where Levchary processes personal information from users in other countries, additional privacy laws may apply.",
          "These may include laws concerning:",
          "Consent",
          "Access",
          "Correction",
          "Deletion",
          "Data transfers",
          "Data localization",
          "Data security",
          "Children's privacy",
          "Levchary may publish additional country-specific privacy notices where necessary."
        ]
      },
      {
        "id": "sec-38",
        "title": "37. INTERNATIONAL DATA TRANSFERS",
        "paragraphs": [
          "Where personal information is transferred between countries, Levchary will use appropriate safeguards required by applicable law.",
          "Depending on the circumstances, information may be processed in the United States or other countries where Levchary or its service providers operate."
        ]
      },
      {
        "id": "sec-39",
        "title": "38. MARKETING COMMUNICATIONS",
        "paragraphs": [
          "Levchary may send service-related communications that are necessary to operate an account or provide a requested service.",
          "Examples include:",
          "Booking confirmations",
          "Class reminders",
          "Payment notices",
          "Account-security notices",
          "Service updates",
          "Important policy notices",
          "Where legally permitted, Levchary may also send marketing communications.",
          "Users may unsubscribe from promotional email communications using the unsubscribe mechanism provided in the message.",
          "Unsubscribing from marketing communications will not necessarily stop essential service communications."
        ]
      },
      {
        "id": "sec-40",
        "title": "39. FRAUD PREVENTION AND PLATFORM SECURITY",
        "paragraphs": [
          "Levchary may process information to detect and prevent:",
          "Fraud",
          "Payment abuse",
          "Account takeover",
          "Identity theft",
          "Fake accounts",
          "Unauthorized transactions",
          "Circumvention of Platform rules",
          "Abuse of students or tutors",
          "Other harmful or prohibited conduct",
          "This may include automated systems and human review."
        ]
      },
      {
        "id": "sec-41",
        "title": "40. LEGAL COMPLIANCE AND DISCLOSURES",
        "paragraphs": [
          "Levchary may disclose information when reasonably necessary to:",
          "Comply with applicable law",
          "Respond to subpoenas or court orders",
          "Respond to government requests",
          "Protect users",
          "Protect Levchary's rights",
          "Investigate suspected fraud",
          "Investigate suspected unlawful conduct",
          "Prevent imminent harm",
          "Enforce contracts and policies",
          "Levchary will seek to limit disclosures to information reasonably necessary for the applicable purpose, subject to legal requirements."
        ]
      },
      {
        "id": "sec-42",
        "title": "41. DATA RELATING TO PARENTS AND GUARDIANS",
        "paragraphs": [
          "Parents and guardians may provide information about themselves and their children.",
          "When a parent or guardian provides a child's information to Levchary, the parent or guardian represents, where applicable, that they have the legal authority to provide that information and consent to its processing for the purposes disclosed.",
          "Nothing in this section eliminates any parental-consent requirement imposed by applicable law."
        ]
      },
      {
        "id": "sec-43",
        "title": "42. CHILDREN'S DATA RIGHTS",
        "paragraphs": [
          "Parents and legal guardians may have rights concerning personal information collected from their children.",
          "Where applicable, parents or guardians may request:",
          "Access to their child's information",
          "Correction",
          "Deletion",
          "Withdrawal of consent",
          "Cessation of further collection or use",
          "Levchary may require reasonable verification of the requesting person's identity and parental or guardian authority."
        ]
      },
      {
        "id": "sec-44",
        "title": "43. CHANGES TO THIS PRIVACY POLICY",
        "paragraphs": [
          "Levchary may update this Privacy Policy periodically.",
          "When we update it, we will revise the \"Last Updated\" date.",
          "If a change materially affects users' rights or our privacy practices and applicable law requires additional notice or consent, Levchary will provide the required notice or obtain the required consent.",
          "The current version will be available through the Levchary Platform."
        ]
      },
      {
        "id": "sec-45",
        "title": "44. RELATIONSHIP TO OTHER LEVCHARY POLICIES",
        "paragraphs": [
          "This Privacy Policy should be read together with applicable Levchary agreements and policies, including:",
          "Levchary User Agreement",
          "Levchary Tutor & Faculty Services Agreement",
          "Cancellation and Refund Policy",
          "Tutor Payout and Commission Policy",
          "Community and Safety Policy",
          "Acceptable Use Policy",
          "Class Recording Policy",
          "Background Check and Verification Authorization",
          "Those documents may contain additional requirements concerning the collection, use, disclosure, or protection of personal information."
        ]
      },
      {
        "id": "sec-46",
        "title": "45. ELECTRONIC ACKNOWLEDGMENT",
        "paragraphs": [
          "By creating an account or using the Platform, you acknowledge that you have had an opportunity to review this Privacy Policy.",
          "Where applicable law requires affirmative consent, Levchary will obtain that consent through an appropriate mechanism.",
          "For minors, Levchary will use the required parent or legal guardian consent process where applicable.",
          "The Platform may maintain an electronic record of:",
          "The user's identity",
          "Privacy Policy version",
          "Date and time of acknowledgment",
          "Method of acceptance",
          "Relevant account information",
          "Such records may be retained as reasonably necessary to demonstrate compliance, maintain contractual records, resolve disputes, and protect Levchary's rights."
        ]
      },
      {
        "id": "sec-47",
        "title": "46. CONTACT LEVCHARY",
        "paragraphs": [
          "Questions, privacy requests, complaints, or concerns regarding this Privacy Policy may be submitted to:",
          "LevcharyPrivacy Department",
          "Email: privacy@levchary.com",
          "Website: https://www.levchary.com/privacy",
          "Business/Legal Address: Maryland, USA. 21044"
        ]
      },
      {
        "id": "sec-48",
        "title": "47. EFFECTIVE DATE",
        "paragraphs": [
          "Effective Date: October 7, 2026",
          "Last Updated: October 7, 2026",
          "Levchary reserves the right to update this Privacy Policy as the Platform, applicable technology, business operations, and legal requirements evolve."
        ]
      }
    ]
  },
  "instructorAgreement": {
    "id": "instructorAgreement",
    "title": "LEVCHARY INSTRUCTOR (TUTOR & FACULTY) SERVICES AGREEMENT",
    "effectiveDate": "Effective Date: October 7, 2026",
    "sections": [
      {
        "id": "section-intro",
        "title": "Overview & Introduction",
        "paragraphs": [
          "This Tutor & Faculty Services Agreement (\"Agreement\") is entered into between Levchary LMS Inc., doing business as Levchary (\"Levchary,\" \"Company,\" \"we,\" \"us,\" or \"our\"), and the individual or entity applying to provide educational services through Levchary (\"Tutor,\" \"Faculty,\" \"you,\" or \"your\").",
          "By clicking \"I Agree,\" signing electronically, completing the Levchary instructor onboarding process, or providing services through Levchary, you agree to this Agreement.",
          "If you do not agree to this Agreement, you may not provide services through Levchary."
        ]
      },
      {
        "id": "sec-1",
        "title": "1. PURPOSE OF THIS AGREEMENT",
        "paragraphs": [
          "Levchary operates an educational technology marketplace that connects students and families with individuals who provide educational instruction and related services.",
          "This Agreement establishes the terms under which you may provide educational services through Levchary.",
          "This Agreement supplements the Levchary User Agreement, Privacy Policy, Safety Policy, Payment Policy, and other policies applicable to instructors.",
          "If there is a conflict between this Agreement and the general User Agreement concerning your responsibilities as a Tutor or Faculty member, this Agreement controls."
        ]
      },
      {
        "id": "sec-2",
        "title": "2. ELIGIBILITY AND APPROVAL",
        "paragraphs": [
          "You must provide truthful, complete, and current information during onboarding and throughout your relationship with Levchary.",
          "Levchary may require you to provide information including:",
          "legal name;",
          "photograph;",
          "contact information;",
          "education;",
          "degrees;",
          "licenses;",
          "certifications;",
          "teaching experience;",
          "professional experience;",
          "subjects and areas of expertise;",
          "grades or educational levels you are qualified to teach;",
          "availability;",
          "identity documentation;",
          "work authorization information where legally required;",
          "references;",
          "background-check information; and",
          "other information reasonably necessary for safety, verification, compliance, or Platform operations.",
          "Levchary may verify information you provide.",
          "Providing false, misleading, incomplete, altered, or fraudulent information may result in immediate rejection, suspension, or termination.",
          "Approval by Levchary does not guarantee continued access to the Platform."
        ]
      },
      {
        "id": "sec-3",
        "title": "3. IDENTITY VERIFICATION AND BACKGROUND CHECKS",
        "paragraphs": [
          "You authorize Levchary and its authorized service providers to conduct identity verification, credential verification, and, where legally permitted and properly authorized, background checks.",
          "You agree to provide information and authorization reasonably necessary to complete those checks.",
          "Where required by applicable law, Levchary will obtain appropriate authorization before requesting a consumer report or background check.",
          "Failure to complete a required verification process may prevent you from providing services through Levchary.",
          "Levchary may suspend or restrict your account while a verification issue is being reviewed.",
          "You must immediately notify Levchary if information previously provided becomes materially inaccurate or if a professional license, certification, or qualification required for your services expires, is suspended, or is revoked."
        ]
      },
      {
        "id": "sec-4",
        "title": "4. INDEPENDENT CONTRACTOR RELATIONSHIP",
        "paragraphs": [
          "To the maximum extent permitted by applicable law, the parties intend that you provide services as an independent contractor and not as an employee, partner, joint venturer, agent, or representative of Levchary.",
          "Nothing in this Agreement creates an employment relationship.",
          "Subject to applicable law and the requirements of the Platform, you generally control the manner and method by which you provide educational instruction.",
          "You are responsible for determining whether you are legally permitted to operate as an independent contractor and for satisfying applicable registration, licensing, tax, insurance, and other legal requirements.",
          "You are responsible for your own federal, state, and local taxes arising from payments you receive through Levchary, except for taxes that Levchary is legally required to withhold or pay.",
          "You are not entitled to employee benefits from Levchary, including unemployment benefits, workers' compensation benefits, paid leave, retirement benefits, or health benefits, except to the extent required by applicable law.",
          "Nothing in this Agreement waives any right or protection that cannot lawfully be waived."
        ]
      },
      {
        "id": "sec-5",
        "title": "5. NO AUTHORITY TO BIND LEVCHARY",
        "paragraphs": [
          "You may not represent that you are an employee, officer, partner, agent, or legal representative of Levchary.",
          "You may not:",
          "enter into contracts on behalf of Levchary;",
          "make promises or warranties on behalf of Levchary;",
          "incur obligations for Levchary;",
          "collect money on behalf of Levchary outside approved payment systems;",
          "represent that Levchary guarantees your services or qualifications; or",
          "use Levchary's name or branding in a manner that suggests you have authority to bind the Company."
        ]
      },
      {
        "id": "sec-6",
        "title": "6. TUTOR PROFILE",
        "paragraphs": [
          "Your profile must contain accurate information.",
          "You may be required to provide:",
          "professional photograph;",
          "education;",
          "qualifications;",
          "certifications;",
          "experience;",
          "biography;",
          "subjects;",
          "educational levels;",
          "approved service categories;",
          "teaching preferences;",
          "availability; and",
          "other information requested by Levchary.",
          "You may not exaggerate, misrepresent, or fabricate your qualifications, experience, employment history, education, certifications, licenses, or accomplishments.",
          "Levchary may edit or format profile information for consistency, accuracy, accessibility, safety, or Platform presentation."
        ]
      },
      {
        "id": "sec-7",
        "title": "7. SERVICES YOU MAY PROVIDE",
        "paragraphs": [
          "You may provide only services and instruction for which you have been approved by Levchary.",
          "You may not provide a subject, grade level, professional service, specialized service, or other offering through Levchary that requires qualifications you do not possess.",
          "You are responsible for preparing appropriately for each class and providing services professionally and competently.",
          "You must comply with applicable laws, professional requirements, school requirements, and Levchary policies."
        ]
      },
      {
        "id": "sec-8",
        "title": "8. TUTOR-SET PRICING",
        "paragraphs": [
          "Tutors and Faculty members determine the prices they charge for their services, subject to Levchary's applicable Platform rules and any minimum or maximum pricing requirements that Levchary may lawfully establish.",
          "You may set and update your listed price through the Platform where that functionality is provided.",
          "Your selected price must be accurate and must not be misleading.",
          "Once a student has completed a booking at a displayed price, that booking price is generally locked for that booking unless Levchary's applicable policies provide otherwise.",
          "You may not change the price of an already-confirmed booking without authorization from Levchary and, where applicable, the student's agreement.",
          "Levchary may establish and disclose its own:",
          "platform commission;",
          "service fees;",
          "payment-processing charges;",
          "promotional discounts;",
          "taxes or tax-related charges;",
          "payout rules; and",
          "other Platform financial terms.",
          "Levchary's commission or fees do not give Levchary ownership of the price you establish for your educational services.",
          "Levchary may require reasonable pricing-related information to operate the marketplace, process payments, display listings, calculate commissions, and comply with applicable law."
        ]
      },
      {
        "id": "sec-9",
        "title": "9. BOOKINGS AND ASSIGNMENTS",
        "paragraphs": [
          "A class or student assignment becomes your responsibility only after it has been confirmed through the Platform or otherwise authorized by Levchary.",
          "You must review the relevant booking information before accepting or providing the service.",
          "You may not transfer, sell, assign, or subcontract a student assignment to another person without Levchary's prior written authorization.",
          "You may not allow another person to teach a class under your account."
        ]
      },
      {
        "id": "sec-10",
        "title": "10. ATTENDANCE AND PUNCTUALITY",
        "paragraphs": [
          "You agree to make reasonable efforts to attend every confirmed class on time and prepared.",
          "Repeated lateness, early departures, cancellations, no-shows, or failure to provide scheduled services may result in reduced access to assignments, withholding of disputed amounts, suspension, or termination.",
          "If you cannot attend a scheduled class, you must notify Levchary as soon as reasonably possible.",
          "You may not arrange unauthorized substitute instructors."
        ]
      },
      {
        "id": "sec-11",
        "title": "11. CLASS QUALITY",
        "paragraphs": [
          "You agree to provide educational services in a professional manner consistent with the service represented on the Platform.",
          "You must:",
          "arrive prepared;",
          "communicate professionally;",
          "treat students respectfully;",
          "maintain appropriate boundaries;",
          "provide instruction appropriate to the student's educational level;",
          "comply with applicable safety requirements; and",
          "promptly report material issues affecting a student's safety or ability to participate.",
          "You do not guarantee a specific academic result unless expressly authorized by Levchary in writing."
        ]
      },
      {
        "id": "sec-12",
        "title": "12. STUDENT SAFETY AND PROFESSIONAL BOUNDARIES",
        "paragraphs": [
          "Student safety is a fundamental requirement of providing services through Levchary.",
          "You must maintain appropriate professional boundaries with students.",
          "You may not:",
          "sexually harass or sexually exploit a student;",
          "engage in romantic or sexual relationships with a minor student;",
          "request inappropriate photographs or information;",
          "send sexually explicit or inappropriate content;",
          "threaten, intimidate, humiliate, or abuse a student;",
          "encourage a student to conceal communications from a parent or guardian;",
          "use a student for personal financial gain outside authorized arrangements;",
          "engage in discriminatory conduct;",
          "use physical punishment; or",
          "engage in any conduct that creates an unreasonable safety risk.",
          "You must immediately report serious safety concerns to Levchary and, where legally required or appropriate, to the relevant authorities.",
          "Nothing in this Agreement prevents you from making a report that you are legally required or legally permitted to make."
        ]
      },
      {
        "id": "sec-13",
        "title": "13. MINORS",
        "paragraphs": [
          "Where a student is a minor, you agree to comply with all applicable laws, safety requirements, parental/guardian requirements, and Levchary policies.",
          "You may not intentionally circumvent a parent or legal guardian's involvement where such involvement is required by Levchary or applicable law.",
          "You may not encourage a minor to create secret accounts, conceal communications, evade parental controls, or meet privately outside authorized arrangements."
        ]
      },
      {
        "id": "sec-14",
        "title": "14. COMMUNICATION WITH STUDENTS",
        "paragraphs": [
          "Communication with students must remain professional and related to legitimate educational purposes.",
          "Where Levchary provides an in-platform messaging system, you agree to use that system when required by Levchary.",
          "You may not use Platform information to improperly solicit students for unrelated services.",
          "Levchary may review communications conducted through Platform systems for safety, fraud prevention, customer support, dispute resolution, quality assurance, compliance, or enforcement purposes."
        ]
      },
      {
        "id": "sec-15",
        "title": "15. OFF-PLATFORM TRANSACTIONS AND CIRCUMVENTION",
        "paragraphs": [
          "You may not use Levchary to obtain a student and then intentionally move that student relationship off the Platform for the purpose of avoiding Levchary's commissions, fees, payment systems, safety procedures, or other Platform requirements.",
          "You may not:",
          "request cash payments to avoid Platform charges;",
          "request direct bank transfers to avoid Platform charges;",
          "request payment through an unauthorized payment service;",
          "provide personal payment instructions for the purpose of circumventing Levchary;",
          "encourage students to cancel Platform bookings and pay you directly; or",
          "otherwise structure transactions to avoid Levchary's applicable fees.",
          "This restriction does not prohibit lawful conduct that cannot legally be restricted.",
          "Violations may result in immediate suspension or termination and may result in the withholding or adjustment of amounts where legally permitted."
        ]
      },
      {
        "id": "sec-16",
        "title": "16. PLATFORM COMMISSIONS AND FEES",
        "paragraphs": [
          "You establish the price charged for your services as described in Section 8.",
          "From that transaction, Levchary may deduct the applicable Platform commission, service fee, payment-processing charge, refund, chargeback, adjustment, or other amount authorized under your applicable financial terms.",
          "The applicable commission and other financial terms will be disclosed through the Platform, your instructor account, booking information, or another written agreement.",
          "Unless otherwise expressly agreed, your payout equals the applicable amount collected for your services minus Levchary's applicable commission, fees, adjustments, refunds, chargebacks, and other authorized deductions.",
          "Levchary may change its commission or fee structure prospectively by providing notice as required by applicable law or the applicable agreement.",
          "Changes will not retroactively alter the financial terms of a completed booking unless permitted by law and the applicable agreement."
        ]
      },
      {
        "id": "sec-17",
        "title": "17. PAYOUTS",
        "paragraphs": [
          "Amounts earned through completed services will be processed according to Levchary's applicable payout policy.",
          "Levchary may delay, hold, adjust, or reverse a payout when reasonably necessary because of:",
          "a suspected fraud issue;",
          "a chargeback;",
          "a payment dispute;",
          "a student refund;",
          "a cancellation;",
          "a class dispute;",
          "a technical or accounting error;",
          "an investigation;",
          "legal requirements; or",
          "other circumstances permitted by applicable law.",
          "Levchary will not intentionally withhold undisputed amounts indefinitely.",
          "You are responsible for providing accurate payout information.",
          "Levchary is not responsible for delays caused by incorrect banking information or third-party payment providers."
        ]
      },
      {
        "id": "sec-18",
        "title": "18. PAYMENT REVERSALS AND CHARGEBACKS",
        "paragraphs": [
          "If a student's payment is reversed, charged back, refunded, or determined to have been improperly processed, Levchary may adjust amounts previously credited to you to the extent permitted by law and the applicable payment terms.",
          "Levchary may request information or documentation from you concerning a disputed transaction.",
          "You agree to cooperate reasonably with payment investigations and disputes."
        ]
      },
      {
        "id": "sec-19",
        "title": "19. CANCELLATIONS AND REFUNDS",
        "paragraphs": [
          "You must comply with Levchary's cancellation and refund policies.",
          "You may not independently promise a student a refund, credit, replacement class, discount, or other financial remedy unless authorized by Levchary.",
          "If a student requests a refund, you must direct the student to Levchary's designated support process unless Levchary instructs otherwise."
        ]
      },
      {
        "id": "sec-20",
        "title": "20. CONFIDENTIALITY",
        "paragraphs": [
          "During your relationship with Levchary, you may receive confidential information concerning:",
          "students;",
          "parents and guardians;",
          "other instructors;",
          "Levchary's business;",
          "pricing;",
          "commissions;",
          "financial information;",
          "Platform operations;",
          "software;",
          "security systems;",
          "internal procedures;",
          "marketing strategies;",
          "business plans;",
          "communications; and",
          "other non-public information.",
          "You agree to keep confidential information confidential and use it only as necessary to provide authorized services.",
          "You may not disclose confidential information to any third party without authorization unless disclosure is required by law.",
          "Confidentiality obligations survive termination of this Agreement.",
          "Information that is publicly available through no breach of this Agreement is not confidential information."
        ]
      },
      {
        "id": "sec-21",
        "title": "21. STUDENT INFORMATION",
        "paragraphs": [
          "Student information is highly sensitive and must be handled carefully.",
          "You may use student information only for legitimate educational purposes authorized by Levchary.",
          "You may not:",
          "sell student information;",
          "share student information with unauthorized persons;",
          "use student information for unrelated marketing;",
          "retain unnecessary copies of student information;",
          "upload student information to unauthorized services; or",
          "use student information to create an independent customer list for unauthorized purposes.",
          "Upon termination or upon Levchary's request, you must return, delete, or cease using student information as required by Levchary and applicable law."
        ]
      },
      {
        "id": "sec-22",
        "title": "22. RECORDINGS, PHOTOGRAPHS, AND CLASS MATERIALS",
        "paragraphs": [
          "You may not record, photograph, screenshot, reproduce, publish, or distribute a student or class session without the required authorization.",
          "You may not independently publish recordings of Levchary classes.",
          "Any recording features provided by Levchary are governed by Levchary's recording, privacy, and consent policies.",
          "You may not use a student's image, name, voice, work, or testimonial for marketing without appropriate authorization."
        ]
      },
      {
        "id": "sec-23",
        "title": "23. INTELLECTUAL PROPERTY",
        "paragraphs": [
          "You retain ownership of original instructional materials that you independently own, subject to the rights granted below.",
          "You grant Levchary a non-exclusive, worldwide, royalty-free license to use, reproduce, display, store, format, and distribute materials you provide through the Platform to the extent reasonably necessary to operate, administer, market, and improve the Platform.",
          "You represent that you have the right to use materials you provide.",
          "You may not upload copyrighted materials that you do not have permission to use.",
          "Levchary retains ownership of its Platform, software, trademarks, branding, systems, databases, and proprietary materials."
        ]
      },
      {
        "id": "sec-24",
        "title": "24. USE OF LEVCHARY BRAND",
        "paragraphs": [
          "You may not use the Levchary name, logo, trademarks, or branding outside authorized Platform activities without prior written permission.",
          "You may not represent yourself as an owner, employee, officer, partner, or official spokesperson of Levchary unless expressly authorized."
        ]
      },
      {
        "id": "sec-25",
        "title": "25. REVIEWS AND RATINGS",
        "paragraphs": [
          "Students and families may submit reviews and ratings regarding your services.",
          "You agree not to:",
          "manipulate ratings;",
          "create fake reviews;",
          "pressure students to provide favorable reviews;",
          "offer unauthorized compensation for reviews;",
          "threaten students because of a negative review; or",
          "retaliate against a student for providing an honest review.",
          "Levchary may investigate suspicious reviews or ratings."
        ]
      },
      {
        "id": "sec-26",
        "title": "26. TAXES",
        "paragraphs": [
          "You are responsible for your tax obligations arising from amounts paid to you through Levchary, except taxes Levchary is legally required to handle.",
          "You agree to provide tax information reasonably required for payment reporting or legal compliance.",
          "Levchary may issue applicable tax forms where legally required."
        ]
      },
      {
        "id": "sec-27",
        "title": "27. INSURANCE",
        "paragraphs": [
          "You are responsible for maintaining insurance required by applicable law or reasonably appropriate for the services you provide.",
          "Depending on the services you provide, Levchary may require proof of insurance before permitting you to offer certain services.",
          "Levchary does not represent that its insurance, if any, covers your personal conduct, property, automobile use, professional liability, or other risks."
        ]
      },
      {
        "id": "sec-28",
        "title": "28. PHYSICAL CLASSES",
        "paragraphs": [
          "If you provide in-person services, you are responsible for following all applicable laws, safety requirements, and Levchary location policies.",
          "You must use only approved locations where Levchary requires an approved location.",
          "You must not arrange unauthorized private meetings with minor students.",
          "You must promptly report accidents, injuries, threats, or serious safety incidents associated with a Levchary class."
        ]
      },
      {
        "id": "sec-29",
        "title": "29. TECHNOLOGY AND VIRTUAL CLASSES",
        "paragraphs": [
          "For virtual instruction, you are responsible for maintaining reasonably adequate equipment and internet access unless Levchary expressly provides otherwise.",
          "You must use approved video-conferencing and communication systems where required.",
          "You may not intentionally record, distribute, or republish a virtual class without appropriate authorization.",
          "You must take reasonable steps to prevent unauthorized persons from accessing a virtual classroom."
        ]
      },
      {
        "id": "sec-30",
        "title": "30. PROHIBITED CONDUCT",
        "paragraphs": [
          "You may not use Levchary to:",
          "commit fraud;",
          "violate applicable law;",
          "harass or abuse users;",
          "discriminate unlawfully;",
          "steal or misuse personal information;",
          "circumvent Platform fees;",
          "manipulate bookings or reviews;",
          "falsify qualifications;",
          "impersonate another person;",
          "introduce malicious software;",
          "interfere with Platform security;",
          "scrape or exploit Platform data without authorization;",
          "solicit students for unauthorized purposes;",
          "engage in inappropriate conduct with minors;",
          "provide unauthorized services; or",
          "otherwise misuse the Platform."
        ]
      },
      {
        "id": "sec-31",
        "title": "31. MONITORING AND INVESTIGATIONS",
        "paragraphs": [
          "To protect students, instructors, Levchary, and the Platform, Levchary may investigate suspected violations of this Agreement.",
          "To the extent permitted by law, Levchary may review relevant Platform records, communications, bookings, payment records, complaints, reports, and other information reasonably related to an investigation.",
          "You agree to cooperate reasonably with legitimate investigations.",
          "Levchary may take protective measures while an investigation is pending, including temporary suspension."
        ]
      },
      {
        "id": "sec-32",
        "title": "32. SUSPENSION",
        "paragraphs": [
          "Levchary may temporarily suspend your account when reasonably necessary to:",
          "protect students;",
          "protect other users;",
          "investigate suspected misconduct;",
          "investigate fraud;",
          "verify information;",
          "address payment disputes;",
          "comply with legal requirements;",
          "protect Platform security; or",
          "prevent continued violation of this Agreement.",
          "Suspension does not necessarily constitute a finding that you violated the Agreement."
        ]
      },
      {
        "id": "sec-33",
        "title": "33. TERMINATION",
        "paragraphs": [
          "Either party may terminate the relationship subject to applicable law and any outstanding obligations.",
          "Levchary may terminate your access immediately where reasonably necessary because of:",
          "serious misconduct;",
          "safety concerns;",
          "fraud;",
          "falsification of information;",
          "material breach of this Agreement;",
          "unauthorized payment circumvention;",
          "inappropriate conduct involving a minor;",
          "misuse of confidential information;",
          "significant reputational or legal risk;",
          "repeated failure to provide scheduled services; or",
          "other material violations.",
          "Termination does not eliminate payment obligations or other obligations that accrued before termination."
        ]
      },
      {
        "id": "sec-34",
        "title": "34. EFFECT OF TERMINATION",
        "paragraphs": [
          "Upon termination:",
          "your access to the Platform may be disabled;",
          "you must stop representing yourself as an active Levchary instructor;",
          "you must stop using Levchary confidential information;",
          "you must stop using Levchary branding unless authorized;",
          "you must return or delete confidential information as required;",
          "outstanding financial obligations will be reconciled; and",
          "provisions intended to survive termination will remain effective."
        ]
      },
      {
        "id": "sec-35",
        "title": "35. INDEMNIFICATION",
        "paragraphs": [
          "To the maximum extent permitted by law, you agree to defend, indemnify, and hold harmless Levchary and its owners, officers, directors, employees, agents, affiliates, and service providers from claims, damages, losses, liabilities, costs, and reasonable attorneys' fees arising from or relating to:",
          "your breach of this Agreement;",
          "your negligent or wrongful conduct;",
          "your violation of applicable law;",
          "your violation of another person's rights;",
          "your User Content or instructional materials;",
          "your services provided outside the scope authorized by Levchary; or",
          "claims arising from your relationship with a student to the extent attributable to your conduct.",
          "This provision does not require indemnification for liability that cannot legally be shifted to you."
        ]
      },
      {
        "id": "sec-36",
        "title": "36. LIMITATION OF LEVCHARY'S LIABILITY",
        "paragraphs": [
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEVCHARY WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST BUSINESS, LOST OPPORTUNITIES, OR LOSS OF GOODWILL.",
          "TO THE MAXIMUM EXTENT PERMITTED BY LAW, LEVCHARY'S TOTAL LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT WILL NOT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY LEVCHARY TO YOU DURING THE SIX MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.",
          "Nothing in this Agreement limits liability that cannot legally be limited."
        ]
      },
      {
        "id": "sec-37",
        "title": "37. NO GUARANTEE OF STUDENT ASSIGNMENTS",
        "paragraphs": [
          "Levchary does not guarantee that you will receive:",
          "any student;",
          "any minimum number of classes;",
          "any minimum income;",
          "any minimum number of bookings; or",
          "any particular number of hours.",
          "Student demand may vary.",
          "Levchary may determine how students, classes, and opportunities are presented through the Platform."
        ]
      },
      {
        "id": "sec-38",
        "title": "38. NO EXCLUSIVITY",
        "paragraphs": [
          "Unless a separate written agreement expressly provides otherwise, you are not required to provide educational services exclusively through Levchary.",
          "However, you must comply with the confidentiality, student-safety, intellectual-property, payment, and anti-circumvention obligations contained in this Agreement.",
          "Nothing in this section restricts any right that cannot legally be restricted."
        ]
      },
      {
        "id": "sec-39",
        "title": "39. DISPUTES",
        "paragraphs": [
          "You agree to first contact Levchary and provide a reasonable opportunity to resolve any dispute informally.",
          "Legal/Support Contact: [EMAIL ADDRESS]",
          "If the dispute cannot be resolved informally, it will be resolved according to the dispute-resolution provisions and governing law applicable to this Agreement.",
          "Nothing in this Agreement prevents either party from exercising rights that cannot legally be waived."
        ]
      },
      {
        "id": "sec-40",
        "title": "40. GOVERNING LAW",
        "paragraphs": [
          "This Agreement will be governed by the laws of the State of Maryland, without regard to conflict-of-law principles, except where applicable law requires otherwise.",
          "Mandatory rights or protections provided by applicable law remain unaffected."
        ]
      },
      {
        "id": "sec-41",
        "title": "41. ELECTRONIC SIGNATURE",
        "paragraphs": [
          "You agree that this Agreement may be entered into electronically.",
          "By clicking \"I Agree,\" checking an acceptance box, signing electronically, or otherwise affirmatively accepting this Agreement, you agree that your electronic acceptance constitutes your legally binding signature to the same extent permitted by applicable law.",
          "Levchary may retain an electronic record of your acceptance."
        ]
      },
      {
        "id": "sec-42",
        "title": "42. CHANGES TO THIS AGREEMENT",
        "paragraphs": [
          "Levchary may update this Agreement from time to time.",
          "For material changes, Levchary will provide notice as required by applicable law.",
          "Where affirmative acceptance is legally required, Levchary may require you to accept the updated Agreement before continuing to provide services through the Platform."
        ]
      },
      {
        "id": "sec-43",
        "title": "43. SEVERABILITY",
        "paragraphs": [
          "If any provision of this Agreement is determined to be invalid or unenforceable, that provision will be modified or limited to the minimum extent necessary, and the remaining provisions will remain in effect to the maximum extent permitted by law."
        ]
      },
      {
        "id": "sec-44",
        "title": "44. NO WAIVER",
        "paragraphs": [
          "A failure by Levchary to enforce any provision of this Agreement does not waive Levchary's right to enforce that provision later."
        ]
      },
      {
        "id": "sec-45",
        "title": "45. ENTIRE AGREEMENT",
        "paragraphs": [
          "This Agreement, together with the documents and policies incorporated into it, constitutes the agreement between you and Levchary concerning your services through the Platform.",
          "Any amendment or additional agreement must be authorized by Levchary."
        ]
      },
      {
        "id": "sec-46",
        "title": "46. ELECTRONIC RECORD OF ACCEPTANCE",
        "paragraphs": [
          "Levchary may maintain an electronic record containing:",
          "your legal name;",
          "account information;",
          "Agreement version;",
          "date and time of acceptance;",
          "electronic signature or affirmative acceptance;",
          "applicable policies accepted;",
          "IP address or other technical information where lawfully collected; and",
          "other information reasonably necessary to demonstrate acceptance.",
          "You agree that these electronic records may be used to establish the existence and timing of your agreement, subject to applicable law.",
          "TUTOR ACKNOWLEDGMENT AND ACCEPTANCE",
          "By selecting \"I Agree & Become a Levchary Tutor/Faculty Member,\" you confirm that:",
          "\u2610 I have read and agree to this Tutor & Faculty Services Agreement.",
          "\u2610 I understand that I determine the price of my educational services, subject to applicable Levchary Platform rules.",
          "\u2610 I understand that Levchary may charge a commission or other Platform fees.",
          "\u2610 I understand that my applicable commission and fees will be disclosed through the Platform or applicable agreement.",
          "\u2610 I have provided accurate and truthful information.",
          "\u2610 I understand that Levchary may verify my identity, qualifications, and other information.",
          "\u2610 I agree to follow Levchary's student-safety and professional-conduct requirements.",
          "\u2610 I agree not to circumvent Levchary's payment system or applicable Platform fees.",
          "\u2610 I agree to protect confidential and student information.",
          "\u2610 I understand that Levchary does not guarantee me students, classes, or income.",
          "\u2610 I understand that my access may be suspended or terminated for violations of this Agreement.",
          "\u2610 I consent to electronic contracting and electronic records of my acceptance.",
          "Legal Name: __________________________________",
          "Electronic Signature: ___________________________",
          "Date: _________________________________________",
          "Account Email: _________________________________",
          "Manoj and Bharat \u2013 Thjs last part for signatures are not needed \u2013 all the instructors (Tutors and Faculty) need to do is to check a box to confirm agreement."
        ]
      }
    ]
  },
  "backgroundCheck": {
    "id": "backgroundCheck",
    "title": "LEVCHARY BACKGROUND CHECK & VERIFICATION AUTHORIZATION",
    "effectiveDate": "Effective Date: October 7, 2026Last Updated: October 7, 2026",
    "sections": [
      {
        "id": "sec-1",
        "title": "1. Purpose",
        "paragraphs": [
          "Levchary is committed to maintaining a safe, professional, and trustworthy educational marketplace. As part of its tutor and faculty approval process, Levchary may require verification of a Tutor/Faculty member's identity, education, professional qualifications, certifications, licenses, experience, and background.",
          "This Authorization explains the information that may be requested and the methods Levchary may use to verify that information."
        ]
      },
      {
        "id": "sec-2",
        "title": "2. Information That May Be Verified",
        "paragraphs": [
          "Depending on the services offered and the requirements applicable to the Tutor/Faculty member, Levchary may verify:",
          "Identity and government-issued identification;",
          "Educational degrees, diplomas, and academic credentials;",
          "Professional certifications;",
          "Professional licenses;",
          "Training and qualifications;",
          "Employment or professional experience;",
          "References;",
          "Professional standing;",
          "Background-check documentation; and",
          "Other information reasonably necessary to evaluate eligibility to provide services through Levchary."
        ]
      },
      {
        "id": "sec-3",
        "title": "3. Tutor/Faculty Responsibility to Obtain Documentation",
        "paragraphs": [
          "Levchary may require a Tutor/Faculty member to obtain certain verification documents or reports independently and submit them to Levchary.",
          "For example, Levchary may require the Tutor/Faculty member to obtain:",
          "A background-check report from an approved provider;",
          "A professional license verification;",
          "A certification verification;",
          "An education or degree verification;",
          "A professional credential report; or",
          "Other documentation reasonably required by Levchary.",
          "The Tutor/Faculty member is responsible for obtaining the requested documentation from the appropriate issuing organization, institution, government agency, licensing authority, or approved verification provider and providing it to Levchary within the required timeframe."
        ]
      },
      {
        "id": "sec-4",
        "title": "4. Direct Verification by Levchary",
        "paragraphs": [
          "Where appropriate, Levchary may independently verify information provided by a Tutor/Faculty member.",
          "This may include contacting or using:",
          "Educational institutions;",
          "Certification organizations;",
          "Licensing authorities;",
          "Professional organizations;",
          "Employers or professional references;",
          "Background-screening providers;",
          "Government or public records; or",
          "Other legitimate verification sources.",
          "The Tutor/Faculty member authorizes Levchary to make reasonable verification inquiries for purposes related to onboarding, eligibility, safety, compliance, and continued participation on the platform."
        ]
      },
      {
        "id": "sec-5",
        "title": "5. Verification of Tutor-Obtained Background Checks",
        "paragraphs": [
          "If Levchary requires a Tutor/Faculty member to obtain a background check independently, the report must generally:",
          "Come from a provider approved or accepted by Levchary;",
          "Be sufficiently recent based on Levchary's applicable requirements;",
          "Clearly identify the individual to whom the report relates;",
          "Be provided in an authentic and reasonably verifiable form; and",
          "Contain sufficient information for Levchary to evaluate the applicable requirements.",
          "Where reasonably available, Levchary may contact or use the issuing provider to confirm the authenticity, validity, date, or other relevant information contained in the report.",
          "Submitting a report does not guarantee approval."
        ]
      },
      {
        "id": "sec-6",
        "title": "6. Background Checks Obtained by Levchary",
        "paragraphs": [
          "In some circumstances, Levchary may elect to obtain a background report directly through a third-party screening provider rather than requiring the Tutor/Faculty member to obtain the report.",
          "If Levchary obtains a consumer report for a purpose covered by applicable federal, state, or local law, Levchary will follow the disclosure, authorization, notice, dispute, and other requirements applicable to that process.",
          "Where legally required, Levchary may provide a separate standalone disclosure and authorization before obtaining such a report."
        ]
      },
      {
        "id": "sec-7",
        "title": "7. Identity Documents",
        "paragraphs": [
          "Levchary may require a current government-issued identification document, such as a driver's license or passport, for identity verification.",
          "Identity documents are intended for verification and security purposes and may be restricted to authorized Levchary personnel and authorized verification providers."
        ]
      },
      {
        "id": "sec-8",
        "title": "8. Education and Professional Credentials",
        "paragraphs": [
          "A Tutor/Faculty member may be required to provide information or documentation relating to degrees, certifications, licenses, training, or other qualifications.",
          "Levchary may verify those credentials directly with the issuing institution or organization or may require the Tutor/Faculty member to obtain an official verification document or report and submit it to Levchary."
        ]
      },
      {
        "id": "sec-9",
        "title": "9. Accuracy and Authenticity",
        "paragraphs": [
          "The Tutor/Faculty member represents that information and documentation submitted to Levchary is accurate, current, complete, and authentic to the best of their knowledge.",
          "A Tutor/Faculty member must not:",
          "Alter or falsify a document;",
          "Submit another person's document;",
          "Misrepresent a qualification or credential;",
          "Provide misleading information; or",
          "Attempt to interfere with the verification process.",
          "Providing false, altered, misleading, or fraudulent information may result in rejection, suspension, or termination of the Tutor/Faculty member's account."
        ]
      },
      {
        "id": "sec-10",
        "title": "10. Use of Verification Information",
        "paragraphs": [
          "Levchary may use verification information to:",
          "Evaluate an application;",
          "Determine eligibility to provide services;",
          "Confirm qualifications;",
          "Protect students, parents, Tutors, Faculty, and other users;",
          "Prevent fraud or misrepresentation;",
          "Investigate safety or compliance concerns;",
          "Meet legal or regulatory requirements;",
          "Administer the platform; and",
          "Determine whether continued access to the platform is appropriate."
        ]
      },
      {
        "id": "sec-11",
        "title": "11. Verification Status",
        "paragraphs": [
          "After reviewing the applicable information, Levchary may assign a verification status such as:",
          "Pending;",
          "Verified;",
          "Additional Information Required;",
          "Unable to Verify;",
          "Not Approved; or",
          "Suspended.",
          "Verification status does not represent a guarantee that a Tutor/Faculty member is safe, qualified in every respect, or suitable for every student."
        ]
      },
      {
        "id": "sec-12",
        "title": "12. No Guarantee of Approval",
        "paragraphs": [
          "Submitting verification documentation or completing a background check does not guarantee approval to provide services through Levchary.",
          "Levchary may consider multiple factors when determining whether to approve, maintain, suspend, or terminate a Tutor/Faculty member's access."
        ]
      },
      {
        "id": "sec-13",
        "title": "13. Background-Check Results",
        "paragraphs": [
          "Where a background check is required, Levchary may review information relevant to its eligibility and safety requirements, subject to applicable law.",
          "A background check is one component of Levchary's overall verification process and does not guarantee that a person has never engaged in misconduct or that no future misconduct will occur."
        ]
      },
      {
        "id": "sec-14",
        "title": "14. Opportunity to Address Verification Issues",
        "paragraphs": [
          "If Levchary identifies an apparent discrepancy, incomplete information, questionable document, or other verification issue, Levchary may request additional information or documentation.",
          "Where applicable law provides rights concerning a background report or other consumer report, Levchary will follow those requirements."
        ]
      },
      {
        "id": "sec-15",
        "title": "15. Third-Party Verification Providers",
        "paragraphs": [
          "Levchary may use third-party companies to assist with identity verification, credential verification, background screening, document verification, fraud prevention, payment-related verification, or other compliance functions.",
          "Information provided to such providers will be handled in accordance with the Levchary Privacy Policy and applicable law."
        ]
      },
      {
        "id": "sec-16",
        "title": "16. Verification Information Is Not Public",
        "paragraphs": [
          "Verification documents and background-check information submitted to Levchary are not intended to be publicly displayed on a Tutor/Faculty profile.",
          "Levchary may disclose verification information to authorized service providers, regulators, law-enforcement authorities, or other parties when permitted or required by law or when reasonably necessary to protect users and the platform."
        ]
      },
      {
        "id": "sec-17",
        "title": "17. Ongoing Verification",
        "paragraphs": [
          "Verification is not necessarily a one-time process.",
          "Levchary may require a Tutor/Faculty member to:",
          "Renew an expired credential;",
          "Provide an updated background check;",
          "Re-verify identity;",
          "Update a license or certification;",
          "Provide additional documentation; or",
          "Complete another verification process.",
          "The frequency of re-verification may depend on the type of credential, applicable law, safety considerations, or Levchary's platform requirements."
        ]
      },
      {
        "id": "sec-18",
        "title": "18. Failure to Complete Verification",
        "paragraphs": [
          "If a Tutor/Faculty member does not provide requested verification information within the required timeframe, Levchary may:",
          "Delay approval;",
          "Restrict access to certain services;",
          "Prevent the Tutor/Faculty member from accepting new bookings;",
          "Temporarily suspend the account; or",
          "Terminate the account."
        ]
      },
      {
        "id": "sec-19",
        "title": "19. Withdrawal of Authorization",
        "paragraphs": [
          "A Tutor/Faculty member may withdraw authorization for verification activities to the extent permitted by applicable law.",
          "However, withdrawal may prevent Levchary from completing required verification and may therefore affect the individual's ability to become or remain an approved Tutor/Faculty member.",
          "Withdrawal does not invalidate verification activities lawfully completed before the withdrawal."
        ]
      },
      {
        "id": "sec-20",
        "title": "20. Privacy and Data Protection",
        "paragraphs": [
          "Verification information will be handled in accordance with the Levchary Privacy Policy and applicable privacy and data-protection laws.",
          "Levchary will take reasonable measures to protect verification information against unauthorized access, use, disclosure, alteration, or destruction."
        ]
      },
      {
        "id": "sec-21",
        "title": "21. Independent Contractor Relationship",
        "paragraphs": [
          "Completion of a background check or verification process does not create an employment relationship between the Tutor/Faculty member and Levchary.",
          "The relationship between Levchary and an approved Tutor/Faculty member is governed by the applicable Levchary Tutor & Faculty Services Agreement and applicable law."
        ]
      },
      {
        "id": "sec-22",
        "title": "22. No Guarantee of Safety",
        "paragraphs": [
          "Verification and background checks are intended to reduce risk and confirm information but cannot guarantee that a Tutor/Faculty member will not engage in inappropriate, unlawful, unsafe, or harmful conduct.",
          "Users should follow Levchary's safety procedures and report concerns through the appropriate channels."
        ]
      },
      {
        "id": "sec-23",
        "title": "23. Duty to Update Information",
        "paragraphs": [
          "A Tutor/Faculty member must promptly notify Levchary if information previously provided for verification becomes materially inaccurate, expires, is revoked, or otherwise changes in a manner that could affect eligibility to provide services through Levchary."
        ]
      },
      {
        "id": "sec-24",
        "title": "24. Electronic Authorization",
        "paragraphs": [
          "The Tutor/Faculty member may provide authorization electronically through the Levchary platform.",
          "Electronic acceptance, including checking an authorization box and submitting the application or verification form, may constitute the Tutor/Faculty member's electronic signature and authorization to the extent permitted by applicable law.",
          "Levchary may maintain an electronic record showing:",
          "The Tutor/Faculty member's identity;",
          "The applicable document version;",
          "The date and time of acceptance;",
          "The method of acceptance; and",
          "Other information reasonably necessary to demonstrate the authorization."
        ]
      },
      {
        "id": "sec-25",
        "title": "25. Important Legal Notice Regarding Consumer Reports",
        "paragraphs": [
          "If Levchary obtains or uses a consumer report for a purpose governed by the Fair Credit Reporting Act (FCRA) or another applicable background-screening law, additional requirements may apply.",
          "Those requirements may include specific disclosures, written authorization, notices concerning potential adverse action, opportunities to dispute inaccurate information, and other procedures.",
          "Where such requirements apply, Levchary will use the legally required process and documentation.",
          "A separate background-check disclosure and authorization may be provided when required."
        ]
      },
      {
        "id": "sec-26",
        "title": "26. Acknowledgment and Authorization",
        "paragraphs": [
          "By electronically accepting this document, I acknowledge that:",
          "I have read and understand this Background Check & Verification Authorization.",
          "I understand that Levchary may require me to obtain verification documents or background-check reports from an approved provider and submit them to Levchary.",
          "I understand that Levchary may verify documents or information directly with the issuing organization, institution, government agency, licensing authority, employer, professional organization, or verification provider.",
          "I understand that Levchary may, where appropriate, obtain verification or background information directly through a third-party provider.",
          "I authorize reasonable verification activities for purposes related to my application, eligibility, safety, compliance, and continued participation on Levchary.",
          "I understand that additional disclosures or authorizations may be required if a background report is obtained for a purpose covered by applicable law.",
          "I certify that the information and documentation I provide is accurate and authentic to the best of my knowledge.",
          "I understand that completing verification does not guarantee approval or continued access to Levchary.",
          "I understand that failure to complete required verification may prevent me from providing services through Levchary.",
          "Tutor/Faculty Name: ______________________________",
          "Electronic Signature/Acceptance: ___________________",
          "Date: ___________________",
          "Account Email: _________________________________",
          "Document Version: ______________________________",
          "Levchary Verification Status: ______________________",
          "Effective Date: October 7, 2026"
        ]
      }
    ]
  }
};

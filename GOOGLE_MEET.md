# Google Calendar & Meet Integration — Levchary LMS

## 1. Integration Architecture

Levchary LMS features an automated integration with the Google Calendar API to provision dedicated, enterprise-grade Google Meet conference rooms for all virtual classes (1-on-1 Virtual and Group Virtual).

---

## 2. Server-Side Execution & Security

- **Zero Client Credentials**: Google Cloud Service Account credentials are kept strictly on the server layer.
- **JWT Authorization**: Authenticates using `google.auth.JWT` with scoped permissions:
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`
- **Dynamic Module Loading**: The `googleapis` library is loaded dynamically server-side, preventing leakage into the client JavaScript bundle.

---

## 3. Concurrency & Group Meeting Sharing

- **1-on-1 Sessions**: A unique Google Meet room code is generated and attached to the booking upon confirmation.
- **Group Classes**: A single dedicated conference room is attached to the parent `ClassItem`. All enrolled students and the instructor access the exact same Google Meet URL from their respective dashboards.
- **Access Control (Rule 14)**: The Google Meet URL is only presented to authenticated users whose `student_id` or `tutor_id` matches the booking. Unauthorized visitors to the class page see only the class description and enrollment status.

---

## 4. Resilient Fallback & Local Development

In local development or environments where `GOOGLE_SERVICE_ACCOUNT_EMAIL` or `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` have not yet been configured, `GoogleMeetService` gracefully transitions to a deterministic conference room generator:
```typescript
const mockConferenceCode = `${randomChars}-${randomChars}-${randomChars}`;
return {
  eventId: `mock-gmeet-evt-${Date.now()}`,
  meetUrl: `https://meet.google.com/${mockConferenceCode}`,
  htmlLink: `https://calendar.google.com/event?eid=mock-${Date.now()}`,
};
```
This ensures developers and reviewers can test end-to-end booking, calendar displays, and launch flows without external API blockers.

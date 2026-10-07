# Jitsi Meet Virtual Classroom Integration — Levchary LMS

## 1. Executive Overview

Levchary LMS features an automated, in-app video conferencing integration with **Jitsi Meet** for all virtual classes (1-on-1 Virtual and Group Virtual).

Instead of forcing students and tutors out of the platform into third-party accounts (e.g., Google Meet), Jitsi Meet provides:
- **Zero Third-Party Account Dependency**: Neither tutors nor students need Google Workspace or specialized video accounts.
- **Embedded In-App Classroom**: Video conferencing is rendered directly inside the Levchary platform at `/classroom/[id]`.
- **Pre-Authenticated Participant Identity**: Display names and email addresses are automatically passed into the video room from the authenticated session (`useAuth`).
- **Encrypted WebRTC Streaming**: Peer-to-peer and SFU video conferencing with full camera, microphone, screen sharing, tile view, raise hand, and text chat capabilities.

---

## 2. Architecture & Components

```
┌─────────────────────────────────┐
│        Levchary Platform        │
│                                 │
│  ┌───────────────────────────┐  │
│  │   /classroom/[roomId]     │  │
│  │  ┌─────────────────────┐  │  │
│  │  │   JitsiClassroom    │  │  │
│  │  │  (IFrame API Embed) │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└────────────────┬────────────────┘
                 │ WebRTC / TLS
                 ▼
┌─────────────────────────────────┐
│     Jitsi Meet Server (SFU)     │
│   (meet.jit.si or self-hosted)  │
└─────────────────────────────────┘
```

### Key Modules:
1. **`src/services/jitsi-meet.ts`**:
   - Computes unique, secure room names: `Levchary-[ClassTitle]-[SessionId]-[Salt]`.
   - Generates both internal classroom route (`/classroom/...`) and external fallback links.
   - Reads `NEXT_PUBLIC_JITSI_DOMAIN` from environment variables.
2. **`src/components/classroom/jitsi-classroom.tsx`**:
   - Dynamically loads `external_api.js` from the configured Jitsi domain.
   - Configures audio/video initial state, toolbar controls, and branding.
   - Handles `videoConferenceLeft` and error fallbacks.
3. **`src/app/classroom/[id]/page.tsx`**:
   - Dedicated full-screen classroom interface with top navigation, session header, and one-click exit.

---

## 3. Configuration & Custom Domain

By default, Levchary uses the public, high-availability Jitsi cloud (`meet.jit.si`).

To switch to a custom self-hosted Jitsi Docker server or Jitsi as a Service (JaaS), set the following in `.env.local`:

```bash
# Optional: defaults to 'meet.jit.si' if unset
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si

# For custom or self-hosted instance (e.g., meet.levchary.com):
# NEXT_PUBLIC_JITSI_DOMAIN=meet.levchary.com
```

---

## 4. Participant Access Flow

1. **Student Books Virtual Class**:
   - `BookingService.bookOneOnOne` generates a unique Jitsi room name and assigns the classroom route to `booking.meet_url`.
2. **Classroom Launch**:
   - From the Student Dashboard (`/student/dashboard`), Student Bookings (`/student/bookings`), or Tutor Dashboard (`/tutor/dashboard`), users click **"Enter Virtual Classroom"**.
   - The user is navigated to `/classroom/[roomName]`.
   - Participant credentials (first name, last name, email) are auto-populated into the room.
3. **Session Conclusion**:
   - Upon clicking "Leave Class" or ending the call, the user is presented with a session conclusion screen and a button returning them to their respective dashboard.

// ============================================================
// LEVCHARY LMS - JITSI MEET VIDEO CONFERENCING SERVICE
// Secure room provisioning, in-app classroom links & domain configuration
// ============================================================

export interface MeetingRequest {
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  attendeeEmails?: string[];
  bookingId?: string;
}

export interface MeetingDetails {
  eventId: string;
  roomName: string;
  meetUrl: string;       // Direct Jitsi URL (e.g. https://meet.jit.si/Levchary-...)
  classroomUrl: string;  // In-app embedded classroom URL (e.g. /classroom/...)
  domain: string;
}

export class JitsiMeetService {
  /**
   * The Jitsi instance domain (can be self-hosted e.g. meet.levchary.com or default meet.jit.si)
   */
  static getDomain(): string {
    return process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
  }

  /**
   * Generate a clean, URL-safe and unique room name for a Levchary session
   */
  static generateRoomName(title: string, bookingOrClassId?: string): string {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 18) || 'Class';
    
    const uniqueId = bookingOrClassId
      ? bookingOrClassId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
      : Math.random().toString(36).substring(2, 8);

    const randomSalt = Math.random().toString(36).substring(2, 6);

    return `Levchary-${cleanTitle}-${uniqueId}-${randomSalt}`;
  }

  /**
   * Automatically generate dedicated Jitsi Meet room for a virtual class
   */
  static async createMeeting(req: MeetingRequest): Promise<MeetingDetails> {
    const domain = this.getDomain();
    const eventId = req.bookingId || `jitsi-evt-${Date.now()}`;
    const roomName = this.generateRoomName(req.title, req.bookingId);
    
    // Direct Jitsi conference URL
    const meetUrl = `https://${domain}/${roomName}`;
    
    // In-app embedded classroom route inside Levchary
    const classroomUrl = `/classroom/${encodeURIComponent(roomName)}`;

    return {
      eventId,
      roomName,
      meetUrl,
      classroomUrl,
      domain,
    };
  }

  /**
   * Cancel or release meeting room
   */
  static async cancelMeeting(eventId: string): Promise<boolean> {
    // Jitsi rooms are ephemeral and automatically tear down when participants leave
    return true;
  }
}

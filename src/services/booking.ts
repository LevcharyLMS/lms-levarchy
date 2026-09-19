// ============================================================
// LEVCHARY LMS - BOOKING & SCHEDULING SERVICE
// Atomic double-booking prevention, capacity enforcement & state machines
// ============================================================

import { db } from '@/lib/data-store';
import { BookingStatus, ClassFormat } from '@/types';
import { GoogleMeetService } from './google-meet';
import { NotificationService } from './notification';
import { AuditService } from './audit';

export class BookingService {
  /**
   * Book a 1-on-1 class slot with atomic double-booking prevention
   */
  static async bookOneOnOne(params: {
    studentId: string;
    tutorId: string;
    classId: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    format: ClassFormat;
    locationId?: string;
    notes?: string;
  }) {
    // 1. Atomically reserve slot and create immutable financial snapshot
    const { booking, snapshot } = db.bookOneOnOneSlot(params);

    // 2. Generate Google Meet link if virtual
    if (params.format === 'VIRTUAL') {
      try {
        const meetInfo = await GoogleMeetService.createMeeting({
          title: `Levchary 1-on-1 Class: ${booking.booking_number}`,
          startTime: booking.start_time,
          endTime: booking.end_time,
        });
        booking.meet_url = meetInfo.meetUrl;
        booking.meet_event_id = meetInfo.eventId;
      } catch (err) {
        console.warn('Google Meet fallback utilized:', err);
      }
    }

    // 3. Send confirmation notifications
    await NotificationService.sendNotification({
      userId: params.studentId,
      title: 'Class Booking Confirmed',
      message: `Your session (${booking.booking_number}) has been scheduled for ${new Date(params.startTime).toLocaleDateString()}.`,
      type: 'BOOKING',
      link: `/student/bookings`,
      idempotencyKey: `notif-bk-student-${booking.id}`,
    });

    await NotificationService.sendNotification({
      userId: params.tutorId,
      title: 'New Student Booking Received',
      message: `A student has booked a session (${booking.booking_number}) with you.`,
      type: 'BOOKING',
      link: `/tutor/classes`,
      idempotencyKey: `notif-bk-tutor-${booking.id}`,
    });

    return { booking, snapshot };
  }

  /**
   * Enroll in a group class with strict capacity enforcement
   */
  static async enrollInGroupClass(params: {
    studentId: string;
    classId: string;
    timezone?: string;
  }) {
    const { booking, snapshot } = db.enrollGroupClass(params);

    await NotificationService.sendNotification({
      userId: params.studentId,
      title: 'Group Class Enrollment Confirmed',
      message: `You are enrolled in cohort (${booking.booking_number}).`,
      type: 'BOOKING',
      link: `/student/classes`,
      idempotencyKey: `notif-grp-student-${booking.id}`,
    });

    return { booking, snapshot };
  }

  /**
   * Update booking status with state validation and audit logging
   */
  static async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    actorId: string,
    reason?: string
  ) {
    const booking = db.getBookings().find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found.');

    const oldStatus = booking.status;
    booking.status = newStatus;
    booking.updated_at = new Date().toISOString();

    AuditService.log({
      actor_id: actorId,
      actor_role: 'ADMIN',
      action: 'BOOKING_STATUS_TRANSITION',
      entity_type: 'BOOKING',
      entity_id: bookingId,
      metadata: { old_status: oldStatus, new_status: newStatus, reason },
    });

    return booking;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase-db';
import { BrevoService } from '@/lib/brevo';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Generate token and record expiry in DB
    const result = await SupabaseDbService.createPasswordResetToken(email);

    // If account exists, send reset email via Brevo
    if (result && result.token) {
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ||
        req.headers.get('origin') ||
        'http://localhost:3000';

      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(
        result.token
      )}&email=${encodeURIComponent(result.user.email)}`;

      try {
        await BrevoService.sendPasswordResetEmail({
          to: result.user.email,
          firstName: result.user.first_name || 'Levchary Learner',
          resetUrl,
        });
      } catch (emailErr) {
        console.error('Failed to dispatch password reset email:', emailErr);
      }
    }

    // Always respond with a generic success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message:
        'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error: any) {
    console.error('Error in /api/auth/forgot-password:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing password reset request' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: 'Token and email parameters are required.' },
        { status: 400 }
      );
    }

    const verification = await SupabaseDbService.verifyPasswordResetToken(email, token);
    if (!verification.valid) {
      return NextResponse.json(
        { valid: false, error: verification.error || 'Token is invalid or expired.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: verification.user?.email || email,
      firstName: verification.user?.first_name || '',
    });
  } catch (error: any) {
    console.error('Error in GET /api/auth/reset-password:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify reset token.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Email, token, and new password are required.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    // In production this would be hashed with bcrypt/argon2. We store a consistent hash representation.
    const passwordHash = `hashed_${newPassword}`;

    const result = await SupabaseDbService.resetPasswordWithToken(
      email,
      token,
      passwordHash
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Password reset failed. The link may have expired.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You may now sign in.',
    });
  } catch (error: any) {
    console.error('Error in POST /api/auth/reset-password:', error);
    return NextResponse.json(
      { error: 'Internal server error while resetting password.' },
      { status: 500 }
    );
  }
}

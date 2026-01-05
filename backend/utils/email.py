"""
Email service utilities for Zapiio
Handles email sending via Resend API
"""

import os
from typing import Optional
import resend

# Configure Resend API key
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "Zapiio <noreply@zapiio.com>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Initialize Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
else:
    print("⚠️  WARNING: RESEND_API_KEY not set. Email sending will be simulated.")


def send_email(to: str, subject: str, html: str) -> bool:
    """
    Send an email using Resend API
    
    Args:
        to: Recipient email address
        subject: Email subject
        html: HTML content of the email
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not RESEND_API_KEY:
        print(f"\n{'='*60}")
        print(f"📧 EMAIL SIMULATION (No RESEND_API_KEY configured)")
        print(f"{'='*60}")
        print(f"To: {to}")
        print(f"Subject: {subject}")
        print(f"{'='*60}")
        print(html)
        print(f"{'='*60}\n")
        return True
    
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        
        resend.Emails.send(params)
        print(f"✓ Email sent to {to}: {subject}")
        return True
    except Exception as e:
        print(f"✗ Failed to send email to {to}: {e}")
        return False


def send_verification_email(email: str, name: str, verification_token: str) -> bool:
    """
    Send email verification email
    
    Args:
        email: User's email address
        name: User's name
        verification_token: Verification token
        
    Returns:
        True if email sent successfully
    """
    verification_url = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    
    subject = "Welcome to Zapiio - Verify Your Email"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Zapiio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1a1f36 0%, #2a3152 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #BFFF00; font-size: 32px; font-weight: bold;">Zapiio</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Property Investment Portfolio Management</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a1f36; font-size: 24px; font-weight: 600;">
                                Welcome to Zapiio, {name}!
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Thank you for creating your Zapiio account. We're excited to help you track your property portfolio and achieve your financial goals.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                To get started, please verify your email address by clicking the button below:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background-color: #BFFF00;">
                                        <a href="{verification_url}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #1a1f36; text-decoration: none; border-radius: 6px;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0 0; color: #4299e1; font-size: 14px; word-break: break-all;">
                                {verification_url}
                            </p>
                            
                            <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                This link will expire in 24 hours for security reasons.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                If you didn't create a Zapiio account, you can safely ignore this email.
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2026 Zapiio. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    return send_email(email, subject, html)


def send_password_reset_email(email: str, name: str, reset_token: str) -> bool:
    """
    Send password reset email
    
    Args:
        email: User's email address
        name: User's name
        reset_token: Password reset token
        
    Returns:
        True if email sent successfully
    """
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    subject = "Reset Your Zapiio Password"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Zapiio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1a1f36 0%, #2a3152 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #BFFF00; font-size: 32px; font-weight: bold;">Zapiio</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Property Investment Portfolio Management</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a1f36; font-size: 24px; font-weight: 600;">
                                Password Reset Request
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hi {name},
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                We received a request to reset the password for your Zapiio account. Click the button below to create a new password:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background-color: #BFFF00;">
                                        <a href="{reset_url}" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #1a1f36; text-decoration: none; border-radius: 6px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0 0; color: #4299e1; font-size: 14px; word-break: break-all;">
                                {reset_url}
                            </p>
                            
                            <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                This link will expire in 1 hour for security reasons.
                            </p>
                            
                            <div style="margin: 30px 0 0 0; padding: 20px; background-color: #fff5f5; border-left: 4px solid #fc8181; border-radius: 4px;">
                                <p style="margin: 0; color: #742a2a; font-size: 14px; font-weight: 600;">
                                    Security Notice
                                </p>
                                <p style="margin: 10px 0 0 0; color: #742a2a; font-size: 14px; line-height: 1.6;">
                                    If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                For security reasons, this password reset link will expire in 1 hour.
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2026 Zapiio. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    return send_email(email, subject, html)


def send_welcome_email(email: str, name: str) -> bool:
    """
    Send welcome email after email verification
    
    Args:
        email: User's email address
        name: User's name
        
    Returns:
        True if email sent successfully
    """
    subject = "Welcome to Zapiio - Let's Get Started!"
    
    html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Zapiio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #1a1f36 0%, #2a3152 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #BFFF00; font-size: 32px; font-weight: bold;">🎉 Welcome to Zapiio!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a1f36; font-size: 24px; font-weight: 600;">
                                You're all set, {name}!
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Your email has been verified and your account is ready to use. Here's what you can do with Zapiio:
                            </p>
                            
                            <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                                <li>Track multiple property portfolios</li>
                                <li>Monitor your net worth and cashflow</li>
                                <li>Manage income, expenses, assets, and liabilities</li>
                                <li>Create and track FIRE plans</li>
                                <li>Visualize your financial progress with interactive charts</li>
                            </ul>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background-color: #BFFF00;">
                                        <a href="{FRONTEND_URL}/dashboard" target="_blank" style="display: inline-block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: #1a1f36; text-decoration: none; border-radius: 6px;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                Need help getting started? Check out our <a href="{FRONTEND_URL}/help" style="color: #4299e1; text-decoration: none;">Help Center</a> or contact support.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2026 Zapiio. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    return send_email(email, subject, html)


# Example usage and testing
if __name__ == "__main__":
    print("Testing email service...")
    
    # Test verification email
    send_verification_email(
        email="test@example.com",
        name="Test User",
        verification_token="test-token-123"
    )
    
    print("\n" + "="*60 + "\n")
    
    # Test password reset email
    send_password_reset_email(
        email="test@example.com",
        name="Test User",
        reset_token="reset-token-456"
    )
    
    print("\nEmail service test complete!")

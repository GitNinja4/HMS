"""Email service for sending emails."""

import secrets
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import EmailToken
from app.config import settings


class EmailService:
    """Service for email operations."""
    
    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure verification token."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_verification_token(db: Session, user_id: int) -> str:
        """
        Create a verification token for email confirmation.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Verification token
        """
        token = EmailService.generate_verification_token()
        
        email_token = EmailToken.create_token(user_id, token)
        db.add(email_token)
        db.commit()
        
        return token
    
    @staticmethod
    def verify_email_token(db: Session, user_id: int, token: str) -> bool:
        """
        Verify an email token and mark as used.
        
        Args:
            db: Database session
            user_id: User ID
            token: Token to verify
            
        Returns:
            True if token is valid and not expired, False otherwise
        """
        email_token = db.query(EmailToken).filter(
            EmailToken.user_id == user_id,
            EmailToken.token == token
        ).first()
        
        if not email_token:
            return False
        
        if email_token.used:
            return False
        
        if datetime.utcnow() > email_token.expires_at:
            return False
        
        email_token.used = True
        db.commit()
        
        return True
    
    @staticmethod
    def send_verification_email(email: str, user_name: str, verification_token: str) -> bool:
        """
        Send verification email to user.
        
        Args:
            email: Recipient email
            user_name: User's name
            verification_token: Verification token to include in email
            
        Returns:
            True if successful, False otherwise
        """
        # TODO: Implement actual email sending using SendGrid, AWS SES, or similar
        # For now, just log the token for development purposes
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        print(f"""
        =====================================
        [EMAIL VERIFICATION]
        =====================================
        To: {email}
        Name: {user_name}
        
        Please verify your email by clicking the link below:
        {verification_url}
        
        This link expires in 24 hours.
        =====================================
        """)
        
        return True
    
    @staticmethod
    def send_password_reset_email(email: str, user_name: str, reset_token: str) -> bool:
        """
        Send password reset email to user.
        
        Args:
            email: Recipient email
            user_name: User's name
            reset_token: Password reset token
            
        Returns:
            True if successful, False otherwise
        """
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        print(f"""
        =====================================
        [PASSWORD RESET]
        =====================================
        To: {email}
        Name: {user_name}
        
        Click the link below to reset your password:
        {reset_url}
        
        This link expires in 1 hour.
        =====================================
        """)
        
        return True

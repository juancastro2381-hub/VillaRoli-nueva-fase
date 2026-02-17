"""
File Storage Service for Payment Evidence

Handles secure upload and storage of payment evidence files
(screenshots, receipts, etc.) for bank transfer confirmations.
"""

from fastapi import HTTPException, UploadFile
import os
from datetime import datetime
import uuid
import logging

logger = logging.getLogger("file_storage")


class FileStorageService:
    """Handle secure file uploads for payment evidence"""
    
    UPLOAD_DIR = "./uploads/payment_evidence"
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}
    
    @staticmethod
    async def upload_evidence(
        payment_id: int,
        file: UploadFile
    ) -> str:
        """
        Upload payment evidence file.
        
        Args:
            payment_id: ID of the payment
            file: Uploaded file
            
        Returns:
            str: Path to stored file
            
        Raises:
            HTTPException: If file is invalid
        """
        # Validate file
        FileStorageService._validate_file(file)
        
        # Generate unique filename
        ext = os.path.splitext(file.filename)[1].lower()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_id = uuid.uuid4().hex[:8]
        unique_name = f"payment_{payment_id}_{timestamp}_{unique_id}{ext}"
        file_path = os.path.join(FileStorageService.UPLOAD_DIR, unique_name)
        
        # Ensure directory exists
        os.makedirs(FileStorageService.UPLOAD_DIR, exist_ok=True)
        
        # Save file
        try:
            content = await file.read()
            
            # Check size after reading
            if len(content) > FileStorageService.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {FileStorageService.MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            logger.info(f"Evidence uploaded: {file_path} ({len(content)} bytes)")
            
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save file: {e}")
            raise HTTPException(status_code=500, detail="Failed to save file")
    
    @staticmethod
    def _validate_file(file: UploadFile):
        """
        Validate uploaded file.
        
        Checks:
        - File extension is allowed
        - Filename exists
        """
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in FileStorageService.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(FileStorageService.ALLOWED_EXTENSIONS)}"
            )
    
    @staticmethod
    def get_file_url(file_path: str) -> str:
        """
        Get public URL for file.
        
        In production, this would return a CDN URL or signed URL.
        For now, returns the file path.
        """
        # TODO: In production, upload to cloud storage and return CDN URL
        return file_path

-- Migration to add RAG processing fields to documents table

-- Add isProcessed field
ALTER TABLE documents ADD COLUMN isProcessed BOOLEAN DEFAULT 0;

-- Add processedAt field  
ALTER TABLE documents ADD COLUMN processedAt DATETIME;

-- Create index for faster queries
CREATE INDEX idx_documents_isProcessed ON documents(isProcessed);

-- Update existing documents to be unprocessed
UPDATE documents SET isProcessed = 0 WHERE isProcessed IS NULL;
DROP INDEX IF EXISTS idx_vendor_requests_created_at;
DROP INDEX IF EXISTS idx_vendor_requests_deleted_at;
DROP INDEX IF EXISTS idx_vendor_requests_user_id;
DROP INDEX IF EXISTS idx_vendor_requests_email_active;
DROP INDEX IF EXISTS idx_vendor_requests_phone_active;
DROP INDEX IF EXISTS idx_vendor_requests_nid_active;

DROP TABLE IF EXISTS vendor_requests;
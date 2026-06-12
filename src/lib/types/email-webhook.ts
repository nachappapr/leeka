/** Shape of the jsonb returned by mark_email_status(p_provider_msg_id, p_status). */
export interface MarkEmailStatusResult {
  message_found: boolean;
  invoice_transitioned: boolean;
}

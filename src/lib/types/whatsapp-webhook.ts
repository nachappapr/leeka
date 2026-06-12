/** Shape of the jsonb returned by mark_message_status(p_provider_msg_id, p_status). */
export interface MarkMessageStatusResult {
  message_found: boolean;
  invoice_transitioned: boolean;
}

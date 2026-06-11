export interface SavedItem {
  id: string;
  business_id: string;
  name: string;
  hsn_sac: string | null;
  unit: string | null;
  default_price: number;
  default_gst_rate: number | null;
  created_at: string;
}

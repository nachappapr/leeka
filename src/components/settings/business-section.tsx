import { CameraIcon } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";

export function BusinessSection() {
  return (
    <Card title="Business profile" headingLevel={3}>
      <div className="p-6">
        <div className="mb-5 flex items-center gap-4">
          <div
            className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl bg-coral text-white"
            aria-label="Business logo placeholder"
            role="img"
          >
            <span className="text-money-sm font-extrabold" aria-hidden>
              RK
            </span>
          </div>
          <PillButton tone="outline" size="md">
            <CameraIcon size={16} aria-hidden />
            Change logo
          </PillButton>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <div>
            <FieldLabel htmlFor="biz-name">Business name</FieldLabel>
            <InputField
              id="biz-name"
              defaultValue="Raj Kumar Trading"
              autoComplete="organization"
              size="web"
            />
          </div>
          <div>
            <FieldLabel htmlFor="biz-phone">Phone</FieldLabel>
            <InputField
              id="biz-phone"
              defaultValue="+91 98765 43210"
              type="tel"
              autoComplete="tel"
              size="web"
            />
          </div>
          <div className="col-span-full">
            <FieldLabel htmlFor="biz-address">Address</FieldLabel>
            <InputField
              id="biz-address"
              defaultValue="Sector 14, Gurugram, Haryana 122001"
              autoComplete="street-address"
              size="web"
            />
          </div>
          <div>
            <FieldLabel htmlFor="biz-gstin">GSTIN (optional)</FieldLabel>
            <InputField
              id="biz-gstin"
              defaultValue="07AAACR1234A1Z5"
              autoComplete="off"
              size="web"
            />
          </div>
          <div>
            <FieldLabel htmlFor="biz-upi">UPI ID</FieldLabel>
            <InputField id="biz-upi" defaultValue="rajkumar@oksbi" autoComplete="off" size="web" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <PillButton tone="ghost" size="md" type="button">
            Cancel
          </PillButton>
          <PillButton tone="primary" size="md" type="button">
            Save changes
          </PillButton>
        </div>
      </div>
    </Card>
  );
}

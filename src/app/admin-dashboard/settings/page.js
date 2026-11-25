import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { saveSiteSettings } from "@/app/actions/admin-content";
import { PageHeader, Notice, Field, TextArea } from "@/components/admin/ui";

export default async function Settings({ searchParams }) {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Website settings" /><Notice searchParams={await searchParams} />
      <form action={saveSiteSettings} className="card grid max-w-3xl gap-4 p-5 sm:grid-cols-2">
        <Field label="Website name" name="siteName" defaultValue={s.siteName} /><Field label="Tagline" name="tagline" defaultValue={s.tagline} />
        <Field label="Logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp" hint={s.logo ? `Used as the site logo and favicon. Current: ${s.logo}` : "No logo uploaded; the site name is shown. Uploaded logos are also used as the favicon."} /><Field label="Announcement bar (empty = hidden)" name="announcement" defaultValue={s.announcement} />
        <Field label="Contact number" name="contactPhone" defaultValue={s.contactPhone} /><Field label="Email" name="contactEmail" type="email" defaultValue={s.contactEmail} />
        <div className="sm:col-span-2"><Field label="Address" name="address" defaultValue={s.address} /></div>
        <Field label="Facebook URL" name="facebookUrl" defaultValue={s.facebookUrl} /><Field label="WhatsApp URL" name="whatsappUrl" defaultValue={s.whatsappUrl} /><Field label="Messenger URL" name="messengerUrl" defaultValue={s.messengerUrl} />
        <Field label="Delivery information (footer)" name="deliveryInfo" defaultValue={s.deliveryInfo} />
        <div className="sm:col-span-2"><TextArea label="Footer text" name="footerText" defaultValue={s.footerText} rows={2} /></div>
        <Field label="Default SEO title" name="seoTitle" defaultValue={s.seoTitle} /><Field label="Default SEO description" name="seoDescription" defaultValue={s.seoDescription} />
        <div className="sm:col-span-2"><TextArea label="Terms (/terms) — plain text" name="termsContent" defaultValue={s.termsContent} rows={10} /></div>
        <div className="sm:col-span-2"><TextArea label="Privacy policy (/privacy-policy) — plain text" name="privacyContent" defaultValue={s.privacyContent} rows={10} /></div>
        <button className="btn-primary sm:col-span-2">Save settings</button>
      </form>
    </>
  );
}

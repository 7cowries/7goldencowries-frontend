import React, { useEffect, useMemo, useState } from 'react';
import Page from '../components/Page';
import { getPartnerSlots, submitPartnerApplication } from '../utils/api';

const initialForm = {
  brand_name: '',
  contact_name: '',
  email: '',
  telegram_handle: '',
  twitter_handle: '',
  website_url: '',
  campaign_type: 'sponsored_quest',
  target_audience: '',
  desired_start_date: '',
  budget: '',
  notes: '',
};

export default function Partners() {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getPartnerSlots()
      .then((res) => setSlots(res?.slots || res?.items || []))
      .catch(() => setSlots([]));
  }, []);

  const canSubmit = useMemo(() => {
    return form.brand_name && form.contact_name && form.email && form.campaign_type && form.budget;
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setMsg('');
    try {
      await submitPartnerApplication(form);
      setMsg('Application submitted successfully. Our partnerships team will contact you shortly.');
      setForm(initialForm);
    } catch (err) {
      setMsg(err?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="glass-strong" style={{ padding: 20 }}>
        <h1>Partner & Sponsor Slots</h1>
        <p className="muted">Run sponsored quests or sponsor a Crowns Arena placement with on-platform visibility.</p>

        <div className="glass" style={{ padding: 12, marginBottom: 12 }}>
          <h3>Available slot model</h3>
          {slots.length === 0 && <p className="muted">Current slots are shared during review.</p>}
          {slots.map((slot, i) => (
            <p key={`${slot?.id || i}`}>{slot?.title || slot?.name || `Slot ${i + 1}`} — {slot?.description || 'Sponsored placement'}</p>
          ))}
        </div>

        <form className="glass" style={{ padding: 12, display: 'grid', gap: 10 }} onSubmit={onSubmit}>
          <input name="brand_name" value={form.brand_name} onChange={onChange} placeholder="Brand / Project name" required />
          <input name="contact_name" value={form.contact_name} onChange={onChange} placeholder="Contact name" required />
          <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" required />
          <input name="telegram_handle" value={form.telegram_handle} onChange={onChange} placeholder="Telegram handle" />
          <input name="twitter_handle" value={form.twitter_handle} onChange={onChange} placeholder="X/Twitter handle" />
          <input name="website_url" value={form.website_url} onChange={onChange} placeholder="Website URL" />
          <select name="campaign_type" value={form.campaign_type} onChange={onChange}>
            <option value="sponsored_quest">Sponsored Quest</option>
            <option value="sponsored_arena">Sponsored Arena</option>
          </select>
          <input name="target_audience" value={form.target_audience} onChange={onChange} placeholder="Target audience" />
          <input name="desired_start_date" type="date" value={form.desired_start_date} onChange={onChange} />
          <input name="budget" value={form.budget} onChange={onChange} placeholder="Budget" required />
          <textarea name="notes" value={form.notes} onChange={onChange} placeholder="Campaign notes" rows={4} />
          <button className="btn" disabled={!canSubmit || submitting} type="submit">{submitting ? 'Submitting…' : 'Apply for a Slot'}</button>
        </form>

        {!!msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </div>
    </Page>
  );
}

'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAudio } from '@/context/AudioContext';

type ContactFormState = {
  email: string;
  message: string;
  name: string;
};

const INITIAL_STATE: ContactFormState = {
  name: '',
  email: '',
  message: '',
};

export default function HomeContactForm() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);
  const { playBlip } = useAudio();

  const canSubmit = useMemo(() => {
    return form.name.trim().length > 0 && form.email.trim().length > 0 && form.message.trim().length > 0;
  }, [form.email, form.message, form.name]);

  const updateField = (field: keyof ContactFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const subject = `Portfolio inquiry from ${form.name.trim()}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      '',
      form.message.trim(),
    ].join('\n');

    window.location.href = `mailto:marifahmed9@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__fields">
        {/* Name */}
        <label className="contact-form__field">
          <span className="contact-form__label">Name</span>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={updateField('name')}
            onFocus={playBlip}
            className="contact-form__input"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>

        {/* Email */}
        <label className="contact-form__field">
          <span className="contact-form__label">Email</span>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={updateField('email')}
            onFocus={playBlip}
            className="contact-form__input"
            placeholder="name@domain.com"
            autoComplete="email"
          />
        </label>

        {/* Message */}
        <label className="contact-form__field">
          <span className="contact-form__label">Message</span>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={updateField('message')}
            onFocus={playBlip}
            className="contact-form__textarea"
            placeholder="Project scope, timeline, constraints, or just enough context to begin."
            rows={4}
          />
        </label>
      </div>

      <div className="contact-form__footer">
        <p className="contact-form__hint">
          Best if you include the goal, timeline, and what needs to feel different when the work is finished.
        </p>

        <button
          id="contact-submit"
          type="submit"
          onMouseEnter={playBlip}
          disabled={!canSubmit}
          className="contact-form__submit"
        >
          Send inquiry
          <span aria-hidden="true" className="contact-form__arrow">→</span>
        </button>
      </div>
    </form>
  );
}

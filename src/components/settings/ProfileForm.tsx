// src/components/settings/ProfileForm.tsx
"use client";

import { FormEvent, useState, ChangeEvent } from "react";
import { SettingsApi, ProfilePayload } from "@/lib/settings";
import { PencilIcon } from "lucide-react";

type FieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
      />
    </div>
  );
}

export default function ProfileForm() {
  const [form, setForm] = useState<ProfilePayload>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    avatarUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, avatarUrl: url }));
  }

  // trigger hidden input
  function handleOpenFilePicker() {
    const input = document.getElementById(
      "avatar-input"
    ) as HTMLInputElement | null;
    input?.click();
  }

  // initials from first + last name
  const initials =
    (form.firstName?.[0] || "").toUpperCase() +
    (form.lastName?.[0] || "").toUpperCase();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      // TODO: upload avatarFile to backend and use returned URL
      await SettingsApi.updateProfile(form);
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 overflow-hidden">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <span>{initials || "?"}</span>
            )}
          </div>

          {/* small edit button */}
          <button
            type="button"
            onClick={handleOpenFilePicker}
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-50"
          >
            <PencilIcon className="h-3 w-3 text-slate-600" />
          </button>

          {/* hidden file input */}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium">Profile picture</p>
          <p className="text-[11px] text-muted">
            Click the pencil icon to upload a profile photo.
          </p>
        </div>
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="First name"
          name="firstName"
          value={form.firstName ?? ""}
          onChange={handleChange}
          required
        />
        <Field
          label="Middle name"
          name="middleName"
          value={form.middleName ?? ""}
          onChange={handleChange}
        />
        <Field
          label="Last name"
          name="lastName"
          value={form.lastName ?? ""}
          onChange={handleChange}
          required
        />
      </div>

      {/* Contact fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Email"
          type="email"
          name="email"
          value={form.email ?? ""}
          onChange={handleChange}
          required
        />
        <Field
          label="Mobile number"
          name="mobile"
          value={form.mobile ?? ""}
          onChange={handleChange}
          required
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {message && (
          <p className="text-xs text-emerald-500">{message}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </form>
  );
}

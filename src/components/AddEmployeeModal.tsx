"use client";

import { FormEvent, useEffect, useState } from "react";
import { countries, currencies } from "@/lib/lookups";
import type { Employee } from "@/lib/employees";

type Mode = "add" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  nextCode: string;
  employee?: Employee | null;
};

type TabKey = "basic" | "details" | "billing";

export default function AddEmployeeModal({
  open,
  mode,
  onClose,
  onSave,
  nextCode,
  employee,
}: Props) {
  const isEdit = mode === "edit";

  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // Basic
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(nextCode);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [department, setDepartment] = useState("Default Department");
  const [location, setLocation] = useState("Default Location");

  // Details
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [country, setCountry] = useState("India");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Billing
  const [workType, setWorkType] = useState<"standard" | "overtime">("standard");
  const [billingType, setBillingType] = useState<"hourly" | "monthly">(
    "hourly"
  );
  const [employeeRate, setEmployeeRate] = useState("");
  const [employeeCurrency, setEmployeeCurrency] = useState(
    "INR - Indian Rupee"
  );
  const [billingRateType, setBillingRateType] = useState<"fixed" | "hourly">(
    "fixed"
  );
  const [billingCurrency, setBillingCurrency] = useState(
    "INR - Indian Rupee"
  );
  const [billingStart, setBillingStart] = useState("");
  const [billingEnd, setBillingEnd] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (isEdit && employee) {
      // EDIT MODE: prefill from existing employee
      setEmail(employee.email);
      setCode(employee.code);
      setFirstName(employee.name);
      setMiddleName("");
      setLastName("");
      setDepartment(employee.department);
      setLocation(employee.location);
      setActiveTab("basic");
    } else if (!isEdit) {
      // ADD MODE: reset everything and use latest nextCode
      setEmail("");
      setCode(nextCode); // <--- important: refresh code when opening
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setPassword("");
      setVerifyPassword("");
      setRole("employee");
      setDepartment("Default Department");
      setLocation("Default Location");
      setAddress("");
      setCity("");
      setStateRegion("");
      setCountry("India");
      setZip("");
      setPhone("");
      setHireDate("");
      setTerminationDate("");
      setResumeFile(null);
      setWorkType("standard");
      setBillingType("hourly");
      setEmployeeRate("");
      setEmployeeCurrency("INR - Indian Rupee");
      setBillingRateType("fixed");
      setBillingCurrency("INR - Indian Rupee");
      setBillingStart("");
      setBillingEnd("");
      setActiveTab("basic");
      setError("");
    }
  }, [open, isEdit, employee, nextCode]);

  if (!open) return null;

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Required fields for both add & edit
    if (
      !email ||
      !code ||
      !department ||
      !location ||
      !phone ||
      !employeeRate
    ) {
      setError("Please fill all required fields (*) before saving.");
      return;
    }

    // Extra required fields for ADD mode
    if (!isEdit && (!firstName || !lastName || !password || !verifyPassword)) {
      setError(
        "Please complete all required Basic fields for a new employee."
      );
      return;
    }

    if (!isEdit && password !== verifyPassword) {
      setError("Password and Verify Password must match.");
      return;
    }

    const baseName = fullName || employee?.name || email;

    const newEmployee: Employee = {
      id: isEdit && employee ? employee.id : Date.now(),
      name: baseName,
      email,
      department,
      location,
      code,
      status: employee?.status ?? "Active",
    };

    console.log("Extra employee data (not persisted yet):", {
      mode,
      role,
      address,
      city,
      stateRegion,
      country,
      zip,
      phone,
      hireDate,
      terminationDate,
      resumeFileName: resumeFile?.name,
      workType,
      billingType,
      employeeRate,
      employeeCurrency,
      billingRateType,
      billingCurrency,
      billingStart,
      billingEnd,
    });

    onSave(newEmployee);
    onClose();
  };

  const resetAndClose = () => {
    setError("");
    onClose();
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic" },
    { key: "details", label: "Details" },
    { key: "billing", label: "Billing" },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-card text-foreground shadow-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Edit Employee" : "Add Employee"}
          </h2>
          <button
            onClick={resetAndClose}
            className="h-7 w-7 rounded-full border border-border text-muted hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-3 py-3 text-sm font-medium ${
                activeTab === tab.key
                  ? "text-emerald-500"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {activeTab === "basic" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Employee Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Employee Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                    placeholder="001"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    First Name
                    {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                    required={!isEdit}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Middle Name
                  </label>
                  <input
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Last Name
                    {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                    required={!isEdit}
                  />
                </div>

                {!isEdit && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">
                        Password<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">
                        Verify Password
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "admin" | "employee")
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Department<span className="text-red-500">*</span>
                  </label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Location<span className="text-red-500">*</span>
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Address
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  State
                </label>
                <input
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Zip Code
                </label>
                <input
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Termination Date
                </label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Resume (.pdf)
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    setResumeFile(e.target.files?.[0] ?? null)
                  }
                  className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
                />
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Work Type
                </label>
                <select
                  value={workType}
                  onChange={(e) =>
                    setWorkType(e.target.value as "standard" | "overtime")
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="standard">Standard</option>
                  <option value="overtime">Overtime</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Billing Type
                </label>
                <select
                  value={billingType}
                  onChange={(e) =>
                    setBillingType(e.target.value as "hourly" | "monthly")
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Employee Rate<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={employeeRate}
                  onChange={(e) => setEmployeeRate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Employee Currency
                </label>
                <select
                  value={employeeCurrency}
                  onChange={(e) => setEmployeeCurrency(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  {currencies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Billing Rate
                </label>
                <select
                  value={billingRateType}
                  onChange={(e) =>
                    setBillingRateType(e.target.value as "fixed" | "hourly")
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Billing Rate Currency
                </label>
                <select
                  value={billingCurrency}
                  onChange={(e) => setBillingCurrency(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                >
                  {currencies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Billing Rate Start Date
                </label>
                <input
                  type="date"
                  value={billingStart}
                  onChange={(e) => setBillingStart(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Billing Rate End Date
                </label>
                <input
                  type="date"
                  value={billingEnd}
                  onChange={(e) => setBillingEnd(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              const form =
                (e.currentTarget.parentElement
                  ?.previousElementSibling as HTMLFormElement) || null;
              form?.requestSubmit();
            }}
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/40 hover:bg-emerald-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

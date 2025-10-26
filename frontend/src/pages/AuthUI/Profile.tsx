import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch, authHeaders, API_BASE } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import PasswordField from "../../components/PasswordField";
import { PASSWORD_MIN_LENGTH } from "../../lib/constants";
import { handleError } from "../../lib/errorHandler";
import type { User as UserType } from "../../lib/types";

type User = UserType & {
  authProvider?: string;
  gender?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  businessRegistrationNumber?: string; // owner-only
};

const resolveUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : u ? `${API_BASE.replace(/\/api$/, "")}${u}` : "");

export default function Profile() {
  const { logout, user: ctxUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(ctxUser ?? null);
  const [name, setName] = useState(user?.name ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ? resolveUrl(user.avatarUrl) : "");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState(user?.businessRegistrationNumber ?? "");

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const isGoogleUser = /^google/i.test(user?.authProvider || "");

  const canSave = useMemo(() => {
    const changed =
      name.trim() !== (user?.name ?? "") ||
      gender !== (user?.gender ?? "") ||
      phone.trim() !== (user?.phone ?? "") ||
      address.trim() !== (user?.address ?? "") ||
      !!avatarFile ||
      (!isGoogleUser && (currentPassword.length > 0 || newPassword.length > 0));
    return changed && !saving;
  }, [name, gender, phone, address, avatarFile, user, saving, isGoogleUser, currentPassword, newPassword]);

  // fetch profile
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const resp = await apiFetch<{ data?: { user?: User }; user?: User }>("/auth/profile", { method: "GET" });
        const data = (resp as { data?: { user?: User } })?.data?.user ?? (resp as { data?: User })?.data ?? resp;

        if (!active) return;

        setUser(data as User);
        setName(data.name ?? "");
        setGender(data.gender ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
        setAvatarUrl(data.avatarUrl ?? "");
        setAvatarPreview(resolveUrl(data.avatarUrl ?? ""));
        setBusinessRegistrationNumber(data.businessRegistrationNumber ?? "");
      } catch (err) {
        const error = err as { status?: number; message?: string };
        if (error?.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        handleError(err, "Profile fetch");
        setApiError(error?.message || "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [logout, navigate]);

  function onAvatarChange(file: File | null) {
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
    else setAvatarPreview(resolveUrl(avatarUrl) || "");
  }

  async function uploadAvatarIfNeeded(): Promise<string | undefined> {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append("avatar", avatarFile);
    const res = await fetch(`${API_BASE}/auth/profile/avatar`, {
      method: "POST",
      credentials: "include",
      headers: { ...authHeaders() }, // do NOT set Content-Type manually
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Avatar upload failed");
    return data?.data?.url || data?.data?.avatarUrl || data?.url;
  }

  async function save() {
    setSaving(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      // 1) Change password first (if provided and local account)
      if (!isGoogleUser && (currentPassword || newPassword)) {
        if (!currentPassword || !newPassword) throw new Error("Please enter both current and new passwords");
        if (newPassword.length < PASSWORD_MIN_LENGTH) throw new Error(`New password must be at least ${PASSWORD_MIN_LENGTH} characters`);
        await apiFetch("/auth/password/change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        setCurrentPassword("");
        setNewPassword("");
      }

      // 2) Upload avatar if needed
      const uploadedUrl = await uploadAvatarIfNeeded();

      // 3) Save profile
      const body = {
        name: name.trim(),
        gender,
        phone: phone.trim(),
        address: address.trim(),
        avatarUrl: uploadedUrl ?? avatarUrl,
      };

      const resp = await apiFetch("/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: any = resp?.data?.user ?? resp?.data ?? resp;
      setUser(data);
      setName(data.name ?? "");
      setGender(data.gender ?? "");
      setPhone(data.phone ?? "");
      setAddress(data.address ?? "");
      setAvatarUrl(data.avatarUrl ?? "");
      setAvatarPreview(resolveUrl(data.avatarUrl ?? "") || "");
      setBusinessRegistrationNumber(data.businessRegistrationNumber ?? "");
      setAvatarFile(null);

      setApiSuccess("Changes saved successfully!");
    } catch (err: any) {
      if (err?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setApiError(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Loading profile…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow mt-8">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      {apiError && <div className="mb-4 border border-red-200 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">{apiError}</div>}
      {apiSuccess && <div className="mb-4 border border-green-200 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">{apiSuccess}</div>}

      <div className="flex items-start gap-6 flex-wrap">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 shadow">
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-2xl">{name ? name[0].toUpperCase() : "?"}</div>
            )}
          </div>
          <label className="mt-3 text-sm text-gray-600">
            <input type="file" accept="image/*" onChange={(e) => onAvatarChange(e.target.files ? e.target.files[0] : null)} className="hidden" />
            <span className="cursor-pointer border rounded-lg px-3 py-1 hover:bg-gray-50">Upload new</span>
          </label>
        </div>

        {/* Info */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500" value={user?.email || ""} disabled />
          </div>

          {/* Owner’s BRN (read-only) */}
          {businessRegistrationNumber && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Registration Number</label>
              <input className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500" value={businessRegistrationNumber} disabled />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full border rounded-lg px-3 py-2" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="w-full border rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+65 9123 4567" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, Postal Code"
            />
          </div>

          {/* Change password (local accounts only) */}
          {!isGoogleUser && (
            <>
              <PasswordField
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <PasswordField
                id="newPassword"
                name="newPassword"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={save}
          disabled={!canSave}
          className={`px-5 py-2 rounded-xl font-medium text-white shadow ${canSave ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

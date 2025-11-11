// app/settings/SettingsTabs.jsx
"use client"

import { useEffect, useState } from "react"
import {
  User,
  MapPin,
  Lock,
  Bell,
  Package,
  Mail,
  Phone,
  Home,
  Plus,
  Trash2,
  Edit,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/app/hooks/useToast.jsx"
import { useAuth } from "@/app/api/login/context/AuthContext"
import { db } from "@/app/api/firebase/firebase"

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore"

import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-amber-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  )
}

function AddressesTab({ user, db, toast }) {
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  // form state
  const [addrLabel, setAddrLabel] = useState("")
  const [addrPhone, setAddrPhone] = useState("")
  const [addrStreet, setAddrStreet] = useState("")
  const [addrCity, setAddrCity] = useState("")
  const [addrState, setAddrState] = useState("")
  const [addrPostal, setAddrPostal] = useState("")
  const [addrCountry, setAddrCountry] = useState("")
  const [addrDefault, setAddrDefault] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    let alive = true
    async function fetchAddresses() {
      if (!user) {
        if (alive) setLoadingAddresses(false)
        return
      }

      try {
        const colRef = collection(db, "users", user.uid, "addresses")
        const q = query(colRef, orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        if (alive) setAddresses(list)
      } catch (err) {
        console.error("Failed to load addresses", err)
        toast({ title: "Error", description: "Could not load addresses." })
      } finally {
        if (alive) setLoadingAddresses(false)
      }
    }

    fetchAddresses()
    return () => { alive = false }
  }, [user, db, toast])

  async function handleAddAddress() {
    if (!user) return
    if (!addrStreet || !addrCity) {
      toast({ title: "Missing fields", description: "Please provide street and city." })
      return
    }
    setSavingAddress(true)
    try {
      const colRef = collection(db, "users", user.uid, "addresses")
      // If setting default, clear previous defaults
      if (addrDefault && addresses.length > 0) {
        const prevDefault = addresses.find((a) => a.isDefault)
        if (prevDefault) {
          const prevRef = doc(db, "users", user.uid, "addresses", prevDefault.id)
          await updateDoc(prevRef, { isDefault: false })
        }
      }

      const payload = {
        label: addrLabel || null,
        phone: addrPhone || null,
        street: addrStreet || null,
        city: addrCity || null,
        state: addrState || null,
        postalCode: addrPostal || null,
        country: addrCountry || null,
        isDefault: !!addrDefault,
        createdAt: serverTimestamp(),
      }

      const ref = await addDoc(colRef, payload)

      // Optimistically update UI
      setAddresses((prev) => [{ id: ref.id, ...payload, createdAt: new Date() }, ...prev])
      setShowAddForm(false)
      setAddrLabel("")
      setAddrPhone("")
      setAddrStreet("")
      setAddrCity("")
      setAddrState("")
      setAddrPostal("")
      setAddrCountry("")
      setAddrDefault(false)

      toast({ title: "Address saved", description: "Your address has been added." })
    } catch (err) {
      console.error("Failed to add address", err)
      toast({ title: "Save failed", description: "Could not save address." })
    } finally {
      setSavingAddress(false)
    }
  }

  async function handleDeleteAddress(id) {
    if (!user) return
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id))
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast({ title: "Deleted", description: "Address removed." })
    } catch (err) {
      console.error("Failed to delete address", err)
      toast({ title: "Delete failed", description: "Could not delete address." })
    }
  }

  async function handleSetDefault(id) {
    if (!user) return
    try {
      // Clear existing default
      const prev = addresses.find((a) => a.isDefault)
      if (prev && prev.id !== id) {
        await updateDoc(doc(db, "users", user.uid, "addresses", prev.id), { isDefault: false })
      }
      await updateDoc(doc(db, "users", user.uid, "addresses", id), { isDefault: true })
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
      toast({ title: "Default set", description: "Default address updated." })
    } catch (err) {
      console.error("Failed to set default", err)
      toast({ title: "Update failed", description: "Could not set default address." })
    }
  }

  return (
    <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 rounded-3xl shadow-lg space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          Saved Addresses
        </h2>
        <button
          type="button"
          onClick={() => setShowAddForm((s) => !s)}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      <p className="text-sm text-slate-600">Manage your saved addresses here.</p>

      {/* Add / Edit form */}
      {showAddForm && (
        <div className="p-4 border border-slate-100 rounded-xl bg-white/80">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <input value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="Home, Work, etc." className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)} placeholder="Phone number" className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Street Address</label>
              <input value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="123 Main St" className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="City" className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State / Region</label>
              <input value={addrState} onChange={(e) => setAddrState(e.target.value)} placeholder="State" className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <input value={addrPostal} onChange={(e) => setAddrPostal(e.target.value)} placeholder="ZIP / Postal" className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <input value={addrCountry} onChange={(e) => setAddrCountry(e.target.value)} placeholder="Country" className="w-full px-3 py-2 rounded-xl border" />
            </div>
            <div className="flex items-center gap-3">
              <input id="defaultAddr" type="checkbox" checked={addrDefault} onChange={(e) => setAddrDefault(e.target.checked)} />
              <label htmlFor="defaultAddr" className="text-sm">Set as default</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
            <button type="button" onClick={handleAddAddress} disabled={savingAddress} className="px-4 py-2 rounded-xl bg-amber-600 text-white">{savingAddress ? 'Saving...' : 'Save Address'}</button>
          </div>
        </div>
      )}

      {/* Addresses list */}
      <div className="space-y-3">
        {loadingAddresses && <div className="text-sm text-slate-600">Loading addresses...</div>}
        {!loadingAddresses && addresses.length === 0 && <div className="text-sm text-slate-600">No saved addresses.</div>}
        {addresses.map((a) => (
          <div key={a.id} className="p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-all border border-orange-100 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="font-semibold">{a.label || 'Address'}</div>
                {a.isDefault && <div className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">Default</div>}
              </div>
              <div className="text-sm text-gray-700">{a.street}</div>
              <div className="text-xs text-gray-600">{a.city}{a.state ? `, ${a.state}` : ''} {a.postalCode}</div>
              {a.phone && <div className="text-xs text-gray-600">{a.phone}</div>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={() => handleSetDefault(a.id)} className="text-sm text-amber-600">Set default</button>
              <button onClick={() => handleDeleteAddress(a.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsTabs() {
  const { toast } = useToast()
  const router = useRouter()
  const { currentUser } = useAuth() || {}
  const user = currentUser

  const [activeTab, setActiveTab] = useState("profile")

  // Profile form state (name, email, phone)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Notifications (local UI only for now)
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newProducts: false,
    newsletter: true,
  })

  // ✅ Always call hooks, then branch on user below
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoadingProfile(false)
        return
      }

      try {
        const ref = doc(db, "users", user.uid)
        const snap = await getDoc(ref)
        const data = snap.exists() ? snap.data() : {}

        setFirstName(data.firstName || "")
        setLastName(data.lastName || "")
        setEmail(data.email || user.email || "")
        setPhone(data.phoneNumber || user.phoneNumber || "")
      } catch (err) {
        console.error("Error loading profile:", err)
        toast({
          title: "Error loading profile",
          description: "Please refresh the page and try again.",
        })
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user, toast])

  async function handleSaveProfile() {
    if (!user) return
    setSavingProfile(true)

    try {
      // 1) Update email in Firebase Auth if changed
      if (email && email !== user.email) {
        await updateEmail(user, email)
      }

      // 2) Save profile fields in Firestore
      const ref = doc(db, "users", user.uid)
      await setDoc(
        ref,
        {
          firstName: firstName || null,
          lastName: lastName || null,
          email: email || null,
          phoneNumber: phone || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      toast({
        title: "Profile updated",
        description: "Your profile details have been saved.",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Update failed",
        description:
          err?.code === "auth/requires-recent-login"
            ? "For security, please log out and log back in, then try again."
            : "Could not update your profile. Please try again.",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleUpdatePassword() {
    if (!user) return

    if (!currentPassword) {
      toast({
        title: "Current password required",
        description: "Please enter your current password.",
      })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Weak password",
        description: "New password must be at least 6 characters.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure the new passwords match.",
      })
      return
    }

    setUpdatingPassword(true)

    try {
      if (!user.email) {
        throw new Error("User has no email associated.")
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password in Firebase Auth
      await updatePassword(user, newPassword)

      // Store metadata in Firestore (NOT the password itself)
      const ref = doc(db, "users", user.uid)
      await setDoc(
        ref,
        {
          passwordUpdatedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("Error updating password:", err)
      toast({
        title: "Password update failed",
        description:
          err?.code === "auth/wrong-password"
            ? "The current password you entered is incorrect."
            : err?.code === "auth/requires-recent-login"
            ? "Please log out and log back in, then try changing your password again."
            : "Could not update your password. Please try again.",
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  // 🔐 After all hooks: branch on auth state
  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-10 text-center max-w-md rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Login Required</h2>
          <p className="text-slate-600 mb-6">
            Please log in to access your account settings
          </p>
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
          >
            Log In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tabs List */}
      <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-1 rounded-2xl shadow-lg inline-flex flex-wrap gap-2">
        {[
          { id: "profile", label: "Profile", Icon: User },
          { id: "addresses", label: "Addresses", Icon: MapPin },
          { id: "security", label: "Security", Icon: Lock },
          { id: "notifications", label: "Notifications", Icon: Bell },
          { id: "orders", label: "Orders", Icon: Package },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === id
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 rounded-3xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            Personal Information
          </h2>

          <div className="space-y-6">
            {/* Profile Photo (static for now) */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-amber-500/20">
                {firstName
                  ? firstName[0].toUpperCase()
                  : user.email
                  ? user.email[0].toUpperCase()
                  : "U"}
              </div>
              <div className="flex-1 w-full">
                <label className="text-slate-700 font-medium mb-2 block">Profile Photo</label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-slate-700 font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loadingProfile}
                  className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none disabled:opacity-60"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-slate-700 font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loadingProfile}
                  className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none disabled:opacity-60"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-slate-700 font-medium">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingProfile}
                  className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none disabled:opacity-60"
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-slate-700 font-medium">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loadingProfile}
                  className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none disabled:opacity-60"
                  placeholder="Add your phone number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile || loadingProfile}
                className="inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === "addresses" && (
        <AddressesTab
          user={user}
          db={db}
          toast={toast}
        />
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 rounded-3xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            Security Settings
          </h2>

          <div className="space-y-6">
            {/* Change Password */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-slate-700 font-medium">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-slate-700 font-medium">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full backdrop-blur-xl border border-slate-200/30 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-500/10 rounded-xl bg-white/90 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab (local only) */}
      {activeTab === "notifications" && (
        <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 rounded-3xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            Notification Preferences
          </h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 backdrop-blur-lg border border-slate-200/30 bg-white/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">Order Updates</p>
                    <p className="text-sm text-slate-600">Get notified about your order status</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.orderUpdates}
                    onChange={(val) =>
                      setNotifications((prev) => ({ ...prev, orderUpdates: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 backdrop-blur-lg border border-slate-200/30 bg-white/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">Promotions & Deals</p>
                    <p className="text-sm text-slate-600">Receive special offers and discounts</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.promotions}
                    onChange={(val) =>
                      setNotifications((prev) => ({ ...prev, promotions: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 backdrop-blur-lg border border-slate-200/30 bg-white/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">New Products</p>
                    <p className="text-sm text-slate-600">Be the first to know about new arrivals</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.newProducts}
                    onChange={(val) =>
                      setNotifications((prev) => ({ ...prev, newProducts: val }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 backdrop-blur-lg border border-slate-200/30 bg-white/50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-800">Newsletter</p>
                    <p className="text-sm text-slate-600">Weekly tips and project ideas</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.newsletter}
                    onChange={(val) =>
                      setNotifications((prev) => ({ ...prev, newsletter: val }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Preferences saved",
                    description: "Notification settings saved locally (DB wiring coming soon).",
                  })
                }
                className="inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab (placeholder) */}
      {activeTab === "orders" && (
        <div className="backdrop-blur-lg border border-slate-200/30 bg-white/70 p-8 rounded-3xl shadow-lg space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            Order History
          </h2>

          <p className="text-sm text-slate-600">
            Order history integration will go here. For now, this is just placeholder content.
          </p>
        </div>
      )}
    </div>
  )
}

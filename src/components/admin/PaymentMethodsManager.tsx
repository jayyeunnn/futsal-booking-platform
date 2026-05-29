"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Loader2,
  CreditCard,
  Wallet,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/shared/Tooltip";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { showToast } from "@/lib/toast";

type PaymentMethodType = "BANK_TRANSFER" | "E_WALLET";

type PaymentMethod = {
  id: string;
  name: string;
  type: PaymentMethodType;
  accountNumber: string;
  accountHolder: string;
  logoUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  initial: PaymentMethod[];
};

type FormState = {
  name: string;
  type: PaymentMethodType;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  sortOrder: string;
};

const empty: FormState = {
  name: "",
  type: "BANK_TRANSFER",
  accountNumber: "",
  accountHolder: "",
  isActive: true,
  sortOrder: "0",
};

/**
 * Manager untuk payment methods (bank/e-wallet) yang ditampilkan di booking flow.
 * Inline create + edit form, plus list dengan toggle/delete.
 */
export function PaymentMethodsManager({ initial }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<PaymentMethod[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const startCreate = () => {
    setForm(empty);
    setEditingId(null);
    setShowCreate(true);
  };

  const startEdit = (m: PaymentMethod) => {
    setForm({
      name: m.name,
      type: m.type,
      accountNumber: m.accountNumber,
      accountHolder: m.accountHolder,
      isActive: m.isActive,
      sortOrder: String(m.sortOrder),
    });
    setEditingId(m.id);
    setShowCreate(true);
  };

  const cancelEdit = () => {
    setShowCreate(false);
    setEditingId(null);
    setForm(empty);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        accountNumber: form.accountNumber,
        accountHolder: form.accountHolder,
        isActive: form.isActive,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      };
      const url = editingId
        ? `/api/admin/payment-methods/${editingId}`
        : "/api/admin/payment-methods";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal menyimpan");
        return;
      }
      const saved = json.data as PaymentMethod;
      if (editingId) {
        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? saved : it))
        );
      } else {
        setItems((prev) => [...prev, saved]);
      }
      cancelEdit();
      showToast.success(
        editingId ? "Metode pembayaran diupdate" : "Metode pembayaran ditambah"
      );
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setLoading(false);
    }
  };

  const onToggle = async (m: PaymentMethod) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !m.isActive }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal");
        return;
      }
      setItems((prev) =>
        prev.map((it) => (it.id === m.id ? { ...it, isActive: !m.isActive } : it))
      );
      showToast.success(
        m.isActive ? "Metode dinonaktifkan" : "Metode diaktifkan"
      );
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/payment-methods/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast.error(json?.error?.message ?? "Gagal");
        return;
      }
      setItems((prev) => prev.filter((it) => it.id !== deleteId));
      setDeleteId(null);
      showToast.success("Metode pembayaran dihapus");
      router.refresh();
    } catch (e) {
      showToast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-heading font-semibold text-text-primary">
            Metode Pembayaran
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Bank transfer & e-wallet yang ditampilkan saat checkout
          </p>
        </div>
        {!showCreate && (
          <Button
            variant="cta"
            className="h-9 text-sm"
            onClick={startCreate}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
          </Button>
        )}
      </div>

      {/* Create/Edit form */}
      {showCreate && (
        <form
          onSubmit={onSubmit}
          className="bg-muted/30 border border-border rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">
              {editingId ? "Edit Metode" : "Metode Baru"}
            </h3>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Nama
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="BCA / GoPay / dst"
                required
                minLength={2}
                maxLength={50}
                className="w-full h-9 px-3 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Tipe
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as PaymentMethodType,
                  })
                }
                className="w-full h-9 px-3 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="E_WALLET">E-Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                No. Rekening / HP
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value })
                }
                placeholder="1234567890 / 081234567890"
                required
                minLength={3}
                className="w-full h-9 px-3 rounded border border-border bg-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Atas Nama
              </label>
              <input
                type="text"
                value={form.accountHolder}
                onChange={(e) =>
                  setForm({ ...form, accountHolder: e.target.value })
                }
                placeholder="PT JayField Indonesia"
                required
                minLength={2}
                className="w-full h-9 px-3 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">
                Urutan Tampil
              </label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
                className="w-full h-9 px-3 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <label className="flex items-center gap-2 mt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">Aktif</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="h-8 text-xs"
              onClick={cancelEdit}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="cta"
              className="h-8 text-xs"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="flex items-center gap-1">
                  <Save className="h-3 w-3" /> Simpan
                </span>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-6">
          Belum ada metode pembayaran. Tambah dulu untuk diaktifkan di checkout.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((m) => (
            <li
              key={m.id}
              className={`py-3 flex items-center gap-3 ${
                !m.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {m.type === "BANK_TRANSFER" ? (
                  <CreditCard className="h-4 w-4 text-primary" />
                ) : (
                  <Wallet className="h-4 w-4 text-cta" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary line-clamp-1">
                  {m.name}
                  <span className="ml-2 text-[10px] font-bold px-1.5 rounded bg-muted text-text-secondary">
                    {m.type === "BANK_TRANSFER" ? "Bank" : "E-Wallet"}
                  </span>
                </p>
                <p className="text-xs text-text-secondary line-clamp-1 font-mono">
                  {m.accountNumber} · a.n. {m.accountHolder}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded ${
                  m.isActive
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {m.isActive ? "Aktif" : "Nonaktif"}
              </span>
              <div className="flex items-center gap-1">
                <Tooltip content="Edit">
                  <button
                    onClick={() => startEdit(m)}
                    className="p-1.5 rounded text-text-secondary hover:text-primary hover:bg-primary/10"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content={m.isActive ? "Nonaktifkan" : "Aktifkan"}>
                  <button
                    onClick={() => onToggle(m)}
                    className={`p-1.5 rounded hover:bg-muted ${
                      m.isActive ? "text-success" : "text-text-secondary"
                    }`}
                    aria-label="Toggle active"
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
                <Tooltip content="Hapus">
                  <button
                    onClick={() => setDeleteId(m.id)}
                    className="p-1.5 rounded text-error hover:bg-error/10"
                    aria-label="Hapus"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        title="Hapus metode pembayaran?"
        description="Metode ini akan hilang dari daftar checkout. Booking yang sudah pakai metode ini tidak terpengaruh."
        variant="danger"
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  );
}

"use client";

export function DeleteButton({
  action,
  fields,
  label = "Hapus",
  confirmText = "Yakin ingin menghapus data ini? Tindakan ini tidak bisa dibatalkan.",
  className = "",
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string | number>;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      <button
        type="submit"
        className={
          className ||
          "inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        }
      >
        {label}
      </button>
    </form>
  );
}

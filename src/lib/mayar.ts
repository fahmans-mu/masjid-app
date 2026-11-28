const DEFAULT_BASE = "https://api.mayar.id/hl/v2";

function apiBase(): string {
  const base = process.env.MAYAR_API_BASE?.trim();
  return (base && base.length > 0 ? base : DEFAULT_BASE).replace(/\/+$/, "");
}

export class MayarError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "MayarError";
    this.status = status;
  }
}

type Envelope<T> = {
  statusCode?: number;
  messages?: unknown;
  message?: unknown;
  data?: T;
};

function errorMessage(code: number, messages: unknown): string {
  const text =
    typeof messages === "string"
      ? messages
      : Array.isArray(messages)
        ? messages
            .map((m) =>
              typeof m === "string"
                ? m
                : typeof m === "object" && m && "message" in m
                  ? String((m as { message: unknown }).message)
                  : ""
            )
            .filter(Boolean)
            .join(", ")
        : "";

  if (code === 401 || code === 403) {
    return "API Key Mayar tidak valid atau tidak punya akses Read & Write.";
  }
  if (code === 429) {
    return "Terlalu banyak permintaan ke Mayar. Coba lagi sebentar.";
  }
  return text || "Mayar menolak permintaan. Periksa pengaturan akun Mayar.";
}

async function mayarFetch<T>(
  apiKey: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new MayarError("Tidak dapat terhubung ke Mayar. Periksa koneksi server.", 502);
  }

  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  const code = body?.statusCode ?? res.status;
  if (!res.ok || code >= 400) {
    throw new MayarError(errorMessage(code, body?.messages ?? body?.message), code);
  }
  return body?.data as T;
}

export type MayarPaymentLink = {
  id: string;
  transactionId: string;
  link: string;
};

// Buat payment request (nominal bebas) di Mayar.
export function createMayarPayment(
  apiKey: string,
  input: {
    name: string;
    email?: string | null;
    mobile?: string | null;
    amount: number;
    description: string;
    redirectUrl: string;
    expiredAt: Date;
    extraData?: Record<string, string | number>;
  }
): Promise<MayarPaymentLink> {
  return mayarFetch<MayarPaymentLink>(apiKey, "/payments/create", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      amount: input.amount,
      email: input.email || undefined,
      mobile: input.mobile || undefined,
      description: input.description,
      redirectUrl: input.redirectUrl,
      expiredAt: input.expiredAt.toISOString(),
      extraData: input.extraData,
    }),
  });
}

export type MayarPaymentDetail = {
  id: string;
  status?: string;
  amount?: number;
  linkUrl?: string;
};

export function getMayarPayment(
  apiKey: string,
  invoiceId: string
): Promise<MayarPaymentDetail> {
  return mayarFetch<MayarPaymentDetail>(
    apiKey,
    `/payments/${encodeURIComponent(invoiceId)}`
  );
}

export type MayarBalance = {
  balanceActive?: number;
  balancePending?: number;
  balance?: number;
};

export function getMayarBalance(apiKey: string): Promise<MayarBalance> {
  return mayarFetch<MayarBalance>(apiKey, "/balance");
}

export function isPaidStatus(status: unknown): boolean {
  if (status === true) return true;
  if (typeof status !== "string") return false;
  return ["paid", "success", "settlement", "capture"].includes(status.toLowerCase());
}
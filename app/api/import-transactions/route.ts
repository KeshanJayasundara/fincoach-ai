// app/api/import-transactions/route.ts
//
// AI fallback for the "Import File" tab. The client-side heuristic
// (findKey in AddTransactionModal.tsx) only recognises common header
// names like "date", "amount", "debit"/"credit". When a file uses
// different or non-English headers, every row gets skipped and the
// user sees "No valid transactions found". This route sends the raw
// rows to Claude and asks it to map them to our schema instead.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IncomeCategoriesList, ExpenseCategoriesList } from "@/lib/enums";

const MAX_ROWS = 400; // keep the request comfortably within context limits

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rows?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const rows = body.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const truncated = rows.length > MAX_ROWS;
  const sample = rows.slice(0, MAX_ROWS);
  const categories = [...IncomeCategoriesList, ...ExpenseCategoriesList];

  const systemPrompt = `You are a financial data extraction assistant. You will be given raw JSON rows exported from a bank statement, e-wallet, or expense tracker CSV/Excel file. The column headers may be abbreviated, in a different language, inconsistent, or non-standard — do not assume any fixed header names.

For EACH row that represents a real transaction, extract an object with this exact shape:
{
  "date": "YYYY-MM-DD",
  "amount": number (always positive),
  "type": "income" or "expense",
  "category": one of [${categories.join(", ")}] — pick the closest match, or "" if nothing fits well,
  "description": string (short, max 100 chars, drawn from any memo/narration/details/particulars field)
}

Rules:
- Skip rows that clearly are not transactions (repeated header rows, subtotals, blank rows, running-balance-only rows).
- If there are separate debit/withdrawal and credit/deposit columns, debit => "expense", credit => "income".
- If there is a single signed amount column, negative => "expense", positive => "income".
- Infer the date format from context (locale hints, column name, typical value ranges) and normalise to YYYY-MM-DD.
- If you truly cannot find a usable date or amount for a row, omit that row rather than guessing wildly.
- Respond with ONLY a raw JSON array. No markdown code fences, no commentary, no explanation.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 8000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Raw rows (JSON array, one object per source row):\n${JSON.stringify(sample)}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || `AI request failed (${response.status})` },
        { status: 502 },
      );
    }

    const text: string = (data.content ?? [])
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("");

    const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned a response that couldn't be parsed. Please try again." },
        { status: 502 },
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: "AI response was not a list of transactions." },
        { status: 502 },
      );
    }

    return NextResponse.json({ result: parsed, truncated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reach the AI service." },
      { status: 500 },
    );
  }
}
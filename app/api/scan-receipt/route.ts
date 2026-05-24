import { NextRequest, NextResponse } from "next/server";
import vision from "@google-cloud/vision";

const visionClient = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS!),
});

export async function POST(req: NextRequest) {
  try {
    const { base64Image } = await req.json();
    if (!base64Image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // ── Step 1: Google Vision OCR (~1-2s) ──────────────────────────────
    const [result] = await visionClient.textDetection({
      image: { content: base64Image },
    });
    const extractedText = result.textAnnotations?.[0]?.description ?? "";

    if (!extractedText) {
      return NextResponse.json(
        { error: "Could not extract text from image." },
        { status: 422 }
      );
    }

    // ── Step 2: Haiku categorises the text (~2-3s) ─────────────────────
    const ALL_CATEGORY_VALUES = [
      "Food & Grocery", "Dining Out", "Coffee & Snacks", "Takeaway / Delivery",
      "Alcohol & Bar", "Rent / Mortgage", "Utilities", "Internet & Phone",
      "Home Insurance", "Home Maintenance", "Furniture & Appliances",
      "Transport", "Fuel & Parking", "Public Transport", "Taxi / Ride Share",
      "Vehicle Maintenance", "Vehicle Insurance", "Health & Medical", "Pharmacy",
      "Gym & Fitness", "Mental Health", "Dental & Vision", "Health Insurance",
      "Education", "Tuition & Courses", "Books & Supplies", "Online Learning",
      "Entertainment", "Streaming Services", "Gaming", "Hobbies & Leisure",
      "Events & Concerts", "Shopping", "Clothing & Fashion", "Electronics & Tech",
      "Personal Care & Beauty", "Gift Given", "Travel", "Flights",
      "Hotels & Stay", "Travel Activities", "Business Expense", "Software & Tools",
      "Marketing & Ads", "Office Supplies", "Professional Fees", "Loan Repayment",
      "Credit Card Bill", "Bank Fees", "Taxes", "Savings & Deposit",
      "Charity & Donation", "Childcare", "Pet Care", "Family Support", "Other",
      "Salary / Income", "Freelance Income", "Business Income",
      "Investment Returns", "Rental Income", "Dividends", "Bonus / Incentive",
      "Side Hustle", "Government Benefit", "Pension", "Gift Received",
      "Refund / Cashback", "Other Income",
    ];

    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are a receipt parser for a personal finance app.

Given this raw OCR text from a receipt, extract the fields below.
Respond ONLY with a valid JSON object — no markdown, no explanation.

OCR TEXT:
${extractedText}

JSON shape:
{
  "amount": "<number as string, e.g. 2450.00>",
  "currency": "<one of: LKR, USD, EUR, GBP, AED, SGD, INR, AUD — default LKR if unclear>",
  "type": "<expense or income>",
  "category": "<pick EXACTLY one from the allowed list>",
  "description": "<short merchant name or bill summary, max 60 chars>",
  "date": "<YYYY-MM-DD — use ${today} if not found>",
  "confidence": "<high | medium | low>"
}

ALLOWED CATEGORIES: ${ALL_CATEGORY_VALUES.map((v) => `"${v}"`).join(", ")}

Rules:
- Supermarket/grocery → "Food & Grocery"
- Restaurant/cafe → "Dining Out" or "Coffee & Snacks"
- Pharmacy/chemist → "Pharmacy"
- Fuel stations → "Fuel & Parking"
- Utility bills (CEB, LECO, water) → "Utilities"
- Telecom (Dialog, Mobitel, SLT) → "Internet & Phone"
- Clothing stores → "Clothing & Fashion"
- Electronics shops → "Electronics & Tech"
- Ride-hailing (PickMe, Uber) → "Taxi / Ride Share"
- Hospital/medical → "Health & Medical"
- If genuinely unsure → "Other"
- If amount not found → "0"
- Date must be YYYY-MM-DD`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", errText);
      return NextResponse.json(
        { error: `Anthropic API error: ${anthropicRes.status}` },
        { status: 500 }
      );
    }

    const data = await anthropicRes.json();
    const rawText = (data.content as any[])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const cleaned = rawText.replace(/```json|```/gi, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: parsed });

  } catch (err: any) {
    console.error("scan-receipt route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
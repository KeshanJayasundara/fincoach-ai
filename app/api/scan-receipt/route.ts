import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

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

    const prompt = `You are a receipt/bill OCR and categorisation assistant for a personal finance app.

Analyse the receipt image and extract the following fields. Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.

JSON shape:
{
  "amount": "<number as string, e.g. 2450.00>",
  "currency": "<one of: LKR, USD, EUR, GBP, AED, SGD, INR, AUD — default LKR if unclear>",
  "type": "<expense or income — almost always expense for a receipt>",
  "category": "<pick EXACTLY one value from the allowed list below>",
  "description": "<short merchant name or bill summary, max 60 chars>",
  "date": "<YYYY-MM-DD — today if not found on receipt>",
  "confidence": "<high | medium | low>"
}

ALLOWED CATEGORY VALUES (copy verbatim, case-sensitive):
${ALL_CATEGORY_VALUES.map((v) => `"${v}"`).join(", ")}

Rules:
- For supermarket / grocery receipts → "Food & Grocery"
- For restaurant / cafe receipts → "Dining Out" or "Coffee & Snacks"
- For pharmacy / chemist → "Pharmacy"
- For fuel stations → "Fuel & Parking"
- For utility bills (CEB, LECO, water) → "Utilities"
- For telecom bills (Dialog, Mobitel, SLT) → "Internet & Phone"
- For clothing stores → "Clothing & Fashion"
- For electronics shops → "Electronics & Tech"
- For ride-hailing (PickMe, Uber) → "Taxi / Ride Share"
- For hospital / medical → "Health & Medical"
- For streaming (Netflix, Spotify) → "Streaming Services"
- For hotel / accommodation → "Hotels & Stay"
- If genuinely unsure → "Other"
- If the amount is ambiguous or not found, set amount to "0"
- The date field must be ISO 8601 (YYYY-MM-DD)`;

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
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
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
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { symbol, price, zone_type, message } = body;

    if (!symbol || !price || !zone_type) {
      return new Response("Missing required fields: symbol, price, zone_type", { status: 400 });
    }

    const now = new Date();
    const timestamp = now.toUTCString();
    const emoji = zone_type.toLowerCase().includes("demand") ? "🟢" : "🔴";

    const text = [
      `🎯 ZONE HIT`,
      ``,
      `${emoji} Symbol: ${symbol}`,
      `Type: ${zone_type}`,
      `Price: ${price}`,
      `Time: ${timestamp}`,
      message ? `\n${message}` : "",
    ]
      .join("\n")
      .trim();

    const token = env.TELEGRAM_BOT_TOKEN.replace(/^﻿/, "");
    const chatId = env.TELEGRAM_CHAT_ID.replace(/^﻿/, "");
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    if (!tgResponse.ok) {
      const err = await tgResponse.text();
      const tokenPreview = env.TELEGRAM_BOT_TOKEN ? env.TELEGRAM_BOT_TOKEN.slice(0, 10) + "..." : "MISSING";
      const chatPreview = env.TELEGRAM_CHAT_ID || "MISSING";
      return new Response(`Telegram error (${tgResponse.status}): ${err} | token=${tokenPreview} chat=${chatPreview}`, { status: 502 });
    }

    return new Response("OK", { status: 200 });
  },
};

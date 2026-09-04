export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/ai" && request.method === "POST") {
      try {
        const body = await request.json();
        const action = body?.action || "analyze";
        const title = String(body?.title || "الدرس").slice(0, 200);
        const lesson = String(body?.lesson || "").trim().slice(0, 18000);

        if (!lesson) {
          return json({ error: "أرسل نص الدرس أولاً." }, 400);
        }

        const prompt = `
أنت "مُذاكر AI"، مساعد تعليمي عربي ممتاز.
مهمتك تحويل الدرس إلى فهم واضح ومفيد للطالب.

العنوان: ${title}

نص الدرس:
---BEGIN LESSON---
${lesson}
---END LESSON---

أجب بالعربية وبشكل منظم، وضمن الأقسام التالية:
1) شرح مبسط جدا
2) أهم الأفكار
3) المصطلحات أو القواعد المهمة
4) أمثلة قصيرة إن أمكن
5) 5 أسئلة استرجاع مع الإجابات
6) 5 بطاقات مراجعة بصيغة سؤال — جواب
7) نصيحة سريعة للحفظ والفهم

لا تخترع معلومات غير موجودة في الدرس إلا إذا كانت ضرورية للتوضيح.
`;

        const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          prompt,
          max_tokens: 1800
        });

        const text =
          typeof result === "string"
            ? result
            : (result?.response || result?.result?.response || JSON.stringify(result));

        return json({ ok: true, text });
      } catch (e) {
        return json(
          { error: "خطأ في خدمة AI: " + (e?.message || "unknown") },
          500
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

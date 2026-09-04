export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 🤖 واجهة الذكاء الاصطناعي
    if (url.pathname === "/api/ai" && request.method === "POST") {
      try {
        const body = await request.json();

        const title = body.title || "درس";
        const lesson = body.lesson || "";

        if (!lesson.trim()) {
          return json({
            ok: false,
            error: "يرجى إدخال محتوى الدرس"
          }, 400);
        }

        const prompt = `
أنت مساعد تعليمي ذكي داخل منصة "مُذاكر".
مهمتك مساعدة الطالب على فهم الدروس بطريقة بسيطة وواضحة باللغة العربية.

اسم الدرس:
${title}

محتوى الدرس:
${lesson}

قم بتحليل الدرس وإرجاع إجابة منظمة تحتوي على:

1. ملخص بسيط للدرس
2. أهم النقاط
3. شرح المصطلحات الصعبة
4. ما يجب على الطالب حفظه
5. مثال بسيط إن أمكن
6. 5 أسئلة قصيرة لاختبار الفهم

استخدم لغة عربية سهلة ومناسبة للطلاب.
`;

        const result = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct",
          {
            prompt,
            max_tokens: 1800
          }
        );

        return json({
          ok: true,
          text: result.response || "لم يتم الحصول على إجابة."
        });

      } catch (error) {
        return json({
          ok: false,
          error: error.message || "حدث خطأ في الذكاء الاصطناعي"
        }, 500);
      }
    }

    // 🌐 عرض الموقع
    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

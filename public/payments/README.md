# شعارات طرق الدفع

لإظهار الشعار الرسمي لأي طريقة دفع بدل النص:
1) ضع ملف الشعار هنا، مثل: platform/public/payments/mada.svg
2) في platform/src/lib/payments.ts أضف المسار للطريقة:
   { id: "mada", name: "مدى", logo: "/payments/mada.svg" },

يُفضَّل ملفات SVG أو PNG شفافة بخلفية فاتحة (لأنها تظهر داخل بطاقة بيضاء).

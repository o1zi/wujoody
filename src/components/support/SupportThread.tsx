type Msg = { id: string; sender: string; body: string; created_at: string };

export default function SupportThread({ messages, me }: { messages: Msg[]; me: "office" | "admin" }) {
  if (!messages.length) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted">
        لا توجد رسائل بعد. ابدأ المحادثة بكتابة رسالتك بالأسفل.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => {
        const mine = m.sender === me;
        return (
          <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                mine ? "bg-accent text-[#0b0d10]" : "border border-border bg-surface-2 text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
              <div className={`mono mt-1 text-[10px] ${mine ? "text-[#0b0d10]/60" : "text-muted"}`}>
                {m.sender === "admin" ? "الدعم" : "المكتب"} · {new Date(m.created_at).toLocaleString("ar-SA")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

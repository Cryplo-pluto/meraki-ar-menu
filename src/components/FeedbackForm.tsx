import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/reviews.functions";

/** "Enjoyed our food?" — guest star rating + quote, inserted as
 * status="pending" and reviewed by staff before it can appear in the
 * public reviews strip. */
export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) return;
    setStatus("sending");
    try {
      await submitReview({
        data: { author_first_name: name, body, rating },
      });
      setStatus("sent");
      setName("");
      setBody("");
      setRating(0);
    } catch {
      setStatus("error");
    }
  }

  const shown = hoverRating || rating;

  return (
    <section className="bg-[var(--mint-tint)] py-20">
      <div className="container-page mx-auto max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--mint)]">Tell us</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Enjoyed our food?</h2>
        <p className="mx-auto mt-3 max-w-md text-[color:var(--muted-foreground)]">
          Leave a quick rating and a note — our team reads every one.
        </p>

        {status === "sent" ? (
          <p className="mt-8 rounded-2xl bg-[var(--paper)] p-6 text-sm text-[var(--charcoal)] warm-shadow">
            Thank you! Your feedback means a lot to us.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-4 rounded-2xl bg-[var(--paper)] p-6 text-left warm-shadow sm:p-8"
          >
            <div
              className="flex items-center justify-center gap-1"
              role="radiogroup"
              aria-label="Rate your experience out of 5 stars"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--mint-tint)]"
                >
                  <Star
                    className={`h-7 w-7 ${n <= shown ? "fill-[var(--mint)] text-[var(--mint)]" : "text-border"}`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="fb-name" className="sr-only">
                Your first name
              </label>
              <input
                id="fb-name"
                type="text"
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full rounded-xl border border-border bg-[var(--paper)] px-4 py-3 text-sm placeholder:text-[color:var(--muted-foreground)] focus:border-[var(--mint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
              />
            </div>

            <div>
              <label htmlFor="fb-body" className="sr-only">
                Your feedback
              </label>
              <textarea
                id="fb-body"
                required
                maxLength={600}
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What did you enjoy?"
                className="w-full resize-none rounded-xl border border-border bg-[var(--paper)] px-4 py-3 text-sm placeholder:text-[color:var(--muted-foreground)] focus:border-[var(--mint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-destructive">Something went wrong — please try again.</p>
            )}

            <button
              type="submit"
              disabled={rating === 0 || status === "sending"}
              className="w-full rounded-full bg-[var(--charcoal)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-[var(--cream)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send feedback"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

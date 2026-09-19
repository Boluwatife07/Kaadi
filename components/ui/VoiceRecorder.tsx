// OWNER: SA
// Voice and typed input are equally required paths (Section 2.1) — neither
// is mandatory. Live transcription runs client-side via the browser's
// SpeechRecognition API and is never submitted straight from audio: it's
// always shown as editable text before the worker submits (Section 10.2).
// If SpeechRecognition is unsupported, this still captures nothing silently
// broken — it just drops straight to the typed textarea, which is the
// fallback path, not a lesser product.
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function VoiceRecorder({
  onSubmit,
}: {
  onSubmit: (text: string, mode: "voice" | "text") => void;
}) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mode, setMode] = useState<"voice" | "text">("text");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  function startRecording() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }
      setTranscript(finalText);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setMode("voice");
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-[var(--space-4)]">
      {supported && (
        <div className="flex items-center gap-[var(--space-3)]">
          {!recording ? (
            <Button variant="primary" onClick={startRecording} type="button">
              ● Record your account
            </Button>
          ) : (
            <Button variant="danger" onClick={stopRecording} type="button">
              ■ Stop recording
            </Button>
          )}
          {recording && (
            <span className="text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
              Listening…
            </span>
          )}
        </div>
      )}

      {!supported && (
        <p className="text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
          Voice recording isn&apos;t available in this browser. Type your account below instead —
          it works exactly the same way.
        </p>
      )}

      <div>
        <label htmlFor="intake-text" className="mb-[var(--space-2)] block font-medium">
          {mode === "voice" ? "Your transcript — check it before submitting" : "Type your account"}
        </label>
        <textarea
          id="intake-text"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            if (mode !== "voice") setMode("text");
          }}
          rows={6}
          placeholder="Tell us who you are, what you do, and who you've worked for…"
          className="w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] p-[var(--space-3)] text-[var(--text-md)]"
        />
      </div>

      <Button
        variant="primary"
        fullWidth
        disabled={!transcript.trim()}
        onClick={() => onSubmit(transcript.trim(), mode)}
        type="button"
      >
        Submit account
      </Button>
    </div>
  );
}

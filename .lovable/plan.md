

# Fix: Voice Mode Crash and API Key Reset

## Root Cause

Two bugs work together to cause the issue:

1. **Missing try-catch on `startRecording()`** in `ChatSimulator.tsx` line 98. When the mic button is clicked, `navigator.mediaDevices.getUserMedia()` can throw (permission denied, not available in iframe, etc.). This error is unhandled because only the `stopRecording` branch (lines 100-132) has a try-catch. The unhandled async error propagates and can crash the component tree.

2. **API key stored only in React state** (`useState` in `useTamadaExternalApi`). Any crash, remount, or page refresh wipes the key. There is no persistence layer (localStorage, sessionStorage, etc.).

## Bugs to Fix

### Bug 1: Unhandled error in voice recording start
**File:** `src/components/api-testing/ChatSimulator.tsx`
**Lines:** 96-98

The `handleVoiceRecord` function calls `await recorder.startRecording()` without try-catch. If mic access fails, the error is unhandled.

**Fix:** Wrap the entire `handleVoiceRecord` in a try-catch, show a toast notification on mic permission failure, and reset state gracefully.

### Bug 2: API key not persisted
**File:** `src/hooks/useTamadaExternalApi.ts`
**Lines:** 11

The `apiKey` is `useState("")` with no persistence. Any component remount loses it.

**Fix:** Initialize from `sessionStorage`, and sync changes back via a `useEffect` or by wrapping `setApiKey`. This preserves the key across tab switches, hot reloads, and error recovery.

### Bug 3: Base64 encoding potential crash for large audio
**File:** `src/hooks/useAudioRecorder.ts`
**Lines:** 47-51

The character-by-character `String.fromCharCode` + `btoa` approach can fail for very large recordings. While not the primary bug, it's fragile.

**Fix:** Use a chunked approach or `FileReader.readAsDataURL()` for safer base64 conversion.

## Implementation

### 1. `src/hooks/useTamadaExternalApi.ts`
- Change `useState("")` to `useState(() => sessionStorage.getItem("tamada_api_key") || "")`
- Add `useEffect` to sync `apiKey` to `sessionStorage` on change

### 2. `src/components/api-testing/ChatSimulator.tsx`
- Wrap the `recorder.state === "idle"` branch in try-catch
- On error, show a sonner toast: "Microphone access denied" / reset state
- Add `import { toast } from "sonner"`

### 3. `src/hooks/useAudioRecorder.ts`
- Replace the manual `String.fromCharCode` loop + `btoa` with a chunked base64 approach that handles large buffers safely


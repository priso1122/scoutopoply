# Scoutopoly

Scoutopoly is a Firebase-powered, real-time patrol board game. The playable client is `scoutopoly.html`; it must be served over HTTP(S), not opened with `file://`.

## Run locally

1. Install Node.js 20 or later.
2. In this folder, run `npm install`.
3. In Firebase Console for `scoutopoly-eb480`, enable **Authentication > Anonymous** and create a **Cloud Firestore** database.
4. Run `npm run dev` and open the URL shown by Vite.

`file://` pages cannot reliably use Firebase Anonymous Authentication. The UI now disables Create/Join until auth is available, preventing the null-user error shown in the browser screenshot.

## Firebase deployment

1. Install the Firebase CLI: `npm install -g firebase-tools`.
2. Authenticate and select the existing project: `firebase login`, then `firebase use scoutopoly-eb480`.
3. Install function dependencies: `cd functions && npm install && cd ..`.
4. Deploy with `firebase deploy`.

## Security model

`firestore.rules` is intentionally restrictive: production game mutations belong in Cloud Functions so clients cannot forge Trail Points, dice, base ownership, Honor, or scores. `functions/index.js` contains the callable-action starting point. Before deploying those strict rules, migrate each remaining client-side mutation to `gameAction` or additional callables.

## Configuration

Copy `.env.example` to `.env` when migrating the client from the embedded public Firebase config to Vite environment variables. Never add Firebase Admin credentials to browser code or commit them.

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();
const db = getFirestore();

function requireUser(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before performing a game action.');
  return request.auth.uid;
}

// This callable establishes the server-authoritative pattern required for game
// mutations. Expand the switch with the same rules used by the UI before
// enabling the production Firestore rules above.
export const gameAction = onCall(async (request) => {
  const uid = requireUser(request);
  const { roomId, type } = request.data || {};
  if (!roomId || !type) throw new HttpsError('invalid-argument', 'roomId and type are required.');

  const roomRef = db.collection('gameRooms').doc(roomId);
  return db.runTransaction(async (transaction) => {
    const roomSnapshot = await transaction.get(roomRef);
    if (!roomSnapshot.exists) throw new HttpsError('not-found', 'Camp not found.');
    const room = roomSnapshot.data();
    if (!room.members?.[uid]) throw new HttpsError('permission-denied', 'You are not a member of this camp.');

    if (type === 'setReady') {
      if (room.phase !== 'lobby') throw new HttpsError('failed-precondition', 'The lobby is closed.');
      const member = room.members[uid];
      transaction.update(roomRef, { [`members.${uid}`]: { ...member, ready: !member.ready } });
      return { ready: !member.ready };
    }

    if (type === 'pause') {
      if (room.gmUid !== uid && room.hostUid !== uid) throw new HttpsError('permission-denied', 'Only the Game Master can pause the game.');
      const phase = room.phase === 'paused' ? 'playing' : 'paused';
      transaction.update(roomRef, { phase, updatedAt: FieldValue.serverTimestamp() });
      return { phase };
    }

    throw new HttpsError('unimplemented', `Unsupported game action: ${type}`);
  });
});

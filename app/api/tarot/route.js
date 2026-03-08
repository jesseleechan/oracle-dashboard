import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { TAROT_DECK } from '@/lib/tarotData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count')) || 3;

  if (count > TAROT_DECK.length) {
    return NextResponse.json({ error: "Count exceeds deck size" }, { status: 400 });
  }

  // Cryptographically secure shuffle using Node.js crypto module
  const deck = [...TAROT_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const selected = deck.slice(0, count).map(card => ({ ...card, flipped: false }));
  return NextResponse.json(selected);
}

import { NextResponse } from 'next/server';

function calculateUniversalDay(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  
  const parts = [
    date.getMonth() + 1, // 1-12
    date.getDate(),
    date.getFullYear()
  ];
  
  const sumDigits = (num) => String(num).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  let total = parts.reduce((acc, p) => acc + sumDigits(p), 0);
  
  while (total > 9) {
    total = sumDigits(total);
  }
  
  return total;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  
  const universalDay = calculateUniversalDay(dateStr);
  
  return NextResponse.json({ universalDay });
}

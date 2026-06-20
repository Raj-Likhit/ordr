import { NextResponse } from 'next/server';
import { AppError } from '../errors/AppError';

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error('Unhandled Error:', error);
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}

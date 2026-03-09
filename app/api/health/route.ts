import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ status: 'ok', message: 'Servidor rodando' })
}

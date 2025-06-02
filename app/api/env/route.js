import { NextResponse } from 'next/server'

export async function GET(req, res) {
    //res.status(200).json(process.env); // Attenzione: include anche dati sensibili
    return NextResponse.json(process.env, { status: 200 })
}


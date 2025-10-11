import { NextRequest, NextResponse } from 'next/server';

const RASA_WEBHOOK_URL = process.env.RASA_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    if (!RASA_WEBHOOK_URL) {
      console.error('❌ RASA_WEBHOOK_URL environment variable is not set');
      return NextResponse.json(
        { status: 'error', message: 'RASA webhook URL not configured' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { status: 'error', message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { message, sender, context } = body;

    if (!message || !sender) {
      return NextResponse.json(
        { status: 'error', message: 'Missing message or sender' },
        { status: 400 }
      );
    }

    const rasaRequest = {
      sender: sender,
      message: message,
      metadata: context || {}
    };

    console.log('🤖 Proxying to RASA:', RASA_WEBHOOK_URL, rasaRequest);

    const rasaResponse = await fetch(RASA_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rasaRequest),
    });

    if (!rasaResponse.ok) {
      console.error('RASA server error:', rasaResponse.status);
      return NextResponse.json(
        { 
          status: 'error', 
          message: `RASA server returned ${rasaResponse.status}` 
        },
        { status: rasaResponse.status }
      );
    }

    const rasaMessages = await rasaResponse.json();
    console.log('🤖 RASA response:', rasaMessages);

    const responses = rasaMessages.map((msg: any) => ({
      text: msg.text || '',
      buttons: msg.buttons || undefined,
      custom: msg.custom || undefined,
    }));

    return NextResponse.json({
      status: 'success',
      responses: responses,
      sender: sender,
    });

  } catch (error) {
    console.error('Error in RASA proxy:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

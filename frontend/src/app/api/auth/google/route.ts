import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=' + encodeURIComponent(error), request.url)
    );
  }

  if (code) {
    try {
      // Intercambiar código por token con tu backend
      const tokenResponse = await fetch('http://localhost:5001/api/auth/google/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await tokenResponse.json();

      if (data.success) {
        // Redirigir al callback con el token
        return NextResponse.redirect(
          new URL(`/callback?token=${encodeURIComponent(data.data.token)}`, request.url)
        );
      } else {
        return NextResponse.redirect(
          new URL('/login?error=' + encodeURIComponent(data.message), request.url)
        );
      }
    } catch (err) {
      return NextResponse.redirect(
        new URL('/login?error=Error del servidor', request.url)
      );
    }
  }

  return NextResponse.redirect(new URL('/login?error=Código no recibido', request.url));
}

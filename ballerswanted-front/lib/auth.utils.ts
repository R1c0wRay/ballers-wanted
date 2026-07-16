export function isTokenExpired(
  token: string,
): boolean {

  try {

    const payload =
      JSON.parse(
        atob(
          token.split('.')[1],
        ),
      );

    return (
      payload.exp * 1000 <
      Date.now()
    );

  } catch {

    return true;
  }
}

export function getValidToken():
  string | null {

  const token =
    localStorage.getItem(
      'accessToken',
    );

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {

    localStorage.removeItem(
      'accessToken',
    );

    return null;
  }

  return token;
}

export function logout(): void {

  localStorage.removeItem(
    'accessToken',
  );
}
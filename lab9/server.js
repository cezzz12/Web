const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const querystring = require('node:querystring');

const { createRepository } = require('./src/database');
const { renderLoginPage } = require('./src/login-page');
const { validateCredentials, validateDestination } = require('./src/validation');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number.parseInt(process.env.PORT ?? '5110', 10);
const SESSION_COOKIE_NAME = 'lab9_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PUBLIC_ROOT = path.join(__dirname, 'public');
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'lab9.sqlite');

const repository = createRepository(DATABASE_PATH, {
  username: process.env.SEED_USERNAME || 'traveladmin',
  password: process.env.SEED_PASSWORD || 'Travel123!',
});

const sessions = new Map();

function isAllowedOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
    );
  } catch {
    return false;
  }
}

function applyCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Vary', 'Origin');
  }

  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) {
    return cookies;
  }

  for (const segment of cookieHeader.split(';')) {
    const [rawName, ...rawValueParts] = segment.trim().split('=');
    if (!rawName) {
      continue;
    }

    cookies[rawName] = decodeURIComponent(rawValueParts.join('=') || '');
  }

  return cookies;
}

function setCookie(response, value) {
  response.setHeader('Set-Cookie', value);
}

function createSession(user) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId: user.id,
    username: user.username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

function getSession(request) {
  const cookies = parseCookies(request.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE_NAME];
  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return {
    id: sessionId,
    ...session,
  };
}

function clearSession(request, response) {
  const cookies = parseCookies(request.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE_NAME];
  if (sessionId) {
    sessions.delete(sessionId);
  }

  setCookie(
    response,
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

function sendJson(request, response, statusCode, payload) {
  applyCorsHeaders(request, response);
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function sendHtml(request, response, statusCode, html) {
  applyCorsHeaders(request, response);
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end(html);
}

function redirect(request, response, location) {
  applyCorsHeaders(request, response);
  response.statusCode = 302;
  response.setHeader('Location', location);
  response.end();
}

function sendNoContent(request, response) {
  applyCorsHeaders(request, response);
  response.statusCode = 204;
  response.end();
}

function sendNotFound(request, response) {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Not found.');
}

function normalizeReturnUrl(returnUrl) {
  const rawValue = String(returnUrl ?? '').trim();
  if (!rawValue) {
    return '/';
  }

  if (rawValue.startsWith('/')) {
    return rawValue;
  }

  try {
    const parsed = new URL(rawValue);
    if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') {
      return parsed.toString();
    }
  } catch {
    return '/';
  }

  return '/';
}

function getRequestReturnUrl(request) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  return `${requestUrl.pathname}${requestUrl.search}`;
}

function parsePositiveId(urlObject) {
  const rawId = urlObject.searchParams.get('id');
  const id = Number.parseInt(rawId ?? '', 10);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

async function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large.'));
        request.destroy();
      }
    });

    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function parseJsonBody(request) {
  const rawBody = await readBody(request);
  if (!rawBody.trim()) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

async function parseFormBody(request) {
  const rawBody = await readBody(request);
  return querystring.parse(rawBody);
}

function isPublicPath(pathname) {
  return pathname === '/login' || pathname === '/logout' || pathname === '/favicon.ico';
}

function ensureAuthenticated(request, response, pathname) {
  if (isPublicPath(pathname)) {
    return { authenticated: true, session: getSession(request) };
  }

  const session = getSession(request);
  if (session) {
    return { authenticated: true, session };
  }

  if (pathname.startsWith('/api/')) {
    sendJson(request, response, 401, {
      success: false,
      authenticated: false,
      message: 'Authentication required.',
    });
    return { authenticated: false, session: null };
  }

  const returnUrl = encodeURIComponent(getRequestReturnUrl(request));
  redirect(request, response, `/login?returnUrl=${returnUrl}`);
  return { authenticated: false, session: null };
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.ico':
      return 'image/x-icon';
    case '.png':
      return 'image/png';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function serveStatic(request, response, pathname) {
  const relativePath = pathname === '/' ? '/index.html' : pathname;
  const resolvedPath = path.normalize(path.join(PUBLIC_ROOT, relativePath));

  if (!resolvedPath.startsWith(PUBLIC_ROOT)) {
    sendNotFound(request, response);
    return;
  }

  if (!fs.existsSync(resolvedPath) || fs.statSync(resolvedPath).isDirectory()) {
    sendNotFound(request, response);
    return;
  }

  response.statusCode = 200;
  response.setHeader('Content-Type', getContentType(resolvedPath));
  fs.createReadStream(resolvedPath).pipe(response);
}

async function handleLoginGet(request, response, urlObject) {
  const session = getSession(request);
  const returnUrl = normalizeReturnUrl(urlObject.searchParams.get('returnUrl'));

  if (session) {
    redirect(request, response, returnUrl);
    return;
  }

  sendHtml(request, response, 200, renderLoginPage(returnUrl));
}

async function handleLoginPost(request, response) {
  const form = await parseFormBody(request);
  const { username, password, errors } = validateCredentials(form.username, form.password);
  const returnUrl = normalizeReturnUrl(form.returnUrl);

  if (Object.keys(errors).length > 0) {
    sendHtml(
      request,
      response,
      422,
      renderLoginPage(returnUrl, username, 'Please fix the highlighted login fields.', errors),
    );
    return;
  }

  const user = repository.authenticate(username, password);
  if (!user) {
    sendHtml(
      request,
      response,
      401,
      renderLoginPage(returnUrl, username, 'Invalid username or password.'),
    );
    return;
  }

  const sessionId = createSession(user);
  setCookie(
    response,
    `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`,
  );
  redirect(request, response, returnUrl);
}

function handleLogoutRoute(request, response) {
  clearSession(request, response);
  redirect(request, response, '/login');
}

function handleSessionApi(request, response, session) {
  if (!session) {
    sendJson(request, response, 401, {
      success: false,
      authenticated: false,
      message: 'Authentication required.',
    });
    return;
  }

  sendJson(request, response, 200, {
    success: true,
    authenticated: true,
    username: session.username,
  });
}

function handleLogoutApi(request, response) {
  clearSession(request, response);
  sendJson(request, response, 200, {
    success: true,
    authenticated: false,
    message: 'Logged out.',
  });
}

function handleCountriesApi(request, response) {
  try {
    sendJson(request, response, 200, {
      success: true,
      countries: repository.getCountries(),
    });
  } catch {
    sendJson(request, response, 500, {
      success: false,
      message: 'Could not load countries.',
    });
  }
}

function handleGetDestinationsApi(request, response, urlObject) {
  try {
    const country = String(urlObject.searchParams.get('country') ?? '').trim();
    const requestedPage = Number.parseInt(urlObject.searchParams.get('page') ?? '1', 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const result = repository.getDestinations(country, page, 4);

    sendJson(request, response, 200, {
      success: true,
      destinations: result.destinations,
      pagination: {
        page: result.page,
        per_page: result.perPage,
        total: result.total,
        total_pages: result.totalPages,
        has_previous: result.page > 1,
        has_next: result.page < result.totalPages,
      },
      country,
    });
  } catch {
    sendJson(request, response, 500, {
      success: false,
      message: 'Could not process request.',
    });
  }
}

async function handleCreateDestinationApi(request, response) {
  try {
    const body = await parseJsonBody(request);
    const { data, errors } = validateDestination(body);
    if (!data) {
      sendJson(request, response, 422, {
        success: false,
        message: 'Please check the form fields.',
        errors,
      });
      return;
    }

    const id = repository.createDestination(data);
    sendJson(request, response, 201, {
      success: true,
      message: 'Destination added.',
      destination: repository.findDestination(id),
    });
  } catch {
    sendJson(request, response, 500, {
      success: false,
      message: 'Could not process request.',
    });
  }
}

async function handleUpdateDestinationApi(request, response, urlObject) {
  try {
    const id = parsePositiveId(urlObject);
    if (!id || !repository.findDestination(id)) {
      sendJson(request, response, 404, {
        success: false,
        message: 'Destination not found.',
      });
      return;
    }

    const body = await parseJsonBody(request);
    const { data, errors } = validateDestination(body);
    if (!data) {
      sendJson(request, response, 422, {
        success: false,
        message: 'Please check the form fields.',
        errors,
      });
      return;
    }

    repository.updateDestination(id, data);
    sendJson(request, response, 200, {
      success: true,
      message: 'Destination updated.',
      destination: repository.findDestination(id),
    });
  } catch {
    sendJson(request, response, 500, {
      success: false,
      message: 'Could not process request.',
    });
  }
}

function handleDeleteDestinationApi(request, response, urlObject) {
  try {
    const id = parsePositiveId(urlObject);
    if (!id || !repository.findDestination(id)) {
      sendJson(request, response, 404, {
        success: false,
        message: 'Destination not found.',
      });
      return;
    }

    repository.deleteDestination(id);
    sendJson(request, response, 200, {
      success: true,
      message: 'Destination deleted.',
    });
  } catch {
    sendJson(request, response, 500, {
      success: false,
      message: 'Could not process request.',
    });
  }
}

const server = http.createServer(async (request, response) => {
  applyCorsHeaders(request, response);

  if (request.method === 'OPTIONS') {
    sendNoContent(request, response);
    return;
  }

  const urlObject = new URL(request.url, `http://${request.headers.host}`);
  const pathname = urlObject.pathname;

  if (pathname === '/favicon.ico') {
    sendNoContent(request, response);
    return;
  }

  if (pathname === '/login' && request.method === 'GET') {
    await handleLoginGet(request, response, urlObject);
    return;
  }

  if (pathname === '/login' && request.method === 'POST') {
    await handleLoginPost(request, response);
    return;
  }

  if (pathname === '/logout' && (request.method === 'GET' || request.method === 'POST')) {
    handleLogoutRoute(request, response);
    return;
  }

  const { authenticated, session } = ensureAuthenticated(request, response, pathname);
  if (!authenticated) {
    return;
  }

  if (pathname === '/api/session.php' && request.method === 'GET') {
    handleSessionApi(request, response, session);
    return;
  }

  if (pathname === '/api/logout.php' && request.method === 'POST') {
    handleLogoutApi(request, response);
    return;
  }

  if (pathname === '/api/countries.php' && request.method === 'GET') {
    handleCountriesApi(request, response);
    return;
  }

  if (pathname === '/api/destinations.php' && request.method === 'GET') {
    handleGetDestinationsApi(request, response, urlObject);
    return;
  }

  if (pathname === '/api/destinations.php' && request.method === 'POST') {
    await handleCreateDestinationApi(request, response);
    return;
  }

  if (pathname === '/api/destinations.php' && request.method === 'PUT') {
    await handleUpdateDestinationApi(request, response, urlObject);
    return;
  }

  if (pathname === '/api/destinations.php' && request.method === 'DELETE') {
    handleDeleteDestinationApi(request, response, urlObject);
    return;
  }

  if (request.method === 'GET') {
    serveStatic(request, response, pathname);
    return;
  }

  sendNotFound(request, response);
});

server.listen(PORT, HOST, () => {
  console.log(`Lab 9 is running at http://${HOST}:${PORT}/login`);
  console.log('Demo account: traveladmin / Travel123!');
});

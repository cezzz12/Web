using System.Net;

namespace VacationDestinationsAspNet.Ui;

public static class LoginPageRenderer
{
    public static string Render(
        string returnUrl,
        string username = "",
        string? message = null,
        IReadOnlyDictionary<string, string>? fieldErrors = null)
    {
        fieldErrors ??= new Dictionary<string, string>();

        var usernameError = fieldErrors.TryGetValue("username", out var usernameMessage)
            ? $"<small>{Encode(usernameMessage)}</small>"
            : string.Empty;
        var passwordError = fieldErrors.TryGetValue("password", out var passwordMessage)
            ? $"<small>{Encode(passwordMessage)}</small>"
            : string.Empty;
        var notice = string.IsNullOrWhiteSpace(message)
            ? string.Empty
            : $"<div class=\"notice\">{Encode(message)}</div>";

        return $$"""
            <!doctype html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Login | Vacation destinations</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body {
                  margin: 0;
                  min-height: 100vh;
                  display: grid;
                  place-items: center;
                  padding: 24px;
                  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(160deg, #f4f9ff 0%, #eef7f1 100%);
                  color: #1f2937;
                }
                .card {
                  width: min(460px, 100%);
                  background: #ffffff;
                  border: 1px solid #d8dee8;
                  border-radius: 14px;
                  padding: 28px;
                  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.10);
                }
                .eyebrow {
                  margin: 0 0 8px;
                  color: #047857;
                  text-transform: uppercase;
                  font-size: 0.78rem;
                  font-weight: 700;
                  letter-spacing: 0.08em;
                }
                h1 { margin: 0; font-size: 1.8rem; }
                p { color: #4b5563; line-height: 1.5; }
                form { display: grid; gap: 16px; margin-top: 24px; }
                label {
                  display: grid;
                  gap: 6px;
                  font-weight: 700;
                }
                input {
                  width: 100%;
                  min-height: 42px;
                  border: 1px solid #cbd5e1;
                  border-radius: 10px;
                  padding: 10px 12px;
                  font: inherit;
                }
                input:focus {
                  outline: 3px solid #bfdbfe;
                  border-color: #2563eb;
                }
                button {
                  min-height: 42px;
                  border: 0;
                  border-radius: 10px;
                  background: #2563eb;
                  color: #ffffff;
                  font: inherit;
                  font-weight: 700;
                  cursor: pointer;
                }
                small {
                  color: #b42318;
                  font-weight: 400;
                }
                .notice {
                  margin-top: 18px;
                  padding: 12px 14px;
                  border-radius: 10px;
                  background: #fee4e2;
                  color: #b42318;
                  font-weight: 700;
                }
                .hint {
                  margin-top: 18px;
                  padding: 14px;
                  border-radius: 10px;
                  background: #f8fafc;
                  border: 1px solid #d8dee8;
                }
                code {
                  padding: 2px 6px;
                  border-radius: 6px;
                  background: #eef4ff;
                  color: #1e40af;
                }
              </style>
            </head>
            <body>
              <section class="card">
                <p class="eyebrow">Secure access</p>
                <h1>Sign in first</h1>
                <p>All pages in the ASP.NET version are protected by a session. Log in to manage the vacation destinations list.</p>
                {{notice}}
                <form method="post" action="/login">
                  <input type="hidden" name="returnUrl" value="{{Encode(returnUrl)}}">
                  <label>
                    Username
                    <input name="username" value="{{Encode(username)}}" autocomplete="username" maxlength="60" required>
                    {{usernameError}}
                  </label>
                  <label>
                    Password
                    <input name="password" type="password" autocomplete="current-password" minlength="6" maxlength="100" required>
                    {{passwordError}}
                  </label>
                  <button type="submit">Log in</button>
                </form>
                <div class="hint">
                  Demo account: <code>traveladmin</code> / <code>Travel123!</code>
                </div>
              </section>
            </body>
            </html>
            """;
    }

    private static string Encode(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);
}

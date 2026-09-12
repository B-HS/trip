# Trip verification mail worker

This Worker is the narrow mail boundary used by Next.js. Set the `SEND_SECRET` secret and deploy it with Cloudflare Email Service / Workers Paid. Configure the same URL, token and `EMAIL_FROM` in the Next.js environment as `EMAIL_WORKER_URL`, `EMAIL_WORKER_TOKEN` and `EMAIL_FROM`.

The Worker accepts only authenticated JSON `POST` requests and sends through the `SEND_EMAIL` binding. It intentionally does not expose a public mail relay.

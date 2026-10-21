// Requests to our own server. Every failure becomes an Error whose message a user can read.

// When Express is not running, Vite answers 502 with an empty body,
// so the body cannot be trusted to be JSON
async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function getJson(url) {
  let response
  try {
    response = await fetch(url)
  } catch {
    // fetch only rejects when no response arrives at all
    throw new Error('Could not reach the server. Check your connection and try again.')
  }
  const data = await readJson(response)
  if (!response.ok) {
    throw new Error(data?.error ?? `The server did not answer properly (HTTP ${response.status}). Please try again in a moment.`)
  }
  return data
}

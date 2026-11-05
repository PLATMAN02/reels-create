# Optional publishing

Only use this reference when the user requests an upload. A request to create or revise a video does not authorize
uploading it or hosting it publicly. Preserve prior explicit publishing choices within the same task.

Discover the currently available YouTube connector/CLI (load deferred MCP tools with ToolSearch, or try
`composio search "upload youtube video"`) and inspect its upload schema. Do not assume the original pasted
Zapier Code Mode APIs are installed in this environment. Use the available integration's own skill when required.
Uploading is outward-facing: confirm channel, title and visibility with the user in chat before the write. Resolve
account/channel, title, description, audience settings and visibility before the write; ask only for missing consequential
choices. Complete the local video and reviewable metadata first.

Some APIs require a remotely fetchable media URL rather than a local path. Prefer direct local-file upload when supported.
If temporary hosting is necessary, explain which service will receive the video and its actual exposure/expiry, and obtain
explicit authorization for that hosting. Do not treat a failed/uncertain upload as permission to repeat the write through
another service. Verify actual response IDs and read back status where possible before reporting success.

Do not assume Shorts eligibility, file-host availability, custom-thumbnail support, categories or privacy defaults from
old instructions. Check current official product documentation/schema when needed for publishing. Return the verified
video link and actual visibility; keep the local master available regardless of upload outcome.

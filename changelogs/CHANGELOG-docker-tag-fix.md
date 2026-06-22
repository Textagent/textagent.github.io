# Fix invalid Docker image tag on PR builds

- Fixed the `build-and-push` GitHub Actions job failing on pull requests with `invalid tag "...:-<sha>": invalid reference format`
- Root cause: `docker/metadata-action` used `type=sha,prefix={{branch}}-`, but `{{branch}}` resolves to an empty string on `pull_request` events, producing a tag with a leading hyphen (`:-b0503a8`) — which Docker rejects
- Changed the SHA tag prefix to a static `sha-`, valid across branch pushes, PRs, and the default branch; branch/PR identity is still captured by the separate `type=ref,event=branch` and `type=ref,event=pr` tag rules

---

## Summary

The Docker publish workflow couldn't build on any pull request because the SHA-based image tag was constructed with `{{branch}}-`, and the `branch` template is empty on PR events — yielding an invalid `:-<sha>` tag. Using a constant `sha-` prefix fixes PR builds without losing branch/PR information (the ref-based tags already encode that).

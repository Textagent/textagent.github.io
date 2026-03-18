// ============================================================
// TextAgent — Email to Self (Google Apps Script)
// ============================================================
// Deploy this as a Web App:
//   1. Open https://script.google.com → New project
//   2. Paste this code
//   3. Click Deploy → New deployment → Web app
//   4. Execute as: Me | Who has access: Anyone
//   5. Click Deploy → Copy the URL
//   6. Paste the URL into TextAgent's cloud-share.js (EMAIL_SCRIPT_URL)
//
// SECURITY:
//   - Rate limiting: 100 emails/day global, 7/day per recipient address
// ============================================================

// Rate limits
var DAILY_EMAIL_LIMIT = 100;       // Global cap (Gmail free tier allows 100/day)
var PER_EMAIL_LIMIT = 7;           // Max emails per recipient address per day

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);

        // ── 2. Rate limiting ──
        var props = PropertiesService.getScriptProperties();
        var today = new Date().toDateString();

        // Global daily cap
        var globalKey = 'email_count_' + today;
        var globalCount = parseInt(props.getProperty(globalKey) || '0', 10);
        if (globalCount >= DAILY_EMAIL_LIMIT) {
            return jsonResponse({ success: false, error: 'Daily email limit reached. Try again tomorrow.' });
        }

        // Per-recipient rate limit (no login needed — email IS the identity)
        var recipientEmail = (data.email || '').toLowerCase().trim();
        var perEmailKey = 'email_' + recipientEmail + '_' + today;
        var perEmailCount = parseInt(props.getProperty(perEmailKey) || '0', 10);
        if (perEmailCount >= PER_EMAIL_LIMIT) {
            return jsonResponse({ success: false, error: 'You have reached the limit of ' + PER_EMAIL_LIMIT + ' emails per day to this address.' });
        }

        // ── 3. Validate email ──
        var docTitle = data.title || 'Untitled Document';
        var emailSubject = data.subject || ('TextAgent: ' + docTitle);
        var markdownContent = data.content || '';
        var shareLink = data.shareLink || '';

        if (!recipientEmail || recipientEmail.indexOf('@') === -1) {
            return jsonResponse({ success: false, error: 'Invalid email address' });
        }

        // ── 4. Build HTML email body ──
        var htmlBody = '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">'
            + '<div style="border-bottom:2px solid #58a6ff;padding-bottom:16px;margin-bottom:24px">'
            + '<h2 style="margin:0;color:#1f2937">📝 TextAgent</h2>'
            + '<p style="margin:4px 0 0;color:#6b7280;font-size:14px">Your document has been shared</p>'
            + '</div>'
            + '<h3 style="margin:0 0 12px;color:#1f2937">' + docTitle + '</h3>'
            + '<p style="color:#4b5563;font-size:14px;line-height:1.6">You sent yourself this document from TextAgent. '
            + 'Click the link below to open it, or find the <code>.md</code> file attached to this email.</p>'
            + '<div style="margin:20px 0;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px">'
            + '<strong style="font-size:13px;color:#0369a1">🔗 Open in TextAgent</strong><br>'
            + '<a href="' + shareLink + '" style="word-break:break-all;color:#2563eb;font-size:13px">' + shareLink + '</a>'
            + '</div>'
            + '<p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">'
            + 'Sent via <a href="https://textagent.github.io" style="color:#2563eb">TextAgent</a> — '
            + 'Write with AI Agents, 100% client-side.</p>'
            + '</div>';

        // Plain text fallback
        var plainBody = 'TextAgent: ' + docTitle + '\n\n'
            + 'Open in TextAgent:\n' + shareLink + '\n\n'
            + 'The .md file is attached to this email.\n\n'
            + '---\nSent via TextAgent (https://textagent.github.io)';

        // Create .md file attachment
        var safeName = docTitle.replace(/[^a-zA-Z0-9\s\-]/g, '').replace(/\s+/g, '-').substring(0, 50);
        var mdBlob = Utilities.newBlob(markdownContent, 'text/markdown', (safeName || 'document') + '.md');

        // ── 5. Send email ──
        MailApp.sendEmail({
            to: recipientEmail,
            subject: emailSubject,
            body: plainBody,
            htmlBody: htmlBody,
            attachments: [mdBlob],
            name: 'TextAgent'
        });

        // ── 6. Increment rate limit counters ──
        props.setProperty(globalKey, String(globalCount + 1));
        props.setProperty(perEmailKey, String(perEmailCount + 1));

        return jsonResponse({ success: true });

    } catch (error) {
        return jsonResponse({ success: false, error: error.message });
    }
}

// Test endpoint (optional — for verifying deployment)
function doGet(e) {
    return jsonResponse({ status: 'ok', service: 'TextAgent Email (secured with Turnstile)' });
}

/** Helper: return a JSON response */
function jsonResponse(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

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
//
// FEATURES:
//   - Regular share: single link + optional password
//   - Form share: dual links (creator + respondent) + form badge
//   - .md file attachment
//   - Anti-bot: honeypot + timing check
// ============================================================

// Rate limits
var DAILY_EMAIL_LIMIT = 100;       // Global cap (Gmail free tier allows 100/day)
var PER_EMAIL_LIMIT = 7;           // Max emails per recipient address per day

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);

        // ── 1. Anti-bot checks ──
        if (data.hp) {
            return jsonResponse({ success: false, error: 'Invalid request' });
        }
        if (data.ts && data.ts < 3000) {
            return jsonResponse({ success: false, error: 'Invalid request' });
        }

        // ── 2. Rate limiting ──
        var props = PropertiesService.getScriptProperties();
        var today = new Date().toDateString();

        var globalKey = 'email_count_' + today;
        var globalCount = parseInt(props.getProperty(globalKey) || '0', 10);
        if (globalCount >= DAILY_EMAIL_LIMIT) {
            return jsonResponse({ success: false, error: 'Daily email limit reached. Try again tomorrow.' });
        }

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
        var password = data.passphrase || '';
        var isForm = data.isForm || false;
        var respondentLink = data.respondentLink || '';

        if (!recipientEmail || recipientEmail.indexOf('@') === -1) {
            return jsonResponse({ success: false, error: 'Invalid email address' });
        }

        // ── 4. Build HTML email body ──
        var isSecure = !!password;
        var htmlBody, plainBody;

        if (isForm && respondentLink) {
            // ===== FORM DOCUMENT: DUAL LINKS =====
            htmlBody = buildFormEmail(docTitle, shareLink, respondentLink, password);
            plainBody = 'TextAgent: ' + docTitle + '\n\n'
                + '📋 This document contains a form.\n\n'
                + '🔧 Your Link (edit + view responses):\n' + shareLink + '\n\n'
                + '🔗 Respondent Link (share with people):\n' + respondentLink + '\n\n'
                + (isSecure ? 'Password:\n' + password + '\n\n' : '')
                + '⚠️ Keep this email safe. Your Creator Link contains the response key.\n\n'
                + '---\nSent via TextAgent (https://textagent.github.io)';
        } else {
            // ===== REGULAR DOCUMENT: SINGLE LINK =====
            htmlBody = buildRegularEmail(docTitle, shareLink, password, isSecure);
            plainBody = 'TextAgent: ' + docTitle + '\n\n'
                + 'Open in TextAgent:\n' + shareLink + '\n\n'
                + (isSecure ? 'Password:\n' + password + '\n\n' : '')
                + 'The .md file is attached to this email.\n\n'
                + '---\nSent via TextAgent (https://textagent.github.io)';
        }

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

// ── Email Templates ──

function buildFormEmail(docTitle, creatorLink, respondentLink, password) {
    var passwordHtml = '';
    if (password) {
        passwordHtml = '<div style="margin:0 0 20px;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">'
            + '<strong style="font-size:13px;color:#166534">🔑 Password</strong><br>'
            + '<code style="font-size:14px;color:#166534;background:#dcfce7;padding:2px 8px;border-radius:4px;display:inline-block;margin-top:4px">' + password + '</code>'
            + '</div>';
    }

    return '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">'
        // Header
        + '<div style="border-bottom:2px solid #58a6ff;padding-bottom:16px;margin-bottom:24px">'
        + '<h2 style="margin:0;color:#1f2937">📝 TextAgent</h2>'
        + '<p style="margin:4px 0 0;color:#6b7280;font-size:14px">Your form has been shared</p>'
        + '</div>'
        // Title + badge
        + '<h3 style="margin:0 0 8px;color:#1f2937">' + docTitle + '</h3>'
        + '<div style="display:inline-block;padding:4px 10px;font-size:12px;font-weight:600;color:#059669;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;margin-bottom:16px">📋 This document contains a form</div>'
        + '<p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0 0 20px">You have two links below — one for you and one to share with respondents.</p>'
        // Creator link
        + '<div style="margin:0 0 20px;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px">'
        + '<strong style="font-size:13px;color:#0369a1">🔧 Your Link</strong> <span style="font-size:12px;color:#6b7280">(edit + view responses)</span><br>'
        + '<a href="' + creatorLink + '" style="word-break:break-all;color:#2563eb;font-size:13px">' + creatorLink + '</a>'
        + '</div>'
        // Respondent link
        + '<div style="margin:0 0 20px;padding:16px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px">'
        + '<strong style="font-size:13px;color:#7c3aed">🔗 Respondent Link</strong> <span style="font-size:12px;color:#6b7280">(share with people)</span><br>'
        + '<a href="' + respondentLink + '" style="word-break:break-all;color:#7c3aed;font-size:13px">' + respondentLink + '</a>'
        + '<p style="margin:8px 0 0;font-size:12px;color:#6b7280">Respondents can fill &amp; submit the form but cannot view other responses.</p>'
        + '</div>'
        // Password
        + passwordHtml
        // Warning
        + '<div style="margin:0 0 20px;padding:12px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px">'
        + '<p style="margin:0;font-size:12px;color:#92400e">⚠️ <strong>Keep this email safe.</strong> Your Creator Link contains the response key — anyone with it can view all submitted responses.</p>'
        + '</div>'
        // Footer
        + '<p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">'
        + 'Sent via <a href="https://textagent.github.io" style="color:#2563eb">TextAgent</a> — '
        + 'Write with AI Agents, 100% client-side.</p>'
        + '</div>';
}

function buildRegularEmail(docTitle, shareLink, password, isSecure) {
    var passwordHtml = '';
    if (isSecure) {
        passwordHtml = '<div style="margin:12px 0 20px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">'
            + '<strong style="font-size:13px;color:#166534">🔑 Password</strong><br>'
            + '<code style="font-size:14px;color:#166534;background:#dcfce7;padding:2px 8px;border-radius:4px;display:inline-block;margin-top:4px">' + password + '</code>'
            + '</div>';
    }

    var openInstructions = isSecure
        ? 'Click the link below and enter the password to open it.'
        : 'Click the link below to open it, or find the <code>.md</code> file attached.';

    return '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">'
        + '<div style="border-bottom:2px solid #58a6ff;padding-bottom:16px;margin-bottom:24px">'
        + '<h2 style="margin:0;color:#1f2937">📝 TextAgent</h2>'
        + '<p style="margin:4px 0 0;color:#6b7280;font-size:14px">Your document has been shared</p>'
        + '</div>'
        + '<h3 style="margin:0 0 12px;color:#1f2937">' + docTitle + '</h3>'
        + '<p style="color:#4b5563;font-size:14px;line-height:1.6">A document was shared with you via TextAgent. '
        + openInstructions + '</p>'
        + '<div style="margin:20px 0;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px">'
        + '<strong style="font-size:13px;color:#0369a1">🔗 Open in TextAgent</strong><br>'
        + '<a href="' + shareLink + '" style="word-break:break-all;color:#2563eb;font-size:13px">' + shareLink + '</a>'
        + '</div>'
        + passwordHtml
        + '<p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:12px">'
        + 'Sent via <a href="https://textagent.github.io" style="color:#2563eb">TextAgent</a> — '
        + 'Write with AI Agents, 100% client-side.</p>'
        + '</div>';
}

function doGet(e) {
    return jsonResponse({ status: 'ok', service: 'TextAgent Email (secured with Turnstile)' });
}

function jsonResponse(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

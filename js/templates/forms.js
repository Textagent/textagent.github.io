// ============================================
// templates/forms.js — Form Builder Templates
// ============================================
window.__MDV_TEMPLATES_FORMS = [
    {
        name: 'Contact Form',
        category: 'forms',
        icon: 'bi-envelope-paper',
        description: 'Simple contact form — name, email, subject dropdown, and message with encrypted response collection',
        content: '# 📬 Contact Form\n\n' +
            '> Share this form to collect messages from anyone. Responses are encrypted and stored securely.\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; line-height: 1.6; }\n' +
            '  .form-header { text-align: center; margin-bottom: 32px; }\n' +
            '  .form-header h1 { font-size: 2em; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }\n' +
            '  .form-header p { color: #94a3b8; font-size: 1.05em; }\n' +
            '  .form-card { background: #1e293b; border-radius: 16px; padding: 28px; border: 1px solid #334155; max-width: 560px; margin: 0 auto; }\n' +
            '  .field { margin-bottom: 22px; }\n' +
            '  .field label { display: block; font-weight: 600; font-size: .95em; margin-bottom: 8px; color: #f1f5f9; }\n' +
            '  .field label .req { color: #f87171; margin-left: 2px; }\n' +
            '  .field input, .field select, .field textarea { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; color: #e2e8f0; font-size: 1em; font-family: inherit; transition: border-color .2s, box-shadow .2s; outline: none; }\n' +
            '  .field input:focus, .field select:focus, .field textarea:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,.15); }\n' +
            '  .field input::placeholder, .field textarea::placeholder { color: #64748b; }\n' +
            '  .field textarea { min-height: 120px; resize: vertical; }\n' +
            '  .field select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }\n' +
            '  .field select option { background: #1e293b; color: #e2e8f0; }\n' +
            '  .field .hint { font-size: .8em; color: #64748b; margin-top: 4px; }\n' +
            '  .field .error { font-size: .8em; color: #f87171; margin-top: 4px; display: none; }\n' +
            '  .submit-btn { display: block; width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 1.05em; font-weight: 700; cursor: pointer; transition: all .2s; letter-spacing: .3px; }\n' +
            '  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,.4); }\n' +
            '  .submit-btn:active { transform: translateY(0); }\n' +
            '  .submit-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }\n' +
            '  .success-msg { text-align: center; padding: 32px; display: none; }\n' +
            '  .success-msg .check { font-size: 3em; margin-bottom: 12px; }\n' +
            '  .success-msg h2 { color: #6ee7b7; margin-bottom: 8px; }\n' +
            '  .success-msg p { color: #94a3b8; }\n' +
            '</style>\n\n' +
            '<div data-textagent-form="true">\n' +
            '  <div class="form-header">\n' +
            '    <h1>📬 Contact Form</h1>\n' +
            '    <p>We\'d love to hear from you. Fill in the details below.</p>\n' +
            '  </div>\n\n' +
            '  <div class="form-card" id="form-card">\n' +
            '    <form id="contact-form" novalidate>\n' +
            '      <div class="field">\n' +
            '        <label>Name <span class="req">*</span></label>\n' +
            '        <input type="text" name="name" placeholder="Your full name" required>\n' +
            '        <div class="error" id="err-name">Please enter your name.</div>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Email <span class="req">*</span></label>\n' +
            '        <input type="email" name="email" placeholder="your.email@example.com" required>\n' +
            '        <div class="error" id="err-email">Please enter a valid email.</div>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Subject</label>\n' +
            '        <select name="subject">\n' +
            '          <option value="">Select a topic…</option>\n' +
            '          <option value="general">General Inquiry</option>\n' +
            '          <option value="support">Support</option>\n' +
            '          <option value="feedback">Feedback</option>\n' +
            '          <option value="partnership">Partnership</option>\n' +
            '          <option value="other">Other</option>\n' +
            '        </select>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Message <span class="req">*</span></label>\n' +
            '        <textarea name="message" placeholder="Write your message here…" required></textarea>\n' +
            '        <div class="error" id="err-message">Please enter a message.</div>\n' +
            '      </div>\n\n' +
            '      <button type="submit" class="submit-btn" id="submit-btn">📨 Send Message</button>\n' +
            '    </form>\n' +
            '  </div>\n\n' +
            '  <div class="success-msg" id="success-msg">\n' +
            '    <div class="check">✅</div>\n' +
            '    <h2>Thank you!</h2>\n' +
            '    <p>Your response has been submitted successfully.</p>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<script>\n' +
            'const form = document.getElementById("contact-form");\n' +
            'form.addEventListener("submit", function(e) {\n' +
            '  e.preventDefault();\n' +
            '  // Validate\n' +
            '  let valid = true;\n' +
            '  const name = form.querySelector("[name=name]");\n' +
            '  const email = form.querySelector("[name=email]");\n' +
            '  const message = form.querySelector("[name=message]");\n' +
            '  document.querySelectorAll(".error").forEach(el => el.style.display = "none");\n' +
            '  if (!name.value.trim()) { document.getElementById("err-name").style.display = "block"; valid = false; }\n' +
            '  if (!email.value.trim() || !email.validity.valid) { document.getElementById("err-email").style.display = "block"; valid = false; }\n' +
            '  if (!message.value.trim()) { document.getElementById("err-message").style.display = "block"; valid = false; }\n' +
            '  if (!valid) return;\n' +
            '  // Collect data\n' +
            '  const data = Object.fromEntries(new FormData(form));\n' +
            '  data._submitted = new Date().toISOString();\n' +
            '  // Send to parent\n' +
            '  window.parent.postMessage({ type: "textagent-form-submit", data: data }, "*");\n' +
            '  // Show success\n' +
            '  document.getElementById("form-card").style.display = "none";\n' +
            '  document.getElementById("success-msg").style.display = "block";\n' +
            '});\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '> [!TIP]\n' +
            '> **Share this form** to start collecting responses. Click **Share** → copy the link → send it to anyone. Responses are encrypted and stored in Firestore.\n' +
            '> To view responses, open your shared link and click **📊 Responses** in the toolbar.\n'
    },
    {
        name: 'Survey Form',
        category: 'forms',
        icon: 'bi-bar-chart-line',
        description: 'Customer satisfaction survey — star rating, NPS scale, checkboxes, and comments',
        content: '# 📊 Customer Satisfaction Survey\n\n' +
            '> Collect feedback with star ratings, NPS scores, checkboxes, and open-ended comments.\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; line-height: 1.6; }\n' +
            '  .form-header { text-align: center; margin-bottom: 32px; }\n' +
            '  .form-header h1 { font-size: 2em; background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }\n' +
            '  .form-header p { color: #94a3b8; font-size: 1.05em; }\n' +
            '  .section { background: #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #334155; max-width: 600px; margin-left: auto; margin-right: auto; margin-bottom: 20px; }\n' +
            '  .section-title { font-size: 1.1em; font-weight: 700; margin-bottom: 16px; color: #f1f5f9; }\n' +
            '  .section-num { display: inline-block; background: #6366f1; color: #fff; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: .8em; margin-right: 8px; }\n' +
            '  /* Star Rating */\n' +
            '  .stars { display: flex; gap: 6px; flex-direction: row-reverse; justify-content: flex-end; }\n' +
            '  .stars input { display: none; }\n' +
            '  .stars label { font-size: 2em; color: #475569; cursor: pointer; transition: color .15s, transform .15s; }\n' +
            '  .stars label:hover, .stars label:hover ~ label, .stars input:checked ~ label { color: #f59e0b; transform: scale(1.1); }\n' +
            '  /* NPS Scale */\n' +
            '  .nps { display: flex; gap: 0; justify-content: space-between; margin: 8px 0; }\n' +
            '  .nps label { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; }\n' +
            '  .nps input { display: none; }\n' +
            '  .nps .dot { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #475569; display: flex; align-items: center; justify-content: center; font-size: .85em; font-weight: 600; transition: all .2s; }\n' +
            '  .nps input:checked + .dot { background: #6366f1; border-color: #818cf8; color: #fff; transform: scale(1.1); }\n' +
            '  .nps label:hover .dot { border-color: #818cf8; }\n' +
            '  .nps-labels { display: flex; justify-content: space-between; font-size: .8em; color: #64748b; margin-top: 4px; }\n' +
            '  /* Checkboxes */\n' +
            '  .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }\n' +
            '  .check-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; cursor: pointer; transition: all .2s; }\n' +
            '  .check-item:hover { border-color: #818cf8; background: rgba(129,140,248,.05); }\n' +
            '  .check-item input { accent-color: #818cf8; width: 18px; height: 18px; }\n' +
            '  /* Text */\n' +
            '  textarea { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; color: #e2e8f0; font-size: 1em; font-family: inherit; min-height: 100px; resize: vertical; outline: none; transition: border-color .2s; }\n' +
            '  textarea:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,.15); }\n' +
            '  textarea::placeholder { color: #64748b; }\n' +
            '  /* MCQ */\n' +
            '  .mcq-options { display: flex; flex-direction: column; gap: 6px; }\n' +
            '  .mcq-options label { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; cursor: pointer; transition: all .2s; }\n' +
            '  .mcq-options label:hover { border-color: #818cf8; background: rgba(129,140,248,.05); }\n' +
            '  .mcq-options input { accent-color: #818cf8; width: 18px; height: 18px; }\n' +
            '  /* Submit */\n' +
            '  .submit-wrap { max-width: 600px; margin: 0 auto; }\n' +
            '  .submit-btn { display: block; width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-size: 1.05em; font-weight: 700; cursor: pointer; transition: all .2s; }\n' +
            '  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,.4); }\n' +
            '  .submit-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }\n' +
            '  .success-msg { text-align: center; padding: 40px; display: none; }\n' +
            '  .success-msg .check { font-size: 3em; margin-bottom: 12px; }\n' +
            '  .success-msg h2 { color: #6ee7b7; margin-bottom: 8px; }\n' +
            '  .success-msg p { color: #94a3b8; }\n' +
            '  .error-hint { font-size: .8em; color: #f87171; margin-top: 8px; display: none; }\n' +
            '</style>\n\n' +
            '<div data-textagent-form="true">\n' +
            '  <div class="form-header">\n' +
            '    <h1>📊 Customer Satisfaction Survey</h1>\n' +
            '    <p>Help us improve by sharing your experience.</p>\n' +
            '  </div>\n\n' +
            '  <form id="survey-form">\n' +
            '    <!-- Star Rating -->\n' +
            '    <div class="section">\n' +
            '      <div class="section-title"><span class="section-num">1</span> Overall Experience</div>\n' +
            '      <div class="stars">\n' +
            '        <input type="radio" name="rating" value="5" id="s5"><label for="s5">★</label>\n' +
            '        <input type="radio" name="rating" value="4" id="s4"><label for="s4">★</label>\n' +
            '        <input type="radio" name="rating" value="3" id="s3"><label for="s3">★</label>\n' +
            '        <input type="radio" name="rating" value="2" id="s2"><label for="s2">★</label>\n' +
            '        <input type="radio" name="rating" value="1" id="s1"><label for="s1">★</label>\n' +
            '      </div>\n' +
            '      <div class="error-hint" id="err-rating">Please select a rating.</div>\n' +
            '    </div>\n\n' +
            '    <!-- NPS Scale -->\n' +
            '    <div class="section">\n' +
            '      <div class="section-title"><span class="section-num">2</span> How likely are you to recommend us?</div>\n' +
            '      <div class="nps">\n' +
            '        <label><input type="radio" name="nps" value="0"><span class="dot">0</span></label>\n' +
            '        <label><input type="radio" name="nps" value="1"><span class="dot">1</span></label>\n' +
            '        <label><input type="radio" name="nps" value="2"><span class="dot">2</span></label>\n' +
            '        <label><input type="radio" name="nps" value="3"><span class="dot">3</span></label>\n' +
            '        <label><input type="radio" name="nps" value="4"><span class="dot">4</span></label>\n' +
            '        <label><input type="radio" name="nps" value="5"><span class="dot">5</span></label>\n' +
            '        <label><input type="radio" name="nps" value="6"><span class="dot">6</span></label>\n' +
            '        <label><input type="radio" name="nps" value="7"><span class="dot">7</span></label>\n' +
            '        <label><input type="radio" name="nps" value="8"><span class="dot">8</span></label>\n' +
            '        <label><input type="radio" name="nps" value="9"><span class="dot">9</span></label>\n' +
            '        <label><input type="radio" name="nps" value="10"><span class="dot">10</span></label>\n' +
            '      </div>\n' +
            '      <div class="nps-labels"><span>Not likely</span><span>Very likely</span></div>\n' +
            '    </div>\n\n' +
            '    <!-- Checkboxes -->\n' +
            '    <div class="section">\n' +
            '      <div class="section-title"><span class="section-num">3</span> What did you enjoy most?</div>\n' +
            '      <div class="check-grid">\n' +
            '        <label class="check-item"><input type="checkbox" name="enjoyed" value="product"> Product Quality</label>\n' +
            '        <label class="check-item"><input type="checkbox" name="enjoyed" value="service"> Customer Service</label>\n' +
            '        <label class="check-item"><input type="checkbox" name="enjoyed" value="pricing"> Pricing</label>\n' +
            '        <label class="check-item"><input type="checkbox" name="enjoyed" value="ux"> User Experience</label>\n' +
            '        <label class="check-item"><input type="checkbox" name="enjoyed" value="docs"> Documentation</label>\n' +
            '        <label class="check-item"><input type="checkbox" name="enjoyed" value="speed"> Performance</label>\n' +
            '      </div>\n' +
            '    </div>\n\n' +
            '    <!-- MCQ -->\n' +
            '    <div class="section">\n' +
            '      <div class="section-title"><span class="section-num">4</span> How did you hear about us?</div>\n' +
            '      <div class="mcq-options">\n' +
            '        <label><input type="radio" name="source" value="search"> Search Engine</label>\n' +
            '        <label><input type="radio" name="source" value="social"> Social Media</label>\n' +
            '        <label><input type="radio" name="source" value="referral"> Friend / Colleague</label>\n' +
            '        <label><input type="radio" name="source" value="blog"> Blog / Article</label>\n' +
            '        <label><input type="radio" name="source" value="other"> Other</label>\n' +
            '      </div>\n' +
            '    </div>\n\n' +
            '    <!-- Long text -->\n' +
            '    <div class="section">\n' +
            '      <div class="section-title"><span class="section-num">5</span> Any additional feedback?</div>\n' +
            '      <textarea name="feedback" placeholder="Tell us what you think…"></textarea>\n' +
            '    </div>\n\n' +
            '    <div class="submit-wrap">\n' +
            '      <button type="submit" class="submit-btn">📊 Submit Survey</button>\n' +
            '    </div>\n' +
            '  </form>\n\n' +
            '  <div class="success-msg" id="success-msg">\n' +
            '    <div class="check">✅</div>\n' +
            '    <h2>Thank you for your feedback!</h2>\n' +
            '    <p>Your responses have been submitted securely.</p>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<script>\n' +
            'document.getElementById("survey-form").addEventListener("submit", function(e) {\n' +
            '  e.preventDefault();\n' +
            '  // Validate star rating\n' +
            '  const rating = document.querySelector("[name=rating]:checked");\n' +
            '  document.getElementById("err-rating").style.display = rating ? "none" : "block";\n' +
            '  if (!rating) return;\n' +
            '  // Collect data\n' +
            '  const data = {};\n' +
            '  data.rating = rating.value;\n' +
            '  const nps = document.querySelector("[name=nps]:checked");\n' +
            '  data.nps = nps ? nps.value : "";\n' +
            '  data.enjoyed = [...document.querySelectorAll("[name=enjoyed]:checked")].map(c => c.value).join(", ");\n' +
            '  const source = document.querySelector("[name=source]:checked");\n' +
            '  data.source = source ? source.value : "";\n' +
            '  data.feedback = document.querySelector("[name=feedback]").value;\n' +
            '  data._submitted = new Date().toISOString();\n' +
            '  // Send to parent\n' +
            '  window.parent.postMessage({ type: "textagent-form-submit", data: data }, "*");\n' +
            '  // Show success\n' +
            '  document.getElementById("survey-form").style.display = "none";\n' +
            '  document.getElementById("success-msg").style.display = "block";\n' +
            '});\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '> [!TIP]\n' +
            '> This survey includes **Star Rating**, **NPS Scale (0-10)**, **Checkboxes**, **Multiple Choice**, and **Long Text** fields. Edit the HTML to customize questions.\n'
    },
    {
        name: 'RSVP Form',
        category: 'forms',
        icon: 'bi-calendar-event',
        description: 'Event RSVP — name, email, attendance, guests, dietary preferences with encrypted responses',
        content: '# 🎉 Event RSVP\n\n' +
            '> Collect RSVPs for your event. Share the link and track attendance.\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; line-height: 1.6; }\n' +
            '  .form-header { text-align: center; margin-bottom: 32px; }\n' +
            '  .form-header h1 { font-size: 2em; background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }\n' +
            '  .form-header p { color: #94a3b8; font-size: 1.05em; }\n' +
            '  .form-header .event-details { background: #1e293b; border-radius: 12px; padding: 16px; margin-top: 16px; display: inline-block; border: 1px solid #334155; }\n' +
            '  .form-header .event-details span { display: block; font-size: .95em; color: #cbd5e1; }\n' +
            '  .form-card { background: #1e293b; border-radius: 16px; padding: 28px; border: 1px solid #334155; max-width: 560px; margin: 0 auto; }\n' +
            '  .field { margin-bottom: 22px; }\n' +
            '  .field label { display: block; font-weight: 600; font-size: .95em; margin-bottom: 8px; color: #f1f5f9; }\n' +
            '  .field label .req { color: #f87171; margin-left: 2px; }\n' +
            '  .field input[type="text"], .field input[type="email"], .field input[type="number"], .field select { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; color: #e2e8f0; font-size: 1em; font-family: inherit; transition: border-color .2s; outline: none; }\n' +
            '  .field input:focus, .field select:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,.15); }\n' +
            '  .field input::placeholder { color: #64748b; }\n' +
            '  /* T/F Radio */\n' +
            '  .tf-options { display: flex; gap: 12px; }\n' +
            '  .tf-options label { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 12px; border: 2px solid #334155; cursor: pointer; font-weight: 600; transition: all .2s; text-align: center; }\n' +
            '  .tf-options input { display: none; }\n' +
            '  .tf-options input:checked + span { color: #fff; }\n' +
            '  .tf-options label:has(input[value="yes"]:checked) { border-color: #22c55e; background: rgba(34,197,94,.15); }\n' +
            '  .tf-options label:has(input[value="no"]:checked) { border-color: #ef4444; background: rgba(239,68,68,.15); }\n' +
            '  .tf-options label:hover { border-color: #f59e0b; }\n' +
            '  /* Checkboxes */\n' +
            '  .check-list label { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin: 4px 0; border-radius: 8px; cursor: pointer; transition: background .2s; }\n' +
            '  .check-list label:hover { background: rgba(245,158,11,.05); }\n' +
            '  .check-list input { accent-color: #f59e0b; width: 18px; height: 18px; }\n' +
            '  .error { font-size: .8em; color: #f87171; margin-top: 4px; display: none; }\n' +
            '  .submit-btn { display: block; width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff; font-size: 1.05em; font-weight: 700; cursor: pointer; transition: all .2s; }\n' +
            '  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(245,158,11,.4); }\n' +
            '  .success-msg { text-align: center; padding: 32px; display: none; }\n' +
            '  .success-msg .check { font-size: 3em; margin-bottom: 12px; }\n' +
            '  .success-msg h2 { color: #6ee7b7; margin-bottom: 8px; }\n' +
            '  .success-msg p { color: #94a3b8; }\n' +
            '  .conditional { display: none; }\n' +
            '  .conditional.show { display: block; }\n' +
            '</style>\n\n' +
            '<div data-textagent-form="true">\n' +
            '  <div class="form-header">\n' +
            '    <h1>🎉 Event RSVP</h1>\n' +
            '    <p>Please let us know if you can make it!</p>\n' +
            '    <div class="event-details">\n' +
            '      <span>📅 Saturday, April 12, 2025</span>\n' +
            '      <span>🕖 7:00 PM — 11:00 PM</span>\n' +
            '      <span>📍 The Grand Ballroom, Downtown</span>\n' +
            '    </div>\n' +
            '  </div>\n\n' +
            '  <div class="form-card" id="form-card">\n' +
            '    <form id="rsvp-form" novalidate>\n' +
            '      <div class="field">\n' +
            '        <label>Full Name <span class="req">*</span></label>\n' +
            '        <input type="text" name="name" placeholder="Your name" required>\n' +
            '        <div class="error" id="err-name">Please enter your name.</div>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Email <span class="req">*</span></label>\n' +
            '        <input type="email" name="email" placeholder="your@email.com" required>\n' +
            '        <div class="error" id="err-email">Please enter a valid email.</div>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Will you attend? <span class="req">*</span></label>\n' +
            '        <div class="tf-options">\n' +
            '          <label><input type="radio" name="attending" value="yes"><span>✅ Yes, I\'ll be there!</span></label>\n' +
            '          <label><input type="radio" name="attending" value="no"><span>❌ Sorry, can\'t make it</span></label>\n' +
            '        </div>\n' +
            '        <div class="error" id="err-attend">Please select an option.</div>\n' +
            '      </div>\n\n' +
            '      <div class="conditional" id="guest-fields">\n' +
            '        <div class="field">\n' +
            '          <label>Number of Guests</label>\n' +
            '          <input type="number" name="guests" min="0" max="10" value="0" placeholder="0">\n' +
            '        </div>\n\n' +
            '        <div class="field">\n' +
            '          <label>Dietary Preferences</label>\n' +
            '          <div class="check-list">\n' +
            '            <label><input type="checkbox" name="dietary" value="none"> No restrictions</label>\n' +
            '            <label><input type="checkbox" name="dietary" value="vegetarian"> 🥬 Vegetarian</label>\n' +
            '            <label><input type="checkbox" name="dietary" value="vegan"> 🌿 Vegan</label>\n' +
            '            <label><input type="checkbox" name="dietary" value="gluten-free"> 🌾 Gluten-free</label>\n' +
            '            <label><input type="checkbox" name="dietary" value="halal"> Halal</label>\n' +
            '            <label><input type="checkbox" name="dietary" value="kosher"> Kosher</label>\n' +
            '          </div>\n' +
            '        </div>\n' +
            '      </div>\n\n' +
            '      <button type="submit" class="submit-btn">🎉 Submit RSVP</button>\n' +
            '    </form>\n' +
            '  </div>\n\n' +
            '  <div class="success-msg" id="success-msg">\n' +
            '    <div class="check">🎊</div>\n' +
            '    <h2>RSVP Received!</h2>\n' +
            '    <p>Thank you — we look forward to seeing you!</p>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<script>\n' +
            '// Conditional logic: show guest fields only if "Yes"\n' +
            'document.querySelectorAll("[name=attending]").forEach(r => {\n' +
            '  r.addEventListener("change", () => {\n' +
            '    document.getElementById("guest-fields").classList.toggle("show", r.value === "yes" && r.checked);\n' +
            '  });\n' +
            '});\n\n' +
            'document.getElementById("rsvp-form").addEventListener("submit", function(e) {\n' +
            '  e.preventDefault();\n' +
            '  let valid = true;\n' +
            '  document.querySelectorAll(".error").forEach(el => el.style.display = "none");\n' +
            '  const name = this.querySelector("[name=name]");\n' +
            '  const email = this.querySelector("[name=email]");\n' +
            '  const attending = document.querySelector("[name=attending]:checked");\n' +
            '  if (!name.value.trim()) { document.getElementById("err-name").style.display = "block"; valid = false; }\n' +
            '  if (!email.value.trim() || !email.validity.valid) { document.getElementById("err-email").style.display = "block"; valid = false; }\n' +
            '  if (!attending) { document.getElementById("err-attend").style.display = "block"; valid = false; }\n' +
            '  if (!valid) return;\n' +
            '  const data = {\n' +
            '    name: name.value, email: email.value, attending: attending.value,\n' +
            '    guests: this.querySelector("[name=guests]").value || "0",\n' +
            '    dietary: [...document.querySelectorAll("[name=dietary]:checked")].map(c => c.value).join(", ") || "none",\n' +
            '    _submitted: new Date().toISOString()\n' +
            '  };\n' +
            '  window.parent.postMessage({ type: "textagent-form-submit", data: data }, "*");\n' +
            '  document.getElementById("form-card").style.display = "none";\n' +
            '  document.getElementById("success-msg").style.display = "block";\n' +
            '});\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '> [!TIP]\n' +
            '> This RSVP form features **conditional logic** — guest and dietary fields only appear when "Yes" is selected. Edit the event details in the HTML header.\n'
    },
    {
        name: 'Feedback Form',
        category: 'forms',
        icon: 'bi-chat-left-heart',
        description: 'Product feedback — star rating, category dropdown, experience slider, and comments',
        content: '# ⭐ Product Feedback\n\n' +
            '> Collect product feedback with star ratings, sliders, dropdowns, and open comments.\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; line-height: 1.6; }\n' +
            '  .form-header { text-align: center; margin-bottom: 32px; }\n' +
            '  .form-header h1 { font-size: 2em; background: linear-gradient(135deg, #22c55e, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }\n' +
            '  .form-header p { color: #94a3b8; font-size: 1.05em; }\n' +
            '  .form-card { background: #1e293b; border-radius: 16px; padding: 28px; border: 1px solid #334155; max-width: 560px; margin: 0 auto; }\n' +
            '  .field { margin-bottom: 24px; }\n' +
            '  .field label { display: block; font-weight: 600; font-size: .95em; margin-bottom: 10px; color: #f1f5f9; }\n' +
            '  .field label .req { color: #f87171; margin-left: 2px; }\n' +
            '  .field select, .field textarea { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; color: #e2e8f0; font-size: 1em; font-family: inherit; outline: none; transition: border-color .2s; }\n' +
            '  .field select:focus, .field textarea:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,.15); }\n' +
            '  .field select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }\n' +
            '  .field select option { background: #1e293b; }\n' +
            '  .field textarea { min-height: 100px; resize: vertical; }\n' +
            '  .field textarea::placeholder { color: #64748b; }\n' +
            '  /* Star rating */\n' +
            '  .stars { display: flex; gap: 4px; flex-direction: row-reverse; justify-content: flex-end; }\n' +
            '  .stars input { display: none; }\n' +
            '  .stars label { font-size: 2.2em; color: #475569; cursor: pointer; transition: color .15s, transform .15s; }\n' +
            '  .stars label:hover, .stars label:hover ~ label, .stars input:checked ~ label { color: #22c55e; transform: scale(1.1); }\n' +
            '  .star-text { font-size: .85em; color: #64748b; margin-top: 4px; height: 20px; }\n' +
            '  /* Range slider */\n' +
            '  .slider-wrap { display: flex; align-items: center; gap: 16px; }\n' +
            '  .slider-wrap input[type="range"] { flex: 1; accent-color: #22c55e; height: 6px; -webkit-appearance: none; background: #334155; border-radius: 3px; outline: none; }\n' +
            '  .slider-wrap input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #22c55e; cursor: pointer; box-shadow: 0 0 8px rgba(34,197,94,.4); }\n' +
            '  .slider-val { font-size: 1.4em; font-weight: 700; color: #22c55e; min-width: 36px; text-align: center; }\n' +
            '  .slider-labels { display: flex; justify-content: space-between; font-size: .8em; color: #64748b; margin-top: 4px; }\n' +
            '  /* Submit */\n' +
            '  .submit-btn { display: block; width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #22c55e, #06b6d4); color: #fff; font-size: 1.05em; font-weight: 700; cursor: pointer; transition: all .2s; }\n' +
            '  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(34,197,94,.4); }\n' +
            '  .success-msg { text-align: center; padding: 32px; display: none; }\n' +
            '  .success-msg .check { font-size: 3em; margin-bottom: 12px; }\n' +
            '  .success-msg h2 { color: #6ee7b7; margin-bottom: 8px; }\n' +
            '  .success-msg p { color: #94a3b8; }\n' +
            '  .error { font-size: .8em; color: #f87171; margin-top: 4px; display: none; }\n' +
            '</style>\n\n' +
            '<div data-textagent-form="true">\n' +
            '  <div class="form-header">\n' +
            '    <h1>⭐ Product Feedback</h1>\n' +
            '    <p>Your feedback helps us build a better product.</p>\n' +
            '  </div>\n\n' +
            '  <div class="form-card" id="form-card">\n' +
            '    <form id="feedback-form" novalidate>\n' +
            '      <div class="field">\n' +
            '        <label>Overall Rating <span class="req">*</span></label>\n' +
            '        <div class="stars">\n' +
            '          <input type="radio" name="rating" value="5" id="r5"><label for="r5">★</label>\n' +
            '          <input type="radio" name="rating" value="4" id="r4"><label for="r4">★</label>\n' +
            '          <input type="radio" name="rating" value="3" id="r3"><label for="r3">★</label>\n' +
            '          <input type="radio" name="rating" value="2" id="r2"><label for="r2">★</label>\n' +
            '          <input type="radio" name="rating" value="1" id="r1"><label for="r1">★</label>\n' +
            '        </div>\n' +
            '        <div class="star-text" id="star-text"></div>\n' +
            '        <div class="error" id="err-rating">Please select a rating.</div>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Category</label>\n' +
            '        <select name="category">\n' +
            '          <option value="">Select a category…</option>\n' +
            '          <option value="features">Features</option>\n' +
            '          <option value="ui">User Interface</option>\n' +
            '          <option value="performance">Performance</option>\n' +
            '          <option value="docs">Documentation</option>\n' +
            '          <option value="support">Support</option>\n' +
            '          <option value="pricing">Pricing</option>\n' +
            '          <option value="other">Other</option>\n' +
            '        </select>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>Ease of Use</label>\n' +
            '        <div class="slider-wrap">\n' +
            '          <input type="range" name="ease" min="1" max="10" value="5" id="ease-slider">\n' +
            '          <span class="slider-val" id="ease-val">5</span>\n' +
            '        </div>\n' +
            '        <div class="slider-labels"><span>Very difficult</span><span>Very easy</span></div>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>What could we improve?</label>\n' +
            '        <textarea name="improvements" placeholder="Tell us what you\'d like to see…"></textarea>\n' +
            '      </div>\n\n' +
            '      <div class="field">\n' +
            '        <label>What do you love about the product?</label>\n' +
            '        <textarea name="positives" placeholder="What\'s working great for you?"></textarea>\n' +
            '      </div>\n\n' +
            '      <button type="submit" class="submit-btn">⭐ Submit Feedback</button>\n' +
            '    </form>\n' +
            '  </div>\n\n' +
            '  <div class="success-msg" id="success-msg">\n' +
            '    <div class="check">💚</div>\n' +
            '    <h2>Thanks for your feedback!</h2>\n' +
            '    <p>We truly appreciate you taking the time.</p>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<script>\n' +
            'const starTexts = ["", "😟 Poor", "😕 Fair", "😐 Good", "😊 Very Good", "🤩 Excellent"];\n' +
            'document.querySelectorAll("[name=rating]").forEach(r => {\n' +
            '  r.addEventListener("change", () => {\n' +
            '    document.getElementById("star-text").textContent = starTexts[parseInt(r.value)];\n' +
            '  });\n' +
            '});\n\n' +
            'document.getElementById("ease-slider").addEventListener("input", function() {\n' +
            '  document.getElementById("ease-val").textContent = this.value;\n' +
            '});\n\n' +
            'document.getElementById("feedback-form").addEventListener("submit", function(e) {\n' +
            '  e.preventDefault();\n' +
            '  const rating = document.querySelector("[name=rating]:checked");\n' +
            '  document.getElementById("err-rating").style.display = rating ? "none" : "block";\n' +
            '  if (!rating) return;\n' +
            '  const data = {\n' +
            '    rating: rating.value,\n' +
            '    category: this.querySelector("[name=category]").value,\n' +
            '    ease_of_use: document.getElementById("ease-slider").value,\n' +
            '    improvements: this.querySelector("[name=improvements]").value,\n' +
            '    positives: this.querySelector("[name=positives]").value,\n' +
            '    _submitted: new Date().toISOString()\n' +
            '  };\n' +
            '  window.parent.postMessage({ type: "textagent-form-submit", data: data }, "*");\n' +
            '  document.getElementById("form-card").style.display = "none";\n' +
            '  document.getElementById("success-msg").style.display = "block";\n' +
            '});\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '> [!TIP]\n' +
            '> This feedback form features **Star Rating**, **Dropdown**, **Range Slider**, and **Long Text** fields. Customize questions and categories to match your product.\n'
    }
];

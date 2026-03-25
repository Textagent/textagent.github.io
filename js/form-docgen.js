// ============================================
// form-docgen.js — {{Form:}} DocGen Tag Module
// Declarative form definitions in markdown
// ============================================
(function (M) {
    'use strict';

    // ==============================================
    // FENCED RANGE DETECTION (standard DocGen pattern)
    // ==============================================
    function getFencedRanges(text) {
        var ranges = [];
        var match;
        var re = /^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm;
        while ((match = re.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        var inlineRe = /`([^`\n]+)`/g;
        while ((match = inlineRe.exec(text)) !== null) {
            ranges.push({ start: match.index, end: match.index + match[0].length });
        }
        return ranges;
    }

    function isInsideFence(pos, fencedRanges) {
        for (var i = 0; i < fencedRanges.length; i++) {
            if (pos >= fencedRanges[i].start && pos < fencedRanges[i].end) return true;
        }
        return false;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ==============================================
    // FIELD CATALOG — used by the Add Field picker
    // ==============================================
    var FIELD_CATALOG = [
        { type: 'text',     icon: '📝', label: 'Text Input',    template: 'field_name | text | Placeholder...' },
        { type: 'email',    icon: '📧', label: 'Email',         template: 'email | email | your@email.com' },
        { type: 'number',   icon: '🔢', label: 'Number',        template: 'count | number | Enter a number' },
        { type: 'date',     icon: '📅', label: 'Date',          template: 'date | date' },
        { type: 'url',      icon: '🔗', label: 'URL',           template: 'website | url | https://...' },
        { type: 'phone',    icon: '📱', label: 'Phone',         template: 'phone | phone | +1 555...' },
        { type: 'textarea', icon: '📄', label: 'Long Text',     template: 'message | textarea | Write here...' },
        { type: 'select',   icon: '📋', label: 'Dropdown',      template: 'choice | select | Option A,Option B,Option C' },
        { type: 'radio',    icon: '🔘', label: 'Single Choice', template: 'pick | radio | Choice 1,Choice 2,Choice 3' },
        { type: 'checkbox', icon: '☑️', label: 'Multi Choice',  template: 'items | checkbox | Item A,Item B,Item C' },
        { type: 'stars',    icon: '⭐', label: 'Star Rating',   template: 'rating | stars | 5' },
        { type: 'nps',      icon: '📊', label: 'NPS Scale',     template: 'score | nps | How likely to recommend?' },
        { type: 'slider',   icon: '🎚️', label: 'Slider',        template: 'level | slider | 1-10' },
        { type: 'yesno',    icon: '✅', label: 'Yes / No',      template: 'confirm | yesno | Do you agree?' }
    ];

    // ==============================================
    // FIELD TYPES — render HTML for each field type
    // ==============================================
    var FIELD_RENDERERS = {
        text: function (f) { return renderInput(f, 'text'); },
        email: function (f) { return renderInput(f, 'email'); },
        url: function (f) { return renderInput(f, 'url'); },
        phone: function (f) { return renderInput(f, 'tel'); },
        number: function (f) { return renderInput(f, 'number'); },
        date: function (f) { return renderInput(f, 'date'); },
        textarea: function (f) {
            var req = f.required ? ' required' : '';
            return '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label)
                + (f.required ? ' <span class="form-dg-req">*</span>' : '')
                + '</label><textarea class="form-dg-textarea" name="' + escapeHtml(f.name) + '" placeholder="'
                + escapeHtml(f.options) + '"' + req + '></textarea></div>';
        },
        select: function (f) {
            var opts = '<option value="">Select…</option>';
            f.options.split(',').forEach(function (v) {
                var val = v.trim();
                opts += '<option value="' + escapeHtml(val) + '">' + escapeHtml(val) + '</option>';
            });
            return '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label)
                + '</label><select class="form-dg-select" name="' + escapeHtml(f.name) + '">' + opts + '</select></div>';
        },
        radio: function (f) {
            var html = '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label) + '</label><div class="form-dg-radios">';
            f.options.split(',').forEach(function (v) {
                var val = v.trim();
                var id = f.name + '_' + val.replace(/\s+/g, '_').toLowerCase();
                html += '<label class="form-dg-radio-item"><input type="radio" name="' + escapeHtml(f.name) + '" value="' + escapeHtml(val) + '" id="' + id + '"><span>' + escapeHtml(val) + '</span></label>';
            });
            return html + '</div></div>';
        },
        checkbox: function (f) {
            var html = '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label) + '</label><div class="form-dg-checks">';
            f.options.split(',').forEach(function (v) {
                var val = v.trim();
                html += '<label class="form-dg-check-item"><input type="checkbox" name="' + escapeHtml(f.name) + '" value="' + escapeHtml(val) + '"><span>' + escapeHtml(val) + '</span></label>';
            });
            return html + '</div></div>';
        },
        stars: function (f) {
            var max = parseInt(f.options) || 5;
            var html = '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label) + '</label><div class="form-dg-stars" data-name="' + escapeHtml(f.name) + '">';
            for (var i = max; i >= 1; i--) {
                html += '<input type="radio" name="' + escapeHtml(f.name) + '" value="' + i + '" id="star_' + f.name + '_' + i + '"><label for="star_' + f.name + '_' + i + '">★</label>';
            }
            return html + '</div></div>';
        },
        nps: function (f) {
            var html = '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label || f.options || 'How likely are you to recommend us?') + '</label><div class="form-dg-nps">';
            for (var i = 0; i <= 10; i++) {
                html += '<label class="form-dg-nps-item"><input type="radio" name="' + escapeHtml(f.name) + '" value="' + i + '"><span class="form-dg-nps-dot">' + i + '</span></label>';
            }
            html += '</div><div class="form-dg-nps-labels"><span>Not likely</span><span>Very likely</span></div></div>';
            return html;
        },
        slider: function (f) {
            var parts = (f.options || '1-10').split('-');
            var min = parseInt(parts[0]) || 1;
            var max = parseInt(parts[1]) || 10;
            var mid = Math.round((min + max) / 2);
            var label = f.flags || f.label;
            return '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(label)
                + '</label><div class="form-dg-slider-wrap"><input type="range" class="form-dg-slider" name="'
                + escapeHtml(f.name) + '" min="' + min + '" max="' + max + '" value="' + mid
                + '"><span class="form-dg-slider-val">' + mid + '</span></div></div>';
        },
        yesno: function (f) {
            // If options contains commas, use custom choices; else default Yes/No
            var choices, labelText;
            if (f.options && f.options.indexOf(',') !== -1) {
                choices = f.options.split(',').map(function (s) { return s.trim(); });
                labelText = f.flags || f.label;
            } else {
                choices = ['Yes', 'No'];
                labelText = f.label || f.options || f.name;
            }
            var YESNO_ICONS = { yes: '✅', no: '❌', maybe: '🤔', true: '✅', false: '❌' };
            var html = '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(labelText)
                + '</label><div class="form-dg-yesno">';
            choices.forEach(function (c) {
                var val = c.toLowerCase();
                var icon = YESNO_ICONS[val] || '🔘';
                html += '<label class="form-dg-yesno-opt"><input type="radio" name="' + escapeHtml(f.name) + '" value="' + escapeHtml(val) + '"><span>' + icon + ' ' + escapeHtml(c) + '</span></label>';
            });
            return html + '</div></div>';
        }
    };

    function renderInput(f, type) {
        var req = f.required ? ' required' : '';
        return '<div class="form-dg-field"><label class="form-dg-label">' + escapeHtml(f.label)
            + (f.required ? ' <span class="form-dg-req">*</span>' : '')
            + '</label><input type="' + type + '" class="form-dg-input" name="' + escapeHtml(f.name)
            + '" placeholder="' + escapeHtml(f.options || '') + '"' + req + '></div>';
    }

    // ==============================================
    // PARSING — find {{Form:}} blocks
    // ==============================================
    function parseFormBlocks(markdown) {
        var blocks = [];
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Form:\s*([\s\S]*?)\}\}/g;
        var match;
        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;
            var body = match[1].trim();
            var lines = body.split('\n');

            // First line = title (may not start with @)
            var title = '';
            var fields = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;
                var fieldMatch = line.match(/^@field:\s*(.+)/i);
                if (fieldMatch) {
                    var parts = fieldMatch[1].split('|').map(function (s) { return s.trim(); });
                    fields.push({
                        name: parts[0] || 'field_' + i,
                        type: (parts[1] || 'text').toLowerCase(),
                        options: parts[2] || '',
                        flags: parts[3] || '',
                        required: (parts[3] || '').toLowerCase() === 'required' || (parts[2] || '').toLowerCase() === 'required',
                        label: (parts[0] || 'field').replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); })
                    });
                } else if (!title && !line.startsWith('@')) {
                    title = line;
                }
            }

            blocks.push({
                title: title || 'Form',
                fields: fields,
                start: match.index,
                end: match.index + match[0].length,
                fullMatch: match[0]
            });
        }
        return blocks;
    }

    // ==============================================
    // TRANSFORM — replace tags with rendered form HTML
    // ==============================================
    function transformFormMarkdown(markdown) {
        var fencedRanges = getFencedRanges(markdown);
        var re = /\{\{@?Form:\s*([\s\S]*?)\}\}/g;
        var result = '';
        var lastIndex = 0;
        var blockIndex = 0;
        var match;

        while ((match = re.exec(markdown)) !== null) {
            if (isInsideFence(match.index, fencedRanges)) continue;

            result += markdown.substring(lastIndex, match.index);

            var parsed = parseFormBlocks(match[0]);
            var block = parsed[0];
            if (!block) { lastIndex = match.index + match[0].length; continue; }

            // Build form HTML
            var fieldsHtml = '';
            block.fields.forEach(function (f) {
                var renderer = FIELD_RENDERERS[f.type];
                if (renderer) {
                    fieldsHtml += renderer(f);
                } else {
                    fieldsHtml += FIELD_RENDERERS.text(f);
                }
            });

            var html = '<div class="form-dg-card" data-form-index="' + blockIndex + '">'
                + '<div class="form-dg-header">'
                + '<span class="form-dg-icon">📋</span>'
                + '<span class="form-dg-title">' + escapeHtml(block.title) + '</span>'
                + '<div class="form-dg-actions">'
                + (M.formResponseKey ? '<button class="form-dg-responses-btn" data-form-index="' + blockIndex + '" type="button" title="View form responses"><i class="bi bi-bar-chart-line"></i> Responses</button>' : '')
                + '<button class="form-dg-remove" data-form-index="' + blockIndex + '" title="Remove form tag">✕</button>'
                + '</div>'
                + '</div>'
                + '<form class="form-dg-body" data-form-index="' + blockIndex + '" novalidate>'
                + fieldsHtml
                + '<button type="submit" class="form-dg-submit">📨 Submit</button>'
                + '</form>'
                + '<div class="form-dg-add-wrap" data-form-index="' + blockIndex + '">'
                + '<button class="form-dg-add-btn" data-form-index="' + blockIndex + '" type="button">➕ Add Field</button>'
                + '<div class="form-dg-add-dropdown" data-form-index="' + blockIndex + '" style="display:none">'
                + FIELD_CATALOG.map(function (c) {
                    return '<button class="form-dg-add-option" data-field-type="' + c.type + '" data-field-template="' + escapeHtml(c.template) + '" data-form-index="' + blockIndex + '" type="button">'
                        + '<span class="form-dg-add-icon">' + c.icon + '</span>'
                        + '<span class="form-dg-add-label">' + escapeHtml(c.label) + '</span>'
                        + '<span class="form-dg-add-type">' + c.type + '</span>'
                        + '</button>';
                }).join('')
                + '</div>'
                + '</div>'
                + '<div class="form-dg-success" data-form-index="' + blockIndex + '" style="display:none">'
                + '<div class="form-dg-success-icon">✅</div>'
                + '<div class="form-dg-success-text">Thank you! Response submitted.</div>'
                + '</div>'
                + '</div>';

            result += html;
            lastIndex = match.index + match[0].length;
            blockIndex++;
        }

        result += markdown.substring(lastIndex);
        return result;
    }

    // ==============================================
    // BIND — attach event listeners to rendered forms
    // ==============================================
    function bindFormPreviewActions(container) {
        // Submit handler
        container.querySelectorAll('.form-dg-body').forEach(function (form) {
            if (form._formBound) return;
            form._formBound = true;

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var idx = form.getAttribute('data-form-index');

                // Validate required fields
                var valid = true;
                form.querySelectorAll('[required]').forEach(function (el) {
                    if (!el.value.trim()) {
                        el.style.borderColor = '#f87171';
                        valid = false;
                    } else {
                        el.style.borderColor = '';
                    }
                });
                if (!valid) return;

                // Collect data
                var data = {};
                // Text/email/number/date/url/phone inputs
                form.querySelectorAll('.form-dg-input, .form-dg-textarea').forEach(function (input) {
                    data[input.name] = input.value;
                });
                // Selects
                form.querySelectorAll('.form-dg-select').forEach(function (sel) {
                    data[sel.name] = sel.value;
                });
                // Radios
                form.querySelectorAll('.form-dg-radios input:checked, .form-dg-yesno input:checked, .form-dg-stars input:checked, .form-dg-nps input:checked').forEach(function (r) {
                    data[r.name] = r.value;
                });
                // Checkboxes (comma-joined)
                var checkGroups = {};
                form.querySelectorAll('.form-dg-checks input:checked').forEach(function (c) {
                    if (!checkGroups[c.name]) checkGroups[c.name] = [];
                    checkGroups[c.name].push(c.value);
                });
                Object.keys(checkGroups).forEach(function (name) {
                    data[name] = checkGroups[name].join(', ');
                });
                // Sliders
                form.querySelectorAll('.form-dg-slider').forEach(function (s) {
                    data[s.name] = s.value;
                });

                data._submitted = new Date().toISOString();
                data._formIndex = idx;
                // Get form title from the card header
                var card = form.closest('.form-dg-card');
                if (card) {
                    var titleEl = card.querySelector('.form-dg-title');
                    if (titleEl) data._formTitle = titleEl.textContent.trim();
                }

                // Disable submit button to prevent re-submission
                var submitBtn = form.querySelector('.form-dg-submit');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '⏳ Submitting…';
                }

                // Send to form-engine.js via postMessage-compatible event dispatch
                // (works for both inline and iframe contexts)
                window.postMessage({ type: 'textagent-form-submit', data: data }, '*');

                // Show success
                form.style.display = 'none';
                var success = container.querySelector('.form-dg-success[data-form-index="' + idx + '"]');
                if (success) success.style.display = 'block';
            });
        });

        // Slider value display
        container.querySelectorAll('.form-dg-slider').forEach(function (slider) {
            if (slider._sliderBound) return;
            slider._sliderBound = true;
            var valEl = slider.parentNode.querySelector('.form-dg-slider-val');
            if (valEl) {
                slider.addEventListener('input', function () {
                    valEl.textContent = slider.value;
                });
            }
        });

        // Remove tag
        container.querySelectorAll('.form-dg-remove').forEach(function (btn) {
            if (btn._removeBound) return;
            btn._removeBound = true;
            btn.addEventListener('click', function () {
                var blocks = parseFormBlocks(M.markdownEditor.value);
                var idx = parseInt(btn.getAttribute('data-form-index'));
                if (blocks[idx]) {
                    var text = M.markdownEditor.value;
                    M.markdownEditor.value = text.substring(0, blocks[idx].start) + text.substring(blocks[idx].end);
                    M.debouncedRender();
                }
            });
        });

        // Add Field toggle
        container.querySelectorAll('.form-dg-add-btn').forEach(function (btn) {
            if (btn._addBound) return;
            btn._addBound = true;
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var idx = btn.getAttribute('data-form-index');
                var dropdown = container.querySelector('.form-dg-add-dropdown[data-form-index="' + idx + '"]');
                if (!dropdown) return;
                // Close any other open dropdowns first
                container.querySelectorAll('.form-dg-add-dropdown').forEach(function (d) {
                    if (d !== dropdown) d.style.display = 'none';
                });
                dropdown.style.display = dropdown.style.display === 'none' ? 'grid' : 'none';
            });
        });

        // Add Field option click — insert @field line into markdown
        container.querySelectorAll('.form-dg-add-option').forEach(function (opt) {
            if (opt._optBound) return;
            opt._optBound = true;
            opt.addEventListener('click', function () {
                var idx = parseInt(opt.getAttribute('data-form-index'));
                var template = opt.getAttribute('data-field-template');
                var blocks = parseFormBlocks(M.markdownEditor.value);
                if (!blocks[idx]) return;

                // Insert the new @field line before the closing }}
                var text = M.markdownEditor.value;
                var insertPos = blocks[idx].end - 2; // before }}
                var newLine = '  @field: ' + template + '\n';
                M.markdownEditor.value = text.substring(0, insertPos) + newLine + text.substring(insertPos);
                M.debouncedRender();
            });
        });

        // Close dropdown when clicking outside
        if (!container._addFieldCloseHandler) {
            container._addFieldCloseHandler = true;
            document.addEventListener('click', function () {
                container.querySelectorAll('.form-dg-add-dropdown').forEach(function (d) {
                    d.style.display = 'none';
                });
            });
        }
    }

    // ==============================================
    // TAG INSERTION — from toolbar
    // ==============================================
    function insertFormTag() {
        M.wrapSelectionWith(
            '{{@Form: My Form\n  @field: name | text | Your name | required\n  @field: email | email | your@email.com | required\n  @field: subject | select | General,Support,Feedback,Other\n  @field: message | textarea | Write your message... | required\n',
            '}}',
            ''
        );
    }

    // ==============================================
    // EXPOSE TO MDView
    // ==============================================
    M.transformFormMarkdown = transformFormMarkdown;
    M.bindFormPreviewActions = bindFormPreviewActions;
    M.parseFormBlocks = parseFormBlocks;

    // Register toolbar action
    M.registerFormattingAction('form-tag', function () { insertFormTag(); });

    // Wire QAB Tools dropdown item
    var qabFormBtn = document.getElementById('qab-form');
    if (qabFormBtn) {
        qabFormBtn.addEventListener('click', function () { insertFormTag(); });
    }

})(window.MDView);

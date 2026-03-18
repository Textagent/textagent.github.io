// ============================================
// product-metadata.js — Single source of truth
// for template counts, categories, and product
// descriptions used by help, demos, and docs.
// ============================================
(function (M) {
    'use strict';

    M.PRODUCT = {
        TEMPLATE_COUNT: 136,
        CATEGORY_COUNT: 14,
        PPT_TEMPLATE_COUNT: 26,
        CATEGORIES: [
            'AI', 'Agents', 'Coding', 'Creative', 'Documentation',
            'Finance', 'Games', 'Maths', 'PPT', 'Project', 'Quiz',
            'Skills', 'Tables', 'Technical'
        ],

        /** Short summary, e.g. "103+ templates across 11 categories" */
        summary: function () {
            return this.TEMPLATE_COUNT + '+ templates across ' +
                this.CATEGORY_COUNT + ' categories';
        },

        /** Parenthesised form, e.g. "103+ templates (11 categories)" */
        summaryParen: function () {
            return this.TEMPLATE_COUNT + '+ templates (' +
                this.CATEGORY_COUNT + ' categories)';
        },

        /** Category list string, e.g. "AI, Agents, Coding, …, Technical" */
        categoryList: function () {
            return this.CATEGORIES.join(', ');
        }
    };
})(window.MDView = window.MDView || {});

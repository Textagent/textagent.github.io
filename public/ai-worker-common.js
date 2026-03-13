/**
 * ai-worker-common.js — Shared constants and helpers for all AI workers.
 *
 * Contains TOKEN_LIMITS and buildMessages() so they are defined in one place.
 * Each worker imports from this module and passes its own contextLimit override.
 */

// Task-specific token limits to keep responses fast
export const TOKEN_LIMITS = {
    summarize: 256,
    expand: 512,
    rephrase: 384,
    grammar: 384,
    polish: 384,
    formalize: 384,
    elaborate: 512,
    shorten: 256,
    autocomplete: 128,
    generate: 512,
    markdown: 512,
    explain: 384,
    simplify: 384,
    qa: 384,
    chat: 512,
};

// System prompts for each task type
const SYSTEM_PROMPTS = {
    summarize:
        'You are a helpful assistant. Summarize the following text concisely while keeping the key points. Be brief. Output in markdown format.',
    expand:
        'You are a helpful writing assistant. Expand the following text with more details, examples, and explanations. Keep the same tone and style. Output in markdown format.',
    rephrase:
        'You are a helpful writing assistant. Rephrase the following text to improve clarity and readability while preserving the meaning. Output in markdown format.',
    grammar:
        'You are a helpful writing assistant. Fix any grammar, spelling, and punctuation errors in the following text. Only output the corrected text, nothing else.',
    autocomplete:
        'You are a helpful writing assistant. Continue writing the text naturally. Only output the continuation, do not repeat the existing text. Write 1-2 sentences.',
    generate:
        'You are a helpful content generation assistant. Generate content based on the user\'s request. Output in well-formatted markdown. Do NOT use LaTeX $...$ or $$...$$ notation for math — use plain text or Unicode instead (e.g. write "x²" not "$x^2$"). Do NOT include any internal thinking, reasoning process, mental notes, or meta-commentary. Output ONLY the final answer.',
    markdown:
        'You are a markdown expert. Generate well-formatted markdown content based on the user\'s request. Use headings, lists, tables, code blocks, and other markdown features as appropriate.',
    explain:
        'You are a helpful assistant. Explain the following text in simple, easy-to-understand terms. Be concise. Output in markdown format.',
    simplify:
        'You are a helpful writing assistant. Simplify the following text to make it easier to understand. Use shorter sentences and simpler words. Output in markdown format.',
    polish:
        'You are a skilled writing editor. Polish the following text to improve flow, word choice, and overall quality while preserving the meaning and tone. Only output the polished text.',
    formalize:
        'You are a professional writing assistant. Rewrite the following text in a more formal, professional tone suitable for business or academic contexts. Only output the formalized text.',
    elaborate:
        'You are a helpful writing assistant. Elaborate on the following text by adding more details, examples, and explanations to make it more comprehensive. Output in markdown format.',
    shorten:
        'You are a concise writing editor. Shorten the following text while preserving all key information. Remove redundancy and use fewer words. Only output the shortened text.',
    qa: 'You are a helpful assistant. The user may have document context open in their editor. If the question relates to the provided context, use it to answer. If the question is unrelated to the context, answer directly from your knowledge. Be concise. Do NOT use LaTeX $...$ or $$...$$ notation — use plain text or Unicode for math. Do NOT include any internal reasoning, thinking process, or meta-commentary. Output in markdown format.',
    chat: 'You are a helpful AI assistant integrated into a Markdown editor. Help the user with writing, editing, and formatting tasks. Be concise. Output in markdown format. Do NOT use LaTeX $...$ or $$...$$ notation for math — use plain text or Unicode instead. Do NOT include any internal thinking, reasoning steps, drafting notes, or meta-commentary. Output ONLY the final polished answer.',
};

/**
 * Build chat messages array based on task type.
 *
 * @param {string} taskType - The task type key (e.g., 'chat', 'summarize')
 * @param {string} context - The document context or selected text
 * @param {string} userPrompt - The user's prompt
 * @param {object} [opts] - Options
 * @param {number} [opts.contextLimit] - Max characters for context (default: 2500)
 * @param {number} [opts.autocompleteLimit] - Max trailing chars for autocomplete (default: 800)
 * @param {Array<{role:string, content:string}>} [opts.chatHistory] - Prior conversation turns
 * @returns {Array<{role: string, content: string}>}
 */
export function buildMessages(taskType, context, userPrompt, opts = {}) {
    const contextLimit = opts.contextLimit ||
        (taskType === 'summarize' || taskType === 'grammar' ? 1500 : 2500);
    const autocompleteLimit = opts.autocompleteLimit || 800;

    const systemMessage = SYSTEM_PROMPTS[taskType] || SYSTEM_PROMPTS.chat;
    const messages = [{ role: 'system', content: systemMessage }];

    // Inject conversation history for conversational task types
    const chatHistory = opts.chatHistory;
    if (chatHistory && chatHistory.length > 0 &&
        ['generate', 'qa', 'chat', 'explain', 'markdown'].includes(taskType)) {
        // Add up to 10 recent history messages, trimming each to 500 chars
        const recent = chatHistory.slice(-10);
        recent.forEach(function (m) {
            messages.push({
                role: m.role,
                content: m.content.substring(0, 500)
            });
        });
    }

    // Detect if context contains web search results
    const hasSearchResults = context && context.indexOf('[Web Search Results') !== -1;

    // Web-search grounding: when search results are present, wrap with strong grounding instructions
    if (hasSearchResults && (taskType === 'generate' || taskType === 'qa' || taskType === 'chat')) {
        var groundedPrompt =
            'IMPORTANT: The following web search results were retrieved for the user\'s question. ' +
            'You MUST base your answer PRIMARILY on these search results. ' +
            'Do NOT fabricate, invent, or hallucinate any facts, numbers, scores, dates, or statistics that are not explicitly stated in the search results. ' +
            'If the search results contain the answer, use them directly and cite the sources. ' +
            'If the search results are insufficient or contradictory, say so honestly rather than guessing.\n\n' +
            context.substring(0, contextLimit) +
            '\n\nUser question: ' + (userPrompt || 'Please answer based on the search results above.');
        messages.push({ role: 'user', content: groundedPrompt });
    } else if (
        context &&
        (taskType === 'qa' || taskType === 'explain' || taskType === 'simplify')
    ) {
        messages.push({
            role: 'user',
            content: `Context:\n\`\`\`\n${context.substring(0, contextLimit)}\n\`\`\`\n\n${userPrompt || 'Please process this text.'}`,
        });
    } else if (
        context &&
        ['summarize', 'expand', 'rephrase', 'grammar', 'polish', 'formalize', 'elaborate', 'shorten'].includes(taskType)
    ) {
        messages.push({
            role: 'user',
            content: context.substring(0, contextLimit),
        });
    } else if (context && taskType === 'autocomplete') {
        messages.push({
            role: 'user',
            content: `Continue this text:\n${context.substring(Math.max(0, context.length - autocompleteLimit))}`,
        });
    } else {
        messages.push({
            role: 'user',
            content: userPrompt || context || 'Hello!',
        });
    }

    return messages;
}

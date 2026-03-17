/**
 * ai-worker-common.js — Shared constants and helpers for all AI workers.
 *
 * Contains TOKEN_LIMITS and buildMessages() so they are defined in one place.
 * Each worker imports from this module and passes its own contextLimit override.
 */

// Task-specific token limits — industry standard
export const TOKEN_LIMITS = {
    summarize: 2048,
    expand: 4096,
    rephrase: 2048,
    grammar: 2048,
    polish: 2048,
    formalize: 2048,
    elaborate: 4096,
    shorten: 1024,
    autocomplete: 512,
    generate: 8192,
    markdown: 8192,
    explain: 4096,
    simplify: 2048,
    qa: 4096,
    chat: 8192,
    excalidraw_diagram: 16384,
};

// Excalidraw element JSON cheat sheet — teaches the LLM the element schema
// Adapted from CopilotKit Excalidraw Studio's RECALL_CHEAT_SHEET
const EXCALIDRAW_CHEAT_SHEET = `You are an expert diagram generator that outputs Excalidraw element JSON.

RULES:
1. Output ONLY a valid JSON array of Excalidraw elements. No markdown, no explanation, no code fences.
2. Each element MUST have a unique "id" (use short strings like "rect1", "arr1", "txt1").
3. Use reasonable coordinates: start near x:100, y:100. Space elements 200-300px apart.
4. All text labels should use type "text" elements with appropriate fontSize (16-24).
5. Keep diagrams clean and well-organized with consistent spacing.

ELEMENT TYPES:

Rectangle:
{"id":"r1","type":"rectangle","x":100,"y":100,"width":200,"height":80,"strokeColor":"#1e1e1e","backgroundColor":"#a5d8ff","fillStyle":"solid","strokeWidth":2,"roughness":1,"roundness":{"type":3},"opacity":100,"angle":0,"groupIds":[],"boundElements":null,"locked":false,"isDeleted":false}

Ellipse:
{"id":"e1","type":"ellipse","x":100,"y":100,"width":160,"height":80,"strokeColor":"#1e1e1e","backgroundColor":"#b2f2bb","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"angle":0,"groupIds":[],"boundElements":null,"locked":false,"isDeleted":false}

Diamond:
{"id":"d1","type":"diamond","x":100,"y":100,"width":160,"height":120,"strokeColor":"#1e1e1e","backgroundColor":"#ffec99","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"angle":0,"groupIds":[],"boundElements":null,"locked":false,"isDeleted":false}

Text:
{"id":"t1","type":"text","x":120,"y":125,"width":160,"height":30,"text":"Label","fontSize":20,"fontFamily":1,"textAlign":"center","verticalAlign":"middle","strokeColor":"#1e1e1e","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":1,"roughness":0,"opacity":100,"angle":0,"groupIds":[],"boundElements":null,"locked":false,"isDeleted":false}

Arrow (connecting elements):
{"id":"a1","type":"arrow","x":300,"y":140,"width":200,"height":0,"points":[[0,0],[200,0]],"strokeColor":"#1e1e1e","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"angle":0,"groupIds":[],"startBinding":{"elementId":"r1","focus":0,"gap":1},"endBinding":{"elementId":"r2","focus":0,"gap":1},"startArrowhead":null,"endArrowhead":"arrow","boundElements":null,"locked":false,"isDeleted":false}

Line:
{"id":"l1","type":"line","x":100,"y":200,"width":300,"height":0,"points":[[0,0],[300,0]],"strokeColor":"#1e1e1e","backgroundColor":"transparent","fillStyle":"solid","strokeWidth":2,"roughness":1,"opacity":100,"angle":0,"groupIds":[],"boundElements":null,"locked":false,"isDeleted":false}

COLORS (use these for backgroundColor):
- Blue: "#a5d8ff"  - Green: "#b2f2bb"  - Yellow: "#ffec99"
- Red: "#ffc9c9"   - Purple: "#d0bfff" - Orange: "#ffd8a8"
- Gray: "#dee2e6"   - White: "#ffffff"  - Transparent: "transparent"

BINDING RULES:
- To connect arrow to a shape, use startBinding/endBinding with the target element's id.
- When binding, the shape's "boundElements" should list the arrow: [{"id":"a1","type":"arrow"}].
- Arrow points are RELATIVE to the arrow's x,y position.

LAYOUT TIPS:
- Flowcharts: arrange top-to-bottom or left-to-right, 250px spacing
- Architecture diagrams: use a grid layout, 300px spacing
- Mind maps: radiate from center
- Place text labels centered inside shapes (adjust x,y to center within the shape's bounds)

IMPORTANT: Output ONLY the JSON array. Example: [{"id":"r1",...},{"id":"t1",...},{"id":"a1",...}]`;

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
    excalidraw_diagram: EXCALIDRAW_CHEAT_SHEET,
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
        (taskType === 'summarize' || taskType === 'grammar' ? 16000 : 32000);
    const autocompleteLimit = opts.autocompleteLimit || 800;

    const systemMessage = SYSTEM_PROMPTS[taskType] || SYSTEM_PROMPTS.chat;
    const messages = [{ role: 'system', content: systemMessage }];

    // Inject conversation history for conversational task types
    const chatHistory = opts.chatHistory;
    if (chatHistory && chatHistory.length > 0 &&
        ['generate', 'qa', 'chat', 'explain', 'markdown'].includes(taskType)) {
        // Add up to 30 recent history messages, trimming each to 4000 chars
        const recent = chatHistory.slice(-30);
        recent.forEach(function (m) {
            messages.push({
                role: m.role,
                content: m.content.substring(0, 4000)
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

const ALLOWED_TAGS = new Set([
    "a",
    "blockquote",
    "br",
    "code",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "u",
    "ul",
]);

const URL_ATTRS = new Set(["href", "src"]);
const GLOBAL_ATTRS = new Set(["class", "title"]);
const TAG_ATTRS: Record<string, Set<string>> = {
    a: new Set(["href", "target", "rel"]),
};

const ENTITY_MAP: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function decodeEntities(value: string) {
    return value
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/&([a-z]+);/gi, (match, name) => ENTITY_MAP[name.toLowerCase()] ?? match);
}

function isSafeUrl(value: string) {
    const normalized = decodeEntities(value).replace(/[\u0000-\u001f\u007f\s]+/g, "").toLowerCase();
    if (!normalized) return false;
    if (normalized.startsWith("#") || normalized.startsWith("/")) return true;

    try {
        const url = new URL(normalized, "https://kb.local");
        return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
    } catch {
        return false;
    }
}

function sanitizeAttributes(tagName: string, attrs = "") {
    const allowed = TAG_ATTRS[tagName] ?? new Set<string>();
    const output: string[] = [];
    const attrPattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let match: RegExpExecArray | null;

    while ((match = attrPattern.exec(attrs)) !== null) {
        const name = match[1].toLowerCase();
        const value = match[2] ?? match[3] ?? match[4] ?? "";

        if (name.startsWith("on")) continue;
        if (["style", "srcdoc", "formaction", "xlink:href"].includes(name)) continue;
        if (!GLOBAL_ATTRS.has(name) && !allowed.has(name)) continue;
        if (URL_ATTRS.has(name) && !isSafeUrl(value)) continue;
        if (name === "target" && value !== "_blank") continue;
        if (name === "class" && !/^[a-z0-9 _:-]+$/i.test(value)) continue;

        output.push(`${name}="${escapeHtml(value)}"`);
    }

    if (tagName === "a" && output.some((attr) => attr === 'target="_blank"')) {
        output.push('rel="noopener noreferrer"');
    }

    return output.length ? ` ${output.join(" ")}` : "";
}

export function sanitizeKnowledgeBaseHtml(input: string) {
    if (!input) return "";

    let html = input
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|option|meta|link|base|template|video|audio|source|track|canvas)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
        .replace(/<\s*(script|style|iframe|object|embed|svg|math|form|input|button|textarea|select|option|meta|link|base|template|video|audio|source|track|canvas)[^>]*\/?\s*>/gi, "");

    html = html.replace(/<\s*\/\s*([a-z0-9]+)\s*>/gi, (match, tag) => {
        const tagName = String(tag).toLowerCase();
        return ALLOWED_TAGS.has(tagName) ? `</${tagName}>` : "";
    });

    html = html.replace(/<\s*([a-z0-9]+)([^>]*)>/gi, (match, tag, attrs) => {
        const tagName = String(tag).toLowerCase();
        if (!ALLOWED_TAGS.has(tagName)) return "";
        if (tagName === "br") return "<br>";
        return `<${tagName}${sanitizeAttributes(tagName, attrs)}>`;
    });

    return html;
}

export function getKnowledgeBasePlainText(input: string, maxLength = 160) {
    const text = decodeEntities(sanitizeKnowledgeBaseHtml(input).replace(/<[^>]+>/g, " "))
        .replace(/\s+/g, " ")
        .trim();

    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trimEnd()}...`;
}

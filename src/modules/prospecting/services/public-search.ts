export type PublicProspect = {
  city: string;
  confidence: number;
  contactName: string;
  contactRole: string;
  description: string;
  instagramUrl: string;
  name: string;
  phone: string;
  segment: string;
  sourceUrl: string;
  websiteUrl: string;
};

type SearchResult = {
  description: string;
  title: string;
  url: string;
};

const OWNER_TERMS = [
  "dono",
  "dona",
  "socio",
  "socia",
  "fundador",
  "fundadora",
  "CEO",
  "proprietario",
  "proprietaria"
];

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function cleanTitle(value: string) {
  return stripTags(value)
    .replace(/\s+-\s+.*$/g, "")
    .replace(/\s+\|\s+.*$/g, "")
    .replace(/\s+em\s+.+$/gi, "")
    .trim();
}

function extractDuckUrl(value: string) {
  const decoded = decodeHtml(value);

  try {
    const url = new URL(decoded.startsWith("//") ? `https:${decoded}` : decoded);
    const redirect = url.searchParams.get("uddg");
    return redirect ? decodeURIComponent(redirect) : url.toString();
  } catch {
    return decoded;
  }
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 13) {
    return "";
  }

  if (digits.startsWith("55")) {
    return digits;
  }

  return `55${digits}`;
}

function extractPhone(text: string) {
  const matches = text.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4,5}[-.\s]?\d{4}/g);
  if (!matches) {
    return "";
  }

  for (const match of matches) {
    const phone = normalizePhone(match);
    if (phone) {
      return phone;
    }
  }

  return "";
}

function extractInstagram(text: string, url: string) {
  const source = `${text} ${url}`;
  const direct = source.match(/https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?/i);
  if (direct) {
    return direct[0].replace(/\/$/, "");
  }

  const handle = source.match(/instagram\.com\/([A-Za-z0-9._-]+)/i);
  return handle ? `https://instagram.com/${handle[1]}` : "";
}

function pickWebsite(url: string) {
  if (!url || /instagram\.com|facebook\.com|linkedin\.com|youtube\.com|google\.com/i.test(url)) {
    return "";
  }

  return url;
}

function extractContactName(text: string) {
  for (const term of OWNER_TERMS) {
    const regex = new RegExp(`${term}\\s+([A-ZÁÀÂÃÉÈÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÈÊÍÓÔÕÚÇáàâãéèêíóôõúç]+(?:\\s+[A-ZÁÀÂÃÉÈÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÈÊÍÓÔÕÚÇáàâãéèêíóôõúç]+)?)`, "i");
    const match = text.match(regex);
    if (match?.[1]) {
      return {
        name: match[1].trim(),
        role: term
      };
    }
  }

  return { name: "", role: "" };
}

function scoreProspect(input: {
  contactName: string;
  instagramUrl: string;
  phone: string;
  websiteUrl: string;
}) {
  let score = 35;
  if (input.websiteUrl) score += 18;
  if (input.instagramUrl) score += 18;
  if (input.phone) score += 24;
  if (input.contactName) score += 15;
  return Math.min(100, score);
}

function parseDuckDuckGo(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const blocks = html.match(/<div class="result[\s\S]*?<\/div>\s*<\/div>/g) ?? [];

  for (const block of blocks) {
    const linkMatch = block.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!linkMatch) {
      continue;
    }

    const snippetMatch = block.match(/<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/div>/);
    const title = cleanTitle(linkMatch[2]);
    const url = extractDuckUrl(linkMatch[1]);
    const description = stripTags(snippetMatch?.[1] ?? snippetMatch?.[2] ?? "");

    if (title && url) {
      results.push({ description, title, url });
    }
  }

  return results;
}

function dedupeProspects(prospects: PublicProspect[]) {
  const seen = new Set<string>();
  const unique: PublicProspect[] = [];

  for (const prospect of prospects) {
    const key = `${prospect.name.toLowerCase()}-${prospect.phone || prospect.websiteUrl || prospect.instagramUrl}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(prospect);
    }
  }

  return unique;
}

export async function searchPublicProspects(input: {
  city: string;
  quantity: number;
  segment: string;
}): Promise<PublicProspect[]> {
  const query = `${input.segment} ${input.city} telefone whatsapp instagram dono`;
  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MDMarketingIASDR/1.0; +https://ia-sdr-md-marketing.vercel.app)"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error("A busca publica nao respondeu agora. Tente novamente em alguns minutos.");
  }

  const html = await response.text();
  const results = parseDuckDuckGo(html);
  const prospects = results
    .map((result) => {
      const combined = `${result.title} ${result.description}`;
      const contact = extractContactName(combined);
      const phone = extractPhone(combined);
      const instagramUrl = extractInstagram(combined, result.url);
      const websiteUrl = pickWebsite(result.url);
      const confidence = scoreProspect({
        contactName: contact.name,
        instagramUrl,
        phone,
        websiteUrl
      });

      return {
        city: input.city,
        confidence,
        contactName: contact.name,
        contactRole: contact.role,
        description: result.description,
        instagramUrl,
        name: result.title,
        phone,
        segment: input.segment,
        sourceUrl: result.url,
        websiteUrl
      };
    })
    .filter((prospect) => prospect.name && (prospect.phone || prospect.websiteUrl || prospect.instagramUrl))
    .sort((a, b) => b.confidence - a.confidence);

  return dedupeProspects(prospects).slice(0, input.quantity);
}

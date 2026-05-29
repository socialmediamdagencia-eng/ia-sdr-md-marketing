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

type OsmElement = {
  center?: {
    lat?: number;
    lon?: number;
  };
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  type: string;
};

type OsmResponse = {
  elements?: OsmElement[];
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

const SEGMENT_FILTERS: Array<{
  terms: string[];
  filters: string[];
}> = [
  {
    terms: ["odont", "dent", "dentista"],
    filters: ['["amenity"="dentist"]', '["healthcare"="dentist"]']
  },
  {
    terms: ["clinica", "clínica", "medic", "saude", "saúde"],
    filters: ['["amenity"="clinic"]', '["healthcare"="clinic"]', '["healthcare"="doctor"]']
  },
  {
    terms: ["estet", "beleza", "salon", "salao", "salão"],
    filters: ['["shop"="beauty"]', '["shop"="hairdresser"]']
  },
  {
    terms: ["academia", "fitness", "pilates"],
    filters: ['["leisure"="fitness_centre"]', '["sport"="fitness"]']
  },
  {
    terms: ["restaurante", "bar", "lanchonete", "pizzaria"],
    filters: ['["amenity"="restaurant"]', '["amenity"="bar"]', '["amenity"="fast_food"]']
  },
  {
    terms: ["veterin", "pet"],
    filters: ['["amenity"="veterinary"]', '["shop"="pet"]']
  },
  {
    terms: ["hotel", "pousada"],
    filters: ['["tourism"="hotel"]', '["tourism"="guest_house"]']
  },
  {
    terms: ["imobili", "corret"],
    filters: ['["office"="estate_agent"]']
  },
  {
    terms: ["escola", "curso", "faculdade"],
    filters: ['["amenity"="school"]', '["amenity"="college"]', '["amenity"="university"]']
  },
  {
    terms: ["oficina", "mecanica", "mecânica", "auto"],
    filters: ['["shop"="car_repair"]', '["craft"="mechanic"]']
  }
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

function resolveOsmFilters(segment: string) {
  const normalized = segment
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const match = SEGMENT_FILTERS.find((entry) =>
    entry.terms.some((term) => normalized.includes(term.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
  );

  return match?.filters ?? ['["shop"]', '["office"]', '["amenity"]'];
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

function normalizeOsmPhone(tags: Record<string, string>) {
  return normalizePhone(tags.phone ?? tags["contact:phone"] ?? tags["phone:mobile"] ?? "");
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

function pickOsmInstagram(tags: Record<string, string>) {
  const value =
    tags["contact:instagram"] ??
    tags.instagram ??
    tags["social:instagram"] ??
    tags["brand:instagram"] ??
    "";

  if (!value) {
    return "";
  }

  if (value.startsWith("http")) {
    return value.replace(/\/$/, "");
  }

  return `https://instagram.com/${value.replace(/^@/, "")}`;
}

function pickOsmWebsite(tags: Record<string, string>) {
  return tags.website ?? tags["contact:website"] ?? tags.url ?? "";
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

function buildOsmSourceUrl(element: OsmElement) {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (lat && lon) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
  }

  return `https://www.openstreetmap.org/${element.type}/${element.id}`;
}

function parseOsmProspects(input: {
  city: string;
  elements: OsmElement[];
  quantity: number;
  segment: string;
}) {
  return input.elements
    .map((element) => {
      const tags = element.tags ?? {};
      const name = tags.name ?? tags.brand ?? tags.operator ?? "";
      const phone = normalizeOsmPhone(tags);
      const instagramUrl = pickOsmInstagram(tags);
      const websiteUrl = pickOsmWebsite(tags);
      const confidence = scoreProspect({
        contactName: "",
        instagramUrl,
        phone,
        websiteUrl
      });

      return {
        city: input.city,
        confidence,
        contactName: "",
        contactRole: "",
        description: tags.description ?? tags.healthcare ?? tags.amenity ?? tags.shop ?? "",
        instagramUrl,
        name,
        phone,
        segment: input.segment,
        sourceUrl: buildOsmSourceUrl(element),
        websiteUrl
      };
    })
    .filter((prospect) => prospect.name && (prospect.phone || prospect.websiteUrl || prospect.instagramUrl))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, input.quantity);
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
  const duckProspects = await searchDuckDuckGoProspects(input).catch(() => []);

  if (duckProspects.length > 0) {
    return duckProspects;
  }

  return searchOpenStreetMapProspects(input);
}

async function searchDuckDuckGoProspects(input: {
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

async function searchOpenStreetMapProspects(input: {
  city: string;
  quantity: number;
  segment: string;
}): Promise<PublicProspect[]> {
  const filters = resolveOsmFilters(input.segment);
  const selectors = filters
    .map(
      (filter) => `
        node(area.searchArea)${filter};
        way(area.searchArea)${filter};
        relation(area.searchArea)${filter};
      `
    )
    .join("\n");

  const query = `
    [out:json][timeout:20];
    area["boundary"="administrative"]["name"="${input.city}"]->.searchArea;
    (
      ${selectors}
    );
    out center tags ${Math.max(input.quantity * 8, 25)};
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    body: new URLSearchParams({ data: query }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (compatible; MDMarketingIASDR/1.0; +https://ia-sdr-md-marketing.vercel.app)"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("A busca publica nao respondeu agora. Tente novamente em alguns minutos.");
  }

  const payload = (await response.json()) as OsmResponse;
  const prospects = parseOsmProspects({
    city: input.city,
    elements: payload.elements ?? [],
    quantity: input.quantity,
    segment: input.segment
  });

  if (prospects.length === 0) {
    throw new Error(
      "Nao encontrei empresas com telefone/site/Instagram nessa busca gratuita. Tente um segmento mais direto, como dentista, academia, restaurante, estetica ou veterinaria."
    );
  }

  return dedupeProspects(prospects);
}

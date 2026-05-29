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

type NominatimResult = {
  address?: Record<string, string>;
  display_name?: string;
  extratags?: Record<string, string>;
  lat?: string;
  lon?: string;
  name?: string;
  osm_id?: number;
  osm_type?: string;
  type?: string;
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
    terms: ["clinica", "medic", "saude"],
    filters: ['["amenity"="clinic"]', '["healthcare"="clinic"]', '["healthcare"="doctor"]']
  },
  {
    terms: ["estet", "beleza", "salon", "salao"],
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
    terms: ["oficina", "mecanica", "auto"],
    filters: ['["shop"="car_repair"]', '["craft"="mechanic"]']
  }
];

const CONTROLLED_NAME_PREFIXES = [
  "Central",
  "Prime",
  "Studio",
  "Espaco",
  "Nucleo",
  "Grupo",
  "Mais",
  "Elite",
  "Avance",
  "Conecta",
  "Vitta",
  "Classe"
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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
  const normalized = normalizeText(segment).toLowerCase();

  const match = SEGMENT_FILTERS.find((entry) =>
    entry.terms.some((term) => normalized.includes(normalizeText(term).toLowerCase()))
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

function normalizeTagsPhone(tags: Record<string, string>) {
  return normalizePhone(
    tags.phone ??
      tags["contact:phone"] ??
      tags["phone:mobile"] ??
      tags.mobile ??
      tags["contact:mobile"] ??
      ""
  );
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

function pickTagsInstagram(tags: Record<string, string>) {
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

function pickTagsWebsite(tags: Record<string, string>) {
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

function buildNominatimSourceUrl(result: NominatimResult) {
  if (result.lat && result.lon) {
    return `https://www.openstreetmap.org/?mlat=${result.lat}&mlon=${result.lon}#map=18/${result.lat}/${result.lon}`;
  }

  return "https://www.openstreetmap.org/search";
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
      const phone = normalizeTagsPhone(tags);
      const instagramUrl = pickTagsInstagram(tags);
      const websiteUrl = pickTagsWebsite(tags);
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
    .filter((prospect) => prospect.name)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, input.quantity);
}

function parseNominatimProspects(input: {
  city: string;
  quantity: number;
  results: NominatimResult[];
  segment: string;
}) {
  return input.results
    .map((result) => {
      const tags = result.extratags ?? {};
      const rawName =
        result.name ??
        tags.name ??
        result.display_name?.split(",")[0] ??
        `${input.segment} em ${input.city}`;
      const phone = normalizeTagsPhone(tags);
      const instagramUrl = pickTagsInstagram(tags);
      const websiteUrl = pickTagsWebsite(tags);
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
        description: result.type ?? tags.description ?? "Resultado publico de mapa",
        instagramUrl,
        name: cleanTitle(rawName),
        phone,
        segment: input.segment,
        sourceUrl: buildNominatimSourceUrl(result),
        websiteUrl
      };
    })
    .filter((prospect) => prospect.name)
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
    const regex = new RegExp(
      `${term}\\s+([A-Z][A-Za-z]+(?:\\s+[A-Z][A-Za-z]+)?)`,
      "i"
    );
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

    const snippetMatch = block.match(
      /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<div[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/div>/
    );
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
    const key = normalizeText(
      `${prospect.name}-${prospect.phone || prospect.websiteUrl || prospect.instagramUrl || prospect.sourceUrl}`
    ).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(prospect);
    }
  }

  return unique;
}

function buildControlledProspects(input: {
  city: string;
  quantity: number;
  segment: string;
}): PublicProspect[] {
  return Array.from({ length: input.quantity }, (_, index) => {
    const prefix = CONTROLLED_NAME_PREFIXES[index % CONTROLLED_NAME_PREFIXES.length];
    const name = `${prefix} ${input.segment} ${input.city}`.replace(/\s+/g, " ").trim();

    return {
      city: input.city,
      confidence: 35,
      contactName: "",
      contactRole: "",
      description:
        "Lead preparado em modo contingencia: fonte publica indisponivel no momento. Precisa de enriquecimento antes do disparo.",
      instagramUrl: "",
      name,
      phone: "",
      segment: input.segment,
      sourceUrl: "https://ia-sdr-md-marketing.vercel.app/prospeccao",
      websiteUrl: ""
    };
  });
}

export async function searchPublicProspects(input: {
  city: string;
  quantity: number;
  segment: string;
}): Promise<PublicProspect[]> {
  const sources = [
    () => searchNominatimProspects(input),
    () => searchOpenStreetMapProspects(input),
    () => searchDuckDuckGoProspects(input)
  ];

  for (const source of sources) {
    const prospects = await source().catch(() => []);
    const unique = dedupeProspects(prospects).slice(0, input.quantity);

    if (unique.length > 0) {
      return unique;
    }
  }

  return buildControlledProspects(input);
}

async function searchNominatimProspects(input: {
  city: string;
  quantity: number;
  segment: string;
}): Promise<PublicProspect[]> {
  const params = new URLSearchParams({
    addressdetails: "1",
    extratags: "1",
    format: "jsonv2",
    limit: String(Math.max(input.quantity * 3, 10)),
    q: `${input.segment} ${input.city}`
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.5",
      "User-Agent":
        "MDMarketingIASDR/1.0 (https://ia-sdr-md-marketing.vercel.app; contato@mdmarketingempresarial.com)"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    return [];
  }

  const results = (await response.json()) as NominatimResult[];
  return parseNominatimProspects({
    city: input.city,
    quantity: input.quantity,
    results,
    segment: input.segment
  });
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
    return [];
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
    .filter((prospect) => prospect.name)
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

  const mirrors = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ];

  for (const endpoint of mirrors) {
    const response = await fetch(endpoint, {
      body: new URLSearchParams({ data: query }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (compatible; MDMarketingIASDR/1.0; +https://ia-sdr-md-marketing.vercel.app)"
      },
      method: "POST"
    }).catch(() => null);

    if (!response?.ok) {
      continue;
    }

    const payload = (await response.json()) as OsmResponse;
    const prospects = parseOsmProspects({
      city: input.city,
      elements: payload.elements ?? [],
      quantity: input.quantity,
      segment: input.segment
    });

    if (prospects.length > 0) {
      return dedupeProspects(prospects);
    }
  }

  return [];
}

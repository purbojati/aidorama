import type { Metadata } from "next";

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
}

const defaultSEO = {
  title: "AiDorama - Roleplay AI Indonesia",
  description: "Ngobrol dengan karakter imajiner yang seru. Buat roleplaymu lebih seru dengan AI. Platform roleplay AI terbaik di Indonesia untuk berinteraksi dengan karakter virtual.",
  image: "/aidorama-logo-trans.png",
  url: "https://aidorama.app",
  type: "website" as const,
};

export function generateSEO({
  title,
  description,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  tags,
  noIndex = false,
}: SEOProps): Metadata {
  const metaTitle = title ? `${title} | AiDorama` : defaultSEO.title;
  const metaDescription = description || defaultSEO.description;
  const metaImage = image || defaultSEO.image;
  const metaUrl = url || defaultSEO.url;

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: metaUrl,
      siteName: "AiDorama",
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      locale: "id_ID",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      site: "@aidorama",
      creator: "@aidorama",
    },
    alternates: {
      canonical: metaUrl,
    },
  };

  // Add article-specific metadata
  if (type === "article") {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime,
      modifiedTime,
      authors: authors?.map(author => `https://aidorama.app/profile/${author}`),
      tags,
    };
  }

  return metadata;
}

export function generateCharacterSEO(character: {
  id: number;
  name: string;
  synopsis?: string;
  avatarUrl?: string;
  characterTags?: string[];
  user?: { name?: string; displayName?: string; username?: string };
  createdAt?: string;
  updatedAt?: string;
}): Metadata {
  const title = `${character.name} - Karakter AI`;
  const description = character.synopsis 
    ? `Ngobrol dengan ${character.name}. ${character.synopsis.slice(0, 120)}...`
    : `Berinteraksi dengan karakter AI ${character.name} di AiDorama. Mulai percakapan seru sekarang!`;
  
  const creatorName = character.user?.displayName || character.user?.name || character.user?.username || "Pengguna AiDorama";
  
  return generateSEO({
    title,
    description,
    image: character.avatarUrl || "/aidorama-logo-trans.png",
    url: `https://aidorama.app/characters/${character.id}`,
    type: "article",
    publishedTime: character.createdAt,
    modifiedTime: character.updatedAt,
    authors: [creatorName],
    tags: character.characterTags,
  });
}

export function generateCharacterStructuredData(character: {
  id: number;
  name: string;
  synopsis?: string;
  avatarUrl?: string;
  characterTags?: string[];
  user?: { name?: string; displayName?: string; username?: string };
  createdAt?: string;
  updatedAt?: string;
}) {
  const creatorName = character.user?.displayName || character.user?.name || character.user?.username || "Pengguna AiDorama";
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": character.name,
    "description": character.synopsis || `Karakter AI ${character.name} untuk roleplay interaktif`,
    "image": character.avatarUrl,
    "url": `https://aidorama.app/characters/${character.id}`,
    "creator": {
      "@type": "Person",
      "name": creatorName
    },
    "dateCreated": character.createdAt,
    "dateModified": character.updatedAt,
    "keywords": character.characterTags?.join(", "),
    "genre": "Interactive Fiction",
    "inLanguage": "id-ID",
    "isPartOf": {
      "@type": "WebSite",
      "name": "AiDorama",
      "url": "https://aidorama.app"
    }
  };
}

export function generatePageSEO(
  page: "login" | "characters" | "create" | "privacy" | "profile" | "my-characters" | "chats"
): Metadata {
  const pageConfig = {
    login: {
      title: "Masuk ke AiDorama",
      description: "Masuk ke akun AiDorama Anda untuk mulai berinteraksi dengan karakter AI favorit dan mengelola karakter buatan Anda.",
      url: "https://aidorama.app/login",
    },
    characters: {
      title: "Jelajahi Karakter AI",
      description: "Temukan ribuan karakter AI unik yang dibuat oleh komunitas AiDorama. Mulai percakapan seru dengan karakter favorit Anda.",
      url: "https://aidorama.app/characters",
    },
    create: {
      title: "Buat Karakter AI",
      description: "Wujudkan imajinasi Anda dengan membuat karakter AI unik. Tentukan kepribadian, latar belakang, dan gaya bicara karakter Anda.",
      url: "https://aidorama.app/characters/create",
    },
    privacy: {
      title: "Kebijakan Privasi",
      description: "Pelajari bagaimana AiDorama melindungi data dan privasi Anda saat menggunakan platform roleplay AI kami.",
      url: "https://aidorama.app/privacy",
    },
    profile: {
      title: "Profil Saya",
      description: "Kelola profil dan pengaturan akun AiDorama Anda.",
      url: "https://aidorama.app/profile",
      noIndex: true,
    },
    "my-characters": {
      title: "Karakter Saya",
      description: "Kelola dan edit karakter AI yang telah Anda buat di AiDorama.",
      url: "https://aidorama.app/characters/my",
      noIndex: true,
    },
    chats: {
      title: "Riwayat Chat",
      description: "Lihat dan kelola riwayat percakapan Anda dengan karakter AI di AiDorama.",
      url: "https://aidorama.app/chats",
      noIndex: true,
    },
  };

  const config = pageConfig[page];
  return generateSEO(config);
} 